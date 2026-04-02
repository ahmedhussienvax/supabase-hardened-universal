/**
 * Supabase Studio Platform API Sidecar Proxy
 * 
 * Runs as a SEPARATE container (not inside Studio).
 * - Intercepts /api/platform/* and /api/v1/* → returns synthetic responses
 * - Proxies everything else → real Studio on supabase-studio:3000
 * 
 * Traefik routes HTTPS traffic here (port 3001), not to Studio directly.
 */

'use strict';

const http = require('http');
const url  = require('url');

const PORT         = 3001;
const STUDIO_HOST  = process.env.STUDIO_INTERNAL_HOST || 'supabase-studio';
const STUDIO_PORT  = parseInt(process.env.STUDIO_INTERNAL_PORT || '3000', 10);

const env = {
  orgName:     process.env.STUDIO_DEFAULT_ORGANIZATION || 'Default Organization',
  projectName: process.env.STUDIO_DEFAULT_PROJECT      || 'Default Project',
  anonKey:     process.env.SUPABASE_ANON_KEY           || '',
  serviceKey:  process.env.SUPABASE_SERVICE_KEY        || '',
};

// ─── Path Normalization ────────────────────────────────────────────────────────
function normalizePath(pathname) {
  if (!pathname) return '/';
  // Remove trailing slashes and ensure lowercase for reliable matching
  return pathname.replace(/\/+$/, '') || '/';
}


// ─── Static mocks ─────────────────────────────────────────────────────────────
const STATIC = {
  '/api/platform/profile': {
    id: 1,
    primary_email: 'admin@localhost',
    username: 'admin',
    name: 'Admin',
    gotrue_id: 'self-hosted',
    free_project_limit: 999,
  },
  '/api/platform/organizations': [{
    id: 1,
    name: env.orgName,
    slug: 'default-org',
    billing_email: 'admin@localhost',
    plan: { id: 'pro', name: 'Pro' },
  }],
  '/api/platform/projects': [{
    id: 1,
    ref: 'default',
    name: env.projectName,
    organization_id: 1,
    region: 'local',
    status: 'ACTIVE_HEALTHY',
    inserted_at: '2024-01-01T00:00:00.000Z',
  }],
  '/api/platform/projects/default': {
    id: 1,
    ref: 'default',
    name: env.projectName,
    organization_id: 1,
    region: 'local',
    status: 'ACTIVE_HEALTHY',
    inserted_at: '2024-01-01T00:00:00.000Z',
    preview_branches: [],
  },
  '/api/v1/projects/default/api-keys': [
    { name: 'anon key',         api_key: env.anonKey,    tags: 'anon',         prefix: env.anonKey.slice(0, 10) },
    { name: 'service_role key', api_key: env.serviceKey, tags: 'service_role', prefix: env.serviceKey.slice(0, 10) },
  ],
  '/api/platform/notifications':                           [],
  '/api/v1/projects/default/functions':                   [],
  '/api/platform/projects/default/analytics/log-drains':  [],
  '/api/cli-release-version':                             { version: '2.67.1' },
  '/api/platform/projects/default/billing/addons': {
    ref: 'default', selected_addons: [], available_addons: [],
  },
  '/api/platform/settings': {
    is_platform: true,
    feature_flags: {
      project_creation_enabled: true,
      billing_enabled: false,
    }
  },
};


// ─── Dynamic inference ────────────────────────────────────────────────────────
const ARRAY_SUFFIXES = [
  'folders','databases','functions','notifications','keys','log-drains',
  'addons','buckets','objects','policies','triggers','extensions',
  'publications','roles','schemas','tables','views','types','migrations',
  'hooks','snippets','secrets','members','invites','backups',
];

function inferResponse(pathname) {
  const last = pathname.split('/').filter(Boolean).pop() || '';
  return ARRAY_SUFFIXES.some(s => last === s || last.endsWith('s')) ? [] : {};
}

function isPlatformRoute(pathname) {
  const normalized = normalizePath(pathname);
  return normalized.startsWith('/api/platform') ||
         normalized.startsWith('/api/v1/projects');
}

function getStaticMock(pathname) {
  const normalized = normalizePath(pathname);
  
  // 1. Direct match in STATIC map
  if (STATIC[normalized] !== undefined) return STATIC[normalized];

  // 2. Dynamic Project Ref Match (e.g. /api/v1/projects/[REF]/api-keys)
  // We check if the path matches the pattern but with a different project ref
  for (const staticPath of Object.keys(STATIC)) {
    if (staticPath.includes('/projects/default/')) {
      const pattern = staticPath.replace('/projects/default/', '/projects/[^/]+/');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(normalized)) {
        console.log(`[mock:dynamic-ref] Local path ${normalized} matches static template ${staticPath}`);
        return STATIC[staticPath];
      }
    }
  }

  return undefined;
}


// ─── Helpers ──────────────────────────────────────────────────────────────────
function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type':   'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control':  'no-cache',
  });
  res.end(body);
}

function proxyToStudio(req, res) {
  const opts = {
    hostname: STUDIO_HOST,
    port:     STUDIO_PORT,
    path:     req.url,
    method:   req.method,
    headers:  { ...req.headers, host: `${STUDIO_HOST}:${STUDIO_PORT}` },
  };

  const proxy = http.request(opts, (studioRes) => {
    res.writeHead(studioRes.statusCode, studioRes.headers);
    studioRes.pipe(res, { end: true });
  });

  proxy.on('error', (err) => {
    console.error(`[proxy] Studio unreachable (${STUDIO_HOST}:${STUDIO_PORT}): ${err.message}`);
    sendJSON(res, 502, { error: 'Studio temporarily unavailable', detail: err.message });
  });

  req.pipe(proxy, { end: true });
}

// ─── Server ───────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const rawPath  = url.parse(req.url).pathname;
  const pathname = normalizePath(rawPath);

  console.log(`[sidecar] Incoming: ${req.method} ${rawPath}`);

  // Health check
  if (pathname === '/health') {
    return sendJSON(res, 200, { status: 'ok', upstream: `${STUDIO_HOST}:${STUDIO_PORT}` });
  }

  // Favicon
  if (pathname === '/favicon.ico') {
    res.writeHead(204);
    return res.end();
  }

  // Check for static or templated mock
  const mockData = getStaticMock(rawPath) || getStaticMock(pathname);
  if (mockData !== undefined) {
    console.log(`[mock:hit]  ${req.method} ${rawPath}`);
    return sendJSON(res, 200, mockData);
  }

  // Dynamic mock — platform routes not in static map
  if (isPlatformRoute(pathname)) {
    const mock = inferResponse(pathname);
    console.log(`[mock:infer] ${req.method} ${rawPath} → ${Array.isArray(mock) ? '[]' : '{}'}`);
    return sendJSON(res, 200, mock);
  }

  // Passthrough → real Studio
  console.log(`[proxy:pass] ${req.method} ${rawPath}`);
  proxyToStudio(req, res);
});


server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n[sidecar] Supabase Platform API Proxy started`);
  console.log(`[sidecar] Listening  → :${PORT}`);
  console.log(`[sidecar] Upstream   → ${STUDIO_HOST}:${STUDIO_PORT}`);
  console.log(`[sidecar] Org        → ${env.orgName}`);
  console.log(`[sidecar] Project    → ${env.projectName}\n`);
});

server.on('error', (err) => {
  console.error(`[sidecar] Fatal server error: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[sidecar] SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

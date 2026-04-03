/**
 * Supabase Studio Universal Sidecar Proxy (v3.2.7)
 * 
 * DESIGN PHILOSOPHY:
 * 1. Greedy Interception: Catch ALL `/api/platform` and `/api/v1/projects` calls.
 * 2. Ref-Agnostic: Automatically identify project refs from URLs and serve consistent mocks.
 * 3. Fallback Safety: Always return 200 OK with valid JSON ({}) instead of 404 to satisfy UI.
 * 
 * Traefik routes HTTPS traffic here (port 3001) -> proxies to Studio (port 3000).
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

// ─── Regex Matchers ───────────────────────────────────────────────────────────
const RE_V1_PROJECT = /^\/api\/v1\/projects\/([^\/]+)/;
const RE_PLATFORM   = /^\/api\/platform/;

// ─── Expanded Static Mocks ────────────────────────────────────────────────────
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
  // Global settings/configs to satisfy UI loaders
  '/api/platform/settings': {
    maintenance: false,
    updates: [],
  },
  '/api/platform/config': {
    is_platform: true,
    ai_assistant_enabled: false,
  },
  '/api/platform/notifications': [],
  '/api/cli-release-version':    { version: '2.67.1' },
};

// ─── Dynamic Mock Generator ───────────────────────────────────────────────────
function getMockResponse(pathname) {
  // 1. Check exact static matches first (Strip query params handled by url.parse)
  if (STATIC[pathname]) return STATIC[pathname];

  // 2. Handle Project-Specific paths (/api/v1/projects/[REF]/...)
  const v1Match = pathname.match(RE_V1_PROJECT);
  if (v1Match) {
    const ref = v1Match[1];
    const subpath = pathname.replace(RE_V1_PROJECT, '');

    if (subpath === '' || subpath === '/') {
      return { id: 1, ref: ref, name: env.projectName, organization_id: 1, status: 'ACTIVE_HEALTHY' };
    }
    if (subpath.includes('api-keys')) {
      return [
        { name: 'anon key',         api_key: env.anonKey,    tags: 'anon',         prefix: env.anonKey.slice(0, 10) },
        { name: 'service_role key', api_key: env.serviceKey, tags: 'service_role', prefix: env.serviceKey.slice(0, 10) },
      ];
    }
    // Default fallback for any project sub-tab
    return subpath.endsWith('s') || subpath.includes('log') ? [] : {};
  }

  // 3. Fallback for any other platform call
  return pathname.endsWith('s') ? [] : {};
}

// ─── Proxy Logic ──────────────────────────────────────────────────────────────
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

// ─── Main Server ──────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname  = parsedUrl.pathname;

  // Health / Favicon
  if (pathname === '/health')     return sendJSON(res, 200, { status: 'ok' });
  if (pathname === '/favicon.ico') return res.writeHead(204).end();

  // INTERCEPTION LOGIC
  const isPlatform = RE_PLATFORM.test(pathname);
  const isV1Project = RE_V1_PROJECT.test(pathname);

  if (isPlatform || isV1Project) {
    const mock = getMockResponse(pathname);
    console.log(`[mock] Intercepted: ${req.method} ${pathname} -> 200 OK`);
    return sendJSON(res, 200, mock);
  }

  // PASSTHROUGH LOGIC
  proxyToStudio(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Sidecar Proxy (v3.2.7) listening on :${PORT}`);
  console.log(`📡 Targeting Studio  -> ${STUDIO_HOST}:${STUDIO_PORT}`);
  console.log(`🌐 Org Name         -> ${env.orgName}\n`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

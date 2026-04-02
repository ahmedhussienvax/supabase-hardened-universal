const http = require('http');
const httpProxy = require('http-proxy');

// Configuration
const TARGET_PORT = 3000;
const PROXY_PORT = 3001;
const TARGET_URL = `http://127.0.0.1:${TARGET_PORT}`;

const proxy = httpProxy.createProxyServer({});

// Synthetic Data for Platform Routes
const SYNTHETIC_DATA = {
  '/api/platform/profile': {
    id: 1,
    username: 'admin',
    primary_email: 'admin@example.com',
    is_alpha_user: true,
    is_beta_user: true
  },
  '/api/platform/projects/default/config': {
    api: {
      auto_api_enabled: true,
      rest_url: process.env.SUPABASE_URL || 'http://supabase-kong:8000',
      anon_key: process.env.SUPABASE_ANON_KEY,
      service_role_key: process.env.SUPABASE_SERVICE_KEY
    },
    auth: {
      site_url: process.env.SUPABASE_URL || 'http://supabase-kong:8000',
      jwt_secret: process.env.AUTH_JWT_SECRET
    }
  },
  '/api/platform/organizations': [
    { id: 1, name: 'Default Organization', slug: 'default-org' }
  ],
  '/api/platform/projects': [
    { 
      id: 1, 
      ref: 'default', 
      name: 'Default Project', 
      organization_id: 1,
      status: 'ACTIVE_HEALTHY',
      region: 'local'
    }
  ]
};

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // Intercept and Patch Platform Routes
  if (SYNTHETIC_DATA[url]) {
    console.log(`[Proxy] Patching Synthetic Route: ${url}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(SYNTHETIC_DATA[url]));
    return;
  }

  // Fallback to Studio
  proxy.web(req, res, { target: TARGET_URL }, (e) => {
    console.error(`[Proxy Error] ${e.message}`);
    res.writeHead(502);
    res.end('Studio Not Ready');
  });
});

console.log(`🚀 Supabase Studio Proxy (AG-OS) starting on port ${PROXY_PORT}...`);
server.listen(PROXY_PORT);

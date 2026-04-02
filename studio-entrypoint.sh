#!/bin/sh
set -e

echo "Hardening Supabase Studio (AG-OS Tooling)..."

# Ensure Node is available for the proxy
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found, attempting installation..."
  apk add --no-cache nodejs npm
fi

# Apply AG-OS Robust Patch to server.js
# This fixes the SyntaxError: Unexpected token '.' in Next.js internal properties
# caused by invalid property access or broken injection.
SERVER_JS="/app/apps/studio/server.js"
if [ -f "$SERVER_JS" ]; then
    echo "Applying AG-OS Robust Patch to server.js..."
    
    # Create backup
    cp "$SERVER_JS" "$SERVER_JS.bak"
    
    # Remove broken or conflicting _originalRewrites lines injected by older systems
    # These often cause SyntaxErrors in newer Next.js standalone builds
    sed -i '/_originalRewrites/d' "$SERVER_JS"
    
    echo "Patch applied: server.js cleaned of broken redirects."
fi

# Run the proxy in the background
echo "Starting Studio Proxy on Port 3001..."
node /app/studio-proxy.js &

# Start the original Studio on Port 3000
echo "Starting Original Studio on Port 3000..."
exec node /app/server.js

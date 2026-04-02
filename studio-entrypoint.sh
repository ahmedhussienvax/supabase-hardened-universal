#!/bin/sh
set -e

echo "🛠️ Hardening Supabase Studio (AG-OS Tooling)..."

# Ensure Node is available for the proxy (Studio already has it, but good to check)
if ! command -v node >/dev/null 2>&1; then
  echo "⚠️ Node.js not found, attempting installation..."
  apk add --no-cache nodejs npm
fi

# Run the proxy in the background
echo "🚀 Starting Studio Proxy on Port 3001..."
node /app/studio-proxy.js &

# Start the original Studio on Port 3000
echo "📊 Starting Original Studio on Port 3000..."
exec node /app/server.js

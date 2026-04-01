#!/bin/bash
set -e

echo "🐘 Supabase Database Initializer: Injecting Secrets..."

# Define roles and set passwords using environment variables
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- Create roles if they don't exist
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
      CREATE ROLE supabase_admin LOGIN PASSWORD '${SERVICE_PASSWORD_POSTGRES}';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN
      CREATE ROLE supabase_auth_admin LOGIN PASSWORD '${SERVICE_PASSWORD_POSTGRES}';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN
      CREATE ROLE supabase_storage_admin LOGIN PASSWORD '${SERVICE_PASSWORD_POSTGRES}';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
      CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD '${SERVICE_PASSWORD_POSTGRES}';
    END IF;
  END
  \$\$;

  -- Ensure common schemas exist
  CREATE SCHEMA IF NOT EXISTS auth;
  CREATE SCHEMA IF NOT EXISTS storage;
  CREATE SCHEMA IF NOT EXISTS extensions;

  -- Grant usage
  GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
  GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
EOSQL

echo "✅ Database Roles Initialized with Real Secrets."

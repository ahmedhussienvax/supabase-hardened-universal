-- 🛡️ SUPABASE MASTER: HARDENED ROLES & ANALYTICS (v3.2.4)
-- ########################################################
-- This script initializes the "World-Class" hardening layer.
-- It creates necessary Supabase roles, schemas, and Logflare metadata tables.
-- All passwords use the ${SERVICE_PASSWORD_POSTGRES} placeholder for security.
-- ########################################################

DO $$ 
BEGIN
    -- 1. Create supabase_admin (Global Admin)
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_admin') THEN
        CREATE ROLE supabase_admin WITH LOGIN PASSWORD '${SERVICE_PASSWORD_POSTGRES}';
        ALTER ROLE supabase_admin CREATEDB CREATEROLE REPLICATION;
    END IF;

    -- 2. Create service_role, anon, and authenticated (PostgREST Layer)
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN;
    END IF;

    -- 3. Create authenticator (The Proxy Role)
    -- This role bridges Kong/PostgREST to the database
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
        CREATE ROLE authenticator WITH NOINHERIT LOGIN PASSWORD '${SERVICE_PASSWORD_POSTGRES}';
        GRANT anon, authenticated, service_role TO authenticator;
    END IF;

    -- 4. Create service-specific admin roles (Auth, Storage, Functions)
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
        CREATE ROLE supabase_auth_admin WITH LOGIN PASSWORD '${SERVICE_PASSWORD_POSTGRES}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
        CREATE ROLE supabase_storage_admin WITH LOGIN PASSWORD '${SERVICE_PASSWORD_POSTGRES}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_functions_admin') THEN
        CREATE ROLE supabase_functions_admin WITH LOGIN PASSWORD '${SERVICE_PASSWORD_POSTGRES}';
    END IF;

    -- 5. Fix Schema Permissions (Public & Storage)
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE SCHEMA IF NOT EXISTS storage;
    CREATE SCHEMA IF NOT EXISTS extensions;

    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, supabase_admin;
    GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role, supabase_admin;
    GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
    GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
    GRANT ALL ON SCHEMA extensions TO supabase_admin;

    -- 6. Analytics & Logflare Setup
    -- Note: Ensure '_supabase' database is created if using separate logs db.
    CREATE SCHEMA IF NOT EXISTS _analytics;
    ALTER SCHEMA _analytics OWNER TO supabase_admin;
    GRANT ALL ON SCHEMA _analytics TO supabase_admin;
    
    -- Create Logflare Metadata Tables (Prevents 500 errors in Studio)
    CREATE TABLE IF NOT EXISTS _analytics.sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        token TEXT NOT NULL UNIQUE,
        inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS _analytics.log_drains (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        settings JSONB DEFAULT '{}'::jsonb,
        inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    GRANT ALL ON ALL TABLES IN SCHEMA _analytics TO supabase_admin;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA _analytics TO supabase_admin;

    -- 7. Final Search Path Optimization
    ALTER ROLE supabase_admin SET search_path TO public, storage, _analytics;

    RAISE NOTICE 'Supabase Master Hardening: SUCCESS (v3.2.4)';
END $$;

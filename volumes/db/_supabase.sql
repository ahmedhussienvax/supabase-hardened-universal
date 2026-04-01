-- Supabase Universal Core Schema Generation

-- Create schemas for core services
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS extensions;

-- Enable core extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" SCHEMA extensions;

-- Set search path for all users
ALTER DATABASE postgres SET search_path = public, auth, extensions;

-- Grant usage to 'anon' and 'authenticated' roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT USAGE ON SCHEMA storage TO anon, authenticated;

-- Final completion marker
SELECT '✅ Supabase Universal Core Initialized' as status;

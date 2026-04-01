-- Supabase Net Extensions for Webhooks on Universal Master Build

-- Create pg_net extension for asynchronous HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Create pg_http extension for synchronous requests (optional)
CREATE EXTENSION IF NOT EXISTS http SCHEMA extensions;

-- Create schema for webhooks hooks
CREATE SCHEMA IF NOT EXISTS supabase_functions;

-- Grant usage on schemas to service_role
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT USAGE ON SCHEMA supabase_functions TO service_role;

-- Grant permissions for http functions to 'postgres'
GRANT ALL ON SCHEMA extensions TO postgres;
GRANT ALL ON SCHEMA supabase_functions TO postgres;

-- Supabase Hardened JWT Configuration

-- Set the JWT secret in postgres settings
-- This is often passed as a placeholder and replaced by the entrypoint
-- but we provide the baseline structure here for the master build.

ALTER DATABASE postgres SET "app.settings.jwt_secret" TO '${SERVICE_PASSWORD_JWT}';

-- Granting access to JWT settings for the authenticator role
-- This allows PostgREST to verify claims
GRANT USAGE ON SCHEMA auth TO authenticator;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO authenticator;

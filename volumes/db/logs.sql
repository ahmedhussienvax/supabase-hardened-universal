-- Supabase Analytics and Logging Schema Generation

-- Create logs schema
CREATE SCHEMA IF NOT EXISTS _analytics;

-- Table for HTTP logs
CREATE TABLE IF NOT EXISTS _analytics.api_logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  method TEXT,
  path TEXT,
  status INTEGER,
  response_time INTEGER,
  user_agent TEXT,
  client_ip TEXT
);

-- Grant privileges for logging data
GRANT ALL ON SCHEMA _analytics TO postgres;
GRANT INSERT ON ALL TABLES IN SCHEMA _analytics TO anon, authenticated, service_role;

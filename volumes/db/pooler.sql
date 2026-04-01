-- Supavisor Monitoring Schema for Supabase Universal Master Build

-- Create schema for monitoring
CREATE SCHEMA IF NOT EXISTS supavisor;

-- Establish monitoring structures
CREATE TABLE IF NOT EXISTS supavisor.stats (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  total_connections INTEGER,
  active_connections INTEGER,
  idle_connections INTEGER
);

-- Grant privileges to the psql user
GRANT ALL ON SCHEMA supavisor TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA supavisor TO postgres;

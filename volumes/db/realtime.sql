-- Realtime CDC Schema Generation for Supabase Universal

-- Create replication schema
CREATE SCHEMA IF NOT EXISTS realtime;

-- Create publication for CDC
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

-- Alter publication to include all tables (Hardened Mode)
-- Note: In production, users should explicitly add tables to this publication.
-- ALTER PUBLICATION supabase_realtime ADD TABLE table_name;

-- Grant usage to 'postgres' user for monitoring
GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT ALL ON SCHEMA realtime TO postgres;

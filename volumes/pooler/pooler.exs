defmodule Supavisor.Config do
  def get_config do
    [
      port: 4000,
      metrics_port: 4001,
      api_port: 8080,
      db_port: 5432,
      db_host: "supabase-db",
      db_user: "supabase_admin",
      db_password: "${SERVICE_PASSWORD_POSTGRES}",
      db_database: "postgres",
      pool_size: 20,
      max_connections: 100,
      pool_mode: :transaction,
      log_level: :info
    ]
  end
end

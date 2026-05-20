-- HoneyTrap Supabase Schema
-- Permanent and Idempotent Script

-- 1. Main table for honeypot events
CREATE TABLE IF NOT EXISTS honeypot_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Source Info
  ip_address INET NOT NULL,
  port INTEGER NOT NULL,
  protocol TEXT NOT NULL CHECK (protocol IN ('SSH', 'HTTP')),
  
  -- Geolocation (populated via Python worker)
  country_code TEXT,       -- e.g., 'FR', 'CN', 'RU'
  country_name TEXT,
  city TEXT,
  asn TEXT,                -- e.g., 'AS4134 CHINANET'
  latitude FLOAT,
  longitude FLOAT,
  
  -- Captured Payload
  username TEXT,           -- SSH login attempts
  password TEXT,           -- SSH login attempts
  http_path TEXT,          -- HTTP path targeted
  http_method TEXT,        -- GET, POST, etc.
  http_user_agent TEXT,
  http_payload TEXT,       -- Body content
  raw_payload JSONB,       -- Extra metadata
  
  -- Analytics
  session_duration_ms INTEGER,
  threat_score INTEGER DEFAULT 0  -- 0-100 calculated score
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_events_created_at ON honeypot_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_ip ON honeypot_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_events_country ON honeypot_events(country_code);
CREATE INDEX IF NOT EXISTS idx_events_protocol ON honeypot_events(protocol);

-- 3. Views for Analytics
CREATE OR REPLACE VIEW country_attack_counts AS
SELECT 
  country_code,
  country_name,
  latitude,
  longitude,
  COUNT(*) as total_attacks,
  COUNT(DISTINCT ip_address) as unique_ips
FROM honeypot_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY country_code, country_name, latitude, longitude;

-- 4. Security (RLS)
ALTER TABLE honeypot_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts during updates
DROP POLICY IF EXISTS "Public read" ON honeypot_events;
DROP POLICY IF EXISTS "Service role insert only" ON honeypot_events;

CREATE POLICY "Public read" ON honeypot_events
  FOR SELECT USING (true);

CREATE POLICY "Service role insert only" ON honeypot_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 5. Advanced Dashboard Functions (RPCs)

-- Comprehensive dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_attacks BIGINT;
  unique_ips BIGINT;
  top_country TEXT;
  ssh_count BIGINT;
  http_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_attacks FROM honeypot_events WHERE created_at > NOW() - INTERVAL '24 hours';
  SELECT COUNT(DISTINCT ip_address) INTO unique_ips FROM honeypot_events WHERE created_at > NOW() - INTERVAL '24 hours';
  
  SELECT country_code INTO top_country 
  FROM honeypot_events 
  WHERE created_at > NOW() - INTERVAL '24 hours' 
  GROUP BY country_code 
  ORDER BY COUNT(*) DESC 
  LIMIT 1;
  
  SELECT COUNT(*) INTO ssh_count FROM honeypot_events WHERE protocol = 'SSH' AND created_at > NOW() - INTERVAL '24 hours';
  SELECT COUNT(*) INTO http_count FROM honeypot_events WHERE protocol = 'HTTP' AND created_at > NOW() - INTERVAL '24 hours';

  result := json_build_object(
    'total_attacks', total_attacks,
    'unique_ips', unique_ips,
    'top_country', COALESCE(top_country, 'N/A'),
    'ssh_count', ssh_count,
    'http_count', http_count
  );
  
  return result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Real-time timeline data (Last 24 hours by hour)
CREATE OR REPLACE FUNCTION get_timeline_stats()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(t) FROM (
      SELECT 
        to_char(series, 'HH24:00') as time,
        COUNT(e.id) FILTER (WHERE e.protocol = 'SSH') as ssh,
        COUNT(e.id) FILTER (WHERE e.protocol = 'HTTP') as http
      FROM generate_series(
        date_trunc('hour', NOW() - INTERVAL '23 hours'),
        date_trunc('hour', NOW()),
        '1 hour'
      ) series
      LEFT JOIN honeypot_events e ON date_trunc('hour', e.created_at) = series
      GROUP BY series
      ORDER BY series
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Top targeted credentials
CREATE OR REPLACE FUNCTION get_top_credentials()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(t) FROM (
      SELECT 
        username, 
        password, 
        COUNT(*) as count
      FROM honeypot_events
      WHERE protocol = 'SSH' AND username IS NOT NULL
      GROUP BY username, password
      ORDER BY count DESC
      LIMIT 10
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

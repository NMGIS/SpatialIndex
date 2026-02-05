-- Run this in the Supabase SQL Editor to update the query_indexed_bbox function.
-- Uses RETURNS TABLE to stream rows (avoids jsonb_agg timeout).
-- Each row includes server_ms (elapsed time at that row); take the max on the client.

DROP FUNCTION IF EXISTS query_indexed_bbox(float, float, float, float);

CREATE FUNCTION query_indexed_bbox(min_lng float, min_lat float, max_lng float, max_lat float)
RETURNS TABLE(id text, name text, admin_type text, geojson json, server_ms numeric) AS $$
DECLARE
  t0 timestamptz := clock_timestamp();
BEGIN
  RETURN QUERY
  SELECT
    c."SMA_ID"::text,
    c."ADMIN_UNIT_NAME"::text,
    c."ADMIN_UNIT_TYPE"::text,
    ST_AsGeoJSON(ST_Transform(c.geometry, 4326))::json,
    EXTRACT(EPOCH FROM (clock_timestamp() - t0)) * 1000
  FROM combined_indexed c
  WHERE c.geometry && ST_Transform(ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326), 3857)
  LIMIT 500;
END;
$$ LANGUAGE plpgsql
SET statement_timeout = '30s';

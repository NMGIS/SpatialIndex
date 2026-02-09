-- Run this in the Supabase SQL Editor to create the get_index_stats function.
-- Returns PostgreSQL internal index & table scan statistics.
-- SECURITY DEFINER allows the anon role to read pg_stat_* system catalogs.

DROP FUNCTION IF EXISTS get_index_stats();

CREATE FUNCTION get_index_stats()
RETURNS TABLE(
  idx_scan bigint,
  idx_tup_read bigint,
  idx_tup_fetch bigint,
  noindex_seq_scan bigint,
  noindex_seq_tup_read bigint
) AS $$
  SELECT
    COALESCE(i.idx_scan, 0),
    COALESCE(i.idx_tup_read, 0),
    COALESCE(i.idx_tup_fetch, 0),
    COALESCE(t.seq_scan, 0),
    COALESCE(t.seq_tup_read, 0)
  FROM pg_stat_user_indexes i
  CROSS JOIN pg_stat_user_tables t
  WHERE i.relname = 'combined_indexed'
    AND t.relname = 'combined'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

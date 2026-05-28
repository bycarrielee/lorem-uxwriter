-- 007_fix_nric_tags: add plain identity-term tags to NRIC-related form label entries
-- so that extractKeyTerms('nric') matches via tags.cs.{nric} instead of relying on
-- context ilike alone.

update public.copy_entries
set tags = tags || ARRAY['nric', 'fin', 'passport']
where element_type = 'forms'
  and scope = 'global'
  and copy::text ilike '%NRIC%'
  and status = 'active';

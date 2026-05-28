-- Step 1 of 2: Add new element_type enum values.
-- Run this first, then run 003_patterns.sql.

alter type element_type add value if not exists 'links';
alter type element_type add value if not exists 'push-notifications';
alter type element_type add value if not exists 'release-notes';

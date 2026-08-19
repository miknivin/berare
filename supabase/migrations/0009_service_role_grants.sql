-- service_role has rolbypassrls = true, which skips RLS *policies* — but
-- that's a separate mechanism from the base table-level GRANT system.
-- Without an explicit GRANT, service_role still gets 42501 "permission
-- denied" on a plain SELECT, RLS bypass or not. Migration 0005 granted
-- anon/authenticated but never service_role itself, on the mistaken
-- assumption that BYPASSRLS implied full access — it doesn't. The admin
-- app's service-role client hit this the first time its dashboard
-- actually rendered a real SELECT end-to-end.
--
-- Grant broadly here rather than table-by-table: service_role is our
-- fully-trusted, staff-gated pathway by design (every call site already
-- goes through requireStaff() in application code first), so full access
-- to every table is the intended shape, not a shortcut.
grant all privileges on all tables in schema public to service_role;

-- Also cover any table added by a future migration, so this exact bug
-- can't recur for new tables without remembering to grant service_role
-- again by hand.
alter default privileges in schema public grant all privileges on tables to service_role;

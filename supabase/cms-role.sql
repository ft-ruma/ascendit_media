-- Run once in the CRM's Supabase project (SQL editor) before the first deploy.
-- Payload gets its own schema and its own role, with no grants on CRM tables.
create schema if not exists cms;
create role payload login password 'REPLACE_WITH_A_LONG_RANDOM_PASSWORD';
grant usage, create on schema cms to payload;
alter default privileges in schema cms grant all on tables to payload;
alter default privileges in schema cms grant all on sequences to payload;
alter role payload set search_path = cms;
-- Staging / preview deployments: same again with a cms_staging schema, or use a Supabase branch.
-- DATABASE_URI=postgres://payload:<password>@<host>:5432/postgres

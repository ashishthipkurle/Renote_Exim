-- This script prepares the Supabase database for Prisma.
-- It drops cross-schema FK constraints that Supabase auth triggers may create,
-- which conflict with Prisma's introspection.
-- Run this BEFORE `prisma db push` if you get a cross-schema reference error.

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey_auth;

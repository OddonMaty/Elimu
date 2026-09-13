-- ==========================================
-- 06_public_applications_rls.sql
-- ELIMU RDC - Public Application Submission
-- ==========================================
-- Adds a NEW INSERT policy on application_dossiers so that
-- anonymous (anon) AND authenticated visitors can submit
-- an application, provided:
--   1. The submitted status is 'SOUMIS'
--   2. The school_id references an existing school
--
-- This policy is ADDITIVE – it does NOT touch or replace
-- the existing tenant-isolation policies from 02_rls_policies.sql.
-- ==========================================

CREATE POLICY "Allow public application submission"
ON public.application_dossiers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Condition 1: the application must arrive with status 'SOUMIS'
  status = 'SOUMIS'
  -- Condition 2: the target school must actually exist
  AND EXISTS (
    SELECT 1 FROM public.schools WHERE schools.id = school_id
  )
);

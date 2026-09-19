-- ==========================================
-- 10_application_update_policy.sql (version corrigée)
-- ==========================================

-- 1. Autorise la mise à jour du champ registration_fee_paid uniquement
GRANT UPDATE (registration_fee_paid) ON public.application_dossiers TO anon;

-- 2. Autorise la LECTURE de colonnes non sensibles uniquement (pas les infos personnelles)
GRANT SELECT (id, registration_fee_paid, status) ON public.application_dossiers TO anon;

-- 3. Policy UPDATE, restreinte à marquer le paiement comme effectué
DROP POLICY IF EXISTS "Allow public payment fee update" ON public.application_dossiers;
CREATE POLICY "Allow public payment fee update"
ON public.application_dossiers
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (
  registration_fee_paid = true
  AND status = 'SOUMIS'
);

-- 4. Policy SELECT nécessaire pour que la confirmation fonctionne
--    (sans risque : les colonnes sensibles restent bloquées par le GRANT ci-dessus,
--     même si cette policy autorise la lecture de la ligne)
DROP POLICY IF EXISTS "Allow limited read for fee confirmation" ON public.application_dossiers;
CREATE POLICY "Allow limited read for fee confirmation"
ON public.application_dossiers
FOR SELECT
TO anon, authenticated
USING (true);
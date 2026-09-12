-- ==========================================
-- 05_school_settings.sql
-- ELIMU RDC - Nouveaux champs pour Paramètres, Grille de frais et Horaires
-- ==========================================

-- 1. Ajout de colonnes à la table schools
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS current_academic_year VARCHAR(50),
ADD COLUMN IF NOT EXISTS current_term VARCHAR(50),
ADD COLUMN IF NOT EXISTS annual_tuition_min_usd DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS annual_tuition_max_usd DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS education_levels TEXT[],
ADD COLUMN IF NOT EXISTS sections TEXT[];

-- 2. Ajout de la fonction administrative au user
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS admin_title VARCHAR(100);

-- 3. Table school_fee_items pour la grille de frais (Partie C)
CREATE TABLE IF NOT EXISTS public.school_fee_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  section VARCHAR(100),
  tranche1 DECIMAL(10,2),
  tranche2 DECIMAL(10,2),
  tranche3 DECIMAL(10,2),
  academic_year VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.school_fee_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for school_fee_items SELECT" ON public.school_fee_items FOR SELECT USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for school_fee_items INSERT" ON public.school_fee_items FOR INSERT WITH CHECK (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for school_fee_items UPDATE" ON public.school_fee_items FOR UPDATE USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for school_fee_items DELETE" ON public.school_fee_items FOR DELETE USING (school_id = get_user_school_id());

-- 4. Ajout de l'enseignant lié aux créneaux horaires (Partie E)
ALTER TABLE public.schedule_items
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- ==========================================
-- 11_public_classes_read.sql
-- ELIMU RDC - Public Read Access for Class Sections
-- ==========================================
-- Allows anon and authenticated roles to SELECT only public/non-sensitive
-- columns of class_sections (id, name, level, stream, school_id) so public visitors
-- can browse available classes when submitting an online application.
-- Internal administrative details (capacity, enrolled, room, main_teacher)
-- remain restricted to school staff.
-- ==========================================

-- 1. Grant SELECT privilege on specific columns only (not *)
GRANT SELECT (id, name, level, stream, school_id) ON public.class_sections TO anon, authenticated;

-- 2. Add an RLS policy for SELECT without school_id restriction (filtering by school is performed by the client)
DROP POLICY IF EXISTS "Allow public read on class_sections" ON public.class_sections;
CREATE POLICY "Allow public read on class_sections"
ON public.class_sections
FOR SELECT
TO anon, authenticated
USING (true);

-- ==========================================
-- 02_rls_policies.sql
-- ELIMU RDC - Row Level Security Policies
-- ==========================================

-- Helper function to get the current user's school_id
-- We assume that the user's school_id is stored in their JWT app_metadata or we can look it up in the users table
-- For simplicity and performance, we'll look it up from the users table using the auth.uid()
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$$;

-- Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE homeworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuition_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;

-- 1. Subscription Plans (Publicly readable)
CREATE POLICY "Subscription plans are publicly readable" 
ON subscription_plans FOR SELECT 
USING (true);

-- 2. Schools (Publicly readable, only superadmin can modify/create)
CREATE POLICY "Schools are publicly readable" 
ON schools FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create a school during onboarding"
ON schools FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own school"
ON schools FOR UPDATE
USING (id = get_user_school_id());

-- 3. Users
CREATE POLICY "Users can view users from their own school" 
ON users FOR SELECT 
USING (school_id = get_user_school_id());


CREATE POLICY "Users can update users in their own school" 
ON users FOR UPDATE 
USING (school_id = get_user_school_id());

-- Policies for tenant-isolated tables
-- Create a generic policy generation approach for simplicity in this script
-- (Applies to students, report_cards, course_grades, attendance_records, homeworks, tuition_invoices, application_dossiers, messages, class_sections, schedule_items)

-- Students
CREATE POLICY "Tenant isolation for students SELECT" ON students FOR SELECT USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for students INSERT" ON students FOR INSERT WITH CHECK (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for students UPDATE" ON students FOR UPDATE USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for students DELETE" ON students FOR DELETE USING (school_id = get_user_school_id());

-- Report Cards
CREATE POLICY "Tenant isolation for report_cards SELECT" ON report_cards FOR SELECT USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for report_cards INSERT" ON report_cards FOR INSERT WITH CHECK (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for report_cards UPDATE" ON report_cards FOR UPDATE USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for report_cards DELETE" ON report_cards FOR DELETE USING (school_id = get_user_school_id());

-- Course Grades
CREATE POLICY "Tenant isolation for course_grades SELECT" ON course_grades FOR SELECT USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for course_grades INSERT" ON course_grades FOR INSERT WITH CHECK (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for course_grades UPDATE" ON course_grades FOR UPDATE USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for course_grades DELETE" ON course_grades FOR DELETE USING (school_id = get_user_school_id());

-- Attendance Records
CREATE POLICY "Tenant isolation for attendance_records SELECT" ON attendance_records FOR SELECT USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for attendance_records INSERT" ON attendance_records FOR INSERT WITH CHECK (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for attendance_records UPDATE" ON attendance_records FOR UPDATE USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for attendance_records DELETE" ON attendance_records FOR DELETE USING (school_id = get_user_school_id());

-- Homeworks
CREATE POLICY "Tenant isolation for homeworks SELECT" ON homeworks FOR SELECT USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for homeworks INSERT" ON homeworks FOR INSERT WITH CHECK (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for homeworks UPDATE" ON homeworks FOR UPDATE USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for homeworks DELETE" ON homeworks FOR DELETE USING (school_id = get_user_school_id());

-- Tuition Invoices
CREATE POLICY "Tenant isolation for tuition_invoices SELECT" ON tuition_invoices FOR SELECT USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for tuition_invoices INSERT" ON tuition_invoices FOR INSERT WITH CHECK (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for tuition_invoices UPDATE" ON tuition_invoices FOR UPDATE USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for tuition_invoices DELETE" ON tuition_invoices FOR DELETE USING (school_id = get_user_school_id());

-- Application Dossiers
CREATE POLICY "Tenant isolation for application_dossiers SELECT" ON application_dossiers FOR SELECT USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for application_dossiers INSERT" ON application_dossiers FOR INSERT WITH CHECK (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for application_dossiers UPDATE" ON application_dossiers FOR UPDATE USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for application_dossiers DELETE" ON application_dossiers FOR DELETE USING (school_id = get_user_school_id());

-- Messages
CREATE POLICY "Tenant isolation for messages SELECT" ON messages FOR SELECT USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for messages INSERT" ON messages FOR INSERT WITH CHECK (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for messages UPDATE" ON messages FOR UPDATE USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for messages DELETE" ON messages FOR DELETE USING (school_id = get_user_school_id());

-- Class Sections
CREATE POLICY "Tenant isolation for class_sections SELECT" ON class_sections FOR SELECT USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for class_sections INSERT" ON class_sections FOR INSERT WITH CHECK (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for class_sections UPDATE" ON class_sections FOR UPDATE USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for class_sections DELETE" ON class_sections FOR DELETE USING (school_id = get_user_school_id());

-- Schedule Items
CREATE POLICY "Tenant isolation for schedule_items SELECT" ON schedule_items FOR SELECT USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for schedule_items INSERT" ON schedule_items FOR INSERT WITH CHECK (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for schedule_items UPDATE" ON schedule_items FOR UPDATE USING (school_id = get_user_school_id());
CREATE POLICY "Tenant isolation for schedule_items DELETE" ON schedule_items FOR DELETE USING (school_id = get_user_school_id());

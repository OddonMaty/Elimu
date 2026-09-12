-- ==========================================
-- 01_schema.sql
-- ELIMU RDC - Supabase Database Schema
-- ==========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  badge_title VARCHAR(255),
  capacity_range VARCHAR(255),
  min_students INTEGER,
  max_students INTEGER,
  monthly_price_usd DECIMAL(10,2) NOT NULL,
  annual_price_usd DECIMAL(10,2) NOT NULL,
  tagline TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended BOOLEAN DEFAULT false,
  highlight BOOLEAN DEFAULT false
);

-- Seed initial plans
INSERT INTO subscription_plans (id, name, badge_title, capacity_range, min_students, max_students, monthly_price_usd, annual_price_usd, tagline, features, recommended, highlight) VALUES
('plan_micro', 'Plan Starter', 'Maternelle & Primaire', '1 à 250 élèves', 1, 250, 35.00, 28.00, 'Pour les petites écoles de quartier et centres d’éducation de base.', '["Registre matricule national conforme EPST", "Bulletins scolaires officiels automatisés", "Suivi des présences & absences journalières", "2 comptes de gestion administrative", "Export PDF des listes d’élèves", "Support client standard par WhatsApp & Email"]', false, false),
('plan_medium', 'Plan Pro', 'Collège & Institut', '251 à 600 élèves', 251, 600, 79.00, 63.00, 'Pour les collèges et lycées à cycle d’enseignement complet.', '["Tous les modules (Direction, Caisse, Parents, Enseignants)", "Passerelle SMS automatique aux parents (Vodacom, Airtel, Orange)", "Gestion de caisse & minerval par tranches (USD / CDF)", "Cartes d’élèves avec QR Code sécurisé", "10 comptes enseignants & personnel", "Support prioritaire 6j/7"]', false, false),
('plan_large', 'Plan Business Référence', '★ Recommandé RDC', '601 à 1 500 élèves', 601, 1500, 149.00, 119.00, 'Pour les grands collèges conventionnés et complexes de référence.', '["Paiements Mobile Money direct (M-Pesa, Orange, Airtel Money)", "Notifications WhatsApp & SMS parents automatisées", "Gestion des emplois du temps & attribution des salles", "Comptes enseignants & personnel illimités", "Portail interactif parents avec bulletins en ligne", "Formation du personnel sur site / visio", "Assistance technique VIP 24/7"]', true, true),
('plan_complex', 'Plan Entreprise+', 'Multi-Campus & Réseau', '+1 500 élèves • Multi-sites', 1501, 10000, 299.00, 239.00, 'Pour les réseaux d’écoles, coordinations provinciales et universités.', '["Gestion multi-sites & multi-implantations centralisée", "Comptabilité générale & trésorerie USD / Francs Congolais (CDF)", "API complète & exports progiciels bancaires", "Hébergement dédié & sauvegardes horaires", "Chef de projet & consultant technique dédié Elimu"]', false, false)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  monthly_price_usd = EXCLUDED.monthly_price_usd,
  annual_price_usd = EXCLUDED.annual_price_usd,
  features = EXCLUDED.features;

-- 2. Schools (Tenants)
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  founded_year INTEGER,
  type VARCHAR(100) NOT NULL, -- 'Privé', 'Public Conventionné', 'International'
  education_levels JSONB NOT NULL DEFAULT '[]'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  annual_tuition_min_usd DECIMAL(10,2),
  annual_tuition_max_usd DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  teacher_count INTEGER DEFAULT 0,
  pass_rate_state_exam DECIMAL(5,2),
  featured BOOLEAN DEFAULT false,
  cover_image TEXT,
  logo_image TEXT,
  description TEXT,
  infrastructure JSONB DEFAULT '[]'::jsonb,
  documents_required JSONB DEFAULT '[]'::jsonb,
  payment_methods JSONB DEFAULT '[]'::jsonb,
  subscription_plan_id VARCHAR(50) REFERENCES subscription_plans(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Users (Extending auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'direction', 'secretariat', 'teacher', 'parent', 'superadmin'
  avatar_url TEXT,
  phone VARCHAR(50),
  children_ids JSONB DEFAULT '[]'::jsonb,
  assigned_classes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Students
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  matricule VARCHAR(100) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  middle_name VARCHAR(255),
  gender VARCHAR(10) NOT NULL,
  birth_date DATE NOT NULL,
  birth_place VARCHAR(255) NOT NULL,
  nationality VARCHAR(100) NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  section VARCHAR(100) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  enrollment_date DATE NOT NULL,
  photo_url TEXT,
  status VARCHAR(50) NOT NULL, -- 'Inscrit', 'En attente', 'Suspendu', 'Diplômé'
  parent_id UUID, -- Optional foreign key if you link to a user record
  parent_name VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  medical_notes TEXT,
  tuition_status VARCHAR(50) NOT NULL, -- 'Payé', 'Tranche 1', 'Tranche 2', 'Impayé'
  overall_average DECIMAL(5,2),
  rank_in_class INTEGER,
  total_in_class INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Report Cards & Course Grades
CREATE TABLE IF NOT EXISTS report_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  matricule VARCHAR(100) NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  section VARCHAR(100) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  term VARCHAR(50) NOT NULL, -- 'Semestre 1', 'Semestre 2', 'Annuel'
  total_obtained DECIMAL(10,2) NOT NULL,
  total_max DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  rank INTEGER NOT NULL,
  class_size INTEGER NOT NULL,
  conduct VARCHAR(50) NOT NULL,
  application VARCHAR(50) NOT NULL,
  teacher_comment TEXT,
  director_comment TEXT,
  decision VARCHAR(100) NOT NULL,
  issue_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  report_card_id UUID NOT NULL REFERENCES report_cards(id) ON DELETE CASCADE,
  course_id VARCHAR(100) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  max_points DECIMAL(10,2) NOT NULL,
  first_period DECIMAL(10,2),
  second_period DECIMAL(10,2),
  first_exam DECIMAL(10,2),
  total_semester1 DECIMAL(10,2),
  third_period DECIMAL(10,2),
  fourth_period DECIMAL(10,2),
  second_exam DECIMAL(10,2),
  total_semester2 DECIMAL(10,2),
  annual_total DECIMAL(10,2),
  percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'PRESENT', 'ABSENT', 'RETARD', 'JUSTIFIE'
  justification_reason TEXT,
  justification_status VARCHAR(50), -- 'EN_ATTENTE', 'VALIDE', 'REJETE'
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Homeworks
CREATE TABLE IF NOT EXISTS homeworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  teacher_name VARCHAR(255) NOT NULL,
  teacher_id UUID,
  assigned_date DATE NOT NULL,
  due_date DATE NOT NULL,
  instructions TEXT NOT NULL,
  attachment_url TEXT,
  submission_status VARCHAR(50), -- 'RENDU', 'A_FAIRE', 'EN_RETARD', 'CORRIGE'
  score_obtained DECIMAL(5,2),
  max_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tuition Invoices
CREATE TABLE IF NOT EXISTS tuition_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100) NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  matricule VARCHAR(100) NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  parent_name VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  tranche VARCHAR(100) NOT NULL,
  amount_usd DECIMAL(10,2) NOT NULL,
  amount_cdf DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'PAYE', 'EN_ATTENTE', 'EN_RETARD', 'ANNULE'
  payment_date DATE,
  payment_method VARCHAR(50),
  transaction_reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Application Dossiers
CREATE TABLE IF NOT EXISTS application_dossiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  applicant_first_name VARCHAR(255) NOT NULL,
  applicant_last_name VARCHAR(255) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  birth_date DATE NOT NULL,
  target_class VARCHAR(100) NOT NULL,
  target_section VARCHAR(100) NOT NULL,
  previous_school VARCHAR(255) NOT NULL,
  parent_name VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  submission_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'SOUMIS', 'EN_EXAMEN', 'APPROUVE', 'REJETE'
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  review_notes TEXT,
  registration_fee_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(50) NOT NULL,
  recipient_id UUID NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT false,
  replies JSONB DEFAULT '[]'::jsonb
);

-- 11. Class Sections
CREATE TABLE IF NOT EXISTS class_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  level VARCHAR(100) NOT NULL,
  stream VARCHAR(100),
  capacity INTEGER NOT NULL,
  enrolled INTEGER NOT NULL,
  room VARCHAR(100) NOT NULL,
  main_teacher VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Schedule Items
CREATE TABLE IF NOT EXISTS schedule_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  day VARCHAR(20) NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  teacher_name VARCHAR(255) NOT NULL,
  room VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

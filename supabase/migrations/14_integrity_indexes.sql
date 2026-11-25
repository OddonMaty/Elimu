-- =====================================================================
-- 14_integrity_indexes.sql : intégrité non cassante (index, unicités métier, updated_at, effectifs des classes)
-- Testée sur elimu-dev. Aucune donnée en production au moment de l'écriture.
-- à appliquer après vérification des deux points signalés ci-dessous.
--   * Présences : un seul enregistrement par élève et par jour (uq_attendance_student_date).
--     À confirmer avec le fonctionnement voulu (pas de matin/après-midi séparés).
--   * Classes : nom unique par école (uq_class_sections_school_name).
-- =====================================================================

-- Index sur school_id et sur les clés étrangères
create index if not exists idx_users_school on public.users(school_id);
create index if not exists idx_students_school_class on public.students(school_id, class_name);
create index if not exists idx_students_parent on public.students(parent_id);
create index if not exists idx_class_sections_school on public.class_sections(school_id);
create index if not exists idx_report_cards_school on public.report_cards(school_id);
create index if not exists idx_report_cards_student on public.report_cards(student_id);
create index if not exists idx_course_grades_school on public.course_grades(school_id);
create index if not exists idx_attendance_school_date on public.attendance_records(school_id, date);
create index if not exists idx_attendance_student on public.attendance_records(student_id);
create index if not exists idx_homeworks_school_class on public.homeworks(school_id, class_name);
create index if not exists idx_homeworks_teacher on public.homeworks(teacher_id);
create index if not exists idx_messages_school on public.messages(school_id);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_recipient on public.messages(recipient_id);
create index if not exists idx_schedule_school on public.schedule_items(school_id);
create index if not exists idx_schedule_teacher on public.schedule_items(teacher_id);
create index if not exists idx_fee_items_school on public.school_fee_items(school_id);
create index if not exists idx_invoices_school on public.tuition_invoices(school_id);
create index if not exists idx_invoices_student on public.tuition_invoices(student_id);
create index if not exists idx_dossiers_school on public.application_dossiers(school_id);
create index if not exists idx_invitations_school on public.account_invitations(school_id);
create index if not exists idx_invitations_student on public.account_invitations(student_id);
create index if not exists idx_schools_plan on public.schools(subscription_plan_id);

-- Unicités métier
create unique index if not exists uq_students_school_matricule on public.students(school_id, matricule);
create unique index if not exists uq_invoices_school_number on public.tuition_invoices(school_id, invoice_number);
create unique index if not exists uq_attendance_student_date on public.attendance_records(student_id, date);
create unique index if not exists uq_report_cards_student_term on public.report_cards(student_id, academic_year, term);
create unique index if not exists uq_class_sections_school_name on public.class_sections(school_id, name);
create unique index if not exists uq_course_grades_card_course on public.course_grades(report_card_id, course_id);

-- updated_at automatique
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

do $$ declare t text; begin
  foreach t in array array['schools','users','students','class_sections','report_cards','course_grades',
    'attendance_records','homeworks','schedule_items','school_fee_items','tuition_invoices','application_dossiers'] loop
    execute format('alter table public.%I add column if not exists updated_at timestamptz not null default now()', t);
    execute format('drop trigger if exists trg_set_updated_at on public.%I', t);
    execute format('create trigger trg_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Effectif des classes tenu à jour automatiquement (schools.student_count n'est pas touché :
-- c'est le chiffre déclaré pour la vitrine publique)
create or replace function public.refresh_class_enrolled(p_school uuid, p_class text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.class_sections c
     set enrolled = (select count(*) from public.students s where s.school_id = p_school and s.class_name = p_class)
   where c.school_id = p_school and c.name = p_class;
end $$;
revoke all on function public.refresh_class_enrolled(uuid, text) from public, anon, authenticated;

create or replace function public.trg_students_enrolled()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op in ('UPDATE','DELETE') then perform public.refresh_class_enrolled(old.school_id, old.class_name); end if;
  if tg_op in ('INSERT','UPDATE') then perform public.refresh_class_enrolled(new.school_id, new.class_name); end if;
  return null;
end $$;
revoke all on function public.trg_students_enrolled() from public, anon, authenticated;

drop trigger if exists trg_students_enrolled on public.students;
create trigger trg_students_enrolled after insert or update of class_name, school_id or delete on public.students
  for each row execute function public.trg_students_enrolled();

update public.class_sections c
   set enrolled = (select count(*) from public.students s where s.school_id = c.school_id and s.class_name = c.name);

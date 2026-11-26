-- =====================================================================
-- 13_application_payment_and_triggers.sql
--  a) déclaration de paiement des frais de dossier par le candidat (confirmation par l'école)
--  b) suivi public d'un dossier : get_application_status inclut la déclaration de paiement
--  c) présences : un parent peut seulement justifier l'absence de son enfant
--  d) matricule des élèves généré côté serveur
--  e) code d'invitation généré côté serveur pour les insertions directes
-- =====================================================================

-- a) Déclaration de paiement -------------------------------------------------
alter table public.application_dossiers
  add column if not exists payment_reference text,
  add column if not exists payment_declared_at timestamptz;

create or replace function public.declare_application_payment(p_id uuid, p_reference text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_row public.application_dossiers%rowtype;
begin
  if p_reference is null or length(btrim(p_reference)) < 4 or length(p_reference) > 100 then
    raise exception 'Référence de transaction invalide';
  end if;
  update public.application_dossiers
     set payment_reference = btrim(p_reference), payment_declared_at = now()
   where id = p_id and registration_fee_paid is not true
  returning * into v_row;
  if not found then
    raise exception 'Dossier introuvable ou frais déjà confirmés';
  end if;
  return jsonb_build_object('id', v_row.id, 'payment_reference', v_row.payment_reference,
                            'payment_declared_at', v_row.payment_declared_at);
end $$;
revoke all on function public.declare_application_payment(uuid, text) from public;
grant execute on function public.declare_application_payment(uuid, text) to anon, authenticated;

-- b) Suivi public d'un dossier (l'identifiant uuid du dossier sert de jeton) ---
create or replace function public.get_application_status(p_id uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', d.id, 'school_id', d.school_id, 'school_name', s.name,
    'applicant_first_name', d.applicant_first_name, 'applicant_last_name', d.applicant_last_name,
    'target_class', d.target_class, 'target_section', d.target_section,
    'status', d.status, 'registration_fee_paid', d.registration_fee_paid,
    'payment_reference', d.payment_reference, 'payment_declared_at', d.payment_declared_at,
    'submission_date', d.submission_date)
  from public.application_dossiers d
  join public.schools s on s.id = d.school_id
  where d.id = p_id;
$$;
revoke all on function public.get_application_status(uuid) from public;
grant execute on function public.get_application_status(uuid) to anon, authenticated;

-- c) Présences : le parent ne peut que justifier l'absence ----------------------
create or replace function public.protect_attendance_for_parents()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated','anon') and not public.is_school_personnel() then
    if (new.school_id, new.student_id, new.student_name, new.class_name, new.date)
       is distinct from (old.school_id, old.student_id, old.student_name, old.class_name, old.date) then
      raise exception 'Les parents ne peuvent modifier que la justification d''absence';
    end if;
    if new.status is distinct from old.status and new.status <> 'JUSTIFIE' then
      raise exception 'Les parents ne peuvent que justifier une absence';
    end if;
    if new.justification_status is distinct from old.justification_status
       and new.justification_status is distinct from 'EN_ATTENTE' then
      raise exception 'Le statut de la justification est décidé par l''école';
    end if;
  end if;
  return new;
end $$;

-- d) Matricule généré par le serveur si absent ----------------------------------
create sequence if not exists public.student_matricule_seq;
revoke all on sequence public.student_matricule_seq from public, anon, authenticated;

create or replace function public.set_student_matricule()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.matricule is null or btrim(new.matricule) = '' then
    new.matricule := 'ELM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.student_matricule_seq')::text, 5, '0');
  end if;
  return new;
end $$;
revoke all on function public.set_student_matricule() from public, anon, authenticated;
drop trigger if exists trg_set_student_matricule on public.students;
create trigger trg_set_student_matricule before insert on public.students
  for each row execute function public.set_student_matricule();

-- e) Code d'invitation toujours généré par le serveur (le client lit le code renvoyé) --
create or replace function public.set_invitation_code()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated','anon') then
    new.code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  end if;
  return new;
end $$;
drop trigger if exists trg_set_invitation_code on public.account_invitations;
create trigger trg_set_invitation_code before insert on public.account_invitations
  for each row execute function public.set_invitation_code();

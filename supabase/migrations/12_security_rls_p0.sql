-- =====================================================================
-- 12_security_rls_p0.sql : durcissement de la sécurité (RLS par rôle, triggers, fonctions, stockage)
--
-- Rôles de l'application : direction, proviseur, secretariat, teacher, tresorerie, parent
-- (superadmin : sans école, ne voit que les données publiques pour l'instant).
--
-- Cette migration REMPLACE toutes les politiques RLS du schéma public et des buckets
-- application-documents / school-media. À appliquer d'abord sur un environnement de
-- développement, avec le code frontend de la même branche (voir supabase/README.md).
-- =====================================================================

-- ---------- 1. Fonctions utilitaires (SECURITY DEFINER, search_path figé) ----------
create or replace function public.get_user_school_id()
returns uuid language sql stable security definer set search_path = ''
as $$ select school_id from public.users where id = (select auth.uid()) $$;

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = ''
as $$ select role::text from public.users where id = (select auth.uid()) $$;

create or replace function public.is_school_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(public.current_user_role() = 'direction', false) $$;

create or replace function public.is_school_staff()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(public.current_user_role() in ('direction','secretariat'), false) $$;

-- personnel = tout rôle sauf parent / élève (direction, secrétariat, enseignants, économe...)
create or replace function public.is_school_personnel()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(public.current_user_role() not in ('parent','student','eleve'), false) $$;

-- direction + proviseur + secrétariat : gestion des classes, emplois du temps, suppressions pédagogiques
create or replace function public.is_school_manager()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(public.current_user_role() in ('direction','proviseur','secretariat'), false) $$;

-- direction + secrétariat + trésorerie : factures et barème des frais
create or replace function public.is_school_finance()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(public.current_user_role() in ('direction','secretariat','tresorerie'), false) $$;

create or replace function public.my_children_ids()
returns uuid[] language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select array_agg(c::uuid)
       from public.users u,
            jsonb_array_elements_text(case when jsonb_typeof(u.children_ids) = 'array' then u.children_ids else '[]'::jsonb end) as c
      where u.id = (select auth.uid())),
    '{}'::uuid[]);
$$;

revoke all on function public.get_user_school_id(), public.current_user_role(), public.is_school_admin(),
  public.is_school_staff(), public.is_school_personnel(), public.is_school_manager(), public.is_school_finance(),
  public.my_children_ids() from public, anon;
grant execute on function public.get_user_school_id(), public.current_user_role(), public.is_school_admin(),
  public.is_school_staff(), public.is_school_personnel(), public.is_school_manager(), public.is_school_finance(),
  public.my_children_ids() to authenticated;

-- ---------- 2. Triggers anti-escalade de privilèges ----------
create or replace function public.protect_users_columns()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated','anon') then
    if new.id is distinct from old.id or new.school_id is distinct from old.school_id then
      raise exception 'Modification interdite de l''identifiant ou de l''école';
    end if;
    if old.id = (select auth.uid()) and new.role is distinct from old.role then
      raise exception 'Vous ne pouvez pas modifier votre propre rôle';
    end if;
    if not public.is_school_admin() then
      if new.role is distinct from old.role
         or new.children_ids is distinct from old.children_ids
         or new.assigned_classes is distinct from old.assigned_classes
         or new.admin_title is distinct from old.admin_title
         or new.email is distinct from old.email then
        raise exception 'Seule la direction peut modifier ces champs';
      end if;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_protect_users_columns on public.users;
create trigger trg_protect_users_columns before update on public.users
  for each row execute function public.protect_users_columns();

create or replace function public.protect_attendance_for_parents()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated','anon') and not public.is_school_personnel() then
    if (new.school_id, new.student_id, new.student_name, new.class_name, new.date, new.status)
       is distinct from (old.school_id, old.student_id, old.student_name, old.class_name, old.date, old.status) then
      raise exception 'Les parents ne peuvent modifier que la justification d''absence';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_protect_attendance_for_parents on public.attendance_records;
create trigger trg_protect_attendance_for_parents before update on public.attendance_records
  for each row execute function public.protect_attendance_for_parents();

-- ---------- 3. Fonctions métier durcies ----------
-- Ancienne surcharge à 10 arguments de create_school_with_admin (migration 03) : on la durcit
-- si elle existe ; elle pourra être supprimée une fois le frontend confirmé sur la version à 12 arguments.
do $$
begin
  if to_regprocedure('public.create_school_with_admin(character varying,character varying,character varying,text,character varying,character varying,character varying,character varying,character varying,character varying)') is not null then
    alter function public.create_school_with_admin(character varying,character varying,character varying,text,character varying,character varying,character varying,character varying,character varying,character varying) set search_path = '';
    revoke all on function public.create_school_with_admin(character varying,character varying,character varying,text,character varying,character varying,character varying,character varying,character varying,character varying) from public, anon;
    grant execute on function public.create_school_with_admin(character varying,character varying,character varying,text,character varying,character varying,character varying,character varying,character varying,character varying) to authenticated;
  end if;
end $$;

create or replace function public.create_school_with_admin(
  p_school_name character varying, p_city character varying, p_province character varying,
  p_address text, p_phone character varying, p_email character varying, p_type character varying,
  p_subscription_plan_id character varying, p_admin_name character varying,
  p_admin_phone character varying, p_admin_title character varying,
  p_payment_phone character varying default null::character varying)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid;
  v_school_id uuid;
  v_auth_email text;
begin
  v_user_id := (select auth.uid());
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  if exists (select 1 from public.users where id = v_user_id) then
    raise exception 'User already belongs to a school';
  end if;
  select email into v_auth_email from auth.users where id = v_user_id;

  insert into public.schools (name, city, province, address, phone, email, type, subscription_plan_id, payment_phone)
  values (p_school_name, p_city, p_province, p_address, p_phone, p_email, p_type, p_subscription_plan_id, p_payment_phone)
  returning id into v_school_id;

  -- l'e-mail du compte est celui d'authentification, pas celui saisi dans le formulaire
  insert into public.users (id, school_id, name, email, role, phone, admin_title)
  values (v_user_id, v_school_id, p_admin_name, coalesce(v_auth_email, p_email), 'direction', p_admin_phone, p_admin_title);

  return v_school_id;
end $$;

create or replace function public.invite_or_link_parent(
  p_school_id uuid, p_student_id uuid, p_parent_name character varying,
  p_parent_phone character varying, p_parent_email character varying, p_code character varying)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_parent record;
  v_code text;
begin
  if p_school_id is distinct from public.get_user_school_id() or not public.is_school_staff() then
    raise exception 'Non autorisé pour cette école';
  end if;
  if not exists (select 1 from public.students where id = p_student_id and school_id = p_school_id) then
    raise exception 'Élève introuvable dans cette école';
  end if;

  select * into v_parent from public.users
   where lower(email) = lower(p_parent_email) and school_id = p_school_id and role = 'parent';

  if found then
    update public.users
       set children_ids = case
             when coalesce(children_ids, '[]'::jsonb) @> to_jsonb(p_student_id) then coalesce(children_ids, '[]'::jsonb)
             else coalesce(children_ids, '[]'::jsonb) || jsonb_build_array(p_student_id)
           end
     where id = v_parent.id;
    return jsonb_build_object('action', 'linked',
      'message', 'Le compte parent existant a été mis à jour avec le nouvel élève.');
  end if;

  -- le code est généré côté serveur (le paramètre p_code est ignoré, conservé pour compatibilité)
  v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  insert into public.account_invitations (code, role, school_id, intended_name, intended_email, intended_phone, student_id)
  values (v_code, 'parent', p_school_id, p_parent_name, p_parent_email, p_parent_phone, p_student_id);

  return jsonb_build_object('action', 'invited', 'code', v_code, 'message', 'Nouvelle invitation générée.');
end $$;

create or replace function public.redeem_invitation(p_code character varying)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid;
  v_inv record;
begin
  v_user_id := (select auth.uid());
  if v_user_id is null then raise exception 'Not authenticated'; end if;

  select * into v_inv from public.account_invitations where code = upper(trim(p_code)) for update;
  if not found then raise exception 'Code d''invitation invalide'; end if;
  if v_inv.used then raise exception 'Ce code d''invitation a déjà été utilisé'; end if;
  if exists (select 1 from public.users where id = v_user_id) then
    raise exception 'L''utilisateur appartient déjà à une école';
  end if;

  if v_inv.role = 'parent' then
    insert into public.users (id, school_id, name, email, phone, role, children_ids)
    values (v_user_id, v_inv.school_id, v_inv.intended_name, v_inv.intended_email, v_inv.intended_phone,
            'parent', jsonb_build_array(v_inv.student_id));
  else
    insert into public.users (id, school_id, name, email, phone, role)
    values (v_user_id, v_inv.school_id, v_inv.intended_name, v_inv.intended_email, v_inv.intended_phone, v_inv.role);
  end if;

  update public.account_invitations set used = true, used_at = now() where id = v_inv.id;
  return jsonb_build_object('role', v_inv.role, 'school_id', v_inv.school_id);
end $$;

-- suivi d'un dossier par le candidat : l'identifiant (uuid) du dossier sert de jeton
create or replace function public.get_application_status(p_id uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', d.id, 'school_id', d.school_id, 'school_name', s.name,
    'applicant_first_name', d.applicant_first_name, 'applicant_last_name', d.applicant_last_name,
    'target_class', d.target_class, 'target_section', d.target_section,
    'status', d.status, 'registration_fee_paid', d.registration_fee_paid,
    'submission_date', d.submission_date)
  from public.application_dossiers d
  join public.schools s on s.id = d.school_id
  where d.id = p_id;
$$;

revoke all on function
  public.create_school_with_admin(character varying, character varying, character varying, text, character varying,
    character varying, character varying, character varying, character varying, character varying, character varying, character varying),
  public.invite_or_link_parent(uuid, uuid, character varying, character varying, character varying, character varying),
  public.redeem_invitation(character varying),
  public.get_application_status(uuid)
  from public, anon;
grant execute on function
  public.create_school_with_admin(character varying, character varying, character varying, text, character varying,
    character varying, character varying, character varying, character varying, character varying, character varying, character varying),
  public.invite_or_link_parent(uuid, uuid, character varying, character varying, character varying, character varying),
  public.redeem_invitation(character varying)
  to authenticated;
grant execute on function public.get_application_status(uuid) to anon, authenticated;

-- ---------- 4. Politiques RLS : on repart de zéro ----------
do $$ declare r record; begin
  for r in select schemaname, tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
  for r in select policyname from pg_policies
           where schemaname = 'storage' and tablename = 'objects'
             and (coalesce(qual,'') || coalesce(with_check,'')) ~ '(application-documents|school-media)' loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

-- Plans d'abonnement : lecture publique
create policy plans_select on public.subscription_plans for select to anon, authenticated using (true);

-- Écoles : vitrine publique (provisoire, voir README) ; modification par la direction de l'école
create policy schools_select on public.schools for select to anon, authenticated using (true);
create policy schools_update_admin on public.schools for update to authenticated
  using (id = public.get_user_school_id() and public.is_school_admin())
  with check (id = public.get_user_school_id() and public.is_school_admin());

-- Utilisateurs : pas d'INSERT direct (création uniquement via fonctions SECURITY DEFINER)
create policy users_select on public.users for select to authenticated
  using (id = (select auth.uid())
         or (school_id = public.get_user_school_id()
             and (public.is_school_personnel() or role not in ('parent','student','eleve'))));
create policy users_update on public.users for update to authenticated
  using (id = (select auth.uid()) or (school_id = public.get_user_school_id() and public.is_school_admin()))
  with check (id = (select auth.uid()) or (school_id = public.get_user_school_id() and public.is_school_admin()));
create policy users_delete_admin on public.users for delete to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_admin() and id <> (select auth.uid()));

-- Élèves
create policy students_select on public.students for select to authenticated
  using (school_id = public.get_user_school_id()
         and (public.is_school_personnel() or id = any(public.my_children_ids())));
create policy students_insert on public.students for insert to authenticated
  with check (school_id = public.get_user_school_id() and public.is_school_staff());
create policy students_update on public.students for update to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_staff())
  with check (school_id = public.get_user_school_id() and public.is_school_staff());
create policy students_delete on public.students for delete to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_admin());

-- Classes : lecture publique (formulaire d'admission), écriture par le secrétariat/la direction
create policy class_sections_select on public.class_sections for select to anon, authenticated using (true);
create policy class_sections_write on public.class_sections for all to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_manager())
  with check (school_id = public.get_user_school_id() and public.is_school_manager());

-- Barème des frais
create policy fee_items_select on public.school_fee_items for select to authenticated
  using (school_id = public.get_user_school_id());
create policy fee_items_write on public.school_fee_items for all to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_finance())
  with check (school_id = public.get_user_school_id() and public.is_school_finance());

-- Présences
create policy attendance_select on public.attendance_records for select to authenticated
  using (school_id = public.get_user_school_id()
         and (public.is_school_personnel() or student_id = any(public.my_children_ids())));
create policy attendance_insert on public.attendance_records for insert to authenticated
  with check (school_id = public.get_user_school_id() and public.is_school_personnel());
create policy attendance_update on public.attendance_records for update to authenticated
  using (school_id = public.get_user_school_id()
         and (public.is_school_personnel() or student_id = any(public.my_children_ids())))
  with check (school_id = public.get_user_school_id()
         and (public.is_school_personnel() or student_id = any(public.my_children_ids())));
create policy attendance_delete on public.attendance_records for delete to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_manager());

-- Devoirs
create policy homeworks_select on public.homeworks for select to authenticated
  using (school_id = public.get_user_school_id()
         and (public.is_school_personnel()
              or exists (select 1 from public.students s
                          where s.id = any(public.my_children_ids())
                            and s.school_id = homeworks.school_id
                            and s.class_name = homeworks.class_name)));
create policy homeworks_write on public.homeworks for all to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_personnel())
  with check (school_id = public.get_user_school_id() and public.is_school_personnel());

-- Emploi du temps
create policy schedule_select on public.schedule_items for select to authenticated
  using (school_id = public.get_user_school_id());
create policy schedule_write on public.schedule_items for all to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_manager())
  with check (school_id = public.get_user_school_id() and public.is_school_manager());

-- Bulletins et notes
create policy report_cards_select on public.report_cards for select to authenticated
  using (school_id = public.get_user_school_id()
         and (public.is_school_personnel() or student_id = any(public.my_children_ids())));
create policy report_cards_insert on public.report_cards for insert to authenticated
  with check (school_id = public.get_user_school_id() and public.is_school_personnel());
create policy report_cards_update on public.report_cards for update to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_personnel())
  with check (school_id = public.get_user_school_id() and public.is_school_personnel());
create policy report_cards_delete on public.report_cards for delete to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_manager());

create policy course_grades_select on public.course_grades for select to authenticated
  using (school_id = public.get_user_school_id()
         and (public.is_school_personnel()
              or exists (select 1 from public.report_cards rc
                          where rc.id = course_grades.report_card_id
                            and rc.student_id = any(public.my_children_ids()))));
create policy course_grades_insert on public.course_grades for insert to authenticated
  with check (school_id = public.get_user_school_id() and public.is_school_personnel());
create policy course_grades_update on public.course_grades for update to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_personnel())
  with check (school_id = public.get_user_school_id() and public.is_school_personnel());
create policy course_grades_delete on public.course_grades for delete to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_manager());

-- Factures : direction/secrétariat, et parents pour leurs enfants
create policy invoices_select on public.tuition_invoices for select to authenticated
  using (school_id = public.get_user_school_id()
         and (public.is_school_finance() or student_id = any(public.my_children_ids())));
create policy invoices_write on public.tuition_invoices for all to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_finance())
  with check (school_id = public.get_user_school_id() and public.is_school_finance());

-- Messages : visibles par l'expéditeur et le destinataire uniquement
-- (hypothèse à vérifier : recipient_id = users.id du destinataire)
create policy messages_select on public.messages for select to authenticated
  using (school_id = public.get_user_school_id()
         and (sender_id = (select auth.uid()) or recipient_id = (select auth.uid())));
create policy messages_insert on public.messages for insert to authenticated
  with check (school_id = public.get_user_school_id() and sender_id = (select auth.uid()));
create policy messages_update on public.messages for update to authenticated
  using (school_id = public.get_user_school_id()
         and (sender_id = (select auth.uid()) or recipient_id = (select auth.uid())))
  with check (school_id = public.get_user_school_id()
         and (sender_id = (select auth.uid()) or recipient_id = (select auth.uid())));
create policy messages_delete on public.messages for delete to authenticated
  using (school_id = public.get_user_school_id() and sender_id = (select auth.uid()));

-- Invitations : le secrétariat ne peut inviter ni direction ni secrétariat
create policy invitations_select on public.account_invitations for select to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_staff());
create policy invitations_insert on public.account_invitations for insert to authenticated
  with check (school_id = public.get_user_school_id()
              and (public.is_school_admin()
                   or (public.is_school_staff() and role not in ('direction','secretariat'))));
create policy invitations_delete on public.account_invitations for delete to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_staff());

-- Dossiers d'admission : dépôt public, lecture/modification réservées au personnel de l'école
create policy dossiers_insert_public on public.application_dossiers for insert to anon, authenticated
  with check (status = 'SOUMIS' and registration_fee_paid is not true and review_notes is null
              and exists (select 1 from public.schools s where s.id = application_dossiers.school_id));
create policy dossiers_select_staff on public.application_dossiers for select to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_staff());
create policy dossiers_update_staff on public.application_dossiers for update to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_staff())
  with check (school_id = public.get_user_school_id() and public.is_school_staff());
create policy dossiers_delete_staff on public.application_dossiers for delete to authenticated
  using (school_id = public.get_user_school_id() and public.is_school_staff());

-- ---------- 5. Privilèges du rôle anonyme (défense en profondeur) ----------
revoke all on all tables in schema public from anon;
grant select on public.subscription_plans, public.schools, public.class_sections to anon;
grant insert on public.application_dossiers to anon;

-- ---------- 6. Stockage ----------
-- Interim : seuls le personnel (direction/secrétariat) peut lire les pièces d'admission
-- et modifier les médias. L'isolation par école (chemin préfixé par school_id) viendra
-- avec la migration 0003, après adaptation du frontend.
create policy storage_docs_insert on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'application-documents');
create policy storage_docs_select_staff on storage.objects for select to authenticated
  using (bucket_id = 'application-documents' and public.is_school_staff());
create policy storage_media_select on storage.objects for select to anon, authenticated
  using (bucket_id = 'school-media');
create policy storage_media_insert_staff on storage.objects for insert to authenticated
  with check (bucket_id = 'school-media' and public.is_school_staff());
create policy storage_media_update_staff on storage.objects for update to authenticated
  using (bucket_id = 'school-media' and public.is_school_staff())
  with check (bucket_id = 'school-media' and public.is_school_staff());
create policy storage_media_delete_staff on storage.objects for delete to authenticated
  using (bucket_id = 'school-media' and public.is_school_staff());

update storage.buckets set file_size_limit = 8388608,
  allowed_mime_types = array['application/pdf','image/jpeg','image/png','image/webp']
 where id = 'application-documents';
update storage.buckets set file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg','image/png','image/webp']
 where id = 'school-media';

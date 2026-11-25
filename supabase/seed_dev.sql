-- =====================================================================
-- seed_dev.sql : données de démonstration, UNIQUEMENT pour l'environnement de développement.
-- Ne jamais exécuter en production (crée des comptes avec un mot de passe connu).
-- Prérequis : migrations 0001, 0002, 0003 appliquées.
--
-- Comptes créés (mot de passe commun : ElimuDev#2026) :
--   direction@elimu.test      direction    (Institut Mwanga, démo)
--   secretariat@elimu.test    secretariat  (même école)
--   enseignant@elimu.test     teacher      (même école)
--   parent1@elimu.test        parent       (parent d'Amani Baraka)
--   parent2@elimu.test        parent       (parent de Neema Zawadi)
--   autre.ecole@elimu.test    direction    (École Autre, démo : test d'isolation entre écoles)
-- =====================================================================
do $$
declare
  pw text := extensions.crypt('ElimuDev#2026', extensions.gen_salt('bf'));
  d  uuid := '11111111-1111-1111-1111-111111111111';
  s  uuid := '22222222-2222-2222-2222-222222222222';
  t  uuid := '33333333-3333-3333-3333-333333333333';
  p1 uuid := '44444444-4444-4444-4444-444444444444';
  p2 uuid := '55555555-5555-5555-5555-555555555555';
  o  uuid := '66666666-6666-6666-6666-666666666666';
  v_school uuid; v_school2 uuid; v_class uuid; v_st1 uuid; v_st2 uuid; v_rc1 uuid; v_rc2 uuid; v_res jsonb;
begin
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
  select '00000000-0000-0000-0000-000000000000', x.id, 'authenticated','authenticated', x.email, pw, now(),
         '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '','','',''
  from (values (d,'direction@elimu.test'),(s,'secretariat@elimu.test'),(t,'enseignant@elimu.test'),
               (p1,'parent1@elimu.test'),(p2,'parent2@elimu.test'),(o,'autre.ecole@elimu.test')) as x(id,email);
  insert into auth.identities (id,user_id,provider_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
  select gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub',u.id::text,'email',u.email,'email_verified',true),'email',now(),now(),now()
  from auth.users u where u.email like '%@elimu.test';

  -- la direction crée l'école démo (via la fonction, comme dans l'application)
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role','authenticated')::text, true);
  set local role authenticated;
  v_school := public.create_school_with_admin('Institut Mwanga (démo)','Uvira','Sud-Kivu','Av. de la Paix 12','+243990000001','direction@elimu.test','Privée conventionnée','plan_large','Direction Démo','+243990000001','Directeur','+243990000001');
  update public.schools set current_academic_year='2026-2027', current_term='1er trimestre' where id = v_school;
  insert into public.class_sections (school_id,name,level,stream,capacity,enrolled,room,main_teacher)
    values (v_school,'6ème Scientifique A','Humanités','Math-Physique',40,0,'Salle 1','M. Kabila') returning id into v_class;
  insert into public.students (school_id,matricule,first_name,last_name,gender,birth_date,birth_place,nationality,class_name,section,academic_year,enrollment_date,status,parent_name,parent_phone,parent_email,address,tuition_status)
    values (v_school,'MWA-0001','Amani','Baraka','M','2010-03-14','Uvira','Congolaise','6ème Scientifique A','Math-Physique','2026-2027','2026-09-01','ACTIF','Parent Un','+243990000004','parent1@elimu.test','Uvira','EN_ORDRE') returning id into v_st1;
  insert into public.students (school_id,matricule,first_name,last_name,gender,birth_date,birth_place,nationality,class_name,section,academic_year,enrollment_date,status,parent_name,parent_phone,parent_email,address,tuition_status)
    values (v_school,'MWA-0002','Neema','Zawadi','F','2010-07-02','Bukavu','Congolaise','6ème Scientifique A','Math-Physique','2026-2027','2026-09-01','ACTIF','Parent Deux','+243990000005','parent2@elimu.test','Uvira','EN_RETARD') returning id into v_st2;
  insert into public.account_invitations (code,role,school_id,intended_name,intended_email,intended_phone) values
    ('SEC00001','secretariat',v_school,'Secrétaire Démo','secretariat@elimu.test','+243990000002'),
    ('TEA00001','teacher',v_school,'Enseignant Démo','enseignant@elimu.test','+243990000003');
  v_res := public.invite_or_link_parent(v_school, v_st1, 'Parent Un', '+243990000004', 'parent1@elimu.test', 'IGNORE');
  create temp table if not exists codes(k text, v text);
  grant all on codes to authenticated;
  insert into codes values ('p1', v_res->>'code');
  v_res := public.invite_or_link_parent(v_school, v_st2, 'Parent Deux', '+243990000005', 'parent2@elimu.test', 'IGNORE');
  insert into codes values ('p2', v_res->>'code');
  reset role;

  -- chaque compte active son invitation
  perform set_config('request.jwt.claims', json_build_object('sub', s,'role','authenticated')::text, true);
  set local role authenticated; perform public.redeem_invitation('SEC00001'); reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', t,'role','authenticated')::text, true);
  set local role authenticated; perform public.redeem_invitation('TEA00001'); reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', p1,'role','authenticated')::text, true);
  set local role authenticated; perform public.redeem_invitation((select v from codes where k='p1')); reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', p2,'role','authenticated')::text, true);
  set local role authenticated; perform public.redeem_invitation((select v from codes where k='p2')); reset role;

  -- seconde école (test d'isolation entre écoles)
  perform set_config('request.jwt.claims', json_build_object('sub', o,'role','authenticated')::text, true);
  set local role authenticated;
  v_school2 := public.create_school_with_admin('École Autre (démo)','Goma','Nord-Kivu','Rue 1','+243990000009','autre.ecole@elimu.test','Privée','plan_micro','Autre Direction','+243990000009','Préfet');
  reset role;

  -- données scolaires saisies par la direction
  perform set_config('request.jwt.claims', json_build_object('sub', d,'role','authenticated')::text, true);
  set local role authenticated;
  insert into public.school_fee_items (school_id,name,section,tranche1,tranche2,tranche3,academic_year) values (v_school,'Minerval','Math-Physique',60,60,60,'2026-2027');
  insert into public.report_cards (school_id,student_id,student_name,matricule,class_name,section,academic_year,term,total_obtained,total_max,percentage,rank,class_size,conduct,application,decision,issue_date)
    values (v_school,v_st1,'Amani Baraka','MWA-0001','6ème Scientifique A','Math-Physique','2026-2027','1er trimestre',410,500,82,1,2,'Bonne','Bonne','Admis','2026-12-20') returning id into v_rc1;
  insert into public.report_cards (school_id,student_id,student_name,matricule,class_name,section,academic_year,term,total_obtained,total_max,percentage,rank,class_size,conduct,application,decision,issue_date)
    values (v_school,v_st2,'Neema Zawadi','MWA-0002','6ème Scientifique A','Math-Physique','2026-2027','1er trimestre',380,500,76,2,2,'Bonne','Bonne','Admis','2026-12-20') returning id into v_rc2;
  insert into public.course_grades (school_id,report_card_id,course_id,course_name,category,max_points,first_period,second_period,first_exam) values
    (v_school,v_rc1,'MATH','Mathématiques','Sciences',20,16,17,34),
    (v_school,v_rc2,'MATH','Mathématiques','Sciences',20,14,15,30);
  insert into public.attendance_records (school_id,student_id,student_name,class_name,date,status) values
    (v_school,v_st1,'Amani Baraka','6ème Scientifique A','2026-11-16','Présent'),
    (v_school,v_st2,'Neema Zawadi','6ème Scientifique A','2026-11-16','Absent');
  insert into public.tuition_invoices (school_id,invoice_number,student_id,student_name,matricule,class_name,parent_name,parent_phone,academic_year,tranche,amount_usd,amount_cdf,due_date,status) values
    (v_school,'FAC-0001',v_st1,'Amani Baraka','MWA-0001','6ème Scientifique A','Parent Un','+243990000004','2026-2027','Tranche 1',60,168000,'2026-10-15','PAYE'),
    (v_school,'FAC-0002',v_st2,'Neema Zawadi','MWA-0002','6ème Scientifique A','Parent Deux','+243990000005','2026-2027','Tranche 1',60,168000,'2026-10-15','EN_ATTENTE');
  insert into public.homeworks (school_id,title,subject,class_name,teacher_name,assigned_date,due_date,instructions) values
    (v_school,'Exercices sur les limites','Mathématiques','6ème Scientifique A','Enseignant Démo','2026-11-16','2026-11-23','Exercices 1 à 5, page 42.');
  insert into public.messages (school_id,sender_id,sender_name,sender_role,recipient_id,recipient_name,subject,body) values
    (v_school,d,'Direction Démo','direction',p1,'Parent Un','Réunion des parents','Réunion le 28 novembre à 15h.');
  reset role;

  -- candidature déposée par un visiteur anonyme
  set local role anon;
  insert into public.application_dossiers (school_id,applicant_first_name,applicant_last_name,gender,birth_date,target_class,target_section,previous_school,parent_name,parent_phone,parent_email,submission_date,status)
    values (v_school,'Candidat','Test','M','2011-01-10','6ème Scientifique A','Math-Physique','EP Uvira','Parent Test','+243990000010','candidat@elimu.test','2026-11-21','SOUMIS');
  reset role;
end $$;

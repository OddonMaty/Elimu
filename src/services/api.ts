import {
  MOCK_SCHOOLS,
  MOCK_STUDENTS,
  MOCK_REPORT_CARD_GLODY,
  MOCK_ATTENDANCE,
  MOCK_HOMEWORKS,
  MOCK_INVOICES,
  MOCK_APPLICATIONS,
  MOCK_CLASSES,
  MOCK_SCHEDULE_ITEMS,
  MOCK_MESSAGES
} from '../data/mockData';
import {
  School,
  Student,
  ReportCard,
  AttendanceRecord,
  Homework,
  TuitionInvoice,
  ApplicationDossier,
  ClassSection,
  ScheduleItem,
  Message,
  CourseGrade,
  AccountInvitation,
  FeeItem,
  User
} from '../types';
import { supabase } from '../lib/supabaseClient';

// Helper for local storage state persistence (fallback)
const getStored = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(`elimu_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`elimu_${key}`, JSON.stringify(value));
  } catch {
    // ignore
  }
};

// Map DB snake_case to camelCase and vice-versa
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const val = toCamelCase(obj[key]);
      acc[camelKey] = val;
      if (key === 'annual_tuition_min_usd') acc['annualTuitionMinUSD'] = val;
      if (key === 'annual_tuition_max_usd') acc['annualTuitionMaxUSD'] = val;
      return acc;
    }, {} as any);
  }
  return obj;
};

const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      let snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (key === 'annualTuitionMinUSD' || key === 'annualTuitionMinUsd') snakeKey = 'annual_tuition_min_usd';
      if (key === 'annualTuitionMaxUSD' || key === 'annualTuitionMaxUsd') snakeKey = 'annual_tuition_max_usd';
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};


export const schoolService = {
  getSchools: async (): Promise<School[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('schools').select('*');
      if (!error && data) return toCamelCase(data) as School[];
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    return getStored<School[]>('schools', MOCK_SCHOOLS);
  },
  getSchoolById: async (id: string): Promise<School | undefined> => {
    if (supabase) {
      const { data, error } = await supabase.from('schools').select('*').eq('id', id).single();
      if (!error && data) return toCamelCase(data) as School;
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    const list = getStored<School[]>('schools', MOCK_SCHOOLS);
    return list.find(s => s.id === id);
  },
  compareSchools: async (ids: string[]): Promise<School[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('schools').select('*').in('id', ids);
      if (!error && data) return toCamelCase(data) as School[];
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    const list = getStored<School[]>('schools', MOCK_SCHOOLS);
    return list.filter(s => ids.includes(s.id));
  },
  getMySchool: async (): Promise<School | undefined> => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const schoolId = (await supabase.from('users').select('school_id').eq('id', userData.user?.id).single()).data?.school_id;
      if (schoolId) {
        const { data, error } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        if (!error && data) return toCamelCase(data) as School;
      }
    }
    const list = getStored<School[]>('schools', MOCK_SCHOOLS);
    return list[0];
  },
  updateMySchool: async (updates: Partial<School>): Promise<School> => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const schoolId = (await supabase.from('users').select('school_id').eq('id', userData.user?.id).single()).data?.school_id;
      if (schoolId) {
        const toUpdate = toSnakeCase(updates);
        const { data, error } = await supabase.from('schools').update(toUpdate).eq('id', schoolId).select().single();
        if (!error && data) return toCamelCase(data) as School;
        if (error) throw error;
      }
    }
    const list = getStored<School[]>('schools', MOCK_SCHOOLS);
    const mySchool = list[0] || ({ id: 'sch-1' } as School);
    const updated = { ...mySchool, ...updates };
    setStored('schools', list.map(s => s.id === mySchool.id ? updated : s));
    return updated;
  }
};

export const studentService = {
  getStudents: async (classFilter?: string): Promise<Student[]> => {
    if (supabase) {
      let query = supabase.from('students').select('*');
      if (classFilter && classFilter !== 'ALL') {
        query = query.eq('class_name', classFilter);
      }
      const { data, error } = await query;
      if (!error && data) return toCamelCase(data) as Student[];
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    
    const list = getStored<Student[]>('students', MOCK_STUDENTS);
    if (classFilter && classFilter !== 'ALL') {
      return list.filter(s => s.className === classFilter);
    }
    return list;
  },
  getStudentById: async (id: string): Promise<Student | undefined> => {
    if (supabase) {
      const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
      if (!error && data) return toCamelCase(data) as Student;
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    const list = getStored<Student[]>('students', MOCK_STUDENTS);
    return list.find(s => s.id === id);
  },
  addStudent: async (student: Omit<Student, 'id' | 'matricule'>): Promise<Student> => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const schoolId = (await supabase.from('users').select('school_id').eq('id', userData.user?.id).single()).data?.school_id;

      // Le matricule est généré par la base (trigger). parent_id est un uuid : on ignore toute valeur factice.
      const { parentId, ...studentRest } = student as any;
      const isUuid = typeof parentId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parentId);
      const toInsert = toSnakeCase({ ...studentRest, ...(isUuid ? { parentId } : {}), schoolId });
      const { data, error } = await supabase.from('students').insert(toInsert).select().single();
      if (!error && data) return toCamelCase(data) as Student;
      if (error) console.error('Supabase error, falling back to mock data:', error);
      throw error;
    }

    const list = getStored<Student[]>('students', MOCK_STUDENTS);
    const newStudent: Student = {
      ...student,
      id: `stud-${Date.now()}`,
      matricule: `ELM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    };
    const updated = [newStudent, ...list];
    setStored('students', updated);
    return newStudent;
  },
  updateStudent: async (id: string, updates: Partial<Student>): Promise<Student> => {
    if (supabase) {
      const toUpdate = toSnakeCase(updates);
      const { data, error } = await supabase.from('students').update(toUpdate).eq('id', id).select().single();
      if (!error && data) return toCamelCase(data) as Student;
      if (error) console.error('Supabase error, falling back to mock data:', error);
      throw error;
    }

    const list = getStored<Student[]>('students', MOCK_STUDENTS);
    const updated = list.map(s => s.id === id ? { ...s, ...updates } : s);
    setStored('students', updated);
    return updated.find(s => s.id === id)!;
  }
};

export const staffService = {
  getTeachers: async (): Promise<User[]> => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const schoolId = (await supabase.from('users').select('school_id').eq('id', userData.user?.id).single()).data?.school_id;
      if (schoolId) {
        const { data, error } = await supabase.from('users').select('*').eq('school_id', schoolId).eq('role', 'teacher');
        if (!error && data) return toCamelCase(data) as User[];
      }
    }
    return [];
  }
};

export const gradeService = {
  getReportCardByStudentId: async (studentId: string): Promise<ReportCard> => {
    if (supabase) {
      const { data, error } = await supabase.from('report_cards').select('*, course_grades(*)').eq('student_id', studentId).order('created_at', { ascending: false }).limit(1).single();
      if (!error && data) {
         const grades = data.course_grades;
         delete data.course_grades;
         const result = toCamelCase(data) as ReportCard;
         result.grades = toCamelCase(grades) as CourseGrade[];
         return result;
      }
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    const custom = getStored<ReportCard | null>(`report_${studentId}`, null);
    if (custom) return custom;
    return { ...MOCK_REPORT_CARD_GLODY, studentId };
  },
  getReportCard: async (studentId: string): Promise<ReportCard> => {
    return gradeService.getReportCardByStudentId(studentId);
  },
  saveGrades: async (studentId: string, reportCard: ReportCard): Promise<void> => {
    if (supabase) {
      // 1. Get student & user context
      const { data: student } = await supabase.from('students').select('*').eq('id', studentId).single();
      if (!student) throw new Error('Student not found');
      
      const { grades, ...cardInfo } = reportCard;
      const cardToInsert = toSnakeCase({
        ...cardInfo,
        studentId,
        schoolId: student.school_id,
        matricule: student.matricule,
        studentName: `${student.first_name} ${student.last_name}`,
        className: student.class_name,
        section: student.section,
        academicYear: student.academic_year
      });

      // Un seul bulletin par élève, année et période : on met à jour s'il existe déjà
      delete (cardToInsert as any).id;
      const { data: existingCard } = await supabase.from('report_cards').select('id')
        .eq('student_id', studentId).eq('academic_year', student.academic_year).eq('term', (cardToInsert as any).term)
        .maybeSingle();
      let cardId: string;
      if (existingCard) {
        const { error: updateError } = await supabase.from('report_cards').update(cardToInsert).eq('id', existingCard.id);
        if (updateError) throw updateError;
        cardId = existingCard.id;
      } else {
        const { data: newCard, error } = await supabase.from('report_cards').insert(cardToInsert).select().single();
        if (error) throw error;
        cardId = newCard.id;
      }

      if (grades && grades.length > 0) {
        const gradesToInsert = grades.map(g => {
          const { id: _ignoredId, ...gradeRest } = g as any;
          return toSnakeCase({ ...gradeRest, reportCardId: cardId, schoolId: student.school_id });
        });
        const { error: gradesError } = await supabase.from('course_grades')
          .upsert(gradesToInsert, { onConflict: 'report_card_id,course_id' });
        if (gradesError) throw gradesError;
      }
      return;
    }
    setStored(`report_${studentId}`, reportCard);
  }
};

export const attendanceService = {
  getAttendance: async (date?: string, className?: string): Promise<AttendanceRecord[]> => {
    if (supabase) {
      let query = supabase.from('attendance_records').select('*');
      if (date) query = query.eq('date', date);
      if (className && className !== 'ALL') query = query.eq('class_name', className);
      
      const { data, error } = await query;
      if (!error && data) return toCamelCase(data) as AttendanceRecord[];
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }

    let list = getStored<AttendanceRecord[]>('attendance', MOCK_ATTENDANCE);
    if (date) list = list.filter(a => a.date === date);
    if (className && className !== 'ALL') list = list.filter(a => a.className === className);
    return list;
  },
  getStudentAttendance: async (studentId: string): Promise<AttendanceRecord[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('attendance_records').select('*').eq('student_id', studentId);
      if (!error && data) return toCamelCase(data) as AttendanceRecord[];
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    const list = getStored<AttendanceRecord[]>('attendance', MOCK_ATTENDANCE);
    return list.filter(a => a.studentId === studentId);
  },
  markAttendance: async (records: AttendanceRecord[]): Promise<void> => {
    if (supabase && records.length > 0) {
      const date = records[0].date;
      // Fetch school_id for the students
      const { data: student } = await supabase.from('students').select('school_id').eq('id', records[0].studentId).single();
      const schoolId = student?.school_id;

      if (schoolId) {
        // Un enregistrement par élève et par jour : on met à jour plutôt que supprimer/réinsérer
        const toUpsert = records.map(r => {
          const { id: _ignoredId, ...recordRest } = r as any;
          return toSnakeCase({ ...recordRest, schoolId });
        });
        const { error } = await supabase.from('attendance_records').upsert(toUpsert, { onConflict: 'student_id,date' });
        if (error) throw error;
        return;
      }
    }

    const current = getStored<AttendanceRecord[]>('attendance', MOCK_ATTENDANCE);
    const date = records[0]?.date;
    const filtered = current.filter(c => c.date !== date);
    setStored('attendance', [...records, ...filtered]);
  },
  submitJustification: async (id: string, reason: string, docUrl?: string): Promise<void> => {
    if (supabase) {
      await supabase.from('attendance_records').update({
        status: 'JUSTIFIE',
        justification_reason: reason,
        justification_status: 'EN_ATTENTE',
        document_url: docUrl
      }).eq('id', id);
      return;
    }
    const list = getStored<AttendanceRecord[]>('attendance', MOCK_ATTENDANCE);
    const updated = list.map(a => a.id === id ? {
      ...a, status: 'JUSTIFIE' as const, justificationReason: reason, justificationStatus: 'EN_ATTENTE' as const, documentUrl: docUrl
    } : a);
    setStored('attendance', updated);
  },
  reviewJustification: async (id: string, status: 'VALIDE' | 'REJETE'): Promise<void> => {
    if (supabase) {
      await supabase.from('attendance_records').update({ justification_status: status }).eq('id', id);
      return;
    }
    const list = getStored<AttendanceRecord[]>('attendance', MOCK_ATTENDANCE);
    const updated = list.map(a => a.id === id ? { ...a, justificationStatus: status } : a);
    setStored('attendance', updated);
  }
};

export const homeworkService = {
  getHomeworks: async (className?: string): Promise<Homework[]> => {
    if (supabase) {
      let query = supabase.from('homeworks').select('*');
      if (className && className !== 'ALL') query = query.eq('class_name', className);
      const { data, error } = await query;
      if (!error && data) return toCamelCase(data) as Homework[];
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    let list = getStored<Homework[]>('homeworks', MOCK_HOMEWORKS);
    if (className && className !== 'ALL') list = list.filter(h => h.className === className);
    return list;
  },
  createHomework: async (hw: Omit<Homework, 'id'>): Promise<Homework> => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const schoolId = (await supabase.from('users').select('school_id').eq('id', userData.user?.id).single()).data?.school_id;
      const toInsert = toSnakeCase({ ...hw, schoolId });
      const { data, error } = await supabase.from('homeworks').insert(toInsert).select().single();
      if (!error && data) return toCamelCase(data) as Homework;
      if (error) console.error('Supabase error, falling back to mock data:', error);
      throw error;
    }
    const list = getStored<Homework[]>('homeworks', MOCK_HOMEWORKS);
    const newHw: Homework = { ...hw, id: `hw-${Date.now()}` };
    setStored('homeworks', [newHw, ...list]);
    return newHw;
  },
  toggleSubmission: async (id: string): Promise<Homework> => {
    if (supabase) {
      const { data: hw } = await supabase.from('homeworks').select('submission_status').eq('id', id).single();
      const nextStatus = hw?.submission_status === 'RENDU' ? 'A_FAIRE' : 'RENDU';
      const { data, error } = await supabase.from('homeworks').update({ submission_status: nextStatus }).eq('id', id).select().single();
      if (!error && data) return toCamelCase(data) as Homework;
      if (error) console.error('Supabase error, falling back to mock data:', error);
      throw error;
    }
    const list = getStored<Homework[]>('homeworks', MOCK_HOMEWORKS);
    const updated = list.map(h => {
      if (h.id === id) {
        const nextStatus = h.submissionStatus === 'RENDU' ? 'A_FAIRE' : 'RENDU';
        return { ...h, submissionStatus: nextStatus as any };
      }
      return h;
    });
    setStored('homeworks', updated);
    return updated.find(h => h.id === id)!;
  }
};

export const financeService = {
  getInvoices: async (studentId?: string): Promise<TuitionInvoice[]> => {
    if (supabase) {
      let query = supabase.from('tuition_invoices').select('*');
      if (studentId) query = query.eq('student_id', studentId);
      const { data, error } = await query;
      if (!error && data) return toCamelCase(data) as TuitionInvoice[];
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    let list = getStored<TuitionInvoice[]>('invoices', MOCK_INVOICES);
    if (studentId) list = list.filter(i => i.studentId === studentId);
    return list;
  },
  payInvoice: async (invoiceId: string, method: string, ref?: string): Promise<TuitionInvoice> => {
    if (supabase) {
      const { data, error } = await supabase.from('tuition_invoices').update({
        status: 'PAYE',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: method,
        transaction_reference: ref || `PAY-${Date.now().toString().slice(-8)}`
      }).eq('id', invoiceId).select().single();
      if (!error && data) return toCamelCase(data) as TuitionInvoice;
      if (error) console.error('Supabase error, falling back to mock data:', error);
      throw error;
    }
    const list = getStored<TuitionInvoice[]>('invoices', MOCK_INVOICES);
    const updated = list.map(i => i.id === invoiceId ? {
      ...i,
      status: 'PAYE' as const,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: method as any,
      transactionReference: ref || `PAY-${Date.now().toString().slice(-8)}`
    } : i);
    setStored('invoices', updated);
    return updated.find(i => i.id === invoiceId)!;
  }
};

export const feeService = {
  getFeeItems: async (): Promise<FeeItem[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('school_fee_items').select('*').order('created_at', { ascending: false });
      if (!error && data) return toCamelCase(data) as FeeItem[];
    }
    return getStored<FeeItem[]>('fee_items', []);
  },
  saveFeeItem: async (item: Partial<FeeItem>): Promise<FeeItem> => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const schoolId = (await supabase.from('users').select('school_id').eq('id', userData.user?.id).single()).data?.school_id;
      
      const toInsert = toSnakeCase({ ...item, schoolId });
      
      if (item.id) {
        const { data, error } = await supabase.from('school_fee_items').update(toInsert).eq('id', item.id).select().single();
        if (!error && data) return toCamelCase(data) as FeeItem;
        throw error;
      } else {
        const { data, error } = await supabase.from('school_fee_items').insert(toInsert).select().single();
        if (!error && data) return toCamelCase(data) as FeeItem;
        throw error;
      }
    }
    
    // Mock
    const list = getStored<FeeItem[]>('fee_items', []);
    if (item.id) {
      const updated = list.map(i => i.id === item.id ? { ...i, ...item } as FeeItem : i);
      setStored('fee_items', updated);
      return updated.find(i => i.id === item.id)!;
    } else {
      const newItem = { ...item, id: `fee-${Date.now()}`, createdAt: new Date().toISOString() } as FeeItem;
      setStored('fee_items', [newItem, ...list]);
      return newItem;
    }
  },
  deleteFeeItem: async (id: string): Promise<void> => {
    if (supabase) {
      await supabase.from('school_fee_items').delete().eq('id', id);
      return;
    }
    const list = getStored<FeeItem[]>('fee_items', []);
    setStored('fee_items', list.filter(i => i.id !== id));
  }
};

export const applicationService = {
  getApplications: async (): Promise<ApplicationDossier[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('application_dossiers').select('*');
      if (!error && data) return toCamelCase(data) as ApplicationDossier[];
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    return getStored<ApplicationDossier[]>('applications', MOCK_APPLICATIONS);
  },
  getApplicationById: async (id: string): Promise<ApplicationDossier | undefined> => {
    if (supabase) {
      const { data, error } = await supabase.from('application_dossiers').select('*').eq('id', id).single();
      if (!error && data) return toCamelCase(data) as ApplicationDossier;
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    const list = getStored<ApplicationDossier[]>('applications', MOCK_APPLICATIONS);
    return list.find(a => a.id === id);
  },
  submitApplication: async (app: Omit<ApplicationDossier, 'id' | 'submissionDate' | 'status'> & { id?: string }): Promise<ApplicationDossier> => {
    if (supabase) {
      // Le candidat est anonyme : il ne peut pas relire son dossier. L'identifiant (uuid) est donc
      // généré ici et sert ensuite de jeton de suivi (voir getPublicStatus).
      const { targetSchoolId, targetSchoolName, id: providedId, ...rest } = app;
      const id = providedId || crypto.randomUUID();
      const submissionDate = new Date().toISOString().split('T')[0];
      const toInsert = toSnakeCase({
        ...rest,
        id,
        schoolId: targetSchoolId,
        submissionDate,
        status: 'SOUMIS'
      });
      const { error } = await supabase.from('application_dossiers').insert(toInsert);
      if (error) {
        console.error('Erreur Supabase lors du dépôt du dossier:', error);
        throw error;
      }
      return {
        ...(rest as any),
        id,
        submissionDate,
        status: 'SOUMIS',
        targetSchoolId,
        targetSchoolName: targetSchoolName || ''
      } as ApplicationDossier;
    }
    const list = getStored<ApplicationDossier[]>('applications', MOCK_APPLICATIONS);
    const newApp: ApplicationDossier = {
      ...app, id: `app-${Date.now()}`, submissionDate: new Date().toISOString().split('T')[0], status: 'SOUMIS'
    };
    setStored('applications', [newApp, ...list]);
    return newApp;
  },
  updateApplicationStatus: async (id: string, status: 'EN_EXAMEN' | 'APPROUVE' | 'REJETE', reviewNotes?: string): Promise<ApplicationDossier> => {
    if (supabase) {
      const updates: any = { status };
      if (reviewNotes !== undefined) updates.review_notes = reviewNotes;
      const { data, error } = await supabase.from('application_dossiers').update(updates).eq('id', id).select().single();
      if (!error && data) return toCamelCase(data) as ApplicationDossier;
      if (error) console.error('Supabase error, falling back to mock data:', error);
      throw error;
    }
    const list = getStored<ApplicationDossier[]>('applications', MOCK_APPLICATIONS);
    const updated = list.map(a => a.id === id ? { ...a, status, reviewNotes: reviewNotes ?? a.reviewNotes } : a);
    setStored('applications', updated);
    return updated.find(a => a.id === id)!;
  },
  // Suivi public d'un dossier par son identifiant (fonction serveur, sans accès à la table)
  getPublicStatus: async (id: string): Promise<(Partial<ApplicationDossier> & {
    schoolId: string; schoolName: string; registrationFeePaid: boolean;
    paymentReference?: string | null; paymentDeclaredAt?: string | null;
  }) | null> => {
    if (supabase) {
      const { data, error } = await supabase.rpc('get_application_status', { p_id: id });
      if (error) throw error;
      return data ? (toCamelCase(data) as any) : null;
    }
    const list = getStored<ApplicationDossier[]>('applications', MOCK_APPLICATIONS);
    const found: any = list.find(a => a.id === id);
    return found ? { ...found, schoolId: found.targetSchoolId, schoolName: found.targetSchoolName } : null;
  },
  // Le candidat déclare avoir payé (référence de transaction) ; l'école confirme ensuite l'encaissement
  declarePayment: async (id: string, reference: string): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.rpc('declare_application_payment', { p_id: id, p_reference: reference });
      if (error) throw error;
      return;
    }
    const list = getStored<ApplicationDossier[]>('applications', MOCK_APPLICATIONS);
    setStored('applications', list.map(a => a.id === id ? ({ ...a, paymentReference: reference } as any) : a));
  },
  // Réservé au personnel de l'école (secrétariat, direction) : confirme l'encaissement des frais
  markRegistrationFeePaid: async (id: string): Promise<ApplicationDossier> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('application_dossiers')
        .update({ registration_fee_paid: true })
        .eq('id', id)
        .select('id, registration_fee_paid, status')
        .single();
      if (!error && data) return toCamelCase(data) as ApplicationDossier;
      if (error) console.error('Supabase error marking fee paid:', error);
      throw error;
    }
    const list = getStored<ApplicationDossier[]>('applications', MOCK_APPLICATIONS);
    const updated = list.map(a => a.id === id ? { ...a, registrationFeePaid: true } : a);
    setStored('applications', updated);
    return updated.find(a => a.id === id)!;
  }
};

export const messageService = {
  getMessages: async (_recipientId?: string): Promise<Message[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('messages').select('*').order('timestamp', { ascending: false });
      if (!error && data) return toCamelCase(data) as Message[];
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    return getStored<Message[]>('messages', MOCK_MESSAGES);
  },
  sendMessage: async (msg: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<Message> => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const schoolId = (await supabase.from('users').select('school_id').eq('id', userData.user?.id).single()).data?.school_id;
      const toInsert = toSnakeCase({ ...msg, schoolId, read: false });
      const { data, error } = await supabase.from('messages').insert(toInsert).select().single();
      if (!error && data) return toCamelCase(data) as Message;
      if (error) console.error('Supabase error, falling back to mock data:', error);
      throw error;
    }
    const list = getStored<Message[]>('messages', MOCK_MESSAGES);
    const newMsg: Message = { ...msg, id: `msg-${Date.now()}`, timestamp: new Date().toISOString(), read: false };
    setStored('messages', [newMsg, ...list]);
    return newMsg;
  },
  replyMessage: async (id: string, senderName: string, body: string): Promise<Message> => {
    if (supabase) {
      const { data: msg } = await supabase.from('messages').select('replies').eq('id', id).single();
      const replies = msg?.replies || [];
      replies.push({ senderName, body, timestamp: new Date().toISOString() });
      const { data, error } = await supabase.from('messages').update({ replies }).eq('id', id).select().single();
      if (!error && data) return toCamelCase(data) as Message;
      if (error) console.error('Supabase error, falling back to mock data:', error);
      throw error;
    }
    const list = getStored<Message[]>('messages', MOCK_MESSAGES);
    const updated = list.map(m => {
      if (m.id === id) {
        const replies = m.replies || [];
        return { ...m, replies: [...replies, { senderName, body, timestamp: new Date().toISOString() }] };
      }
      return m;
    });
    setStored('messages', updated);
    return updated.find(m => m.id === id)!;
  }
};

export const classService = {
  getClasses: async (schoolId?: string): Promise<ClassSection[]> => {
    if (supabase) {
      if (schoolId) {
        const { data, error } = await supabase
          .from('class_sections')
          .select('id, name, level, stream')
          .eq('school_id', schoolId);
        if (!error && data) return toCamelCase(data) as ClassSection[];
        if (error) console.error('Supabase error, falling back to mock data:', error);
      } else {
        const { data, error } = await supabase.from('class_sections').select('*');
        if (!error && data) return toCamelCase(data) as ClassSection[];
        if (error) console.error('Supabase error, falling back to mock data:', error);
      }
    }
    const list = getStored<ClassSection[]>('classes', MOCK_CLASSES);
    if (schoolId) {
      const filtered = list.filter(c => (c as any).schoolId === schoolId);
      if (filtered.length > 0) return filtered;
      return schoolId === 'sch-1' ? list : [];
    }
    return list;
  },
  getSchedule: async (className?: string, teacherId?: string): Promise<ScheduleItem[]> => {
    if (supabase) {
      let query = supabase.from('schedule_items').select('*');
      if (className && className !== 'ALL') query = query.eq('class_name', className);
      if (teacherId) query = query.eq('teacher_id', teacherId);
      const { data, error } = await query;
      if (!error && data) return toCamelCase(data) as ScheduleItem[];
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    let list = getStored<ScheduleItem[]>('schedule', MOCK_SCHEDULE_ITEMS);
    if (className && className !== 'ALL') list = list.filter(s => s.className === className);
    if (teacherId) list = list.filter(s => s.teacherId === teacherId);
    return list;
  },
  saveScheduleItem: async (item: Partial<ScheduleItem>): Promise<ScheduleItem> => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const schoolId = (await supabase.from('users').select('school_id').eq('id', userData.user?.id).single()).data?.school_id;
      
      const toSave = toSnakeCase({ ...item, schoolId });
      
      if (item.id) {
        const { data, error } = await supabase.from('schedule_items').update(toSave).eq('id', item.id).select().single();
        if (!error && data) return toCamelCase(data) as ScheduleItem;
        throw error;
      } else {
        const { data, error } = await supabase.from('schedule_items').insert(toSave).select().single();
        if (!error && data) return toCamelCase(data) as ScheduleItem;
        throw error;
      }
    }
    
    const list = getStored<ScheduleItem[]>('schedule', MOCK_SCHEDULE_ITEMS);
    if (item.id) {
      const updated = list.map(s => s.id === item.id ? { ...s, ...item } as ScheduleItem : s);
      setStored('schedule', updated);
      return updated.find(s => s.id === item.id)!;
    } else {
      const newItem = { ...item, id: `sched-${Date.now()}` } as ScheduleItem;
      setStored('schedule', [newItem, ...list]);
      return newItem;
    }
  },
  deleteScheduleItem: async (id: string): Promise<void> => {
    if (supabase) {
      await supabase.from('schedule_items').delete().eq('id', id);
      return;
    }
    const list = getStored<ScheduleItem[]>('schedule', MOCK_SCHEDULE_ITEMS);
    setStored('schedule', list.filter(s => s.id !== id));
  },
  createClass: async (data: Omit<ClassSection, 'id' | 'enrolled'>): Promise<ClassSection> => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const schoolId = (await supabase.from('users').select('school_id').eq('id', userData.user?.id).single()).data?.school_id;
      const toInsert = toSnakeCase({ ...data, schoolId, enrolled: 0 });
      const { data: created, error } = await supabase.from('class_sections').insert(toInsert).select().single();
      if (!error && created) return toCamelCase(created) as ClassSection;
      if (error) throw error;
    }
    const list = getStored<ClassSection[]>('classes', MOCK_CLASSES);
    const newClass: ClassSection = { ...data, id: `cls-${Date.now()}`, enrolled: 0 };
    setStored('classes', [...list, newClass]);
    return newClass;
  },
  updateClass: async (id: string, data: Partial<ClassSection>): Promise<ClassSection> => {
    if (supabase) {
      const toUpdate = toSnakeCase(data);
      const { data: updated, error } = await supabase.from('class_sections').update(toUpdate).eq('id', id).select().single();
      if (!error && updated) return toCamelCase(updated) as ClassSection;
      if (error) throw error;
    }
    const list = getStored<ClassSection[]>('classes', MOCK_CLASSES);
    const updatedList = list.map(c => c.id === id ? { ...c, ...data } : c);
    setStored('classes', updatedList);
    return updatedList.find(c => c.id === id)!;
  },
  deleteClass: async (id: string): Promise<void> => {
    if (supabase) {
      await supabase.from('class_sections').delete().eq('id', id);
      return;
    }
    const list = getStored<ClassSection[]>('classes', MOCK_CLASSES);
    setStored('classes', list.filter(c => c.id !== id));
  }
};

export const invitationService = {
  getInvitations: async (): Promise<AccountInvitation[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('account_invitations').select('*').order('created_at', { ascending: false });
      if (!error && data) return toCamelCase(data) as AccountInvitation[];
      if (error) console.error('Supabase error, falling back to mock data:', error);
    }
    return getStored<AccountInvitation[]>('invitations', []);
  },
  generateInvitation: async (invitation: Omit<AccountInvitation, 'id' | 'used' | 'createdAt' | 'schoolId'>): Promise<AccountInvitation> => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const schoolId = (await supabase.from('users').select('school_id').eq('id', userData.user?.id).single()).data?.school_id;
      
      const toInsert = toSnakeCase({ ...invitation, schoolId });
      const { data, error } = await supabase.from('account_invitations').insert(toInsert).select().single();
      
      if (!error && data) return toCamelCase(data) as AccountInvitation;
      throw error;
    }
    
    // Mock logic
    const list = getStored<AccountInvitation[]>('invitations', []);
    const newInv: AccountInvitation = {
      ...invitation,
      id: `inv-${Date.now()}`,
      schoolId: 'sch-mock',
      used: false,
      createdAt: new Date().toISOString()
    };
    setStored('invitations', [newInv, ...list]);
    return newInv;
  },
  inviteOrLinkParent: async (studentId: string, parentName: string, parentPhone: string, parentEmail: string, code: string): Promise<{ action: 'invited' | 'linked', message: string, code?: string }> => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const schoolId = (await supabase.from('users').select('school_id').eq('id', userData.user?.id).single()).data?.school_id;
      
      const { data, error } = await supabase.rpc('invite_or_link_parent', {
        p_school_id: schoolId,
        p_student_id: studentId,
        p_parent_name: parentName,
        p_parent_phone: parentPhone,
        p_parent_email: parentEmail,
        p_code: code
      });
      if (error) throw error;
      return data;
    }
    
    // Mock logic: simply generate an invite
    await invitationService.generateInvitation({
      code,
      role: 'parent',
      intendedName: parentName,
      intendedEmail: parentEmail,
      intendedPhone: parentPhone,
      studentId
    });
    return { action: 'invited', message: 'Mock invitation générée.', code };
  }
};

export type UserRole = 'direction' | 'secretariat' | 'teacher' | 'parent' | 'tresorerie' | 'proviseur' | 'superadmin' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  schoolId?: string;
  schoolName?: string;
  phone?: string;
  childrenIds?: string[]; // for parents
  assignedClasses?: string[]; // for teachers
}

export interface AccountInvitation {
  id: string;
  code: string;
  role: UserRole;
  schoolId: string;
  intendedName: string;
  intendedEmail?: string;
  intendedPhone?: string;
  studentId?: string;
  used: boolean;
  createdAt: string;
  usedAt?: string;
}

export interface School {
  id: string;
  name: string;
  tagline?: string;
  city: string;
  province: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  foundedYear?: number;
  type: 'Privé' | 'Public Conventionné' | 'International';
  educationLevels?: ('Maternelle' | 'Primaire' | 'Secondaire & Humanités')[];
  sections?: string[];
  annualTuitionMinUSD?: number;
  annualTuitionMaxUSD?: number;
  currency?: 'USD' | 'CDF';
  rating?: number;
  reviewCount?: number;
  studentCount?: number;
  teacherCount?: number;
  passRateStateExam?: number; // Examen d'État %
  featured?: boolean;
  coverImage?: string;
  logoImage?: string;
  description?: string;
  infrastructure?: string[];
  documentsRequired?: string[];
  paymentMethods?: ('M-Pesa' | 'Orange Money' | 'Airtel Money' | 'Visa/Mastercard' | 'Virement Bancaire')[];
  currentAcademicYear?: string;
  currentTerm?: string;
}

export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: 'M' | 'F';
  birthDate: string;
  birthPlace: string;
  nationality: string;
  className: string;
  section: string;
  academicYear: string;
  enrollmentDate: string;
  photoUrl: string;
  status: 'Inscrit' | 'En attente' | 'Suspendu' | 'Diplômé';
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  medicalNotes?: string;
  tuitionStatus: 'Payé' | 'Tranche 1' | 'Tranche 2' | 'Impayé';
  overallAverage: number; // e.g. 74.5%
  rankInClass: number;
  totalInClass: number;
}

export interface CourseGrade {
  courseId: string;
  courseName: string;
  category: 'MAXIMA_GENERAUX' | 'SCIENCES' | 'LANGUES' | 'SCIENCES_HUMAINES' | 'COURS_TECHNIQUES' | 'EDUCATION_PHYSIQUE';
  maxPoints: number;
  firstPeriod: number;
  secondPeriod: number;
  firstExam: number;
  totalSemester1: number;
  thirdPeriod?: number;
  fourthPeriod?: number;
  secondExam?: number;
  totalSemester2?: number;
  annualTotal?: number;
  percentage?: number;
}

export interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  matricule: string;
  className: string;
  section: string;
  academicYear: string;
  term: 'Semestre 1' | 'Semestre 2' | 'Annuel';
  grades: CourseGrade[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  rank: number;
  classSize: number;
  conduct: 'Très Bon' | 'Bon' | 'Passable' | 'Médiocre';
  application: 'Très Bien' | 'Bien' | 'Assez Bien' | 'Faible';
  teacherComment: string;
  directorComment: string;
  decision: 'Passé' | 'Ajourné' | 'En délibération' | 'Admis avec mention';
  issueDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE';
  justificationReason?: string;
  justificationStatus?: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  documentUrl?: string;
  notes?: string;
}

export interface Homework {
  id: string;
  title: string;
  subject: string;
  className: string;
  teacherName: string;
  teacherId: string;
  assignedDate: string;
  dueDate: string;
  instructions: string;
  attachmentUrl?: string;
  submissionStatus?: 'RENDU' | 'A_FAIRE' | 'EN_RETARD' | 'CORRIGE';
  scoreObtained?: number;
  maxScore?: number;
}

export interface TuitionInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  matricule: string;
  className: string;
  parentName: string;
  parentPhone: string;
  academicYear: string;
  tranche: 'Frais Inscription' | 'Tranche 1' | 'Tranche 2' | 'Tranche 3' | 'Frais Examen';
  amountUSD: number;
  amountCDF: number;
  dueDate: string;
  status: 'PAYE' | 'EN_ATTENTE' | 'EN_RETARD' | 'ANNULE';
  paymentDate?: string;
  paymentMethod?: 'M-Pesa' | 'Orange Money' | 'Airtel Money' | 'Visa' | 'Espèces';
  transactionReference?: string;
}

export interface ApplicationDossier {
  id: string;
  applicantFirstName: string;
  applicantLastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  targetSchoolId: string;
  targetSchoolName: string;
  targetClass: string;
  targetSection: string;
  previousSchool: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  submissionDate: string;
  status: 'SOUMIS' | 'EN_EXAMEN' | 'APPROUVE' | 'REJETE';
  documents: { name: string; status?: 'VALIDE' | 'EN_ATTENTE'; url?: string }[];
  reviewNotes?: string;
  registrationFeePaid: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  replies?: { senderName: string; body: string; timestamp: string }[];
}

export interface ClassSection {
  id: string;
  name: string;
  level: 'Maternelle' | 'Primaire' | 'Secondaire' | 'Humanités' | string;
  stream?: 'Scientifique' | 'Littéraire' | 'Commerciale & Gestion' | 'Pédagogie Générale' | 'Technique' | string;
  capacity?: number;
  enrolled?: number;
  room?: string;
  mainTeacher?: string;
  schoolId?: string;
}

export interface ScheduleItem {
  id: string;
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  timeSlot: string; // e.g. "07:30 - 08:25"
  subject: string;
  className: string;
  teacherName: string;
  teacherId?: string;
  room: string;
}

export interface FeeItem {
  id: string;
  schoolId: string;
  name: string;
  section?: string;
  tranche1?: number;
  tranche2?: number;
  tranche3?: number;
  academicYear?: string;
  createdAt: string;
}

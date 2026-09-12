import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { RequireRole } from './components/auth/RequireRole';

// ── Public Pages ──────────────────────────────────────────────────────────────
import { SchoolDirectoryPage } from './pages/public/SchoolDirectoryPage';
import { SchoolDetailPage } from './pages/public/SchoolDetailPage';
import { SchoolComparatorPage } from './pages/public/SchoolComparatorPage';
import { OnlineRegistrationPage } from './pages/public/OnlineRegistrationPage';
import { RegistrationPaymentPage } from './pages/public/RegistrationPaymentPage';
import { VisitorEntryPage } from './pages/public/VisitorEntryPage';
import { WelcomePage } from './pages/public/WelcomePage';

// ── Auth Pages ─────────────────────────────────────────────────────────────────
import { LoginPage } from './pages/auth/LoginPage';
import { SchoolOnboardingPage } from './pages/auth/SchoolOnboardingPage';
import { ActivateAccountPage } from './pages/public/ActivateAccountPage';

// ── Direction Module ───────────────────────────────────────────────────────────
import { DirectionDashboardPage } from './pages/direction/DirectionDashboardPage';
import { ApplicationsListPage } from './pages/direction/ApplicationsListPage';
import { ApplicationReviewPage } from './pages/direction/ApplicationReviewPage';
import { ClassesConfigPage } from './pages/direction/ClassesConfigPage';
import { SchoolOptionsPage } from './pages/direction/SchoolOptionsPage';
import { SchedulesPage } from './pages/direction/SchedulesPage';
import { SchoolSettingsPage } from './pages/direction/SchoolSettingsPage';
import { NotificationConfigPage } from './pages/direction/NotificationConfigPage';
import { TeamManagementPage } from './pages/direction/TeamManagementPage';
import { StaffMessagesPage } from './pages/direction/StaffMessagesPage';

// ── Secrétariat Module ─────────────────────────────────────────────────────────
import { StudentsListPage } from './pages/secretariat/StudentsListPage';
import { StudentEnrollmentPage } from './pages/secretariat/StudentEnrollmentPage';
import { StudentIdCardsPage } from './pages/secretariat/StudentIdCardsPage';

// ── Teacher Module ─────────────────────────────────────────────────────────────
import { TeacherAttendancePage } from './pages/teacher/TeacherAttendancePage';
import { TeacherGradesPage } from './pages/teacher/TeacherGradesPage';
import { TeacherHomeworkPage } from './pages/teacher/TeacherHomeworkPage';
import { CreateHomeworkPage } from './pages/teacher/CreateHomeworkPage';
import { TeacherSchedulePage } from './pages/teacher/TeacherSchedulePage';

// ── Parent Module ──────────────────────────────────────────────────────────────
import { ParentDashboardPage } from './pages/parent/ParentDashboardPage';
import { ParentGradesPage } from './pages/parent/ParentGradesPage';
import { OfficialBulletinPage } from './pages/parent/OfficialBulletinPage';
import { ParentAbsencesPage } from './pages/parent/ParentAbsencesPage';
import { AbsenceJustificationPage } from './pages/parent/AbsenceJustificationPage';
import { ParentHomeworkPage } from './pages/parent/ParentHomeworkPage';
import { ParentMessagesPage } from './pages/parent/ParentMessagesPage';
import { ParentFinancesPage } from './pages/parent/ParentFinancesPage';
import { PaymentReceiptPage } from './pages/parent/PaymentReceiptPage';

// ── Finance Module ─────────────────────────────────────────────────────────────
import { BillingDashboardPage } from './pages/finance/BillingDashboardPage';
import { FeesConfigurationPage } from './pages/finance/FeesConfigurationPage';
import { TuitionTrackingPage } from './pages/finance/TuitionTrackingPage';

// ── Proviseur Module ───────────────────────────────────────────────────────────
import { TeacherRosterPage } from './pages/proviseur/TeacherRosterPage';

// ── Super Admin Module ─────────────────────────────────────────────────────────
import { SuperAdminDashboardPage } from './pages/admin/SuperAdminDashboardPage';
import { SaaSPlanSubscriptionPage } from './pages/admin/SaaSPlanSubscriptionPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Suspense fallback={<LoadingSpinner message="Chargement de la plateforme Elimu..." />}>
            <Routes>
              {/* ── Root: Animated welcome / onboarding slides ── */}
              <Route path="/" element={<WelcomePage />} />

              {/* ── Visitor profile choice (standalone, no layout) ── */}
              <Route path="/choix" element={<VisitorEntryPage />} />

              {/* ── Public Routes ── */}
              <Route path="/activer" element={<ActivateAccountPage />} />
              <Route element={<PublicLayout />}>
                <Route path="/schools" element={<SchoolDirectoryPage />} />
                <Route path="/schools/:id" element={<SchoolDetailPage />} />
                <Route path="/compare" element={<SchoolComparatorPage />} />
                <Route path="/register" element={<OnlineRegistrationPage />} />
                <Route path="/register/payment" element={<RegistrationPaymentPage />} />
              </Route>

              {/* ── Auth Routes ── */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/onboarding" element={<SchoolOnboardingPage />} />
              </Route>

              {/* ── Dashboard Routes (all authenticated roles) ── */}
              <Route element={<DashboardLayout />}>
                {/* Direction (Exclusif) */}
                <Route element={<RequireRole allowedRoles={['direction']} />}>
                  <Route path="/direction" element={<DirectionDashboardPage />} />
                  <Route path="/direction/applications" element={<ApplicationsListPage />} />
                  <Route path="/direction/applications/:id" element={<ApplicationReviewPage />} />
                  <Route path="/direction/options" element={<SchoolOptionsPage />} />
                  <Route path="/direction/settings" element={<SchoolSettingsPage />} />
                  <Route path="/direction/notifications" element={<NotificationConfigPage />} />
                  <Route path="/direction/team" element={<TeamManagementPage />} />
                  <Route path="/direction/messages" element={<StaffMessagesPage />} />
                </Route>

                {/* Direction + Proviseur */}
                <Route element={<RequireRole allowedRoles={['direction', 'proviseur']} />}>
                  <Route path="/proviseur" element={<TeacherRosterPage />} />
                  <Route path="/direction/classes" element={<ClassesConfigPage />} />
                  <Route path="/direction/schedules" element={<SchedulesPage />} />
                </Route>

                {/* Secrétariat */}
                <Route element={<RequireRole allowedRoles={['direction', 'secretariat']} />}>
                  <Route path="/secretariat/students" element={<StudentsListPage />} />
                  <Route path="/secretariat/enrollment" element={<StudentEnrollmentPage />} />
                  <Route path="/secretariat/id-cards" element={<StudentIdCardsPage />} />
                </Route>

                {/* Teacher */}
                <Route element={<RequireRole allowedRoles={['direction', 'teacher']} />}>
                  <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
                  <Route path="/teacher/grades" element={<TeacherGradesPage />} />
                  <Route path="/teacher/homework" element={<TeacherHomeworkPage />} />
                  <Route path="/teacher/homework/new" element={<CreateHomeworkPage />} />
                  <Route path="/teacher/schedule" element={<TeacherSchedulePage />} />
                </Route>

                {/* Parent */}
                <Route element={<RequireRole allowedRoles={['parent']} />}>
                  <Route path="/parent" element={<ParentDashboardPage />} />
                  <Route path="/parent/grades" element={<ParentGradesPage />} />
                  <Route path="/parent/bulletin/official" element={<OfficialBulletinPage />} />
                  <Route path="/parent/absences" element={<ParentAbsencesPage />} />
                  <Route path="/parent/absences/justify" element={<AbsenceJustificationPage />} />
                  <Route path="/parent/homework" element={<ParentHomeworkPage />} />
                  <Route path="/parent/messages" element={<ParentMessagesPage />} />
                  <Route path="/parent/finances" element={<ParentFinancesPage />} />
                  <Route path="/parent/finances/receipt/:id" element={<PaymentReceiptPage />} />
                </Route>

                {/* Finance */}
                <Route element={<RequireRole allowedRoles={['direction', 'tresorerie']} />}>
                  <Route path="/finance" element={<BillingDashboardPage />} />
                  <Route path="/finance/config" element={<FeesConfigurationPage />} />
                  <Route path="/finance/tuition" element={<TuitionTrackingPage />} />
                </Route>

                {/* Super Admin */}
                <Route element={<RequireRole allowedRoles={['superadmin']} />}>
                  <Route path="/admin" element={<SuperAdminDashboardPage />} />
                </Route>
                
                {/* Specific override for SaaS Plan accessible by Direction too */}
                <Route element={<RequireRole allowedRoles={['superadmin', 'direction']} />}>
                  <Route path="/admin/plan" element={<SaaSPlanSubscriptionPage />} />
                </Route>
              </Route>


              {/* ── 404 Fallback ── */}
              <Route path="*" element={<Navigate to="/schools" replace />} />
            </Routes>
          </Suspense>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { studentService, applicationService, attendanceService } from '../../services/api';
import { Student, ApplicationDossier, AttendanceRecord } from '../../types';

export interface DirectionDashboardPageProps {}

export const DirectionDashboardPage: React.FC<DirectionDashboardPageProps> = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<ApplicationDossier[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      const [s, a, att] = await Promise.all([
        studentService.getStudents(),
        applicationService.getApplications(),
        attendanceService.getAttendance()
      ]);
      setStudents(s);
      setApplications(a);
      setAttendance(att);
    };
    load();
  }, []);

  const totalStudents = students.length || 2450;
  const pendingApps = applications.filter(a => a.status === 'SOUMIS' || a.status === 'EN_EXAMEN').length;
  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 96;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Système Opérationnel • Semestre 1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight mt-1">
            Tableau de Bord Direction Générale
          </h1>
          <p className="text-xs text-on-surface-variant">
            Collège Boboto • Vue d’ensemble stratégique, scolarité et assiduité en temps réel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/direction/applications">
            <Button variant="accent" size="md" icon="how_to_reg">
              Dossiers ({pendingApps})
            </Button>
          </Link>
          <Link to="/secretariat/enrollment">
            <Button variant="primary" size="md" icon="person_add">
              Nouvel Élève
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Students */}
        <Card noPadding className="p-5 bg-surface-container-lowest border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-on-surface-variant">Effectif Scolaire</span>
            <span className="material-symbols-outlined text-primary text-xl">groups</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-primary mt-2">{totalStudents}</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-success font-semibold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+4.2% vs année 2024-2025</span>
          </div>
        </Card>

        {/* Metric 2: Attendance Rate */}
        <Card noPadding className="p-5 bg-surface-container-lowest border-l-4 border-l-success">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-on-surface-variant">Taux d'Assiduité</span>
            <span className="material-symbols-outlined text-success text-xl">fact_check</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-success mt-2">{attendanceRate}%</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-on-surface-variant">
            <span>Présence moyenne de la semaine</span>
          </div>
        </Card>

        {/* Metric 3: Tuition Collection */}
        <Card noPadding className="p-5 bg-surface-container-lowest border-l-4 border-l-secondary-container">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-on-surface-variant">Recouvrement Tranche 2</span>
            <span className="material-symbols-outlined text-secondary-container text-xl">payments</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-primary mt-2">84.6%</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-on-surface-variant">
            <span>$412,500 encaissés sur $487,500</span>
          </div>
        </Card>

        {/* Metric 4: Pending Admissions */}
        <Card noPadding className="p-5 bg-surface-container-lowest border-l-4 border-l-tertiary">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-on-surface-variant">Candidatures en Attente</span>
            <span className="material-symbols-outlined text-tertiary text-xl">pending_actions</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-primary mt-2">{pendingApps}</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-secondary font-bold">
            <span>Dossiers nécessitant validation</span>
          </div>
        </Card>

      </div>

      {/* Two Column Layout: Recent Applications + Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Candidatures Récentes */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Derniers Dossiers de Candidature Soumis"
            subtitle="Admissions en ligne pour l'année 2025 - 2026"
            action={
              <Link to="/direction/applications" className="text-xs font-bold text-primary hover:underline">
                Voir Tous les Dossiers →
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-outline-variant text-on-surface-variant font-bold">
                    <th className="pb-3">Candidat</th>
                    <th className="pb-3">Classe</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Statut</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {applications.slice(0, 4).map(app => (
                    <tr key={app.id} className="hover:bg-surface-container-low/50">
                      <td className="py-3 font-semibold text-primary">
                        {app.applicantLastName} {app.applicantFirstName}
                      </td>
                      <td className="py-3 text-on-surface">{app.targetClass}</td>
                      <td className="py-3 text-on-surface-variant">{app.submissionDate}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            app.status === 'APPROUVE' ? 'success' :
                            app.status === 'EN_EXAMEN' ? 'warning' :
                            app.status === 'REJETE' ? 'error' : 'info'
                          }
                          size="sm"
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Link to={`/direction/applications/${app.id}`}>
                          <Button variant="outline" size="sm">Examiner</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Access Matrix */}
          <Card title="Modules de Gestion Stratégique" subtitle="Accès direct aux fonctionnalités de pilotage">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link
                to="/direction/classes"
                className="p-4 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant transition-colors group flex flex-col items-center text-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">groups</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-on-surface">Configuration des Classes</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Effectifs, salles et titulaires</p>
                </div>
              </Link>

              <Link
                to="/direction/schedules"
                className="p-4 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant transition-colors group flex flex-col items-center text-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">schedule</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-on-surface">Horaires & Emplois du Temps</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Grille maîtresse hebdomadaire</p>
                </div>
              </Link>

              <Link
                to="/direction/notifications"
                className="p-4 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant transition-colors group flex flex-col items-center text-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">sms</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-on-surface">Alertes SMS Parents</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Règles d’envoi automatique</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column: Direction Announcements & Quick Alerts */}
        <div className="space-y-6">
          <Card title="Alertes Pédagogiques & Urgences" variant="navy">
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white/10 rounded border border-white/20">
                <span className="font-bold text-secondary-container block text-[11px]">CONSEIL DE DIRECTION</span>
                <p className="mt-1 text-white/90">
                  Délibérations semestrielles prévues ce Vendredi 27 Février à 14h00 en salle du conseil.
                </p>
              </div>

              <div className="p-3 bg-white/10 rounded border border-white/20">
                <span className="font-bold text-secondary-container block text-[11px]">INSPECTION MINISTÉRIELLE</span>
                <p className="mt-1 text-white/90">
                  Visite de contrôle pédagogique EPST programmée le 03 Mars 2026. Registres matricules à jour requis.
                </p>
              </div>
            </div>
          </Card>

          <Card title="Statistiques Rapides Classes">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-outline-variant/60">
                <span className="text-on-surface-variant">Classes Actives :</span>
                <span className="font-bold text-primary">28 classes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/60">
                <span className="text-on-surface-variant">Enseignants Titulaires :</span>
                <span className="font-bold text-primary">94 professeurs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/60">
                <span className="text-on-surface-variant">Moyenne Générale École :</span>
                <span className="font-bold text-success">74.2%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-on-surface-variant">Taux de Rétention :</span>
                <span className="font-bold text-primary">98.8%</span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

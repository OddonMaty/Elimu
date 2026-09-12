import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentService, attendanceService, financeService, homeworkService } from '../../services/api';
import { Student, AttendanceRecord, TuitionInvoice, Homework } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface ParentDashboardPageProps {}

export const ParentDashboardPage: React.FC<ParentDashboardPageProps> = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [absences, setAbsences] = useState<AttendanceRecord[]>([]);
  const [invoices, setInvoices] = useState<TuitionInvoice[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const students = await studentService.getStudents();
      const st = students[0]; // Simulate logged-in parent's child
      setStudent(st);

      const [att, inv, hw] = await Promise.all([
        attendanceService.getStudentAttendance(st.id),
        financeService.getInvoices(),
        homeworkService.getHomeworks('ALL')
      ]);

      setAbsences(att.filter(a => a.status === 'ABSENT' || a.status === 'RETARD'));
      setInvoices(inv.filter(i => i.studentName === `${st.lastName} ${st.firstName}`));
      setHomeworks(hw.slice(0, 3));

      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner message="Chargement du tableau de bord parent..." />;
  if (!student) return null;

  const unpaidInvoice = invoices.find(i => i.status === 'EN_ATTENTE');
  const avgPct = student.overallAverage;

  return (
    <div className="space-y-6 pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#1b3b5f] text-white p-6 shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={student.photoUrl}
              alt={student.firstName}
              className="w-16 h-16 rounded-full object-cover border-4 border-white/30 shadow-md"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">Portail Parent — Collège Boboto</p>
              <h1 className="text-2xl font-black mt-0.5">
                {student.lastName} {student.firstName}
              </h1>
              <p className="text-sm text-white/80 mt-0.5">
                {student.className} • Matricule : {student.matricule} • A.S. {student.academicYear}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute right-6 top-6 opacity-10">
          <span className="material-symbols-outlined text-[120px]">school</span>
        </div>
      </div>

      {/* Urgent Alerts */}
      {unpaidInvoice && (
        <div className="flex items-center justify-between bg-warning/10 border border-warning rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-warning text-2xl">warning</span>
            <div>
              <p className="font-bold text-sm text-on-surface">Paiement en attente : {unpaidInvoice.tranche}</p>
              <p className="text-xs text-on-surface-variant">Montant : <strong>${unpaidInvoice.amountUSD} USD</strong> • Échéance : {unpaidInvoice.dueDate}</p>
            </div>
          </div>
          <Link to="/parent/finances">
            <Button variant="accent" size="sm">Payer Maintenant</Button>
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/parent/grades" className="block group">
          <Card noPadding className="p-4 text-center space-y-1 hover:shadow-md transition-shadow border-l-4 border-l-primary cursor-pointer">
            <span className="text-2xl font-black text-primary block">{avgPct}%</span>
            <span className="text-[10px] font-bold uppercase text-on-surface-variant block">Moyenne Générale</span>
            <span className="text-[10px] text-on-surface-variant">Rang : {student.rankInClass}/{student.totalInClass}</span>
          </Card>
        </Link>

        <Link to="/parent/absences" className="block group">
          <Card noPadding className={`p-4 text-center space-y-1 hover:shadow-md transition-shadow border-l-4 ${absences.length > 3 ? 'border-l-error' : 'border-l-success'} cursor-pointer`}>
            <span className={`text-2xl font-black block ${absences.length > 3 ? 'text-error' : 'text-success'}`}>{absences.length}</span>
            <span className="text-[10px] font-bold uppercase text-on-surface-variant block">Absences / Retards</span>
            <span className="text-[10px] text-on-surface-variant">Ce semestre</span>
          </Card>
        </Link>

        <Link to="/parent/homework" className="block group">
          <Card noPadding className="p-4 text-center space-y-1 hover:shadow-md transition-shadow border-l-4 border-l-secondary-container cursor-pointer">
            <span className="text-2xl font-black text-primary block">{homeworks.length}</span>
            <span className="text-[10px] font-bold uppercase text-on-surface-variant block">Devoirs en Cours</span>
            <span className="text-[10px] text-on-surface-variant">Travaux assignés</span>
          </Card>
        </Link>

        <Link to="/parent/finances" className="block group">
          <Card noPadding className={`p-4 text-center space-y-1 hover:shadow-md transition-shadow border-l-4 ${unpaidInvoice ? 'border-l-warning' : 'border-l-success'} cursor-pointer`}>
            <span className={`text-2xl font-black block ${unpaidInvoice ? 'text-warning' : 'text-success'}`}>
              {unpaidInvoice ? 'À Jour J-' + Math.max(0, Math.ceil((new Date(unpaidInvoice.dueDate).getTime() - Date.now()) / 86400000)) : '✓'}
            </span>
            <span className="text-[10px] font-bold uppercase text-on-surface-variant block">Frais Scolaires</span>
            <span className="text-[10px] text-on-surface-variant">{student.tuitionStatus}</span>
          </Card>
        </Link>
      </div>

      {/* Recent Homework */}
      <Card title="Devoirs Récents" subtitle="Travaux à domicile en cours ou à venir">
        <div className="space-y-3">
          {homeworks.map(hw => (
            <div key={hw.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/60 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-primary block">{hw.title}</span>
                <span className="text-on-surface-variant">{hw.subject} • {hw.className}</span>
              </div>
              <Badge variant="warning" size="sm">À rendre : {hw.dueDate}</Badge>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link to="/parent/homework">
            <Button variant="outline" size="sm" fullWidth>
              Voir Tous les Devoirs
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

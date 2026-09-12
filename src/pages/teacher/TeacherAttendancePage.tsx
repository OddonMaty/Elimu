import React, { useState, useEffect } from 'react';
import { studentService, attendanceService } from '../../services/api';
import { Student, AttendanceRecord } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Select } from '../../components/common/Select';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface TeacherAttendancePageProps {}

export const TeacherAttendancePage: React.FC<TeacherAttendancePageProps> = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('4ème Scientifique A');
  const [records, setRecords] = useState<{ [studentId: string]: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE' }>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [data, existingAtt] = await Promise.all([
        studentService.getStudents(selectedClass),
        attendanceService.getAttendance(attendanceDate, selectedClass)
      ]);
      
      setStudents(data);
      const initialMap: { [id: string]: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE' } = {};
      data.forEach(s => {
        const found = existingAtt.find(a => a.studentId === s.id);
        initialMap[s.id] = found ? found.status : 'PRESENT';
      });
      setRecords(initialMap);
      setLoading(false);
    };
    fetch();
  }, [selectedClass, attendanceDate]);

  const setStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE') => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const recordsToSave: AttendanceRecord[] = students.map(s => ({
        id: `att-${s.id}-${attendanceDate}`,
        studentId: s.id,
        studentName: `${s.lastName} ${s.firstName}`,
        className: selectedClass,
        date: attendanceDate,
        status: records[s.id] || 'PRESENT'
      }));

      await attendanceService.markAttendance(recordsToSave);
      const absents = recordsToSave.filter(r => r.status === 'ABSENT').length;
      notify(
        'success',
        'Appel Enregistré avec Succès !',
        `Registre journalier du ${attendanceDate} sauvegardé (${absents} absent${absents > 1 ? 's' : ''}, alertes SMS transmises aux parents).`
      );
    } catch {
      notify('error', 'Erreur', 'Impossible de sauvegarder le registre.');
    } finally {
      setIsSaving(false);
    }
  };

  const markAllPresent = () => {
    const next: { [id: string]: 'PRESENT' } = {};
    students.forEach(s => { next[s.id] = 'PRESENT'; });
    setRecords(next);
  };

  const presentCount = Object.values(records).filter(s => s === 'PRESENT').length;
  const absentCount = Object.values(records).filter(s => s === 'ABSENT').length;
  const retardCount = Object.values(records).filter(s => s === 'RETARD').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Appel de Présence & Registre Journalier
          </h1>
          <p className="text-xs text-on-surface-variant">
            Pointage quotidien des élèves, gestion des retards et déclenchement instantané des SMS parents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon="done_all" onClick={markAllPresent}>
            Tous Présents
          </Button>
          <Button variant="accent" size="sm" icon="save" isLoading={isSaving} onClick={handleSaveAll}>
            Sauvegarder le Registre
          </Button>
        </div>
      </div>

      {/* Control Bar: Class, Date and Stat Badges */}
      <Card noPadding className="p-4 bg-surface-container-lowest flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="w-56">
            <Select
              options={['4ème Scientifique A', '4ème Scientifique B', '1ère Humanités B']}
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
            />
          </div>
          <div>
            <input
              type="date"
              className="h-10 px-3 border border-outline-variant rounded bg-surface-container-low text-xs font-bold text-primary focus:outline-none"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
            />
          </div>
        </div>

        {/* Counter badges */}
        <div className="flex items-center gap-3 text-xs">
          <Badge variant="success" size="md">
            Présents : {presentCount}
          </Badge>
          <Badge variant="error" size="md">
            Absents : {absentCount}
          </Badge>
          <Badge variant="warning" size="md">
            Retards : {retardCount}
          </Badge>
        </div>
      </Card>

      {/* Roster Roll Call Table */}
      {loading ? (
        <LoadingSpinner message="Chargement des élèves de la classe..." />
      ) : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                  <th className="p-3.5 w-12">N°</th>
                  <th className="p-3.5">Élève (Nom & Prénom)</th>
                  <th className="p-3.5">Matricule</th>
                  <th className="p-3.5 text-center">Pointage Présence</th>
                  <th className="p-3.5 text-right">Statut Actuel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {students.map((st, idx) => {
                  const currentStatus = records[st.id] || 'PRESENT';
                  return (
                    <tr key={st.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="p-3.5 font-bold text-on-surface-variant">{idx + 1}</td>
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={st.photoUrl}
                          alt={st.firstName}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <span className="font-bold text-sm text-primary block">
                            {st.lastName} {st.firstName}
                          </span>
                          <span className="text-[10px] text-on-surface-variant">
                            Parent : {st.parentName} ({st.parentPhone})
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-primary font-bold">{st.matricule}</td>
                      
                      {/* Attendance Toggle Buttons */}
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setStatus(st.id, 'PRESENT')}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                              currentStatus === 'PRESENT'
                                ? 'bg-success text-white shadow-sm'
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                          >
                            Présent
                          </button>

                          <button
                            type="button"
                            onClick={() => setStatus(st.id, 'ABSENT')}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                              currentStatus === 'ABSENT'
                                ? 'bg-error text-white shadow-sm'
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                          >
                            Absent
                          </button>

                          <button
                            type="button"
                            onClick={() => setStatus(st.id, 'RETARD')}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                              currentStatus === 'RETARD'
                                ? 'bg-warning text-white shadow-sm'
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                          >
                            Retard
                          </button>

                          <button
                            type="button"
                            onClick={() => setStatus(st.id, 'JUSTIFIE')}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                              currentStatus === 'JUSTIFIE'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                          >
                            Justifié
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <Badge
                          variant={
                            currentStatus === 'PRESENT' ? 'success' :
                            currentStatus === 'ABSENT' ? 'error' :
                            currentStatus === 'RETARD' ? 'warning' : 'info'
                          }
                          size="sm"
                        >
                          {currentStatus}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { studentService, gradeService } from '../../services/api';
import { Student, ReportCard } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface TeacherGradesPageProps {}

export const TeacherGradesPage: React.FC<TeacherGradesPageProps> = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('4ème Scientifique A');
  const [selectedSubject, setSelectedSubject] = useState('Chimie Organique & Inorganique');
  const [period, setPeriod] = useState<'1ère Période' | '2ème Période' | 'Examen 1er Semestre'>('1ère Période');
  const [maxPoints, setMaxPoints] = useState<number>(20);
  const [gradesMap, setGradesMap] = useState<{ [studentId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await studentService.getStudents(selectedClass);
      setStudents(data);

      // Load initial grades from mock report card if available
      const initial: { [id: string]: number } = {
        'stud-1': 16,
        'stud-2': 18,
        'stud-3': 15,
        'stud-4': 14,
        'stud-5': 11
      };
      setGradesMap(initial);
      setLoading(false);
    };
    fetch();
  }, [selectedClass]);

  const handleGradeChange = (studentId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setGradesMap(prev => ({ ...prev, [studentId]: num }));
  };

  const handleSaveGrades = async () => {
    setIsSaving(true);
    try {
      notify(
        'success',
        'Notes Enregistrées !',
        `Les cotes de ${selectedSubject} (${period} / ${maxPoints} pts) ont été sauvegardées et répercutées dans les bulletins.`
      );
    } catch {
      notify('error', 'Erreur', 'Impossible d’enregistrer les notes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Saisie des Notes & Évaluations Pédagogiques
          </h1>
          <p className="text-xs text-on-surface-variant">
            Encodage des interrogations, devoirs surveillés et examens semestriels selon les pondérations EPST
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="accent" size="sm" icon="save" isLoading={isSaving} onClick={handleSaveGrades}>
            Sauvegarder la Grille
          </Button>
        </div>
      </div>

      {/* Filter and Criteria Bar */}
      <Card noPadding className="p-4 bg-surface-container-lowest grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Select
          label="Classe *"
          options={['4ème Scientifique A', '4ème Scientifique B', '1ère Humanités B']}
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
        />
        <Select
          label="Matière / Branche *"
          options={[
            'Chimie Organique & Inorganique',
            'Mathématiques Générales',
            'Physique & Mécanique',
            'Biologie & Anatomie',
            'Français & Littérature'
          ]}
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
        />
        <Select
          label="Évaluation / Période *"
          options={['1ère Période', '2ème Période', 'Examen 1er Semestre']}
          value={period}
          onChange={e => {
            const p = e.target.value as any;
            setPeriod(p);
            setMaxPoints(p === 'Examen 1er Semestre' ? 40 : 20);
          }}
        />
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
            Maxima (Points)
          </label>
          <div className="h-10 px-3 bg-surface-container-low border border-outline-variant rounded flex items-center font-bold text-sm text-primary">
            / {maxPoints} points
          </div>
        </div>
      </Card>

      {/* Grade Entry Table */}
      {loading ? (
        <LoadingSpinner message="Chargement de la feuille de cotes..." />
      ) : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                  <th className="p-3.5 w-12">N°</th>
                  <th className="p-3.5">Élève</th>
                  <th className="p-3.5">Matricule</th>
                  <th className="p-3.5 w-40 text-center">Note Obtenue (sur {maxPoints})</th>
                  <th className="p-3.5 w-32 text-center">Pourcentage</th>
                  <th className="p-3.5 text-right">Appréciation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {students.map((st, idx) => {
                  const score = gradesMap[st.id] !== undefined ? gradesMap[st.id] : 0;
                  const pct = Math.round((score / maxPoints) * 100);
                  const isPass = pct >= 50;

                  return (
                    <tr key={st.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="p-3.5 font-bold text-on-surface-variant">{idx + 1}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-sm text-primary block">
                          {st.lastName} {st.firstName}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">{st.className}</span>
                      </td>
                      <td className="p-3.5 font-mono text-primary font-bold">{st.matricule}</td>

                      {/* Number input for grade */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max={maxPoints}
                            step="0.5"
                            value={score}
                            onChange={e => handleGradeChange(st.id, e.target.value)}
                            className="w-20 h-10 px-2 text-center font-bold text-sm bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                          <span className="text-xs text-on-surface-variant font-semibold">/ {maxPoints}</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`text-sm font-black ${isPass ? 'text-success' : 'text-error'}`}>
                          {pct}%
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-medium">
                        {pct >= 80 ? (
                          <span className="text-success font-bold">Très Bien</span>
                        ) : pct >= 65 ? (
                          <span className="text-primary font-semibold">Bien</span>
                        ) : pct >= 50 ? (
                          <span className="text-warning font-semibold">Satisfaisant</span>
                        ) : (
                          <span className="text-error font-bold">À renforcer</span>
                        )}
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

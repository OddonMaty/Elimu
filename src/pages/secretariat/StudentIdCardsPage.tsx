import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/api';
import { Student } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { StudentCard } from '../../components/official/StudentCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface StudentIdCardsPageProps {}

export const StudentIdCardsPage: React.FC<StudentIdCardsPageProps> = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('4ème Scientifique A');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await studentService.getStudents();
      setStudents(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = students.filter(s => selectedClass === 'ALL' || s.className === selectedClass);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Génération des Cartes d’Identité Scolaires Sécurisées
          </h1>
          <p className="text-xs text-on-surface-variant">
            Cartes d'élèves officielles avec QR Code, photo numérisée et validation annuelle EPST
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-56">
            <Select
              options={[
                { value: 'ALL', label: 'Toutes les Classes' },
                { value: '4ème Scientifique A', label: '4ème Scientifique A' },
                { value: '4ème Scientifique B', label: '4ème Scientifique B' },
                { value: '1ère Humanités B', label: '1ère Humanités B' }
              ]}
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
            />
          </div>
          <Button variant="primary" size="sm" icon="print" onClick={() => window.print()}>
            Imprimer la Planche ({filtered.length})
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Génération des badges..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(st => (
            <Card key={st.id} noPadding className="p-4 bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <StudentCard student={st} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

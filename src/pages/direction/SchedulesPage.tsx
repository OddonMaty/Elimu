import React, { useState, useEffect } from 'react';
import { classService, staffService } from '../../services/api';
import { ScheduleItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';

export interface SchedulesPageProps {}

export const SchedulesPage: React.FC<SchedulesPageProps> = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
  const [selectedClass, setSelectedClass] = useState('4ème Scientifique A');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const init = async () => {
      const t = await staffService.getTeachers();
      setTeachers(t);
      if (t.length > 0) setSelectedTeacherId(t[0].id);
    };
    init();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      if (viewMode === 'class') {
        const data = await classService.getSchedule(selectedClass);
        setSchedule(data);
      } else {
        if (!selectedTeacherId) return;
        const data = await classService.getSchedule('ALL', selectedTeacherId);
        setSchedule(data);
      }
    };
    fetch();
  }, [viewMode, selectedClass, selectedTeacherId]);

  const days: ('Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi')[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const timeSlots = [
    '07:30 - 08:25',
    '08:25 - 09:20',
    '09:35 - 10:30',
    '10:30 - 11:25',
    '11:40 - 12:35',
    '12:35 - 13:30'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Emploi du Temps & Gestion des Horaires
          </h1>
          <p className="text-xs text-on-surface-variant">
            Planning hebdomadaire des cours, occupation des salles et charges horaires des enseignants
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-surface-container rounded-md p-1 border border-outline-variant">
            <button
              onClick={() => setViewMode('class')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${viewMode === 'class' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Par Classe
            </button>
            <button
              onClick={() => setViewMode('teacher')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${viewMode === 'teacher' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Par Enseignant
            </button>
          </div>

          <div className="w-56">
            {viewMode === 'class' ? (
              <Select
                options={[
                  '4ème Scientifique A',
                  '4ème Scientifique B',
                  '4ème Littéraire A',
                  '4ème Commerciale & Gestion',
                  '1ère Humanités A',
                  '1ère Humanités B'
                ]}
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
              />
            ) : (
              <select
                className="w-full h-10 px-3 bg-white border border-outline-variant rounded-md text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>
          <Button variant="outline" size="sm" icon="print" onClick={() => window.print()}>
            Imprimer
          </Button>
        </div>
      </div>

      {/* Schedule Master Grid */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="bg-primary text-white font-bold">
                <th className="p-3 border-r border-primary-container w-28">Heure</th>
                {days.map(d => (
                  <th key={d} className="p-3 border-r border-primary-container last:border-r-0 min-w-[150px]">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {timeSlots.map((slot, slotIdx) => (
                <tr key={slotIdx} className={slotIdx % 2 === 0 ? 'bg-white' : 'bg-surface-container-low/30'}>
                  <td className="p-3 font-mono font-bold text-primary bg-surface-container-low border-r border-outline-variant">
                    {slot}
                  </td>
                  {days.map(d => {
                    const match = schedule.find(s => s.day === d && s.timeSlot === slot);
                    return (
                      <td key={d} className="p-2 border-r border-outline-variant last:border-r-0 h-16 align-top">
                        {match ? (
                          <div className="h-full p-2 rounded bg-primary-fixed/40 border border-primary-fixed text-left space-y-0.5 shadow-xs">
                            <span className="font-extrabold text-xs text-primary block leading-tight">
                              {match.subject}
                            </span>
                            {viewMode === 'class' ? (
                              <span className="text-[10px] text-on-surface-variant block truncate">
                                {match.teacherName}
                              </span>
                            ) : (
                              <span className="text-[10px] text-secondary-container font-bold block truncate">
                                {match.className}
                              </span>
                            )}
                            <span className="text-[9px] font-bold text-secondary-container bg-primary px-1.5 py-0.2 rounded inline-block mt-1">
                              {match.room}
                            </span>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-on-surface-variant/40 text-[10px] italic">
                            -
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

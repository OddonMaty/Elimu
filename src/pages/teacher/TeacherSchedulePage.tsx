import React, { useState, useEffect } from 'react';
import { classService } from '../../services/api';
import { ScheduleItem } from '../../types';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';

export interface TeacherSchedulePageProps {}

export const TeacherSchedulePage: React.FC<TeacherSchedulePageProps> = () => {
  const { currentUser } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const fetch = async () => {
      if (!currentUser.id) return;
      const data = await classService.getSchedule('ALL', currentUser.id);
      setSchedule(data);
    };
    fetch();
  }, [currentUser.id]);

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
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Mon Emploi du Temps Hebdomadaire
        </h1>
        <p className="text-xs text-on-surface-variant">
          Planning personnel des cours, salles attribuées et classes à encadrer
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-primary-fixed border border-primary opacity-80" />
          <span className="font-semibold text-on-surface-variant">Mes cours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-surface-container" />
          <span className="text-on-surface-variant">Disponible / Préparation</span>
        </div>
      </div>

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
                          <div className="h-full p-2 rounded text-left space-y-0.5 shadow-xs border bg-primary-fixed/60 border-primary">
                            <span className="font-extrabold text-xs block leading-tight text-primary">
                              {match.subject}
                            </span>
                            <span className="text-[10px] text-on-surface-variant block truncate font-bold">
                              {match.className}
                            </span>
                            <span className="text-[9px] font-bold text-white bg-primary px-1.5 rounded inline-block mt-1">
                              {match.room}
                            </span>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-on-surface-variant/30 text-[10px] italic">
                            Libre
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

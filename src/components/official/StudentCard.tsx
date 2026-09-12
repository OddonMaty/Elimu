import React from 'react';
import { Student } from '../../types';
import { Button } from '../common/Button';

export interface StudentCardProps {
  readonly student: Student;
  readonly onPrint?: () => void;
  readonly schoolName?: string;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onPrint = () => window.print(),
  schoolName = 'COLLÈGE BOBOTO - KINSHASA'
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between no-print bg-surface-container-lowest p-3 rounded-lg border border-outline-variant">
        <span className="text-xs font-semibold text-primary">Carte d'Identité Scolaire Numérique</span>
        <Button variant="outline" size="sm" icon="print" onClick={onPrint}>
          Imprimer la Carte
        </Button>
      </div>

      {/* Credit-Card Size ID Badge (85.6mm x 53.98mm ratio) */}
      <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-primary via-primary-container to-tertiary text-white rounded-xl shadow-xl overflow-hidden border-2 border-secondary-container relative font-sans">
        
        {/* Top Header */}
        <div className="px-4 py-2 bg-black/30 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-secondary-container text-primary font-black flex items-center justify-center text-xs">
              E
            </div>
            <span className="text-[10px] font-black tracking-wider uppercase">{schoolName}</span>
          </div>
          <span className="text-[9px] font-bold text-secondary-container tracking-widest">{student.academicYear}</span>
        </div>

        {/* Card Body */}
        <div className="p-4 flex items-center gap-4">
          <div className="relative">
            <img
              src={student.photoUrl}
              alt={student.firstName}
              className="w-20 h-24 object-cover rounded-lg border-2 border-white shadow-md"
            />
            <div className="absolute -bottom-1.5 -right-1.5 bg-success text-white p-0.5 rounded-full ring-2 ring-primary">
              <span className="material-symbols-outlined text-xs block">verified</span>
            </div>
          </div>

          <div className="flex-1 space-y-1 text-xs">
            <div className="border-b border-white/20 pb-1">
              <p className="text-[9px] text-on-primary-container font-semibold uppercase">Nom & Postnom</p>
              <p className="text-sm font-black tracking-tight uppercase">{student.lastName} {student.firstName}</p>
            </div>
            <div>
              <p className="text-[9px] text-on-primary-container font-semibold uppercase">Classe & Section</p>
              <p className="font-bold text-secondary-container">{student.className}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-on-primary-container font-semibold uppercase">Matricule</p>
                <p className="font-mono font-bold text-[11px]">{student.matricule}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-on-primary-container font-semibold uppercase">Statut</p>
                <span className="text-[10px] font-extrabold bg-success-container text-success px-1.5 py-0.2 rounded">
                  {student.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with QR code placeholder */}
        <div className="px-4 py-2 bg-black/40 flex items-center justify-between text-[8px] text-white/70 border-t border-white/10">
          <div>
            <p>Ministère de l'EPST • Carte Scolaire Sécurisée</p>
            <p className="text-[7px]">Valable pour l'année scolaire en cours</p>
          </div>
          <div className="w-7 h-7 bg-white p-0.5 rounded flex items-center justify-center text-primary font-mono text-[8px] font-black">
            QR
          </div>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { ReportCard } from '../../types';
import { Button } from '../common/Button';

export interface OfficialBulletinProps {
  readonly reportCard: ReportCard;
  readonly onPrint?: () => void;
  readonly schoolName?: string;
  readonly provinceEducation?: string;
}

export const OfficialBulletin: React.FC<OfficialBulletinProps> = ({
  reportCard,
  onPrint = () => window.print(),
  schoolName = "COLLÈGE BOBOTO",
  provinceEducation = "PROVINCE ÉDUCATIONNELLE DE KINSHASA-LUKUNGA"
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Control Action Bar */}
      <div className="flex items-center justify-between no-print bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm">
        <div className="flex items-center gap-2 text-sm text-primary font-bold">
          <span className="material-symbols-outlined text-xl text-secondary-container">verified</span>
          <span>Bulletin Scolaire Officiel RDC (Conforme aux normes EPST)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon="print" onClick={onPrint}>
            Imprimer le Bulletin
          </Button>
          <Button variant="primary" size="sm" icon="download" onClick={onPrint}>
            Exporter en PDF
          </Button>
        </div>
      </div>

      {/* Official Sheet Container (Printable Paper Document) */}
      <div className="bg-white text-black p-6 sm:p-8 rounded-lg border border-gray-300 shadow-md font-sans max-w-5xl mx-auto w-full leading-tight text-xs">
        
        {/* Ministerial Header */}
        <div className="border-b-2 border-black pb-4 mb-4 text-center space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-left space-y-0.5">
              <p className="font-extrabold text-[10px] uppercase">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</p>
              <p className="font-semibold text-[9px] uppercase text-gray-700">MINISTÈRE DE L’ÉDUCATION NATIONALE ET NOUVELLE CITOYENNETÉ</p>
              <p className="text-[9px] font-bold text-primary">{provinceEducation}</p>
            </div>
            
            {/* National Crest / Symbol Emblem */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs bg-yellow-50 text-blue-900 shadow-inner">
                RDC
              </div>
              <span className="text-[8px] font-bold mt-0.5 uppercase tracking-widest text-gray-600">PAIX - JUSTICE - TRAVAIL</span>
            </div>

            <div className="text-right space-y-0.5">
              <p className="font-extrabold text-sm uppercase text-blue-950">{schoolName}</p>
              <p className="text-[9px] text-gray-600">Code Établissement : 01048291</p>
              <p className="text-[9px] font-bold text-gray-800">ANNÉE SCOLAIRE : {reportCard.academicYear}</p>
            </div>
          </div>

          <div className="pt-2">
            <h2 className="text-base font-black uppercase tracking-wider bg-gray-100 py-1 border-y border-black">
              BULLETIN SCOLAIRE OFFICIEL DU SECONDAIRE & HUMANITÉS
            </h2>
          </div>
        </div>

        {/* Student Identification Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-gray-50 border border-gray-400 rounded mb-4 text-xs">
          <div>
            <span className="text-gray-500 text-[10px] block uppercase font-bold">Élève :</span>
            <span className="font-black text-sm text-gray-900">{reportCard.studentName}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase font-bold">Matricule :</span>
            <span className="font-mono font-bold text-primary">{reportCard.matricule}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase font-bold">Classe & Section :</span>
            <span className="font-bold">{reportCard.className} • {reportCard.section}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase font-bold">Période :</span>
            <span className="font-bold text-blue-900">{reportCard.term}</span>
          </div>
        </div>

        {/* Official Grades Grid */}
        <div className="overflow-x-auto border border-black mb-4">
          <table className="w-full text-center border-collapse text-[11px]">
            <thead>
              <tr className="bg-blue-950 text-white font-bold border-b border-black">
                <th className="p-2 text-left border-r border-blue-900 w-1/3">BRANCHES / COURS</th>
                <th className="p-1.5 border-r border-blue-900 text-yellow-300">MAX</th>
                <th className="p-1.5 border-r border-blue-900">1ère P.</th>
                <th className="p-1.5 border-r border-blue-900">2ème P.</th>
                <th className="p-1.5 border-r border-blue-900">EXAM 1</th>
                <th className="p-1.5 border-r border-blue-900 bg-blue-900 font-extrabold text-yellow-300">TOT. S1</th>
                <th className="p-1.5 border-r border-blue-900">3ème P.</th>
                <th className="p-1.5 border-r border-blue-900">4ème P.</th>
                <th className="p-1.5 border-r border-blue-900">EXAM 2</th>
                <th className="p-1.5 border-r border-blue-900 bg-blue-900 font-extrabold text-yellow-300">TOT. S2</th>
                <th className="p-1.5 bg-yellow-400 text-blue-950 font-black">%</th>
              </tr>
            </thead>
            <tbody>
              {reportCard.grades.map((g, idx) => (
                <tr key={g.courseId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 text-left font-medium border-r border-b border-gray-300 flex items-center justify-between">
                    <span>{g.courseName}</span>
                    <span className="text-[9px] text-gray-500 font-normal">{g.category.replace('_', ' ')}</span>
                  </td>
                  <td className="p-1.5 font-bold border-r border-b border-gray-300 bg-gray-100">{g.maxPoints}</td>
                  <td className="p-1.5 border-r border-b border-gray-300">{g.firstPeriod}</td>
                  <td className="p-1.5 border-r border-b border-gray-300">{g.secondPeriod}</td>
                  <td className="p-1.5 border-r border-b border-gray-300 font-semibold">{g.firstExam}</td>
                  <td className="p-1.5 border-r border-b border-gray-300 font-black bg-blue-50 text-blue-950">{g.totalSemester1}</td>
                  <td className="p-1.5 border-r border-b border-gray-300 text-gray-400">{g.thirdPeriod ?? '-'}</td>
                  <td className="p-1.5 border-r border-b border-gray-300 text-gray-400">{g.fourthPeriod ?? '-'}</td>
                  <td className="p-1.5 border-r border-b border-gray-300 text-gray-400 font-semibold">{g.secondExam ?? '-'}</td>
                  <td className="p-1.5 border-r border-b border-gray-300 text-gray-400 font-black bg-blue-50/50">{g.totalSemester2 ?? '-'}</td>
                  <td className="p-1.5 border-b border-gray-300 font-bold text-blue-900">{g.percentage ? `${g.percentage}%` : '-'}</td>
                </tr>
              ))}
              {/* Grand Total Row */}
              <tr className="bg-yellow-50 border-t-2 border-black font-black text-xs">
                <td className="p-2.5 text-left uppercase text-blue-950 border-r border-black">
                  TOTAL GÉNÉRAL DES POINTS
                </td>
                <td className="p-2 border-r border-black">{reportCard.totalMax}</td>
                <td colSpan={3} className="p-2 border-r border-black text-center text-gray-500">Points Obtenus Sem. 1</td>
                <td className="p-2 border-r border-black text-blue-950 text-sm bg-yellow-200">
                  {reportCard.totalObtained}
                </td>
                <td colSpan={3} className="p-2 border-r border-black text-center text-gray-400">-</td>
                <td className="p-2 border-r border-black text-gray-400">-</td>
                <td className="p-2 bg-yellow-400 text-blue-950 text-sm">
                  {reportCard.percentage}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Results & Deliberation Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-blue-50/60 border border-blue-900 rounded mb-4">
          <div className="text-center p-2 bg-white rounded border border-blue-200">
            <span className="text-[10px] text-gray-500 block uppercase font-bold">Pourcentage Global</span>
            <span className="text-xl font-black text-blue-950">{reportCard.percentage}%</span>
          </div>
          <div className="text-center p-2 bg-white rounded border border-blue-200">
            <span className="text-[10px] text-gray-500 block uppercase font-bold">Place / Rang</span>
            <span className="text-xl font-black text-primary">
              {reportCard.rank}<sup>{reportCard.rank === 1 ? 'ère' : 'ème'}</sup> / {reportCard.classSize} élèves
            </span>
          </div>
          <div className="text-center p-2 bg-white rounded border border-blue-200">
            <span className="text-[10px] text-gray-500 block uppercase font-bold">Décision du Jury</span>
            <span className="text-sm font-black text-success uppercase tracking-wider block mt-1">
              {reportCard.decision}
            </span>
          </div>
        </div>

        {/* Observations & Discipline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3 border border-gray-300 rounded space-y-1">
            <p className="font-bold text-[10px] uppercase text-gray-600">Appréciation Pédagogique du Titulaire :</p>
            <p className="italic text-gray-800 text-xs">{reportCard.teacherComment}</p>
            <div className="pt-2 flex items-center justify-between text-[10px] text-gray-600 border-t border-gray-200 mt-2">
              <span>Application : <strong>{reportCard.application}</strong></span>
              <span>Conduite : <strong>{reportCard.conduct}</strong></span>
            </div>
          </div>

          <div className="p-3 border border-gray-300 rounded space-y-1">
            <p className="font-bold text-[10px] uppercase text-gray-600">Avis du Chef d’Établissement :</p>
            <p className="italic text-gray-800 text-xs">{reportCard.directorComment}</p>
            <p className="text-[10px] text-gray-500 pt-2 border-t border-gray-200 mt-2">
              Fait à Kinshasa, le {reportCard.issueDate}
            </p>
          </div>
        </div>

        {/* Official Signatures & Seal Strip */}
        <div className="grid grid-cols-3 gap-4 text-center border-t border-black pt-4">
          <div>
            <p className="font-bold text-[10px] uppercase">Le Titulaire de Classe</p>
            <div className="h-14 flex items-center justify-center italic text-gray-400 text-xs">
              (Signature)
            </div>
            <p className="text-[10px] font-semibold text-gray-700">M. Jean-Paul Kasongo</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <p className="font-bold text-[10px] uppercase text-gray-500">Sceau de l’Établissement</p>
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-[8px] text-gray-400 uppercase font-bold text-center p-1 mt-1">
              Sceau Officiel
            </div>
          </div>

          <div>
            <p className="font-bold text-[10px] uppercase">Le Préfet des Études / Directeur</p>
            <div className="h-14 flex items-center justify-center italic text-gray-400 text-xs">
              (Signature & Sceau)
            </div>
            <p className="text-[10px] font-semibold text-gray-700">Prof. Dieudonné Mwamba</p>
          </div>
        </div>

      </div>
    </div>
  );
};

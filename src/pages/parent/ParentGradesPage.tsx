import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gradeService } from '../../services/api';
import { ReportCard } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface ParentGradesPageProps {}

export const ParentGradesPage: React.FC<ParentGradesPageProps> = () => {
  const [report, setReport] = useState<ReportCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await gradeService.getReportCard('stud-1');
      setReport(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner message="Chargement des résultats scolaires..." />;
  if (!report) return null;

  const overallPct = Math.round((report.totalObtained / report.totalMax) * 100);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Résultats Scolaires & Notes par Matière
          </h1>
          <p className="text-xs text-on-surface-variant">
            Relevé de notes officiel • {report.studentName} • {report.className} • {report.academicYear}
          </p>
        </div>
        <Link to="/parent/bulletin/official">
          <Button variant="accent" size="sm" icon="description">
            Bulletin Officiel PDF
          </Button>
        </Link>
      </div>

      {/* Summary banner */}
      <div className="grid grid-cols-3 gap-4">
        <Card noPadding className={`p-4 text-center border-l-4 ${overallPct >= 50 ? 'border-l-success' : 'border-l-error'}`}>
          <span className={`text-3xl font-black block ${overallPct >= 50 ? 'text-success' : 'text-error'}`}>{overallPct}%</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Moyenne Générale</span>
        </Card>
        <Card noPadding className="p-4 text-center border-l-4 border-l-primary">
          <span className="text-3xl font-black text-primary block">{report.rank}<sup className="text-base">e</sup></span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Rang / {report.classSize} élèves</span>
        </Card>
        <Card noPadding className={`p-4 text-center border-l-4 ${report.decision === 'Passé' || report.decision === 'Admis avec mention' ? 'border-l-success' : 'border-l-warning'}`}>
          <span className={`text-lg font-black block mt-2 ${report.decision === 'Passé' || report.decision === 'Admis avec mention' ? 'text-success' : 'text-warning'}`}>
            {report.decision}
          </span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Décision du Conseil</span>
        </Card>
      </div>

      {/* Grades Per Subject Table */}
      <Card title="Relevé de Notes Détaillé par Cours" subtitle="Pondérations officielles EPST-RDC">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                <th className="p-3">Matière / Cours</th>
                <th className="p-3 text-center">Période 1 (/20)</th>
                <th className="p-3 text-center">Période 2 (/20)</th>
                <th className="p-3 text-center">Examen (/40)</th>
                <th className="p-3 text-center">Total (/80)</th>
                <th className="p-3 text-center">%</th>
                <th className="p-3 text-right">Appréciation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {report.grades.map((g, idx) => {
                const total = g.firstPeriod + g.secondPeriod + g.firstExam;
                const max = g.maxPoints || 80;
                const pct = Math.round((total / max) * 100);
                return (
                  <tr key={idx} className={`hover:bg-surface-container-low/40 transition-colors ${pct < 50 ? 'bg-error/5' : ''}`}>
                    <td className="p-3 font-semibold text-on-surface">{g.courseName}</td>
                    <td className="p-3 text-center font-bold text-primary">{g.firstPeriod}</td>
                    <td className="p-3 text-center font-bold text-primary">{g.secondPeriod}</td>
                    <td className="p-3 text-center font-bold text-primary">{g.firstExam}</td>
                    <td className="p-3 text-center font-black text-sm text-primary">{total}</td>
                    <td className="p-3 text-center">
                      <span className={`font-black ${pct >= 50 ? 'text-success' : 'text-error'}`}>{pct}%</span>
                    </td>
                    <td className="p-3 text-right">
                      {pct >= 80 ? (
                        <Badge variant="success" size="sm">Très Bien</Badge>
                      ) : pct >= 65 ? (
                        <Badge variant="primary" size="sm">Bien</Badge>
                      ) : pct >= 50 ? (
                        <Badge variant="warning" size="sm">Satisfaisant</Badge>
                      ) : (
                        <Badge variant="error" size="sm">Insuffisant</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { gradeService } from '../../services/api';
import { ReportCard } from '../../types';
import { OfficialBulletin } from '../../components/official/OfficialBulletin';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface OfficialBulletinPageProps {}

export const OfficialBulletinPage: React.FC<OfficialBulletinPageProps> = () => {
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

  if (loading) return <LoadingSpinner message="Génération du bulletin officiel..." />;
  if (!report) return null;

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Bulletin Officiel EPST — République Démocratique du Congo
          </h1>
          <p className="text-xs text-on-surface-variant">
            Document officiel conforme aux directives du Ministère de l'EPST-RDC
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon="print" onClick={() => window.print()}>
            Imprimer / Sauvegarder PDF
          </Button>
        </div>
      </div>

      <OfficialBulletin reportCard={report} />
    </div>
  );
};

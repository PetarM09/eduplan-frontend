import { useEffect, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { StatCard } from './StatCard';
import { Calendar, UserX, FileText, ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { RasporedStavkaResponse, ZamenaResponse } from '@/lib/types';

interface Stats {
  casovaUNedelji: number;
  zamenaKaoOdsutni: number;
  zamenaKaoZamenik: number;
  predstojeceZamene: number;
}

export function ProfessorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ucitaj = async () => {
      setLoading(true);
      setError(null);
      try {
        const [raspored, kaoOdsutni, kaoZamenik] = await Promise.all([
          // Raspored moze da fail-uje ako nema aktivne verzije rasporeda — guta gresku
          api.get<RasporedStavkaResponse[]>('/raspored/me').catch(() => [] as RasporedStavkaResponse[]),
          api.get<ZamenaResponse[]>('/zamene/moje/odsutni'),
          api.get<ZamenaResponse[]>('/zamene/moje/zamenik'),
        ]);
        const danas = new Date().toISOString().slice(0, 10);
        const predstojece = [...kaoOdsutni, ...kaoZamenik].filter(
          (z) => z.datum >= danas && z.status !== 'ODBIJENA' && z.status !== 'OTKAZANA'
        ).length;
        setStats({
          casovaUNedelji: raspored.length,
          zamenaKaoOdsutni: kaoOdsutni.length,
          zamenaKaoZamenik: kaoZamenik.length,
          predstojeceZamene: predstojece,
        });
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju');
      } finally {
        setLoading(false);
      }
    };
    ucitaj();
  }, []);

  return (
    <AppLayout>
      <PageHeader
        title="Moj profil"
        description={`Dobrodosao, ${user?.username ?? ''}. Pregled tvog rasporeda, zamena i planova.`}
      />

      {loading ? (
        <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border p-12 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam podatke...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Casovi u nedelji"
            value={stats.casovaUNedelji}
            icon={Calendar}
            accent="brand"
            to="/raspored"
            hint={stats.casovaUNedelji === 0 ? 'Raspored nije uvezen' : undefined}
          />
          <StatCard
            label="Predstojece zamene"
            value={stats.predstojeceZamene}
            icon={UserX}
            accent="warning"
            to="/zamene"
            hint={
              stats.zamenaKaoZamenik > 0 ? `${stats.zamenaKaoZamenik} kao zamenik` : undefined
            }
          />
          <StatCard label="Godisnji planovi" value="—" icon={FileText} accent="success" to="/planovi/godisnji" hint="U izradi" />
          <StatCard label="Operativni planovi" value="—" icon={ClipboardList} accent="accent" to="/planovi/operativni" hint="U izradi" />
        </div>
      ) : null}
    </AppLayout>
  );
}

import { useEffect, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { StatCard } from './StatCard';
import { BookOpen, Users, School, UserX, FileText, ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type {
  GodisnjiPlanResponse,
  KorisnikResponse,
  OdeljenjeResponse,
  OperativniPlanResponse,
  PredmetResponse,
  ZamenaResponse,
} from '@/lib/types';

interface Stats {
  korisnika: number;
  aktivnihKorisnika: number;
  predmeta: number;
  odeljenja: number;
  zameneDanas: number;
  predlozeneZamene: number;
  godisnjiPodnetih: number;
  godisnjiOdobrenih: number;
  operativniPodnetih: number;
  operativniOdobrenih: number;
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ucitaj = async () => {
      setLoading(true);
      setError(null);
      try {
        const danas = new Date().toISOString().slice(0, 10);
        const [korisnici, predmeti, odeljenja, zameneDanas, godisnji, operativni] = await Promise.all([
          api.get<KorisnikResponse[]>('/korisnici'),
          api.get<PredmetResponse[]>('/predmeti/svi'),
          api.get<OdeljenjeResponse[]>('/odeljenja'),
          api.get<ZamenaResponse[]>('/zamene/danas', { params: { datum: danas } }),
          api.get<GodisnjiPlanResponse[]>('/planovi/godisnji/svi').catch(() => []),
          api.get<OperativniPlanResponse[]>('/planovi/operativni/svi').catch(() => []),
        ]);
        setStats({
          korisnika: korisnici.length,
          aktivnihKorisnika: korisnici.filter((k) => k.aktivan).length,
          predmeta: predmeti.filter((p) => p.aktivan).length,
          odeljenja: odeljenja.filter((o) => o.aktivan).length,
          zameneDanas: zameneDanas.length,
          predlozeneZamene: zameneDanas.filter((z) => z.status === 'PREDLOZENA').length,
          godisnjiPodnetih: godisnji.filter((p) => p.status === 'PODNET').length,
          godisnjiOdobrenih: godisnji.filter((p) => p.status === 'ARHIVIRAN').length,
          operativniPodnetih: operativni.filter((p) => p.status === 'PODNET').length,
          operativniOdobrenih: operativni.filter((p) => p.status === 'ARHIVIRAN').length,
        });
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju statistike');
      } finally {
        setLoading(false);
      }
    };
    ucitaj();
  }, []);

  return (
    <AppLayout>
      <PageHeader
        title="Administrativni pregled"
        description={`Dobrodosao, ${user?.username ?? ''}. Pregled stanja u skoli na jednom mestu.`}
      />

      {loading ? (
        <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border p-12 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam statistiku...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Korisnici"
              value={stats.korisnika}
              icon={Users}
              accent="info"
              to="/korisnici"
              hint={`${stats.aktivnihKorisnika} aktivnih`}
            />
            <StatCard
              label="Predmeti"
              value={stats.predmeta}
              icon={BookOpen}
              accent="brand"
              to="/predmeti"
            />
            <StatCard
              label="Odeljenja"
              value={stats.odeljenja}
              icon={School}
              accent="accent"
              to="/odeljenja"
            />
            <StatCard
              label="Zamene danas"
              value={stats.zameneDanas}
              icon={UserX}
              accent="warning"
              to="/zamene"
              hint={
                stats.predlozeneZamene > 0
                  ? `${stats.predlozeneZamene} ceka odobrenje`
                  : 'sve obradjene'
              }
            />
            <StatCard
              label="Godisnji planovi (poslati)"
              value={stats.godisnjiPodnetih}
              icon={FileText}
              accent="success"
              to="/planovi/godisnji"
              hint={`${stats.godisnjiOdobrenih} odobrenih`}
            />
            <StatCard
              label="Operativni planovi (poslati)"
              value={stats.operativniPodnetih}
              icon={ClipboardList}
              accent="accent"
              to="/planovi/operativni"
              hint={`${stats.operativniOdobrenih} odobrenih`}
            />
          </div>
        </>
      ) : null}
    </AppLayout>
  );
}

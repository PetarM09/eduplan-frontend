import { useEffect, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { StatCard } from './StatCard';
import { BookOpen, Users, School, UserX, FileText, ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type {
  KorisnikResponse,
  OdeljenjeResponse,
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
        const [korisnici, predmeti, odeljenja, zameneDanas] = await Promise.all([
          api.get<KorisnikResponse[]>('/korisnici'),
          api.get<PredmetResponse[]>('/predmeti/svi'),
          api.get<OdeljenjeResponse[]>('/odeljenja'),
          api.get<ZamenaResponse[]>('/zamene/danas', { params: { datum: danas } }),
        ]);
        setStats({
          korisnika: korisnici.length,
          aktivnihKorisnika: korisnici.filter((k) => k.aktivan).length,
          predmeta: predmeti.filter((p) => p.aktivan).length,
          odeljenja: odeljenja.filter((o) => o.aktivan).length,
          zameneDanas: zameneDanas.length,
          predlozeneZamene: zameneDanas.filter((z) => z.status === 'PREDLOZENA').length,
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
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex items-center justify-center text-gray-500">
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
              accent="indigo"
              to="/korisnici"
              hint={`${stats.aktivnihKorisnika} aktivnih`}
            />
            <StatCard
              label="Predmeti"
              value={stats.predmeta}
              icon={BookOpen}
              accent="blue"
              to="/predmeti"
            />
            <StatCard
              label="Odeljenja"
              value={stats.odeljenja}
              icon={School}
              accent="cyan"
              to="/odeljenja"
            />
            <StatCard
              label="Zamene danas"
              value={stats.zameneDanas}
              icon={UserX}
              accent="orange"
              to="/zamene"
              hint={
                stats.predlozeneZamene > 0
                  ? `${stats.predlozeneZamene} ceka odobrenje`
                  : 'sve obradjene'
              }
            />
            <StatCard label="Godisnji planovi" value="—" icon={FileText} accent="green" to="/planovi/godisnji" hint="U izradi" />
            <StatCard label="Operativni planovi" value="—" icon={ClipboardList} accent="purple" to="/planovi/operativni" hint="U izradi" />
          </div>
        </>
      ) : null}
    </AppLayout>
  );
}

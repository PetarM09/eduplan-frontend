import { useEffect, useMemo, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import { SkolskaGodinaSelect } from '@/app/components/ui/SkolskaGodinaSelect';
import {
  AlertCircle,
  BarChart3,
  ClipboardList,
  Download,
  FileText,
  Loader2,
  Users2,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type {
  PPDashboardResponse,
  PPPeriod,
  PPStatus,
  StatistikaResponse,
} from '@/lib/types';

const PERIOD_LABEL: Record<PPPeriod, string> = {
  PRVO_TROMESECJE: 'Prvo tromesecje',
  PRVO_POLUGODISTE: 'Prvo polugodiste',
  TRECE_TROMESECJE: 'Trece tromesecje',
  KRAJ_GODINE: 'Kraj godine',
};

const STATUS_BG: Record<string, string> = {
  NACRT: 'bg-secondary text-foreground',
  PODNET: 'bg-brand-100 text-brand-700',
  PRIHVACEN: 'bg-emerald-100 text-emerald-700',
  VRACENO_NA_DORADU: 'bg-amber-100 text-amber-700',
  ARHIVIRAN: 'bg-secondary text-muted-foreground',
};

function trenutnaSkolskaGodina(): string {
  const danas = new Date();
  const m = danas.getMonth() + 1;
  const y = danas.getFullYear();
  // skolska godina krece u septembru
  return m >= 9 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

export function PPDashboardPage() {
  const [skolskaGodina, setSkolskaGodina] = useState(trenutnaSkolskaGodina());
  const [period, setPeriod] = useState<PPPeriod>('PRVO_POLUGODISTE');
  const [dashboard, setDashboard] = useState<PPDashboardResponse | null>(null);
  const [statistika, setStatistika] = useState<StatistikaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statLoading, setStatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ucitajDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<PPDashboardResponse>('/pp/dashboard', {
        params: { skolskaGodina },
      });
      setDashboard(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju dashboarda');
    } finally {
      setLoading(false);
    }
  };

  const ucitajStatistiku = async () => {
    setStatLoading(true);
    try {
      const data = await api.get<StatistikaResponse>('/pp/statistika', {
        params: { skolskaGodina, period },
      });
      setStatistika(data);
    } catch (e) {
      setStatistika(null);
      if (e instanceof ApiError && e.status !== 404) {
        alert(e.message);
      }
    } finally {
      setStatLoading(false);
    }
  };

  useEffect(() => {
    ucitajDashboard();
  }, [skolskaGodina]);

  useEffect(() => {
    ucitajStatistiku();
  }, [skolskaGodina, period]);

  const skiniExcel = async () => {
    try {
      const blob = await api.get<Blob>('/pp/eksport/excel', { params: { skolskaGodina } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pp-izvestaj-${skolskaGodina.replace('/', '-')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri preuzimanju');
    }
  };

  const ucenikUkupno = statistika?.ukupnoUcenika ?? 0;
  const procenatM = ucenikUkupno > 0 ? Math.round(((statistika?.ucenikaMuski ?? 0) * 100) / ucenikUkupno) : 0;
  const procenatZ = ucenikUkupno > 0 ? Math.round(((statistika?.ucenikaZenski ?? 0) * 100) / ucenikUkupno) : 0;

  return (
    <AppLayout>
      <PageHeader
        title="PP dashboard"
        description="Pregled planova, izvestaja i statistike za skolsku godinu"
        action={
          <div className="flex items-center gap-2">
            <div className="w-36">
              <SkolskaGodinaSelect value={skolskaGodina} onChange={setSkolskaGodina} />
            </div>
            <Button onClick={skiniExcel} variant="outline">
              <Download className="w-4 h-4" /> Excel
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="bg-card rounded-2xl border border-border p-12 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam dashboard...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={ucitajDashboard} className="ml-auto">
            Pokusaj ponovo
          </Button>
        </div>
      ) : dashboard ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatKartica
              icon={FileText}
              boja="blue"
              naslov="Godisnji planovi"
              broj={dashboard.ukupnoGodisnjihPlanova}
              podStatusi={dashboard.godisnjiPoStatusu}
            />
            <StatKartica
              icon={ClipboardList}
              boja="purple"
              naslov="Operativni planovi"
              broj={dashboard.ukupnoOperativnihPlanova}
              podStatusi={dashboard.operativniPoStatusu}
            />
            <StatKartica
              icon={Users2}
              boja="emerald"
              naslov="PP izvestaji"
              broj={dashboard.ukupnoIzvestaja}
              podStatusi={dashboard.izvestajiPoStatusu}
            />
          </div>

          <div className="bg-card rounded-2xl border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-600" />
                <h2 className="font-semibold text-foreground">Statistika izvestaja</h2>
              </div>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PPPeriod)}
                className="h-9 px-2 rounded-lg border border-input text-sm"
              >
                {(Object.keys(PERIOD_LABEL) as PPPeriod[]).map((p) => (
                  <option key={p} value={p}>
                    {PERIOD_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
            <div className="p-6">
              {statLoading ? (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Ucitavam statistiku...
                </div>
              ) : statistika && statistika.brojIzvestaja > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <SummaryRow label="Broj izvestaja" value={statistika.brojIzvestaja.toString()} />
                  <SummaryRow label="Ukupno ucenika" value={statistika.ukupnoUcenika.toString()} />
                  <SummaryRow
                    label="Pol (M / Z)"
                    value={`${statistika.ucenikaMuski} (${procenatM}%) / ${statistika.ucenikaZenski} (${procenatZ}%)`}
                  />
                  <SummaryRow
                    label="Izostanci (opr / neopr)"
                    value={`${statistika.prisustvo.opravdana} / ${statistika.prisustvo.neopravdana}`}
                  />
                  <Distribucija
                    naslov="Vladanje"
                    podaci={statistika.vladanjeDistribucija}
                    classBg="bg-brand-500"
                  />
                  <Distribucija
                    naslov="Uspeh"
                    podaci={statistika.uspehDistribucija}
                    classBg="bg-emerald-500"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nema PP izvestaja za odabrani period i skolsku godinu.
                </p>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Poslednji PP izvestaji</h2>
            </div>
            {dashboard.izvestaji.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">Jos nema PP izvestaja.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <Th>Staresina</Th>
                    <Th>Odeljenje</Th>
                    <Th>Period</Th>
                    <Th>Sk. godina</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dashboard.izvestaji.slice(0, 10).map((iz) => (
                    <tr key={iz.id} className="hover:bg-secondary">
                      <Td className="font-medium text-foreground">{iz.staresinaIme}</Td>
                      <Td>{iz.odeljenjeLabel}</Td>
                      <Td>{PERIOD_LABEL[iz.period]}</Td>
                      <Td>{iz.skolskaGodina}</Td>
                      <Td>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_BG[iz.status] ?? STATUS_BG.NACRT
                          }`}
                        >
                          {iz.status}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </AppLayout>
  );
}

function StatKartica({
  icon: Icon,
  boja,
  naslov,
  broj,
  podStatusi,
}: {
  icon: React.ComponentType<{ className?: string }>;
  boja: 'blue' | 'purple' | 'emerald';
  naslov: string;
  broj: number;
  podStatusi: Record<string, number>;
}) {
  const bojaMap = {
    blue: 'bg-brand-50 text-brand-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  const stavke = Object.entries(podStatusi).filter(([, v]) => v > 0);
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{naslov}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{broj}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${bojaMap[boja]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {stavke.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {stavke.map(([status, broj]) => (
            <span
              key={status}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                STATUS_BG[status] ?? STATUS_BG.NACRT
              }`}
            >
              {status}: {broj}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}

function Distribucija({
  naslov,
  podaci,
  classBg,
}: {
  naslov: string;
  podaci: Record<string, number>;
  classBg: string;
}) {
  const ukupno = useMemo(() => Object.values(podaci).reduce((a, b) => a + b, 0), [podaci]);
  return (
    <div className="md:col-span-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{naslov}</p>
      {ukupno === 0 ? (
        <p className="text-sm text-muted-foreground">—</p>
      ) : (
        <div className="space-y-1.5">
          {Object.entries(podaci).map(([k, v]) => {
            const pct = ukupno > 0 ? Math.round((v * 100) / ukupno) : 0;
            return (
              <div key={k} className="flex items-center gap-2 text-sm">
                <span className="w-32 text-foreground truncate">{k}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${classBg}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-12 text-right text-xs text-muted-foreground">
                  {v} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-4 text-sm text-foreground ${className}`}>{children}</td>;
}

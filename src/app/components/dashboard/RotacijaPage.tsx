import { useEffect, useMemo, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Play,
  Plus,
  Repeat,
  Trash2,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type {
  KreirajRotacijuRequest,
  OdeljenjeResponse,
  PredmetResponse,
  RotacijaResponse,
} from '@/lib/types';

type Tab = 'lista' | 'novi' | 'detalj';

export function RotacijaPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('lista');
  const [izabranaRotacijaId, setIzabranaRotacijaId] = useState<string | null>(null);

  const mojRezim = user?.uloga === 'NASTAVNIK';

  return (
    <AppLayout>
      {tab === 'lista' && (
        <ListaRotacija
          mojRezim={mojRezim}
          onKreiraj={() => setTab('novi')}
          onOtvori={(id) => {
            setIzabranaRotacijaId(id);
            setTab('detalj');
          }}
        />
      )}
      {tab === 'novi' && (
        <NoviRotacijaForma
          onOtkazi={() => setTab('lista')}
          onSnimljeno={(id) => {
            setIzabranaRotacijaId(id);
            setTab('detalj');
          }}
        />
      )}
      {tab === 'detalj' && izabranaRotacijaId && (
        <DetaljRotacije
          rotacijaId={izabranaRotacijaId}
          onNazad={() => setTab('lista')}
          mojRezim={mojRezim}
        />
      )}
    </AppLayout>
  );
}

// ============= LISTA =============

function ListaRotacija({
  mojRezim,
  onKreiraj,
  onOtvori,
}: {
  mojRezim: boolean;
  onKreiraj: () => void;
  onOtvori: (id: string) => void;
}) {
  const { user } = useAuth();
  const [rotacije, setRotacije] = useState<RotacijaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const path = mojRezim ? '/rotacija/moje' : '/rotacija';
      const data = await api.get<RotacijaResponse[]>(path);
      setRotacije(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ucitaj();
  }, [mojRezim]);

  const obrisi = async (id: string) => {
    if (!confirm('Obrisati rotaciju (sve nedelje ce se obrisati)?')) return;
    try {
      await api.delete(`/rotacija/${id}`);
      setRotacije((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  return (
    <>
      <PageHeader
        title={mojRezim ? 'Moje rotacije' : 'Rotacije'}
        description="Generisanje balansiranog ciklusa za grupne casove (vezbe) — C(N,K) algoritam"
        action={
          user?.uloga === 'NASTAVNIK' && (
            <Button size="lg" onClick={onKreiraj}>
              <Plus className="w-4 h-4" /> Nova rotacija
            </Button>
          )
        }
      />

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={ucitaj} className="ml-auto">
            Pokusaj ponovo
          </Button>
        </div>
      ) : rotacije.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          Jos nema rotacija. {user?.uloga === 'NASTAVNIK' && 'Klikni "Nova rotacija" da kreiras.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <Th>Naziv</Th>
                {!mojRezim && <Th>Nastavnik</Th>}
                <Th>Predmet</Th>
                <Th>Sk. godina</Th>
                <Th>Odeljenja / Grupa</Th>
                <Th>Nedelje</Th>
                <Th>Balans</Th>
                <Th className="text-right">Akcije</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rotacije.map((r) => {
                const balOk = r.statistika.balansirano;
                return (
                  <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onOtvori(r.id)}>
                    <Td className="font-medium text-gray-900 flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-indigo-500" />
                      {r.naziv}
                    </Td>
                    {!mojRezim && <Td>{r.nastavnikIme}</Td>}
                    <Td>{r.predmetNaziv ?? '—'}</Td>
                    <Td>{r.skolskaGodina}</Td>
                    <Td>
                      {r.odeljenja.length} odeljenja, grupa od {r.grupaVelicina}
                    </Td>
                    <Td>{r.statistika.ukupnoNedelja}</Td>
                    <Td>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          balOk
                            ? 'bg-emerald-100 text-emerald-700'
                            : r.statistika.ukupnoNedelja === 0
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {balOk && <CheckCircle2 className="w-3 h-3" />}
                        {r.statistika.ukupnoNedelja === 0
                          ? 'Negenerisano'
                          : balOk
                          ? 'Balansirano'
                          : `${r.statistika.minCasovaPoOdeljenju}–${r.statistika.maxCasovaPoOdeljenju}`}
                      </span>
                    </Td>
                    <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                      {user?.uloga === 'NASTAVNIK' && r.nastavnikId === user.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => obrisi(r.id)}
                          title="Obrisi"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ============= NOVI =============

function NoviRotacijaForma({
  onOtkazi,
  onSnimljeno,
}: {
  onOtkazi: () => void;
  onSnimljeno: (id: string) => void;
}) {
  const [naziv, setNaziv] = useState('');
  const [predmetId, setPredmetId] = useState<string>('');
  const [predmeti, setPredmeti] = useState<PredmetResponse[]>([]);
  const [odeljenja, setOdeljenja] = useState<OdeljenjeResponse[]>([]);
  const [odabrana, setOdabrana] = useState<Set<string>>(new Set());
  const [grupaVelicina, setGrupaVelicina] = useState<number>(2);
  const [casovaNedeljno, setCasovaNedeljno] = useState<number>(2);
  const [skolskaGodina, setSkolskaGodina] = useState<string>('');
  const [snimanje, setSnimanje] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [pr, od] = await Promise.all([
          api.get<PredmetResponse[]>('/predmeti'),
          api.get<OdeljenjeResponse[]>('/odeljenja'),
        ]);
        setPredmeti(pr);
        setOdeljenja(od);
        // default sk. godina iz prvog odeljenja
        if (od.length > 0 && !skolskaGodina) setSkolskaGodina(od[0].skolskaGodina);
      } catch {
        // ignored — UI će prikazati prazne select-e
      }
    })();
  }, []);

  const toggle = (id: string) => {
    setOdabrana((prev) => {
      const novi = new Set(prev);
      if (novi.has(id)) novi.delete(id);
      else novi.add(id);
      return novi;
    });
  };

  const validno = useMemo(() => {
    return (
      naziv.trim().length > 0 &&
      odabrana.size >= 2 &&
      odabrana.size <= 12 &&
      grupaVelicina >= 1 &&
      grupaVelicina <= 11 &&
      casovaNedeljno >= 1 &&
      casovaNedeljno <= 20 &&
      /^\d{4}\/\d{4}$/.test(skolskaGodina) &&
      grupaVelicina < odabrana.size
    );
  }, [naziv, odabrana, grupaVelicina, casovaNedeljno, skolskaGodina]);

  const snimi = async () => {
    if (!validno) return;
    setSnimanje(true);
    try {
      const body: KreirajRotacijuRequest = {
        naziv: naziv.trim(),
        predmetId: predmetId || null,
        odeljenjaIds: Array.from(odabrana),
        grupaVelicina,
        casovaNedeljno,
        skolskaGodina,
      };
      const rez = await api.post<RotacijaResponse>('/rotacija', body);
      onSnimljeno(rez.id);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setSnimanje(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Nova rotacija"
        description="Kreiraj konfiguraciju — generisanje ciklusa pokrenuces u sledecem koraku"
        action={
          <Button variant="outline" onClick={onOtkazi}>
            <ArrowLeft className="w-4 h-4" /> Otkazi
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="naziv">Naziv</Label>
            <Input
              id="naziv"
              value={naziv}
              onChange={(e) => setNaziv(e.target.value)}
              placeholder="npr. Vezbe iz informatike — III/6"
            />
          </div>
          <div>
            <Label htmlFor="predmet">Predmet (opcionalno)</Label>
            <select
              id="predmet"
              value={predmetId}
              onChange={(e) => setPredmetId(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-300 text-sm w-full"
            >
              <option value="">—</option>
              {predmeti.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.naziv}
                  {p.razred ? ` (${p.razred}.)` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="sk-godina">Skolska godina</Label>
            <Input
              id="sk-godina"
              value={skolskaGodina}
              onChange={(e) => setSkolskaGodina(e.target.value)}
              placeholder="2025/2026"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="grupa">Grupa od (K)</Label>
              <Input
                id="grupa"
                type="number"
                min={1}
                max={11}
                value={grupaVelicina}
                onChange={(e) => setGrupaVelicina(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="casovi">Casova nedeljno</Label>
              <Input
                id="casovi"
                type="number"
                min={1}
                max={20}
                value={casovaNedeljno}
                onChange={(e) => setCasovaNedeljno(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div>
          <Label>Odeljenja u rotaciji (2–12)</Label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {odeljenja.length === 0 ? (
              <p className="text-sm text-gray-500 col-span-full">Nema odeljenja.</p>
            ) : (
              odeljenja.map((o) => {
                const checked = odabrana.has(o.id);
                return (
                  <label
                    key={o.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer ${
                      checked ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(o.id)}
                      className="rounded"
                    />
                    <span className="font-medium text-gray-900">{o.label}</span>
                  </label>
                );
              })
            )}
          </div>
          {odabrana.size > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Odabrano {odabrana.size} odeljenja. Grupa K = {grupaVelicina}. Algoritam ce ucitati C({odabrana.size},
              {grupaVelicina}) ={' '}
              <strong>{binom(odabrana.size, grupaVelicina)}</strong> kombinacija u ciklusu.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" onClick={onOtkazi}>
            Otkazi
          </Button>
          <Button onClick={snimi} disabled={!validno || snimanje}>
            {snimanje ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Kreiraj
          </Button>
        </div>
      </div>
    </>
  );
}

// ============= DETALJ =============

function DetaljRotacije({
  rotacijaId,
  onNazad,
  mojRezim,
}: {
  rotacijaId: string;
  onNazad: () => void;
  mojRezim: boolean;
}) {
  const { user } = useAuth();
  const [rot, setRot] = useState<RotacijaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generisanje, setGenerisanje] = useState(false);

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<RotacijaResponse>(`/rotacija/${rotacijaId}`);
      setRot(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ucitaj();
  }, [rotacijaId]);

  const generisi = async () => {
    if (!confirm('Generisanje ce obrisati postojeće nedelje i ponovo izracunati pun ciklus. Nastaviti?')) return;
    setGenerisanje(true);
    try {
      const data = await api.post<RotacijaResponse>(`/rotacija/${rotacijaId}/generisi`);
      setRot(data);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setGenerisanje(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 flex items-center justify-center text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam...
      </div>
    );
  }
  if (error || !rot) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-2 text-red-700">
        <AlertCircle className="w-5 h-5" />
        <span>{error ?? 'Nije pronadjeno'}</span>
        <Button size="sm" variant="outline" onClick={onNazad} className="ml-auto">
          Nazad
        </Button>
      </div>
    );
  }

  const mojaRotacija = user?.uloga === 'NASTAVNIK' && rot.nastavnikId === user.id;

  return (
    <>
      <PageHeader
        title={rot.naziv}
        description={`${rot.predmetNaziv ?? '—'} • ${rot.skolskaGodina} • ${rot.nastavnikIme}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onNazad}>
              <ArrowLeft className="w-4 h-4" /> Nazad
            </Button>
            {mojaRotacija && (
              <Button onClick={generisi} disabled={generisanje}>
                {generisanje ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Generisi ciklus
              </Button>
            )}
          </div>
        }
      />

      {/* Statistika */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Stat label="Ukupno nedelja" value={rot.statistika.ukupnoNedelja.toString()} />
          <Stat label="Grupa (K)" value={rot.grupaVelicina.toString()} />
          <Stat label="Casova nedeljno" value={rot.casovaNedeljno.toString()} />
          <Stat label="Min/max po odeljenju" value={`${rot.statistika.minCasovaPoOdeljenju} / ${rot.statistika.maxCasovaPoOdeljenju}`} />
          <span
            className={`ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
              rot.statistika.balansirano
                ? 'bg-emerald-100 text-emerald-700'
                : rot.statistika.ukupnoNedelja === 0
                ? 'bg-gray-100 text-gray-500'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {rot.statistika.balansirano && <CheckCircle2 className="w-3 h-3" />}
            {rot.statistika.ukupnoNedelja === 0
              ? 'Jos negenerisano'
              : rot.statistika.balansirano
              ? 'Savrseno balansirano'
              : 'Neravnomeran raspored'}
          </span>
        </div>

        {Object.keys(rot.statistika.casoviPoOdeljenju).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Casovi po odeljenju</p>
            <div className="flex flex-wrap gap-1.5">
              {rot.odeljenja.map((o) => {
                const broj = rot.statistika.casoviPoOdeljenju[o.id] ?? 0;
                return (
                  <span
                    key={o.id}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-xs"
                  >
                    {o.label}: <strong>{broj}</strong>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Nedelje */}
      {rot.nedelje.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          Klikni "Generisi ciklus" da pokrenes C(N,K) algoritam.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <Th>Nedelja</Th>
                <Th>Odeljenja u grupi</Th>
                <Th>Broj odeljenja</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rot.nedelje.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <Td className="font-medium text-gray-900">{n.brojNedelje}.</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {n.odeljenja.map((o) => (
                        <span
                          key={o.id}
                          className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs"
                        >
                          {o.label}
                        </span>
                      ))}
                    </div>
                  </Td>
                  <Td className="text-xs text-gray-500">{n.odeljenja.length}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <td className={`px-6 py-4 text-sm text-gray-700 ${className}`} onClick={onClick}>
      {children}
    </td>
  );
}

function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let res = 1;
  for (let i = 0; i < k; i++) {
    res = (res * (n - i)) / (i + 1);
  }
  return Math.round(res);
}

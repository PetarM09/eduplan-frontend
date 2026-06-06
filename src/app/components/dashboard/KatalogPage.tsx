import { useEffect, useMemo, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  Cog,
  Folder,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type {
  IshodResponse,
  NastavnaJedinicaResponse,
  PadajuciMeniResponse,
  PredmetResponse,
  TemaResponse,
} from '@/lib/types';

export function KatalogPage() {
  const { user } = useAuth();
  const [predmeti, setPredmeti] = useState<PredmetResponse[]>([]);
  const [predmetId, setPredmetId] = useState<string | null>(null);
  const [teme, setTeme] = useState<TemaResponse[]>([]);
  const [temaId, setTemaId] = useState<string | null>(null);
  const [jedinice, setJedinice] = useState<NastavnaJedinicaResponse[]>([]);
  const [ishodi, setIshodi] = useState<IshodResponse[]>([]);
  const [tipoviCasa, setTipoviCasa] = useState<PadajuciMeniResponse[]>([]);
  const [metodeRada, setMetodeRada] = useState<PadajuciMeniResponse[]>([]);

  const [loadingPredmeti, setLoadingPredmeti] = useState(true);
  const [loadingTeme, setLoadingTeme] = useState(false);
  const [loadingJedinice, setLoadingJedinice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pretragaTema, setPretragaTema] = useState('');

  // Dialog: dodavanje ishoda (samo nastavnik)
  const [ishodOpen, setIshodOpen] = useState(false);
  const [noviIshodOpis, setNoviIshodOpis] = useState('');
  const [ishodSubmit, setIshodSubmit] = useState(false);
  const [ishodError, setIshodError] = useState<string | null>(null);

  // Ucitaj padajuce menije jednom
  useEffect(() => {
    (async () => {
      try {
        const [tc, mr] = await Promise.all([
          api.get<PadajuciMeniResponse[]>('/katalog/tipovi-casa'),
          api.get<PadajuciMeniResponse[]>('/katalog/metode-rada'),
        ]);
        setTipoviCasa(tc);
        setMetodeRada(mr);
      } catch {
        // tihi fallback — pregled je sekundarno
      }
    })();
  }, []);

  // Ucitaj predmete na start
  useEffect(() => {
    (async () => {
      setLoadingPredmeti(true);
      try {
        const data = await api.get<PredmetResponse[]>('/predmeti');
        setPredmeti(data);
        if (data.length > 0) setPredmetId(data[0].id);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju predmeta');
      } finally {
        setLoadingPredmeti(false);
      }
    })();
  }, []);

  // Kada se promeni predmet — ucitaj teme tog predmeta
  useEffect(() => {
    if (!predmetId) {
      setTeme([]);
      setTemaId(null);
      return;
    }
    (async () => {
      setLoadingTeme(true);
      setError(null);
      try {
        const data = await api.get<TemaResponse[]>('/katalog/teme', { params: { predmetId } });
        setTeme(data);
        setTemaId(data.length > 0 ? data[0].id : null);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju tema');
      } finally {
        setLoadingTeme(false);
      }
    })();
  }, [predmetId]);

  // Kada se promeni tema — ucitaj jedinice i ishode
  useEffect(() => {
    if (!temaId) {
      setJedinice([]);
      setIshodi([]);
      return;
    }
    (async () => {
      setLoadingJedinice(true);
      try {
        const [j, i] = await Promise.all([
          api.get<NastavnaJedinicaResponse[]>('/katalog/jedinice', { params: { temaId } }),
          api.get<IshodResponse[]>('/katalog/ishodi', { params: { temaId } }),
        ]);
        setJedinice(j);
        setIshodi(i);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju jedinica');
      } finally {
        setLoadingJedinice(false);
      }
    })();
  }, [temaId]);

  const filtriraneTeme = useMemo(() => {
    const q = pretragaTema.trim().toLowerCase();
    if (!q) return teme;
    return teme.filter((t) => t.naziv.toLowerCase().includes(q));
  }, [teme, pretragaTema]);

  const izabraniPredmet = useMemo(
    () => predmeti.find((p) => p.id === predmetId) ?? null,
    [predmeti, predmetId]
  );
  const izabranaTema = useMemo(() => teme.find((t) => t.id === temaId) ?? null, [teme, temaId]);

  const dodajIshod = async () => {
    if (!temaId) return;
    setIshodError(null);
    const opis = noviIshodOpis.trim();
    if (opis.length < 3) {
      setIshodError('Ishod mora imati najmanje 3 karaktera');
      return;
    }
    setIshodSubmit(true);
    try {
      const nov = await api.post<IshodResponse>('/katalog/ishodi', { temaId, opis });
      setIshodi((prev) => [...prev, nov]);
      setNoviIshodOpis('');
      setIshodOpen(false);
    } catch (e) {
      setIshodError(e instanceof ApiError ? e.message : 'Greska pri dodavanju ishoda');
    } finally {
      setIshodSubmit(false);
    }
  };

  const mozeUreditiIshode = user?.uloga === 'NASTAVNIK' || user?.uloga === 'KOORDINATOR';
  const mozeBrisati = user?.uloga === 'KOORDINATOR';
  const mozeMenjatiPadajuce = user?.uloga === 'KOORDINATOR' || user?.uloga === 'PP_SLUZBA';

  const obrisiTemu = async (t: TemaResponse) => {
    if (!confirm(`Obrisati temu "${t.naziv}"? Svi nastavni jedinice i ishodi te teme bice obrisani.`)) return;
    try {
      await api.delete(`/katalog/teme/${t.id}`);
      setTeme((prev) => prev.filter((x) => x.id !== t.id));
      if (temaId === t.id) setTemaId(null);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri brisanju teme');
    }
  };

  const obrisiJedinicu = async (j: NastavnaJedinicaResponse) => {
    if (!confirm(`Obrisati nastavnu jedinicu "${j.naziv}"?`)) return;
    try {
      await api.delete(`/katalog/jedinice/${j.id}`);
      setJedinice((prev) => prev.filter((x) => x.id !== j.id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri brisanju jedinice');
    }
  };

  const obrisiIshod = async (i: IshodResponse) => {
    if (!confirm('Obrisati ishod?')) return;
    try {
      await api.delete(`/katalog/ishodi/${i.id}`);
      setIshodi((prev) => prev.filter((x) => x.id !== i.id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri brisanju ishoda');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Katalog nastave"
        description="Teme, nastavne jedinice i ishodi koje skola gradi kroz godisnje i operativne planove (auto-save)."
      />

      {/* Izbor predmeta */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
        <Folder className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-700 font-medium">Predmet:</span>
        {loadingPredmeti ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : predmeti.length === 0 ? (
          <span className="text-sm text-gray-500">
            Nema predmeta u skoli. Prvo kreiraj predmete u sekciji "Predmeti".
          </span>
        ) : (
          <Select value={predmetId ?? ''} onValueChange={(v) => setPredmetId(v)}>
            <SelectTrigger className="w-80">
              <SelectValue placeholder="Izaberi predmet" />
            </SelectTrigger>
            <SelectContent>
              {predmeti.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.naziv}
                  {p.razred ? ` — ${p.razred}. razred` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Glavni grid: leva kolona teme, desna jedinice + ishodi */}
      {izabraniPredmet && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Leva kolona: Teme */}
          <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
            <header className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Teme predmeta {izabraniPredmet.naziv}</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Pretrazi teme"
                  value={pretragaTema}
                  onChange={(e) => setPretragaTema(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </header>
            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {loadingTeme ? (
                <CenteredLoader />
              ) : filtriraneTeme.length === 0 ? (
                <EmptyState
                  ikona={BookOpen}
                  poruka={
                    pretragaTema
                      ? 'Nema tema koje odgovaraju pretrazi.'
                      : 'Predmet jos nema unetih tema. Kreiraj godisnji plan da ih dodas u katalog.'
                  }
                />
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filtriraneTeme.map((t) => {
                    const isActive = t.id === temaId;
                    return (
                      <li key={t.id} className="group relative">
                        <button
                          onClick={() => setTemaId(t.id)}
                          className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-3 ${
                            isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <span
                            className={`flex-shrink-0 w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center ${
                              isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {t.redniBroj}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                              {t.naziv}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Obrada {t.casObrada} • Utvrd. {t.casUtvrd} • Ostalo {t.casOstalo}
                            </div>
                          </div>
                          {isActive && (
                            <ChevronRight
                              className={`w-4 h-4 text-blue-600 mt-1.5 ${mozeBrisati ? 'group-hover:hidden' : ''}`}
                            />
                          )}
                        </button>
                        {mozeBrisati && (
                          <button
                            onClick={(e) => { e.stopPropagation(); obrisiTemu(t); }}
                            title="Obrisi temu (sa svim jedinicama i ishodima)"
                            className="absolute top-1/2 -translate-y-1/2 right-3 hidden group-hover:flex w-7 h-7 rounded-md text-red-600 hover:bg-red-50 items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Desna kolona: Jedinice + Ishodi */}
          <section className="lg:col-span-3 space-y-6">
            {!izabranaTema ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
                Izaberi temu iz liste da vidis njene nastavne jedinice i ishode.
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <header className="p-4 border-b border-gray-200 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-semibold text-gray-900">
                      Nastavne jedinice — {izabranaTema.naziv}
                    </h2>
                    <span className="ml-auto text-xs text-gray-500">{jedinice.length} ukupno</span>
                  </header>
                  {loadingJedinice ? (
                    <CenteredLoader />
                  ) : jedinice.length === 0 ? (
                    <EmptyState
                      ikona={Layers}
                      poruka="Tema jos nema unetih nastavnih jedinica. One se kreiraju kroz operativne planove."
                    />
                  ) : (
                    <ol className="divide-y divide-gray-100">
                      {jedinice.map((j) => (
                        <li key={j.id} className="px-4 py-3 flex items-start gap-3 group">
                          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center">
                            {j.redniBroj ?? '—'}
                          </span>
                          <span className="flex-1 text-sm text-gray-900">{j.naziv}</span>
                          {mozeBrisati && (
                            <button
                              onClick={() => obrisiJedinicu(j)}
                              title="Obrisi jedinicu"
                              className="hidden group-hover:flex w-7 h-7 rounded-md text-red-600 hover:bg-red-50 items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <header className="p-4 border-b border-gray-200 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <h2 className="font-semibold text-gray-900">
                      Ishodi ucenja — {izabranaTema.naziv}
                    </h2>
                    <span className="ml-auto text-xs text-gray-500">{ishodi.length} ukupno</span>
                    {mozeUreditiIshode && (
                      <Button size="sm" variant="outline" onClick={() => setIshodOpen(true)}>
                        <Plus className="w-3.5 h-3.5" /> Dodaj
                      </Button>
                    )}
                  </header>
                  {ishodi.length === 0 ? (
                    <EmptyState
                      ikona={GraduationCap}
                      poruka="Tema jos nema definisanih ishoda. Ishodi se dodaju pri izradi planova."
                    />
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {ishodi.map((i, idx) => (
                        <li key={i.id} className="px-4 py-3 flex items-start gap-3 group">
                          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-green-50 text-green-700 text-xs font-semibold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="flex-1 text-sm text-gray-900 leading-relaxed">{i.opis}</span>
                          {mozeBrisati && (
                            <button
                              onClick={() => obrisiIshod(i)}
                              title="Obrisi ishod"
                              className="hidden group-hover:flex w-7 h-7 rounded-md text-red-600 hover:bg-red-50 items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* Padajuci meniji — sistemski + skolski */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PadajuciSekcija
          naslov="Tipovi casa"
          opis="Vrednosti koje koristis u operativnom planu (tip casa)"
          ikona={Sparkles}
          stavke={tipoviCasa}
          mozeMenjati={mozeMenjatiPadajuce}
          onDodaj={async (naziv) => {
            const nov = await api.post<PadajuciMeniResponse>('/katalog/tipovi-casa', { naziv });
            setTipoviCasa((prev) => [...prev, nov]);
          }}
          onObrisi={async (id) => {
            await api.delete(`/katalog/tipovi-casa/${id}`);
            setTipoviCasa((prev) => prev.filter((x) => x.id !== id));
          }}
        />
        <PadajuciSekcija
          naslov="Metode rada"
          opis="Pedagoske metode izbora u operativnom planu"
          ikona={Cog}
          stavke={metodeRada}
          mozeMenjati={mozeMenjatiPadajuce}
          onDodaj={async (naziv) => {
            const nov = await api.post<PadajuciMeniResponse>('/katalog/metode-rada', { naziv });
            setMetodeRada((prev) => [...prev, nov]);
          }}
          onObrisi={async (id) => {
            await api.delete(`/katalog/metode-rada/${id}`);
            setMetodeRada((prev) => prev.filter((x) => x.id !== id));
          }}
        />
      </div>

      {/* Dijalog: dodaj ishod */}
      <Dialog open={ishodOpen} onOpenChange={setIshodOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novi ishod ucenja</DialogTitle>
            <DialogDescription>
              Ishod ostaje u katalogu i moze se birati u svakom buducem planu za temu{' '}
              <strong>{izabranaTema?.naziv}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ishod-opis">Opis ishoda</Label>
            <Textarea
              id="ishod-opis"
              value={noviIshodOpis}
              onChange={(e) => setNoviIshodOpis(e.target.value)}
              placeholder="Ucenik je u stanju da..."
              rows={4}
            />
            <p className="text-xs text-gray-500">Maks. 2000 karaktera. Trenutno: {noviIshodOpis.length}</p>
          </div>
          {ishodError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {ishodError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIshodOpen(false)} disabled={ishodSubmit}>
              Odustani
            </Button>
            <Button onClick={dodajIshod} disabled={ishodSubmit || noviIshodOpis.trim().length < 3}>
              {ishodSubmit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Dodaj ishod
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function PadajuciSekcija({
  naslov,
  opis,
  ikona: Icon,
  stavke,
  mozeMenjati,
  onDodaj,
  onObrisi,
}: {
  naslov: string;
  opis: string;
  ikona: React.ComponentType<{ className?: string }>;
  stavke: PadajuciMeniResponse[];
  mozeMenjati: boolean;
  onDodaj: (naziv: string) => Promise<void>;
  onObrisi: (id: string) => Promise<void>;
}) {
  const sistemski = stavke.filter((s) => s.sistemski);
  const skolski = stavke.filter((s) => !s.sistemski);
  const [noviNaziv, setNoviNaziv] = useState('');
  const [snimanje, setSnimanje] = useState(false);

  const dodaj = async () => {
    const trim = noviNaziv.trim();
    if (trim.length < 1) return;
    setSnimanje(true);
    try {
      await onDodaj(trim);
      setNoviNaziv('');
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setSnimanje(false);
    }
  };

  const obrisi = async (id: string, naziv: string) => {
    if (!confirm(`Obrisati "${naziv}"?`)) return;
    try {
      await onObrisi(id);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <header className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-5 h-5 text-amber-600" />
          <h2 className="font-semibold text-gray-900">{naslov}</h2>
          <span className="ml-auto text-xs text-gray-500">{stavke.length} ukupno</span>
        </div>
        <p className="text-xs text-gray-500">{opis}</p>
      </header>
      <div className="p-4 space-y-3">
        {sistemski.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Sistemski
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sistemski.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-xs"
                >
                  {s.naziv}
                </span>
              ))}
            </div>
          </div>
        )}
        {skolski.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Skolski
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skolski.map((s) => (
                <span
                  key={s.id}
                  className="group inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 text-xs"
                >
                  {s.naziv}
                  {mozeMenjati && (
                    <button
                      onClick={() => obrisi(s.id, s.naziv)}
                      title="Obrisi"
                      className="hidden group-hover:inline-flex w-4 h-4 rounded-full text-red-600 hover:bg-red-100 items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
        {mozeMenjati && (
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
            <Input
              value={noviNaziv}
              onChange={(e) => setNoviNaziv(e.target.value)}
              placeholder={`Nova stavka u "${naslov.toLowerCase()}"`}
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === 'Enter') dodaj();
              }}
            />
            <Button size="sm" onClick={dodaj} disabled={snimanje || noviNaziv.trim().length < 1}>
              {snimanje ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Dodaj
            </Button>
          </div>
        )}
        {stavke.length === 0 && !mozeMenjati && (
          <p className="text-sm text-gray-500 text-center py-2">Lista je prazna.</p>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  ikona: React.ComponentType<{ className?: string }>;
  poruka: string;
}
function EmptyState({ ikona: Icon, poruka }: EmptyStateProps) {
  return (
    <div className="p-8 text-center text-gray-500">
      <Icon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
      <p className="text-sm">{poruka}</p>
    </div>
  );
}

function CenteredLoader() {
  return (
    <div className="p-8 flex items-center justify-center text-gray-500">
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam...
    </div>
  );
}

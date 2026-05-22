import { useEffect, useMemo, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
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
  Folder,
  GraduationCap,
  Layers,
  Loader2,
  Search,
  Target,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type {
  IshodResponse,
  NastavnaJedinicaResponse,
  PredmetResponse,
  TemaResponse,
} from '@/lib/types';

/**
 * Katalog je hijerarhijski: Predmet → Tema → Nastavna jedinica + Ishodi.
 * Sve se kreira automatski kroz godisnji/operativni plan (findOrCreate pattern u backend-u),
 * pa je ova stranica primarno read-only pregled "biblioteke znanja" skole.
 */
export function KatalogPage() {
  const [predmeti, setPredmeti] = useState<PredmetResponse[]>([]);
  const [predmetId, setPredmetId] = useState<string | null>(null);
  const [teme, setTeme] = useState<TemaResponse[]>([]);
  const [temaId, setTemaId] = useState<string | null>(null);
  const [jedinice, setJedinice] = useState<NastavnaJedinicaResponse[]>([]);
  const [ishodi, setIshodi] = useState<IshodResponse[]>([]);

  const [loadingPredmeti, setLoadingPredmeti] = useState(true);
  const [loadingTeme, setLoadingTeme] = useState(false);
  const [loadingJedinice, setLoadingJedinice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pretragaTema, setPretragaTema] = useState('');

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
                      <li key={t.id}>
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
                          {isActive && <ChevronRight className="w-4 h-4 text-blue-600 mt-1.5" />}
                        </button>
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
                        <li key={j.id} className="px-4 py-3 flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center">
                            {j.redniBroj ?? '—'}
                          </span>
                          <span className="text-sm text-gray-900">{j.naziv}</span>
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
                  </header>
                  {ishodi.length === 0 ? (
                    <EmptyState
                      ikona={GraduationCap}
                      poruka="Tema jos nema definisanih ishoda. Ishodi se dodaju pri izradi planova."
                    />
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {ishodi.map((i, idx) => (
                        <li key={i.id} className="px-4 py-3 flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-green-50 text-green-700 text-xs font-semibold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-gray-900 leading-relaxed">{i.opis}</span>
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
    </AppLayout>
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

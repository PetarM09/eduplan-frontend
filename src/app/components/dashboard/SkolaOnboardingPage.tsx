import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { SkolskaGodinaSelect } from '@/app/components/ui/SkolskaGodinaSelect';
import { tekucaSkolskaGodina } from '@/lib/skolskaGodina';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  GraduationCap,
  Layers,
  Loader2,
  School,
  Sparkles,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';

interface TipSkoleResponse {
  id: string;
  kod: string;
  naziv: string;
  ukupnoRazreda: number;
  brojProfila: number;
}

interface ObrazovniProfilResponse {
  id: string;
  tipSkoleId: string;
  tipSkoleNaziv: string;
  ukupnoRazreda: number;
  kod: string;
  naziv: string;
  opis: string | null;
  brojPredmeta: number;
}

interface PredmetUPregledu {
  razred: number;
  naziv: string;
  fondTeorija: number;
  fondVezbe: number;
  fondBlok: number;
  vecPostoji: boolean;
}

interface WizardPregled {
  predmeti: PredmetUPregledu[];
  upozorenja: string[];
}

interface WizardRezultat {
  novihPredmeta: number;
  preskocenihPredmeta: number;
  novihOdeljenja: number;
  preskocenihOdeljenja: number;
  upozorenja: string[];
}

const KORACI = ['Tip skole', 'Profili', 'Razredi i odeljenja', 'Pregled i potvrda'];

export function SkolaOnboardingPage() {
  const navigate = useNavigate();
  const [korak, setKorak] = useState(0);

  const [tipovi, setTipovi] = useState<TipSkoleResponse[]>([]);
  const [profili, setProfili] = useState<ObrazovniProfilResponse[]>([]);
  const [izabraniTipId, setIzabraniTipId] = useState<string | null>(null);
  const [izabraniProfiliIds, setIzabraniProfiliIds] = useState<string[]>([]);
  const [razrediOznake, setRazrediOznake] = useState<Record<number, string>>({});
  const [skolskaGodina, setSkolskaGodina] = useState<string>(tekucaSkolskaGodina());

  const [pregled, setPregled] = useState<WizardPregled | null>(null);
  const [pregledLoading, setPregledLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [rezultat, setRezultat] = useState<WizardRezultat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<TipSkoleResponse[]>('/master/tipovi-skole');
        setTipovi(data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju tipova skole');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!izabraniTipId) {
      setProfili([]);
      return;
    }
    (async () => {
      try {
        const data = await api.get<ObrazovniProfilResponse[]>('/master/profili', {
          params: { tipSkoleId: izabraniTipId },
        });
        setProfili(data);
      } catch (e) {
        alert(e instanceof ApiError ? e.message : 'Greska pri ucitavanju profila');
      }
    })();
  }, [izabraniTipId]);

  const izabraniTip = tipovi.find((t) => t.id === izabraniTipId);
  const ukupnoRazreda = izabraniTip?.ukupnoRazreda ?? 0;

  const sledeci = async () => {
    if (korak === 0 && !izabraniTipId) {
      alert('Izaberi tip skole');
      return;
    }
    if (korak === 1 && izabraniProfiliIds.length === 0) {
      alert('Izaberi bar jedan obrazovni profil');
      return;
    }
    if (korak === 2) {
      const ima = Object.values(razrediOznake).some((v) => v.trim());
      if (!ima) {
        alert('Unesi oznake bar jednog razreda');
        return;
      }
      if (!skolskaGodina) {
        alert('Izaberi skolsku godinu');
        return;
      }
      await ucitajPregled();
    }
    setKorak((k) => k + 1);
  };

  const nazad = () => setKorak((k) => Math.max(0, k - 1));

  const ucitajPregled = async () => {
    if (!izabraniTipId) return;
    setPregledLoading(true);
    try {
      const data = await api.post<WizardPregled>('/skola-onboarding/pregled', {
        tipSkoleId: izabraniTipId,
        obrazovniProfiliIds: izabraniProfiliIds,
      });
      setPregled(data);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri pregledu');
    } finally {
      setPregledLoading(false);
    }
  };

  const pokreniWizard = async () => {
    if (!izabraniTipId) return;
    const razrediPayload = Object.entries(razrediOznake)
      .map(([razredStr, oznakeStr]) => {
        const oznake = oznakeStr
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean);
        return { razred: Number(razredStr), oznake };
      })
      .filter((r) => r.oznake.length > 0);
    if (razrediPayload.length === 0) {
      alert('Unesi bar jedan razred sa oznakama odeljenja');
      return;
    }
    setSubmitLoading(true);
    try {
      const rez = await api.post<WizardRezultat>('/skola-onboarding/pokreni', {
        tipSkoleId: izabraniTipId,
        obrazovniProfiliIds: izabraniProfiliIds,
        razredi: razrediPayload,
        skolskaGodina,
      });
      setRezultat(rez);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri pokretanju wizard-a');
    } finally {
      setSubmitLoading(false);
    }
  };

  const togglePofil = (id: string) => {
    setIzabraniProfiliIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const razrediNiz = useMemo(
    () => Array.from({ length: ukupnoRazreda }, (_, i) => i + 1),
    [ukupnoRazreda]
  );

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="Onboarding wizard" description="Ucitavam katalog..." />
        <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border p-12 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam...
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <PageHeader title="Onboarding wizard" description={error} />
      </AppLayout>
    );
  }

  if (rezultat) {
    return (
      <AppLayout>
        <PageHeader
          title="Onboarding zavrsen"
          description="Predmeti i odeljenja su kreirani u tvojoj skoli."
        />
        <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-emerald-200 p-8 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Skola spremna</h2>
              <p className="text-sm text-muted-foreground">
                Sve sto je sledece je dodavanje nastavnika kroz uvoz XML rasporeda ili pojedinacno.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile label="Novih predmeta" value={rezultat.novihPredmeta} accent="text-emerald-600" />
            <StatTile label="Preskocenih predmeta" value={rezultat.preskocenihPredmeta} accent="text-muted-foreground" />
            <StatTile label="Novih odeljenja" value={rezultat.novihOdeljenja} accent="text-brand-600" />
            <StatTile label="Preskocenih odeljenja" value={rezultat.preskocenihOdeljenja} accent="text-muted-foreground" />
          </div>
          {rezultat.upozorenja.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
                <AlertTriangle className="w-4 h-4" /> Upozorenja
              </div>
              <ul className="text-sm text-amber-800 list-disc pl-5 space-y-1">
                {rezultat.upozorenja.map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button onClick={() => navigate('/predmeti')}>Pogledaj predmete</Button>
            <Button variant="outline" onClick={() => navigate('/odeljenja')}>Pogledaj odeljenja</Button>
            <Button variant="outline" onClick={() => navigate('/admin-dashboard')}>Dashboard</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Onboarding wizard"
        description="Brzi setup skole iz master kataloga — predmeti i odeljenja u nekoliko klikova."
      />

      {/* Step indicator */}
      <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border p-4 flex items-center gap-2 overflow-x-auto">
        {KORACI.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${i === korak ? 'text-brand-600' : i < korak ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                i === korak ? 'bg-brand-100' : i < korak ? 'bg-emerald-100' : 'bg-secondary'
              }`}>
                {i < korak ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="text-sm font-medium whitespace-nowrap">{label}</span>
            </div>
            {i < KORACI.length - 1 && <div className="w-8 h-px bg-secondary" />}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border p-6">
        {korak === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <School className="w-5 h-5 text-brand-500" /> Izaberi tip skole
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tipovi.map((t) => {
                const izabran = izabraniTipId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setIzabraniTipId(t.id)}
                    className={`text-left p-4 rounded-xl border transition-colors ${
                      izabran ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-brand-300 hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap className={`w-5 h-5 ${izabran ? 'text-brand-600' : 'text-muted-foreground'}`} />
                      <span className="font-medium text-foreground">{t.naziv}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.ukupnoRazreda} razreda · {t.brojProfila} dostupnih profila
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {korak === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Layers className="w-5 h-5 text-purple-500" /> Izaberi obrazovne profile
            </div>
            {profili.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nema profila za izabrani tip. Trazi od podrske da se doda profil u master katalog.
              </p>
            ) : (
              <div className="space-y-2">
                {profili.map((p) => {
                  const izabran = izabraniProfiliIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        izabran ? 'border-purple-500 bg-purple-50' : 'border-border hover:border-purple-300 hover:bg-secondary'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={izabran}
                        onChange={() => togglePofil(p.id)}
                        className="mt-1 w-4 h-4 accent-purple-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{p.naziv}</div>
                        <div className="text-xs text-muted-foreground">{p.kod} · {p.brojPredmeta} predmet(a)</div>
                        {p.opis && <div className="text-xs text-muted-foreground mt-1">{p.opis}</div>}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {korak === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Sparkles className="w-5 h-5 text-emerald-500" /> Razredi i odeljenja
            </div>
            <p className="text-sm text-muted-foreground">
              Za svaki razred unesi oznake odeljenja, razdvojene zarezom (npr. <code className="bg-secondary px-1 rounded">A, B, C</code>).
              Razredi koje ostavis prazne se preskacu.
            </p>
            <div className="space-y-3">
              <div>
                <Label>Skolska godina</Label>
                <div className="max-w-xs">
                  <SkolskaGodinaSelect value={skolskaGodina} onChange={setSkolskaGodina} />
                </div>
              </div>
              {razrediNiz.map((razred) => (
                <div key={razred} className="grid grid-cols-[80px_1fr] gap-3 items-center">
                  <Label className="font-medium text-foreground">{razred}. razred</Label>
                  <Input
                    placeholder="A, B, C"
                    value={razrediOznake[razred] ?? ''}
                    onChange={(e) =>
                      setRazrediOznake((prev) => ({ ...prev, [razred]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {korak === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Check className="w-5 h-5 text-emerald-500" /> Pregled
            </div>
            {pregledLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Ucitavam pregled...
              </div>
            ) : pregled ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <SummaryBox label="Izabrano profila" value={izabraniProfiliIds.length} />
                  <SummaryBox label="Unique predmeta" value={pregled.predmeti.length} />
                  <SummaryBox
                    label="Vec u skoli"
                    value={pregled.predmeti.filter((p) => p.vecPostoji).length}
                    accent="text-amber-600"
                  />
                </div>
                {pregled.upozorenja.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1 text-sm text-amber-800">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertTriangle className="w-4 h-4" /> Upozorenja
                    </div>
                    <ul className="list-disc pl-5">
                      {pregled.upozorenja.map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  </div>
                )}
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase">
                      <tr>
                        <th className="text-left px-3 py-2">Razred</th>
                        <th className="text-left px-3 py-2">Predmet</th>
                        <th className="text-left px-3 py-2">Fond (T+V+B)</th>
                        <th className="text-right px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pregled.predmeti.map((p, idx) => (
                        <tr key={idx} className={p.vecPostoji ? 'bg-amber-50/40' : ''}>
                          <td className="px-3 py-2">{p.razred}.</td>
                          <td className="px-3 py-2">{p.naziv}</td>
                          <td className="px-3 py-2 font-mono">
                            {p.fondTeorija}+{p.fondVezbe}+{p.fondBlok}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {p.vecPostoji ? (
                              <span className="text-xs text-amber-700">vec postoji — preskoci</span>
                            ) : (
                              <span className="text-xs text-emerald-700">nov</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  Kliknuti "Pokreni wizard" da se kreiraju predmeti i odeljenja. Postojeci predmeti i
                  odeljenja se preskacu bez prepisivanja.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nema pregleda</p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={nazad} disabled={korak === 0}>
            <ArrowLeft className="w-4 h-4" /> Nazad
          </Button>
          {korak < KORACI.length - 1 ? (
            <Button onClick={sledeci}>
              Sledeci <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={pokreniWizard} disabled={submitLoading || pregledLoading || !pregled}>
              {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Pokreni wizard
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function StatTile({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-border p-3 bg-card">
      <div className={`text-2xl font-bold ${accent ?? 'text-foreground'}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function SummaryBox({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-lg bg-muted border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold ${accent ?? 'text-foreground'}`}>{value}</div>
    </div>
  );
}

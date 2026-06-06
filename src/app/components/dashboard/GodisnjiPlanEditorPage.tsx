import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { SkolskaGodinaSelect } from '@/app/components/ui/SkolskaGodinaSelect';
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  School,
  Trash2,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import {
  MESECI_KEYS,
  type GodisnjiPlanResponse,
  type GodisnjiPlanTemaRequest,
  type KreirajGodisnjiPlanRequest,
  type OdeljenjeResponse,
  type PredmetResponse,
} from '@/lib/types';

interface StavkaTemeFormData {
  redniBroj: number;
  nazivTeme: string;
  casObrada: number;
  casUtvrd: number;
  casOstalo: number;
  meseci: Set<string>;
  noviIshodi: string; // textarea, line-by-line
}

const PRAZNA_STAVKA = (redniBroj: number): StavkaTemeFormData => ({
  redniBroj,
  nazivTeme: '',
  casObrada: 0,
  casUtvrd: 0,
  casOstalo: 0,
  meseci: new Set<string>(),
  noviIshodi: '',
});

function tekucaGodina(): string {
  const sada = new Date();
  const g = sada.getMonth() >= 8 ? sada.getFullYear() : sada.getFullYear() - 1;
  return `${g}/${g + 1}`;
}

export function GodisnjiPlanEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const editMode = !!id;

  const [predmeti, setPredmeti] = useState<PredmetResponse[]>([]);
  const [odeljenja, setOdeljenja] = useState<OdeljenjeResponse[]>([]);
  const [bootstrap, setBootstrap] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Forma
  const [predmetId, setPredmetId] = useState('');
  const [skolskaGodina, setSkolskaGodina] = useState(tekucaGodina());
  const [razred, setRazred] = useState<number | ''>('');
  const [izabranaOdeljenja, setIzabranaOdeljenja] = useState<Set<string>>(new Set());
  const [ciljevi, setCiljevi] = useState('');
  const [udzbenik, setUdzbenik] = useState('');
  const [autori, setAutori] = useState('');
  const [literatura, setLiteratura] = useState('');
  const [godisnjiFond, setGodisnjiFond] = useState<number | ''>('');
  const [nedeljniFond, setNedeljniFond] = useState<number | ''>('');
  const [dopunski, setDopunski] = useState('');
  const [dodatni, setDodatni] = useState('');
  const [napomene, setNapomene] = useState('');
  const [stavke, setStavke] = useState<StavkaTemeFormData[]>([PRAZNA_STAVKA(1)]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const ucitajBootstrap = async () => {
      setBootstrap(true);
      try {
        const [p, o] = await Promise.all([
          api.get<PredmetResponse[]>('/predmeti'),
          api.get<OdeljenjeResponse[]>('/odeljenja'),
        ]);
        setPredmeti(p);
        setOdeljenja(o.filter((x) => x.aktivan));
        if (id) {
          const plan = await api.get<GodisnjiPlanResponse>(`/planovi/godisnji/${id}`);
          ucitajPlanUFormu(plan);
        }
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju');
      } finally {
        setBootstrap(false);
      }
    };
    ucitajBootstrap();
  }, [id]);

  const ucitajPlanUFormu = (p: GodisnjiPlanResponse) => {
    setPredmetId(p.predmetId);
    setSkolskaGodina(p.skolskaGodina);
    setRazred(p.razred ?? '');
    setIzabranaOdeljenja(new Set(p.odeljenjaIds ?? []));
    setCiljevi(p.ciljeviZadaci ?? '');
    setUdzbenik(p.udzebenik ?? '');
    setAutori(p.autori ?? '');
    setLiteratura(p.literatura ?? '');
    setGodisnjiFond(p.godisnjiFond ?? '');
    setNedeljniFond(p.nedeljniFond ?? '');
    setDopunski(p.dopunskiRad ?? '');
    setDodatni(p.dodatniRad ?? '');
    setNapomene(p.napomene ?? '');
    if (p.teme && p.teme.length > 0) {
      setStavke(
        p.teme.map((t) => ({
          redniBroj: t.redniBroj,
          nazivTeme: t.nazivTeme,
          casObrada: t.casObrada,
          casUtvrd: t.casUtvrd,
          casOstalo: t.casOstalo,
          meseci: new Set(Object.entries(t.meseci ?? {}).filter(([, v]) => v).map(([k]) => k)),
          noviIshodi: '',
        }))
      );
    }
  };

  const dodajStavku = () =>
    setStavke((prev) => [...prev, PRAZNA_STAVKA(prev.length + 1)]);

  const obrisiStavku = (idx: number) =>
    setStavke((prev) => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, redniBroj: i + 1 })));

  const azurirajStavku = (idx: number, izmena: Partial<StavkaTemeFormData>) =>
    setStavke((prev) => prev.map((s, i) => (i === idx ? { ...s, ...izmena } : s)));

  const toggleMesec = (idx: number, mesec: string) =>
    setStavke((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        const next = new Set(s.meseci);
        if (next.has(mesec)) next.delete(mesec);
        else next.add(mesec);
        return { ...s, meseci: next };
      })
    );

  const toggleOdeljenje = (id: string) =>
    setIzabranaOdeljenja((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const ukupnoCasovaStavke = (s: StavkaTemeFormData) =>
    Number(s.casObrada || 0) + Number(s.casUtvrd || 0) + Number(s.casOstalo || 0);

  const sacuvaj = async () => {
    setSaveError(null);
    if (!predmetId) {
      setSaveError('Predmet je obavezan');
      return;
    }
    if (!skolskaGodina.match(/^\d{4}\/\d{4}$/)) {
      setSaveError('Skolska godina mora biti u formatu 2024/2025');
      return;
    }
    if (stavke.length === 0) {
      setSaveError('Plan mora imati bar jednu temu');
      return;
    }
    for (let i = 0; i < stavke.length; i++) {
      if (!stavke[i].nazivTeme.trim()) {
        setSaveError(`Stavka ${i + 1}: naziv teme je obavezan`);
        return;
      }
    }

    const payload: KreirajGodisnjiPlanRequest = {
      predmetId,
      skolskaGodina,
      razred: typeof razred === 'number' ? razred : null,
      odeljenjaIds: Array.from(izabranaOdeljenja),
      ciljeviZadaci: ciljevi || null,
      udzebenik: udzbenik || null,
      autori: autori || null,
      literatura: literatura || null,
      godisnjiFond: typeof godisnjiFond === 'number' ? godisnjiFond : null,
      nedeljniFond: typeof nedeljniFond === 'number' ? nedeljniFond : null,
      dopunskiRad: dopunski || null,
      dodatniRad: dodatni || null,
      napomene: napomene || null,
      teme: stavke.map<GodisnjiPlanTemaRequest>((s) => ({
        nazivTeme: s.nazivTeme.trim(),
        redniBroj: s.redniBroj,
        casObrada: s.casObrada,
        casUtvrd: s.casUtvrd,
        casOstalo: s.casOstalo,
        ukupnoCasova: ukupnoCasovaStavke(s),
        meseci: Array.from(s.meseci),
        noviIshodi: s.noviIshodi
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean),
      })),
    };

    setSaving(true);
    try {
      const sacuvan = await api.post<GodisnjiPlanResponse>('/planovi/godisnji', payload);
      navigate(`/planovi/godisnji`, { replace: true });
      alert(
        `Plan sacuvan (status: ${sacuvan.status}). Word i PDF se generisu u pozadini i bice dostupni kroz par sekundi na listi planova.`
      );
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : 'Greska pri cuvanju plana');
    } finally {
      setSaving(false);
    }
  };

  const predmetiZaRazred = useMemo(() => {
    if (typeof razred !== 'number') return predmeti;
    return predmeti.filter((p) => !p.razred || p.razred === razred);
  }, [predmeti, razred]);

  if (bootstrap) {
    return (
      <AppLayout>
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={editMode ? 'Izmena godisnjeg plana' : 'Novi godisnji plan'}
        description="Plan se idempotentno cuva po (predmet, godina, nastavnik). Word i PDF se generisu asinhrono."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/planovi/godisnji')}>
              <ArrowLeft className="w-4 h-4" /> Nazad
            </Button>
            <Button onClick={sacuvaj} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sacuvaj
            </Button>
          </div>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Osnovni podaci */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Osnovni podaci</h2>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="predmet">Predmet</Label>
            <Select value={predmetId} onValueChange={setPredmetId}>
              <SelectTrigger id="predmet"><SelectValue placeholder="Izaberi predmet" /></SelectTrigger>
              <SelectContent>
                {predmetiZaRazred.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.naziv}
                    {p.razred ? ` — ${p.razred}. razred` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="razred">Razred</Label>
            <Select value={String(razred)} onValueChange={(v) => setRazred(v ? Number(v) : '')}>
              <SelectTrigger id="razred"><SelectValue placeholder="Izaberi razred" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1. razred</SelectItem>
                <SelectItem value="2">2. razred</SelectItem>
                <SelectItem value="3">3. razred</SelectItem>
                <SelectItem value="4">4. razred</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="godina">Skolska godina</Label>
            <SkolskaGodinaSelect id="godina" value={skolskaGodina} onChange={setSkolskaGodina} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Odeljenja u kojima se realizuje plan</Label>
          {odeljenja.length === 0 ? (
            <p className="text-sm text-gray-500">Nema odeljenja — prvo ih kreiraj u sekciji "Odeljenja".</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {odeljenja.map((o) => {
                const checked = izabranaOdeljenja.has(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => toggleOdeljenje(o.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium border transition-colors ${
                      checked
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <School className="w-3.5 h-3.5" />
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ciljevi">Ciljevi i zadaci predmeta</Label>
          <Textarea id="ciljevi" rows={3} value={ciljevi} onChange={(e) => setCiljevi(e.target.value)} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="udz">Udzbenik</Label>
            <Input id="udz" value={udzbenik} onChange={(e) => setUdzbenik(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aut">Autori</Label>
            <Input id="aut" value={autori} onChange={(e) => setAutori(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lit">Literatura za realizaciju programa</Label>
          <Textarea id="lit" rows={2} value={literatura} onChange={(e) => setLiteratura(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="gfond">Godisnji fond</Label>
            <Input id="gfond" type="number" value={godisnjiFond} onChange={(e) => setGodisnjiFond(e.target.value ? Number(e.target.value) : '')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nfond">Nedeljni fond</Label>
            <Input id="nfond" type="number" value={nedeljniFond} onChange={(e) => setNedeljniFond(e.target.value ? Number(e.target.value) : '')} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="dop">Dopunski rad</Label>
            <Textarea id="dop" rows={2} value={dopunski} onChange={(e) => setDopunski(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dod">Dodatni rad</Label>
            <Textarea id="dod" rows={2} value={dodatni} onChange={(e) => setDodatni(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nap">Napomene</Label>
          <Textarea id="nap" rows={2} value={napomene} onChange={(e) => setNapomene(e.target.value)} />
        </div>
      </section>

      {/* Tabela tema */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Teme</h2>
          <Button size="sm" variant="outline" onClick={dodajStavku}>
            <Plus className="w-4 h-4" /> Dodaj temu
          </Button>
        </div>

        <div className="space-y-4">
          {stavke.map((s, idx) => (
            <article key={idx} className="border border-gray-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">
                  {s.redniBroj}
                </span>
                <Input
                  placeholder="Naziv teme"
                  value={s.nazivTeme}
                  onChange={(e) => azurirajStavku(idx, { nazivTeme: e.target.value })}
                  className="flex-1"
                />
                <Button size="sm" variant="ghost" onClick={() => obrisiStavku(idx)} title="Ukloni temu">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Obrada</Label>
                  <Input type="number" min={0} value={s.casObrada} onChange={(e) => azurirajStavku(idx, { casObrada: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Utvrdjivanje</Label>
                  <Input type="number" min={0} value={s.casUtvrd} onChange={(e) => azurirajStavku(idx, { casUtvrd: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Ostalo</Label>
                  <Input type="number" min={0} value={s.casOstalo} onChange={(e) => azurirajStavku(idx, { casOstalo: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Ukupno</Label>
                  <div className="h-10 px-3 flex items-center bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium">
                    {ukupnoCasovaStavke(s)}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Meseci u kojima se predaje</Label>
                <div className="flex flex-wrap gap-1.5">
                  {MESECI_KEYS.map((m) => {
                    const checked = s.meseci.has(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMesec(idx, m)}
                        className={`min-w-10 px-2 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          checked
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`ishodi-${idx}`} className="text-xs text-gray-500">
                  Ishodi (jedan po redu — bice automatski upisani u katalog teme)
                </Label>
                <Textarea
                  id={`ishodi-${idx}`}
                  rows={3}
                  value={s.noviIshodi}
                  onChange={(e) => azurirajStavku(idx, { noviIshodi: e.target.value })}
                  placeholder="Ucenik ce razumeti...&#10;Ucenik ce moci da..."
                />
              </div>
            </article>
          ))}
        </div>

        {stavke.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">Klikni "Dodaj temu" za prvi unos.</p>
        )}
      </section>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" /> {saveError}
        </div>
      )}

      <div className="flex justify-end gap-2 pb-4">
        <Button variant="outline" onClick={() => navigate('/planovi/godisnji')}>
          Odustani
        </Button>
        <Button onClick={sacuvaj} disabled={saving} size="lg">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Sacuvaj plan
        </Button>
      </div>
    </AppLayout>
  );
}

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
import { AlertCircle, ArrowLeft, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type {
  KreirajOperativniPlanRequest,
  MedjupredmetnoRequest,
  OdeljenjeResponse,
  OpStavkaRequest,
  OperativniPlanResponse,
  PadajuciMeniResponse,
  PredmetResponse,
} from '@/lib/types';

interface StavkaFormData {
  redniBrojCasa: number;
  nazivTeme: string;
  nazivJedinice: string;
  tipCasaId: string;
  metodaRadaId: string;
  noviIshodi: string; // textarea
  medjupredmetno: Array<{ predmetId: string; opis: string }>;
  evaluacija: string;
}

const PRAZNA_STAVKA = (rb: number): StavkaFormData => ({
  redniBrojCasa: rb,
  nazivTeme: '',
  nazivJedinice: '',
  tipCasaId: '',
  metodaRadaId: '',
  noviIshodi: '',
  medjupredmetno: [],
  evaluacija: '',
});

function tekucaGodina(): string {
  const sada = new Date();
  const g = sada.getMonth() >= 8 ? sada.getFullYear() : sada.getFullYear() - 1;
  return `${g}/${g + 1}`;
}

const MESEC_LABEL = [
  '', 'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
];

export function OperativniPlanEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const editMode = !!id;

  const [predmeti, setPredmeti] = useState<PredmetResponse[]>([]);
  const [odeljenja, setOdeljenja] = useState<OdeljenjeResponse[]>([]);
  const [tipoviCasa, setTipoviCasa] = useState<PadajuciMeniResponse[]>([]);
  const [metodeRada, setMetodeRada] = useState<PadajuciMeniResponse[]>([]);
  const [bootstrap, setBootstrap] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Forma
  const [predmetId, setPredmetId] = useState('');
  const [odeljenjeId, setOdeljenjeId] = useState('');
  const [mesec, setMesec] = useState<number>(new Date().getMonth() + 1);
  const [skolskaGodina, setSkolskaGodina] = useState(tekucaGodina());
  const [nedeljniFond, setNedeljniFond] = useState<number | ''>('');
  const [samoprocena, setSamoprocena] = useState('');
  const [napomene, setNapomene] = useState('');
  const [stavke, setStavke] = useState<StavkaFormData[]>([PRAZNA_STAVKA(1)]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setBootstrap(true);
      try {
        const [p, o, tc, mr] = await Promise.all([
          api.get<PredmetResponse[]>('/predmeti'),
          api.get<OdeljenjeResponse[]>('/odeljenja'),
          api.get<PadajuciMeniResponse[]>('/katalog/tipovi-casa'),
          api.get<PadajuciMeniResponse[]>('/katalog/metode-rada'),
        ]);
        setPredmeti(p);
        setOdeljenja(o.filter((x) => x.aktivan));
        setTipoviCasa(tc);
        setMetodeRada(mr);
        if (id) {
          const plan = await api.get<OperativniPlanResponse>(`/planovi/operativni/${id}`);
          ucitajPlanUFormu(plan);
        }
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju');
      } finally {
        setBootstrap(false);
      }
    })();
  }, [id]);

  const ucitajPlanUFormu = (p: OperativniPlanResponse) => {
    setPredmetId(p.predmetId);
    setOdeljenjeId(p.odeljenjeId);
    setMesec(p.mesec);
    setSkolskaGodina(p.skolskaGodina);
    setNedeljniFond(p.nedeljniFond ?? '');
    setSamoprocena(p.samoprocenaIshoda ?? '');
    setNapomene(p.napomene ?? '');
    if (p.stavke && p.stavke.length > 0) {
      setStavke(
        p.stavke.map((s) => ({
          redniBrojCasa: s.redniBrojCasa,
          nazivTeme: s.nazivTeme ?? '',
          nazivJedinice: s.nazivJedinice ?? '',
          tipCasaId: s.tipCasaId ?? '',
          metodaRadaId: s.metodaRadaId ?? '',
          noviIshodi: (s.ishodi ?? []).map((i) => i.opis).join('\n'),
          medjupredmetno: (s.medjupredmetno ?? []).map((m) => ({
            predmetId: m.predmetId,
            opis: m.opisKompetencije,
          })),
          evaluacija: s.evaluacija ?? '',
        }))
      );
    }
  };

  const dodajStavku = () =>
    setStavke((prev) => [...prev, PRAZNA_STAVKA(prev.length + 1)]);

  const obrisiStavku = (idx: number) =>
    setStavke((prev) =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, redniBrojCasa: i + 1 }))
    );

  const azurirajStavku = (idx: number, izmena: Partial<StavkaFormData>) =>
    setStavke((prev) => prev.map((s, i) => (i === idx ? { ...s, ...izmena } : s)));

  const dodajMedjupredmetno = (idx: number) =>
    azurirajStavku(idx, {
      medjupredmetno: [...stavke[idx].medjupredmetno, { predmetId: '', opis: '' }],
    });

  const obrisiMedjupredmetno = (idx: number, mpIdx: number) =>
    azurirajStavku(idx, {
      medjupredmetno: stavke[idx].medjupredmetno.filter((_, i) => i !== mpIdx),
    });

  const sacuvaj = async () => {
    setSaveError(null);
    if (!predmetId || !odeljenjeId) {
      setSaveError('Predmet i odeljenje su obavezni');
      return;
    }
    if (!skolskaGodina.match(/^\d{4}\/\d{4}$/)) {
      setSaveError('Skolska godina mora biti u formatu 2024/2025');
      return;
    }
    for (let i = 0; i < stavke.length; i++) {
      const s = stavke[i];
      if (!s.nazivTeme.trim()) {
        setSaveError(`Stavka ${i + 1}: tema je obavezna`);
        return;
      }
      if (!s.tipCasaId) {
        setSaveError(`Stavka ${i + 1}: tip casa je obavezan`);
        return;
      }
    }

    const payload: KreirajOperativniPlanRequest = {
      predmetId,
      odeljenjeId,
      mesec,
      skolskaGodina,
      nedeljniFond: typeof nedeljniFond === 'number' ? nedeljniFond : null,
      samoprocenaIshoda: samoprocena || null,
      napomene: napomene || null,
      stavke: stavke.map<OpStavkaRequest>((s) => ({
        redniBrojCasa: s.redniBrojCasa,
        nazivTeme: s.nazivTeme.trim(),
        nazivJedinice: s.nazivJedinice.trim() || null,
        tipCasaId: s.tipCasaId,
        metodaRadaId: s.metodaRadaId || null,
        noviIshodi: s.noviIshodi.split('\n').map((x) => x.trim()).filter(Boolean),
        medjupredmetno: s.medjupredmetno
          .filter((m) => m.predmetId && m.opis.trim())
          .map<MedjupredmetnoRequest>((m) => ({
            predmetId: m.predmetId,
            opisKompetencije: m.opis.trim(),
          })),
        evaluacija: s.evaluacija || null,
      })),
    };

    setSaving(true);
    try {
      const sacuvan = await api.post<OperativniPlanResponse>('/planovi/operativni', payload);
      navigate('/planovi/operativni', { replace: true });
      alert(
        `Plan sacuvan (status: ${sacuvan.status}). Word i PDF se generisu u pozadini.`
      );
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : 'Greska pri cuvanju plana');
    } finally {
      setSaving(false);
    }
  };

  const drugiPredmeti = useMemo(
    () => predmeti.filter((p) => p.id !== predmetId),
    [predmeti, predmetId]
  );

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
        title={editMode ? 'Izmena operativnog plana' : 'Novi operativni plan'}
        description="Mesecni plan po predmetu i odeljenju. Idempotentno cuvanje po (predmet, odeljenje, mesec, godina)."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/planovi/operativni')}>
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
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Osnovni podaci</h2>
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="predmet">Predmet</Label>
            <Select value={predmetId} onValueChange={setPredmetId}>
              <SelectTrigger id="predmet"><SelectValue placeholder="Izaberi predmet" /></SelectTrigger>
              <SelectContent>
                {predmeti.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.naziv}
                    {p.razred ? ` — ${p.razred}.` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="odeljenje">Odeljenje</Label>
            <Select value={odeljenjeId} onValueChange={setOdeljenjeId}>
              <SelectTrigger id="odeljenje"><SelectValue placeholder="Izaberi odeljenje" /></SelectTrigger>
              <SelectContent>
                {odeljenja.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label} ({o.skolskaGodina})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mesec">Mesec</Label>
            <Select value={String(mesec)} onValueChange={(v) => setMesec(Number(v))}>
              <SelectTrigger id="mesec"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MESEC_LABEL.slice(1).map((m, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="godina">Skolska godina</Label>
            <SkolskaGodinaSelect id="godina" value={skolskaGodina} onChange={setSkolskaGodina} />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nfond">Nedeljni fond casova</Label>
            <Input
              id="nfond"
              type="number"
              min={1}
              max={20}
              value={nedeljniFond}
              onChange={(e) => setNedeljniFond(e.target.value ? Number(e.target.value) : '')}
            />
          </div>
        </div>
      </section>

      {/* Stavke (casovi) */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Casovi u mesecu</h2>
          <Button size="sm" variant="outline" onClick={dodajStavku}>
            <Plus className="w-4 h-4" /> Dodaj cas
          </Button>
        </div>

        <div className="space-y-4">
          {stavke.map((s, idx) => (
            <article key={idx} className="border border-gray-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-purple-100 text-purple-700 text-sm font-bold flex items-center justify-center">
                  {s.redniBrojCasa}.
                </span>
                <span className="text-sm font-medium text-gray-900">Cas #{s.redniBrojCasa}</span>
                <Button size="sm" variant="ghost" onClick={() => obrisiStavku(idx)} className="ml-auto">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Tema</Label>
                  <Input
                    placeholder="npr. Uvod u racunarske mreze"
                    value={s.nazivTeme}
                    onChange={(e) => azurirajStavku(idx, { nazivTeme: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Nastavna jedinica</Label>
                  <Input
                    placeholder="npr. Sta je mreza"
                    value={s.nazivJedinice}
                    onChange={(e) => azurirajStavku(idx, { nazivJedinice: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Tip casa</Label>
                  <Select value={s.tipCasaId} onValueChange={(v) => azurirajStavku(idx, { tipCasaId: v })}>
                    <SelectTrigger><SelectValue placeholder="Izaberi tip" /></SelectTrigger>
                    <SelectContent>
                      {tipoviCasa.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.naziv}
                          {t.sistemski ? '' : ' (skolski)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Metoda rada</Label>
                  <Select value={s.metodaRadaId} onValueChange={(v) => azurirajStavku(idx, { metodaRadaId: v })}>
                    <SelectTrigger><SelectValue placeholder="Izaberi metodu" /></SelectTrigger>
                    <SelectContent>
                      {metodeRada.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.naziv}
                          {m.sistemski ? '' : ' (skolska)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Ishodi (jedan po redu — auto-save u katalog)</Label>
                <Textarea
                  rows={2}
                  value={s.noviIshodi}
                  onChange={(e) => azurirajStavku(idx, { noviIshodi: e.target.value })}
                  placeholder="Ucenik razume...&#10;Ucenik nabraja..."
                />
              </div>

              {/* Medjupredmetno */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-500">Medjupredmetno povezivanje</Label>
                  <Button size="sm" variant="ghost" onClick={() => dodajMedjupredmetno(idx)}>
                    <Plus className="w-3.5 h-3.5" /> Predmet
                  </Button>
                </div>
                {s.medjupredmetno.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nema povezivanja sa drugim predmetima.</p>
                ) : (
                  <div className="space-y-2">
                    {s.medjupredmetno.map((m, mi) => (
                      <div key={mi} className="flex gap-2 items-start">
                        <Select
                          value={m.predmetId}
                          onValueChange={(v) => {
                            const sviNovi = [...s.medjupredmetno];
                            sviNovi[mi] = { ...sviNovi[mi], predmetId: v };
                            azurirajStavku(idx, { medjupredmetno: sviNovi });
                          }}
                        >
                          <SelectTrigger className="w-44"><SelectValue placeholder="Predmet" /></SelectTrigger>
                          <SelectContent>
                            {drugiPredmeti.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.naziv}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Opis kompetencije"
                          value={m.opis}
                          onChange={(e) => {
                            const sviNovi = [...s.medjupredmetno];
                            sviNovi[mi] = { ...sviNovi[mi], opis: e.target.value };
                            azurirajStavku(idx, { medjupredmetno: sviNovi });
                          }}
                          className="flex-1"
                        />
                        <Button size="sm" variant="ghost" onClick={() => obrisiMedjupredmetno(idx, mi)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Evaluacija</Label>
                <Input
                  placeholder="npr. Usmena provera znanja"
                  value={s.evaluacija}
                  onChange={(e) => azurirajStavku(idx, { evaluacija: e.target.value })}
                />
              </div>
            </article>
          ))}
        </div>

        {stavke.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">Klikni "Dodaj cas" za prvi unos.</p>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Samoprocena nastavnika</h2>
        <Textarea
          rows={3}
          value={samoprocena}
          onChange={(e) => setSamoprocena(e.target.value)}
          placeholder="Kako su ucenici ostvarili ishode u ovom mesecu..."
        />
        <h3 className="font-medium text-gray-900 text-sm">Napomene</h3>
        <Textarea rows={2} value={napomene} onChange={(e) => setNapomene(e.target.value)} />
      </section>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" /> {saveError}
        </div>
      )}

      <div className="flex justify-end gap-2 pb-4">
        <Button variant="outline" onClick={() => navigate('/planovi/operativni')}>
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

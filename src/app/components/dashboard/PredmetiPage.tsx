import { useEffect, useMemo, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Loader2,
  Plus,
  School,
  Search,
  ShieldOff,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type {
  KreirajPredmetRequest,
  OdeljenjeResponse,
  PredmetResponse,
} from '@/lib/types';

const PRAZNA_FORMA: KreirajPredmetRequest = {
  naziv: '',
  razred: null,
  fondCasova: null,
};

export function PredmetiPage() {
  const [predmeti, setPredmeti] = useState<PredmetResponse[]>([]);
  const [odeljenja, setOdeljenja] = useState<OdeljenjeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pretraga, setPretraga] = useState('');
  const [filterRazred, setFilterRazred] = useState<'sve' | '1' | '2' | '3' | '4'>('sve');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [forma, setForma] = useState<KreirajPredmetRequest>(PRAZNA_FORMA);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dijalog za dodelu odeljenja konkretnom predmetu
  const [dodelaPredmet, setDodelaPredmet] = useState<PredmetResponse | null>(null);
  const [dodelaIzbor, setDodelaIzbor] = useState<Set<string>>(new Set());

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, o] = await Promise.all([
        api.get<PredmetResponse[]>('/predmeti/svi'),
        api.get<OdeljenjeResponse[]>('/odeljenja'),
      ]);
      setPredmeti(p);
      setOdeljenja(o);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ucitaj();
  }, []);

  const filtrirani = useMemo(() => {
    const q = pretraga.trim().toLowerCase();
    return predmeti.filter((p) => {
      if (q && !p.naziv.toLowerCase().includes(q)) return false;
      if (filterRazred !== 'sve' && String(p.razred) !== filterRazred) return false;
      return true;
    });
  }, [predmeti, pretraga, filterRazred]);

  const handleDodaj = async () => {
    setFormError(null);
    if (!forma.naziv.trim()) {
      setFormError('Naziv predmeta je obavezan');
      return;
    }
    setSubmitting(true);
    try {
      const novi = await api.post<PredmetResponse>('/predmeti', forma);
      setPredmeti((prev) => [...prev, novi]);
      setForma(PRAZNA_FORMA);
      setDialogOpen(false);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Greska pri kreiranju predmeta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeaktiviraj = async (p: PredmetResponse) => {
    if (!confirm(`Deaktivirati predmet "${p.naziv}"?`)) return;
    try {
      await api.delete(`/predmeti/${p.id}`);
      setPredmeti((prev) => prev.map((x) => (x.id === p.id ? { ...x, aktivan: false } : x)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri deaktivaciji');
    }
  };

  const otvoriDodelu = (p: PredmetResponse) => {
    setDodelaPredmet(p);
    setDodelaIzbor(new Set(p.odeljenja.map((o) => o.id)));
  };

  const sacuvajDodelu = async () => {
    if (!dodelaPredmet) return;
    try {
      const azurirano = await api.put<PredmetResponse>(
        `/predmeti/${dodelaPredmet.id}/odeljenja`,
        { odeljenjaIds: Array.from(dodelaIzbor) }
      );
      setPredmeti((prev) => prev.map((x) => (x.id === azurirano.id ? azurirano : x)));
      setDodelaPredmet(null);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri dodeli odeljenja');
    }
  };

  const toggleOdeljenje = (id: string) => {
    setDodelaIzbor((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Predmeti"
        description="Registar predmeta skole i dodeljenih odeljenja"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-4 h-4" /> Dodaj predmet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novi predmet</DialogTitle>
                <DialogDescription>
                  Posle kreiranja, dodeli odeljenja u kojima se predmet realizuje preko "Dodeli odeljenja".
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="naziv">Naziv</Label>
                  <Input
                    id="naziv"
                    value={forma.naziv}
                    onChange={(e) => setForma({ ...forma, naziv: e.target.value })}
                    placeholder="npr. Racunarske mreze"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="razred">Razred</Label>
                    <Select
                      value={forma.razred ? String(forma.razred) : ''}
                      onValueChange={(v) => setForma({ ...forma, razred: Number(v) })}
                    >
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
                    <Label htmlFor="fond">Nedeljni fond casova</Label>
                    <Input
                      id="fond"
                      type="number"
                      min={1}
                      max={20}
                      value={forma.fondCasova ?? ''}
                      onChange={(e) =>
                        setForma({ ...forma, fondCasova: e.target.value ? Number(e.target.value) : null })
                      }
                    />
                  </div>
                </div>
              </div>
              {formError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4" /> {formError}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                  Odustani
                </Button>
                <Button onClick={handleDodaj} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kreiraj'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filteri */}
      <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pretrazi po nazivu predmeta"
            value={pretraga}
            onChange={(e) => setPretraga(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRazred} onValueChange={(v) => setFilterRazred(v as typeof filterRazred)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sve">Svi razredi</SelectItem>
            <SelectItem value="1">1. razred</SelectItem>
            <SelectItem value="2">2. razred</SelectItem>
            <SelectItem value="3">3. razred</SelectItem>
            <SelectItem value="4">4. razred</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {loading ? (
        <CenteredLoader />
      ) : error ? (
        <ErrorRow message={error} onRetry={ucitaj} />
      ) : filtrirani.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border p-12 text-center text-muted-foreground">
          Nema predmeta. Klikni "Dodaj predmet" da napravis prvi.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrirani.map((p) => (
            <article
              key={p.id}
              className={`bg-card rounded-2xl shadow-xl shadow-gray-200/50 border p-5 transition-shadow hover:shadow-md ${
                p.aktivan ? 'border-border' : 'border-border opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                {!p.aktivan && (
                  <span className="text-xs font-medium rounded-full bg-secondary text-muted-foreground px-2 py-0.5">
                    Deaktiviran
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-1">{p.naziv}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {p.razred ? `${p.razred}. razred` : 'Razred nije zadat'}
                {p.fondCasova ? ` • ${p.fondCasova} casa nedeljno` : ''}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4 min-h-7">
                {p.odeljenja.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">Nema dodeljenih odeljenja</span>
                ) : (
                  p.odeljenja.map((o) => (
                    <span
                      key={o.id}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-0.5"
                    >
                      <School className="w-3 h-3" /> {o.label}
                    </span>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => otvoriDodelu(p)} className="flex-1">
                  Dodeli odeljenja
                </Button>
                {p.aktivan && (
                  <Button size="sm" variant="ghost" onClick={() => handleDeaktiviraj(p)} title="Deaktiviraj">
                    <ShieldOff className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Dijalog za dodelu odeljenja */}
      <Dialog open={!!dodelaPredmet} onOpenChange={(o) => !o && setDodelaPredmet(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodeli odeljenja: {dodelaPredmet?.naziv}</DialogTitle>
            <DialogDescription>
              Odaberi sva odeljenja u kojima se predmet realizuje.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-1 -mx-2 px-2">
            {odeljenja.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Nema odeljenja u skoli. Prvo kreiraj odeljenja u sekciji "Odeljenja".
              </p>
            ) : (
              odeljenja.map((o) => {
                const checked = dodelaIzbor.has(o.id);
                return (
                  <label
                    key={o.id}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer ${
                      checked ? 'bg-brand-50' : 'hover:bg-secondary'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOdeljenje(o.id)}
                      className="w-4 h-4 rounded border-input text-brand-600 focus:ring-brand-600/40"
                    />
                    <span className="font-medium text-foreground">{o.label}</span>
                    {o.staresinaIme && (
                      <span className="text-xs text-muted-foreground ml-auto">staresina: {o.staresinaIme}</span>
                    )}
                  </label>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDodelaPredmet(null)}>Odustani</Button>
            <Button onClick={sacuvajDodelu}>Sacuvaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function CenteredLoader() {
  return (
    <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border p-12 flex items-center justify-center text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam...
    </div>
  );
}

function ErrorRow({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-2 text-red-700">
      <AlertCircle className="w-5 h-5" />
      <span>{message}</span>
      <Button size="sm" variant="outline" onClick={onRetry} className="ml-auto">
        Pokusaj ponovo
      </Button>
    </div>
  );
}

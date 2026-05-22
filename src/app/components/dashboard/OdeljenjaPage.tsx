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
  Loader2,
  Plus,
  School,
  Search,
  ShieldOff,
  UserCog,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type {
  KorisnikResponse,
  KreirajOdeljenjeRequest,
  OdeljenjeResponse,
} from '@/lib/types';

const PRAZNA_FORMA: KreirajOdeljenjeRequest = {
  razred: 1,
  oznaka: '',
  skolskaGodina: trenutnaSkolskaGodina(),
  staresinaId: null,
};

function trenutnaSkolskaGodina(): string {
  // Pre septembra → tekuca/iduca; od septembra → tekuca/iduca-2
  const sada = new Date();
  const godina = sada.getMonth() >= 8 ? sada.getFullYear() : sada.getFullYear() - 1;
  return `${godina}/${godina + 1}`;
}

export function OdeljenjaPage() {
  const [odeljenja, setOdeljenja] = useState<OdeljenjeResponse[]>([]);
  const [nastavnici, setNastavnici] = useState<KorisnikResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pretraga, setPretraga] = useState('');
  const [filterRazred, setFilterRazred] = useState<'sve' | '1' | '2' | '3' | '4'>('sve');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [forma, setForma] = useState<KreirajOdeljenjeRequest>(PRAZNA_FORMA);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Inline edit staresine
  const [edit, setEdit] = useState<{ odeljenje: OdeljenjeResponse; staresinaId: string } | null>(null);

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const [o, n] = await Promise.all([
        api.get<OdeljenjeResponse[]>('/odeljenja'),
        api.get<KorisnikResponse[]>('/korisnici/po-ulozi/NASTAVNIK'),
      ]);
      setOdeljenja(o);
      setNastavnici(n);
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
    return odeljenja.filter((o) => {
      if (q && !o.label.toLowerCase().includes(q) && !(o.staresinaIme ?? '').toLowerCase().includes(q)) {
        return false;
      }
      if (filterRazred !== 'sve' && String(o.razred) !== filterRazred) return false;
      return true;
    });
  }, [odeljenja, pretraga, filterRazred]);

  const handleDodaj = async () => {
    setFormError(null);
    if (!forma.oznaka.trim()) {
      setFormError('Oznaka odeljenja je obavezna');
      return;
    }
    setSubmitting(true);
    try {
      const novi = await api.post<OdeljenjeResponse>('/odeljenja', {
        ...forma,
        staresinaId: forma.staresinaId || null,
      });
      setOdeljenja((prev) => [...prev, novi]);
      setForma(PRAZNA_FORMA);
      setDialogOpen(false);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Greska pri kreiranju odeljenja');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeaktiviraj = async (o: OdeljenjeResponse) => {
    if (!confirm(`Deaktivirati odeljenje "${o.label}"?`)) return;
    try {
      await api.delete(`/odeljenja/${o.id}`);
      setOdeljenja((prev) => prev.map((x) => (x.id === o.id ? { ...x, aktivan: false } : x)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri deaktivaciji');
    }
  };

  const sacuvajStaresinu = async () => {
    if (!edit) return;
    try {
      const azurirano = await api.put<OdeljenjeResponse>(
        `/odeljenja/${edit.odeljenje.id}/staresina`,
        undefined,
        { params: edit.staresinaId ? { staresinaId: edit.staresinaId } : undefined }
      );
      setOdeljenja((prev) => prev.map((x) => (x.id === azurirano.id ? azurirano : x)));
      setEdit(null);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri postavljanju staresine');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Odeljenja"
        description="Razredi i odeljenja u skoli, sa razrednim staresinom"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-4 h-4" /> Dodaj odeljenje
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo odeljenje</DialogTitle>
                <DialogDescription>
                  Oznaka odeljenja moze biti broj (1, 2, ...) ili slovo (A, B). Skolska godina je obavezna.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="razred">Razred</Label>
                  <Select
                    value={String(forma.razred)}
                    onValueChange={(v) => setForma({ ...forma, razred: Number(v) })}
                  >
                    <SelectTrigger id="razred"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1. razred</SelectItem>
                      <SelectItem value="2">2. razred</SelectItem>
                      <SelectItem value="3">3. razred</SelectItem>
                      <SelectItem value="4">4. razred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="oznaka">Oznaka</Label>
                  <Input
                    id="oznaka"
                    value={forma.oznaka}
                    onChange={(e) => setForma({ ...forma, oznaka: e.target.value })}
                    placeholder="npr. 1 ili A"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="godina">Skolska godina</Label>
                  <Input
                    id="godina"
                    value={forma.skolskaGodina}
                    onChange={(e) => setForma({ ...forma, skolskaGodina: e.target.value })}
                    placeholder="2024/2025"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="staresina">Razredni staresina (opciono)</Label>
                  <Select
                    value={forma.staresinaId ?? ''}
                    onValueChange={(v) => setForma({ ...forma, staresinaId: v === '_nema_' ? null : v })}
                  >
                    <SelectTrigger id="staresina"><SelectValue placeholder="Bez staresine" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_nema_">Bez staresine</SelectItem>
                      {nastavnici.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.ime} {n.prezime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Pretrazi po oznaci ili imenu staresine"
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
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam odeljenja...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={ucitaj} className="ml-auto">Pokusaj ponovo</Button>
        </div>
      ) : filtrirani.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          Nema odeljenja. Klikni "Dodaj odeljenje" da kreiras prvo.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrirani.map((o) => (
            <article
              key={o.id}
              className={`bg-white rounded-2xl border p-5 ${
                o.aktivan ? 'border-gray-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                  {o.label}
                </div>
                {!o.aktivan && (
                  <span className="text-xs font-medium rounded-full bg-gray-100 text-gray-600 px-2 py-0.5">
                    Deaktivirano
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {o.razred}. razred — odeljenje {o.oznaka}
              </h3>
              <p className="text-sm text-gray-500 mb-3">Skolska godina {o.skolskaGodina}</p>
              <div className="text-sm bg-gray-50 rounded-lg px-3 py-2 mb-3 flex items-center gap-2 min-h-10">
                <School className="w-4 h-4 text-gray-400" />
                {o.staresinaIme ? (
                  <span className="text-gray-700">
                    <span className="text-xs text-gray-500 block">Razredni staresina</span>
                    {o.staresinaIme}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">Bez staresine</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEdit({ odeljenje: o, staresinaId: o.staresinaId ?? '' })}
                  className="flex-1"
                >
                  <UserCog className="w-4 h-4" /> Staresina
                </Button>
                {o.aktivan && (
                  <Button size="sm" variant="ghost" onClick={() => handleDeaktiviraj(o)} title="Deaktiviraj">
                    <ShieldOff className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Edit staresine */}
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Razredni staresina: {edit?.odeljenje.label}</DialogTitle>
            <DialogDescription>
              Odaberi nastavnika iz svoje skole. Mozes ostaviti odeljenje bez staresine.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Staresina</Label>
            <Select
              value={edit?.staresinaId || '_nema_'}
              onValueChange={(v) =>
                setEdit((prev) => (prev ? { ...prev, staresinaId: v === '_nema_' ? '' : v } : prev))
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_nema_">Bez staresine</SelectItem>
                {nastavnici.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.ime} {n.prezime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Odustani</Button>
            <Button onClick={sacuvajStaresinu}>Sacuvaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

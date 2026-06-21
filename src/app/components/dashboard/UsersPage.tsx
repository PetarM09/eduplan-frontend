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
import { Plus, Search, ShieldOff, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { KorisnikResponse, KreirajKorisnikaRequest, Uloga } from '@/lib/types';

const ULOGA_META: Record<Uloga, { label: string; chipBg: string; chipText: string }> = {
  SUPER_ADMIN: { label: 'Super admin', chipBg: 'bg-purple-100', chipText: 'text-purple-700' },
  KOORDINATOR: { label: 'Koordinator', chipBg: 'bg-red-100', chipText: 'text-red-700' },
  DIREKTOR: { label: 'Direktor', chipBg: 'bg-orange-100', chipText: 'text-orange-700' },
  ADMIN: { label: 'Administrator', chipBg: 'bg-amber-100', chipText: 'text-amber-700' },
  PP_SLUZBA: { label: 'PP sluzba', chipBg: 'bg-brand-100', chipText: 'text-brand-700' },
  NASTAVNIK: { label: 'Nastavnik', chipBg: 'bg-brand-100', chipText: 'text-brand-700' },
};

// Uloge koje koordinator moze da kreira (SUPER_ADMIN i KOORDINATOR su rezervisani)
const KREIRAJUCE_ULOGE: Uloga[] = ['DIREKTOR', 'ADMIN', 'PP_SLUZBA', 'NASTAVNIK'];

const PRAZNA_FORMA: KreirajKorisnikaRequest = {
  username: '',
  email: '',
  lozinka: '',
  ime: '',
  prezime: '',
  uloga: 'NASTAVNIK',
};

export function UsersPage() {
  const [korisnici, setKorisnici] = useState<KorisnikResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filteri
  const [pretraga, setPretraga] = useState('');
  const [filterUloga, setFilterUloga] = useState<'sve' | Uloga>('sve');
  const [filterAktivan, setFilterAktivan] = useState<'sve' | 'aktivni' | 'neaktivni'>('aktivni');

  // Dialog za dodavanje
  const [dialogOpen, setDialogOpen] = useState(false);
  const [forma, setForma] = useState<KreirajKorisnikaRequest>(PRAZNA_FORMA);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dohvati listu sa servera
  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<KorisnikResponse[]>('/korisnici');
      setKorisnici(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju korisnika');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ucitaj();
  }, []);

  // Klijentsko filtriranje (lista nije velika — backend vraca sve)
  const filtrirani = useMemo(() => {
    const q = pretraga.trim().toLowerCase();
    return korisnici.filter((k) => {
      if (q) {
        const matchText =
          k.username.toLowerCase().includes(q) ||
          k.email.toLowerCase().includes(q) ||
          `${k.ime} ${k.prezime}`.toLowerCase().includes(q);
        if (!matchText) return false;
      }
      if (filterUloga !== 'sve' && k.uloga !== filterUloga) return false;
      if (filterAktivan === 'aktivni' && !k.aktivan) return false;
      if (filterAktivan === 'neaktivni' && k.aktivan) return false;
      return true;
    });
  }, [korisnici, pretraga, filterUloga, filterAktivan]);

  const stats = useMemo(() => {
    const ukupno = korisnici.length;
    const aktivni = korisnici.filter((k) => k.aktivan).length;
    const byRole = (u: Uloga) => korisnici.filter((k) => k.uloga === u).length;
    return {
      ukupno,
      aktivni,
      nastavnici: byRole('NASTAVNIK'),
      direktori: byRole('DIREKTOR') + byRole('ADMIN'),
      pp: byRole('PP_SLUZBA'),
    };
  }, [korisnici]);

  const handleDodaj = async () => {
    setFormError(null);
    if (!forma.username.trim() || !forma.email.trim() || !forma.lozinka || !forma.ime.trim() || !forma.prezime.trim()) {
      setFormError('Sva polja su obavezna');
      return;
    }
    if (forma.lozinka.length < 8) {
      setFormError('Lozinka mora imati najmanje 8 karaktera');
      return;
    }
    setSubmitting(true);
    try {
      const novi = await api.post<KorisnikResponse>('/korisnici', forma);
      setKorisnici((prev) => [...prev, novi]);
      setForma(PRAZNA_FORMA);
      setDialogOpen(false);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Greska pri kreiranju korisnika');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeaktiviraj = async (id: string) => {
    try {
      const azurirano = await api.post<KorisnikResponse>(`/korisnici/${id}/deaktiviraj`);
      setKorisnici((prev) => prev.map((k) => (k.id === id ? azurirano : k)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri deaktivaciji');
    }
  };

  const inicijali = (ime: string, prezime: string) =>
    `${ime[0] ?? ''}${prezime[0] ?? ''}`.toUpperCase();

  return (
    <AppLayout>
      <PageHeader
        title="Korisnici"
        description="Upravljaj nalozima u svojoj školi"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-4 h-4" />
                Dodaj korisnika
              </Button>
            </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novi korisnik</DialogTitle>
                    <DialogDescription>
                      Korisnik ce dobiti pocetnu lozinku koju ti unosis ovde. Treba je menjati pri prvom logovanju.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField id="ime" label="Ime" value={forma.ime} onChange={(v) => setForma({ ...forma, ime: v })} />
                    <FormField id="prezime" label="Prezime" value={forma.prezime} onChange={(v) => setForma({ ...forma, prezime: v })} />
                    <FormField id="username" label="Korisnicko ime" value={forma.username} onChange={(v) => setForma({ ...forma, username: v })} />
                    <FormField id="email" label="Email" type="email" value={forma.email} onChange={(v) => setForma({ ...forma, email: v })} />
                    <FormField id="lozinka" label="Pocetna lozinka" type="password" value={forma.lozinka} onChange={(v) => setForma({ ...forma, lozinka: v })} />
                    <div className="space-y-1.5">
                      <Label htmlFor="uloga">Uloga</Label>
                      <Select
                        value={forma.uloga}
                        onValueChange={(v) => setForma({ ...forma, uloga: v as Uloga })}
                      >
                        <SelectTrigger id="uloga">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {KREIRAJUCE_ULOGE.map((u) => (
                            <SelectItem key={u} value={u}>
                              {ULOGA_META[u].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {formError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {formError}
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

            {/* Statistike */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatBox label="Ukupno" value={stats.ukupno} />
              <StatBox label="Aktivni" value={stats.aktivni} accent="text-green-600" />
              <StatBox label="Nastavnika" value={stats.nastavnici} accent="text-brand-600" />
              <StatBox label="Direktora/Admin" value={stats.direktori} accent="text-orange-600" />
              <StatBox label="PP sluzba" value={stats.pp} accent="text-brand-600" />
            </div>

            {/* Filteri */}
            <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border p-4 flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pretrazi po imenu, email-u ili korisnickom imenu"
                  value={pretraga}
                  onChange={(e) => setPretraga(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterUloga} onValueChange={(v) => setFilterUloga(v as Uloga | 'sve')}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Sve uloge" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sve">Sve uloge</SelectItem>
                  {(Object.keys(ULOGA_META) as Uloga[])
                    .filter((u) => u !== 'SUPER_ADMIN')
                    .map((u) => (
                      <SelectItem key={u} value={u}>
                        {ULOGA_META[u].label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select value={filterAktivan} onValueChange={(v) => setFilterAktivan(v as typeof filterAktivan)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktivni">Samo aktivni</SelectItem>
                  <SelectItem value="neaktivni">Samo neaktivni</SelectItem>
                  <SelectItem value="sve">Svi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lista */}
            <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border overflow-hidden">
              {loading ? (
                <div className="p-12 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam korisnike...
                </div>
              ) : error ? (
                <div className="p-6 bg-red-50 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                  <Button size="sm" variant="outline" onClick={ucitaj} className="ml-auto">
                    Pokusaj ponovo
                  </Button>
                </div>
              ) : filtrirani.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">Nema rezultata za zadane filtere.</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Korisnik</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Uloga</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Akcije</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtrirani.map((k) => {
                      const meta = ULOGA_META[k.uloga];
                      return (
                        <tr key={k.id} className="hover:bg-secondary transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center text-sm font-semibold">
                                {inicijali(k.ime, k.prezime)}
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {k.ime} {k.prezime}
                                </div>
                                <div className="text-xs text-muted-foreground">@{k.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              {k.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.chipBg} ${meta.chipText}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {k.aktivan ? (
                              <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
                                <span className="w-2 h-2 bg-green-500 rounded-full" />
                                Aktivan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                <span className="w-2 h-2 bg-muted-foreground rounded-full" />
                                Deaktiviran
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {k.aktivan && k.uloga !== 'KOORDINATOR' && k.uloga !== 'SUPER_ADMIN' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (confirm(`Deaktivirati korisnika "${k.ime} ${k.prezime}"?`)) {
                                    handleDeaktiviraj(k.id);
                                  }
                                }}
                              >
                                <ShieldOff className="w-4 h-4" /> Deaktiviraj
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
    </AppLayout>
  );
}

// -------- pomocne komponente --------

function StatBox({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${accent ?? 'text-foreground'}`}>{value}</div>
    </div>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

function FormField({ id, label, value, onChange, type = 'text' }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

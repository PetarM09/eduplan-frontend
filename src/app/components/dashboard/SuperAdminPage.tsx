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
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Plus,
  School,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { KorisnikResponse, KreirajKorisnikaRequest, Uloga } from '@/lib/types';

const ULOGE_U_SKOLI: Uloga[] = ['KOORDINATOR', 'DIREKTOR', 'ADMIN', 'PP_SLUZBA', 'NASTAVNIK'];

const ULOGA_BADGE: Record<Uloga, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700',
  KOORDINATOR: 'bg-purple-100 text-purple-700',
  DIREKTOR: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-indigo-100 text-indigo-700',
  PP_SLUZBA: 'bg-emerald-100 text-emerald-700',
  NASTAVNIK: 'bg-gray-100 text-gray-700',
};

interface SkolaResponse {
  id: string;
  naziv: string;
  grad: string | null;
  adresa: string | null;
  mailPlanovi: string | null;
  aktivan: boolean;
}

interface KreirajSkoluRequest {
  naziv: string;
  grad?: string | null;
  adresa?: string | null;
  mailPlanovi?: string | null;
}

const PRAZNA_SKOLA: KreirajSkoluRequest = {
  naziv: '',
  grad: '',
  adresa: '',
  mailPlanovi: '',
};

const PRAZAN_KOORDINATOR: KreirajKorisnikaRequest = {
  username: '',
  email: '',
  lozinka: '',
  ime: '',
  prezime: '',
  uloga: 'KOORDINATOR',
};

export function SuperAdminPage() {
  const [skole, setSkole] = useState<SkolaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dijalog: nova skola
  const [skolaOpen, setSkolaOpen] = useState(false);
  const [novaSkola, setNovaSkola] = useState<KreirajSkoluRequest>(PRAZNA_SKOLA);
  const [skolaSubmit, setSkolaSubmit] = useState(false);
  const [skolaError, setSkolaError] = useState<string | null>(null);

  // Dijalog: koordinator za izabranu skolu
  const [koordZaSkolu, setKoordZaSkolu] = useState<SkolaResponse | null>(null);
  const [koordForma, setKoordForma] = useState<KreirajKorisnikaRequest>(PRAZAN_KOORDINATOR);
  const [koordSubmit, setKoordSubmit] = useState(false);
  const [koordError, setKoordError] = useState<string | null>(null);

  // Dijalog: korisnici skole
  const [korisniciSkola, setKorisniciSkola] = useState<SkolaResponse | null>(null);
  const [korisnici, setKorisnici] = useState<KorisnikResponse[]>([]);
  const [korisniciLoading, setKorisniciLoading] = useState(false);
  const [korisniciError, setKorisniciError] = useState<string | null>(null);
  const [akcijaInProgress, setAkcijaInProgress] = useState<string | null>(null);

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<SkolaResponse[]>('/super/skole');
      setSkole(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju skola');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ucitaj();
  }, []);

  const aktivnih = useMemo(() => skole.filter((s) => s.aktivan).length, [skole]);

  const dodajSkolu = async () => {
    setSkolaError(null);
    if (!novaSkola.naziv.trim()) {
      setSkolaError('Naziv skole je obavezan');
      return;
    }
    setSkolaSubmit(true);
    try {
      const kreirana = await api.post<SkolaResponse>('/super/skole', {
        naziv: novaSkola.naziv.trim(),
        grad: novaSkola.grad?.trim() || null,
        adresa: novaSkola.adresa?.trim() || null,
        mailPlanovi: novaSkola.mailPlanovi?.trim() || null,
      });
      setSkole((prev) => [...prev, kreirana]);
      setNovaSkola(PRAZNA_SKOLA);
      setSkolaOpen(false);
      // Predlozim da odmah doda koordinatora za novokreirana skola
      setKoordZaSkolu(kreirana);
      setKoordForma(PRAZAN_KOORDINATOR);
    } catch (e) {
      setSkolaError(e instanceof ApiError ? e.message : 'Greska pri kreiranju skole');
    } finally {
      setSkolaSubmit(false);
    }
  };

  const dodajKoordinatora = async () => {
    if (!koordZaSkolu) return;
    setKoordError(null);
    if (
      !koordForma.username.trim() ||
      !koordForma.email.trim() ||
      !koordForma.lozinka ||
      !koordForma.ime.trim() ||
      !koordForma.prezime.trim()
    ) {
      setKoordError('Sva polja su obavezna');
      return;
    }
    if (koordForma.lozinka.length < 8) {
      setKoordError('Lozinka mora imati najmanje 8 karaktera');
      return;
    }
    setKoordSubmit(true);
    try {
      await api.post<KorisnikResponse>(`/super/skole/${koordZaSkolu.id}/koordinator`, koordForma);
      setKoordZaSkolu(null);
      setKoordForma(PRAZAN_KOORDINATOR);
      alert(`Koordinator je kreiran. Login: ${koordForma.username}`);
    } catch (e) {
      setKoordError(e instanceof ApiError ? e.message : 'Greska pri kreiranju koordinatora');
    } finally {
      setKoordSubmit(false);
    }
  };

  const otvoriKorisnike = async (skola: SkolaResponse) => {
    setKorisniciSkola(skola);
    setKorisnici([]);
    setKorisniciError(null);
    setKorisniciLoading(true);
    try {
      const data = await api.get<KorisnikResponse[]>(`/super/skole/${skola.id}/korisnici`);
      setKorisnici(data);
    } catch (e) {
      setKorisniciError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju korisnika');
    } finally {
      setKorisniciLoading(false);
    }
  };

  const azurirajUListi = (k: KorisnikResponse) =>
    setKorisnici((prev) => prev.map((p) => (p.id === k.id ? k : p)));

  const aktiviraj = async (id: string) => {
    setAkcijaInProgress(id);
    try {
      const k = await api.post<KorisnikResponse>(`/super/korisnici/${id}/aktiviraj`);
      azurirajUListi(k);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setAkcijaInProgress(null);
    }
  };

  const deaktiviraj = async (id: string) => {
    setAkcijaInProgress(id);
    try {
      const k = await api.post<KorisnikResponse>(`/super/korisnici/${id}/deaktiviraj`);
      azurirajUListi(k);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setAkcijaInProgress(null);
    }
  };

  const promeniUlogu = async (id: string, nova: Uloga) => {
    setAkcijaInProgress(id);
    try {
      const k = await api.patch<KorisnikResponse>(`/super/korisnici/${id}/uloga`, { uloga: nova });
      azurirajUListi(k);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setAkcijaInProgress(null);
    }
  };

  const obrisi = async (k: KorisnikResponse) => {
    if (!confirm(`Obrisati ${k.ime} ${k.prezime} (${k.username})? Ako ima vezane planove ili izvestaje, brisanje ce biti odbijeno — koristi deaktivaciju.`)) return;
    setAkcijaInProgress(k.id);
    try {
      await api.delete(`/super/korisnici/${k.id}`);
      setKorisnici((prev) => prev.filter((p) => p.id !== k.id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setAkcijaInProgress(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Skole u sistemu"
        description="Kreiraj novu skolu i dodeli joj koordinatora — to je dovoljno, koordinator dalje sam upravlja svojom skolom."
        action={
          <Dialog open={skolaOpen} onOpenChange={setSkolaOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-4 h-4" /> Dodaj skolu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova skola</DialogTitle>
                <DialogDescription>
                  Posle kreiranja skole automatski se otvara dialog za njenog koordinatora.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4">
                <Field id="naziv" label="Naziv skole" value={novaSkola.naziv} onChange={(v) => setNovaSkola({ ...novaSkola, naziv: v })} />
                <div className="grid grid-cols-2 gap-4">
                  <Field id="grad" label="Grad" value={novaSkola.grad ?? ''} onChange={(v) => setNovaSkola({ ...novaSkola, grad: v })} />
                  <Field id="adresa" label="Adresa" value={novaSkola.adresa ?? ''} onChange={(v) => setNovaSkola({ ...novaSkola, adresa: v })} />
                </div>
                <Field
                  id="mailPlanovi"
                  label="Mail za primanje planova"
                  type="email"
                  value={novaSkola.mailPlanovi ?? ''}
                  onChange={(v) => setNovaSkola({ ...novaSkola, mailPlanovi: v })}
                  placeholder="planovi@skola.rs"
                />
              </div>
              {skolaError && <ErrorBox message={skolaError} />}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSkolaOpen(false)} disabled={skolaSubmit}>
                  Odustani
                </Button>
                <Button onClick={dodajSkolu} disabled={skolaSubmit}>
                  {skolaSubmit ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kreiraj skolu'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatBox label="Ukupno skola" value={skole.length} />
        <StatBox label="Aktivnih" value={aktivnih} accent="text-green-600" />
        <StatBox label="Neaktivnih" value={skole.length - aktivnih} accent="text-gray-500" />
      </div>

      {loading ? (
        <CenteredLoader />
      ) : error ? (
        <ErrorRow message={error} onRetry={ucitaj} />
      ) : skole.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          Nema kreiranih skola. Klikni "Dodaj skolu" da napravis prvu.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skole.map((s) => (
            <article
              key={s.id}
              className={`bg-white rounded-2xl border border-gray-200 p-5 ${
                s.aktivan ? '' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <School className="w-5 h-5" />
                </div>
                {!s.aktivan && (
                  <span className="text-xs font-medium rounded-full bg-gray-100 text-gray-600 px-2 py-0.5">
                    Neaktivna
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{s.naziv}</h3>
              <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                {s.grad && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {s.grad}
                    {s.adresa && `, ${s.adresa}`}
                  </div>
                )}
                {s.mailPlanovi && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{s.mailPlanovi}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => otvoriKorisnike(s)}
                >
                  <Users className="w-4 h-4" /> Korisnici
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setKoordZaSkolu(s);
                    setKoordForma(PRAZAN_KOORDINATOR);
                    setKoordError(null);
                  }}
                >
                  <UserPlus className="w-4 h-4" /> Koordinator
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Dijalog za korisnike skole */}
      <Dialog open={!!korisniciSkola} onOpenChange={(o) => !o && setKorisniciSkola(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Korisnici: {korisniciSkola?.naziv}</DialogTitle>
            <DialogDescription>
              Promeni ulogu inline, deaktiviraj umesto brisanja ako korisnik ima vezane podatke.
            </DialogDescription>
          </DialogHeader>

          {korisniciLoading ? (
            <CenteredLoader />
          ) : korisniciError ? (
            <ErrorBox message={korisniciError} />
          ) : korisnici.length === 0 ? (
            <p className="p-6 text-sm text-gray-500 text-center">
              Skola jos nema kreiranih korisnika.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ime i prezime
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Username / Email
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Uloga
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {korisnici.map((k) => {
                    const radi = akcijaInProgress === k.id;
                    return (
                      <tr key={k.id} className={`${k.aktivan ? '' : 'opacity-60'}`}>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          {k.ime} {k.prezime}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          <div>{k.username}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">{k.email}</div>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ULOGA_BADGE[k.uloga]}`}
                            >
                              {k.uloga}
                            </span>
                            <select
                              value={k.uloga}
                              onChange={(e) => promeniUlogu(k.id, e.target.value as Uloga)}
                              disabled={radi}
                              className="h-8 px-2 rounded border border-gray-300 text-xs"
                              title="Promeni ulogu"
                            >
                              {ULOGE_U_SKOLI.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {k.aktivan ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Aktivan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium">
                              <UserX className="w-3 h-3" /> Neaktivan
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="inline-flex items-center gap-1">
                            {radi && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                            {k.aktivan ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deaktiviraj(k.id)}
                                disabled={radi}
                                title="Deaktiviraj"
                                className="text-amber-600 hover:text-amber-700"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => aktiviraj(k.id)}
                                disabled={radi}
                                title="Aktiviraj"
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => obrisi(k)}
                              disabled={radi}
                              title="Obrisi"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setKorisniciSkola(null)}>
              Zatvori
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dijalog za koordinatora */}
      <Dialog open={!!koordZaSkolu} onOpenChange={(o) => !o && setKoordZaSkolu(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Koordinator za: {koordZaSkolu?.naziv}</DialogTitle>
            <DialogDescription>
              Koordinator je administrator skole. On dalje kreira sve ostale naloge
              (DIREKTOR, ADMIN, PP_SLUZBA, NASTAVNIK).
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Field id="k-ime" label="Ime" value={koordForma.ime} onChange={(v) => setKoordForma({ ...koordForma, ime: v })} />
            <Field id="k-prezime" label="Prezime" value={koordForma.prezime} onChange={(v) => setKoordForma({ ...koordForma, prezime: v })} />
            <Field id="k-username" label="Korisnicko ime" value={koordForma.username} onChange={(v) => setKoordForma({ ...koordForma, username: v })} />
            <Field id="k-email" label="Email" type="email" value={koordForma.email} onChange={(v) => setKoordForma({ ...koordForma, email: v })} />
            <Field id="k-lozinka" label="Pocetna lozinka" type="password" value={koordForma.lozinka} onChange={(v) => setKoordForma({ ...koordForma, lozinka: v })} />
          </div>
          {koordError && <ErrorBox message={koordError} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setKoordZaSkolu(null)} disabled={koordSubmit}>
              Odustani
            </Button>
            <Button onClick={dodajKoordinatora} disabled={koordSubmit}>
              {koordSubmit ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kreiraj koordinatora'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

// -------- pomocne komponente --------

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}
function Field({ id, label, value, onChange, type = 'text', placeholder }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${accent ?? 'text-gray-900'}`}>{value}</div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      {message}
    </div>
  );
}

function CenteredLoader() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-12 flex items-center justify-center text-gray-500">
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

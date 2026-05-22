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
  Loader2,
  Mail,
  MapPin,
  Plus,
  School,
  UserPlus,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { KorisnikResponse, KreirajKorisnikaRequest } from '@/lib/types';

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
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setKoordZaSkolu(s);
                  setKoordForma(PRAZAN_KOORDINATOR);
                  setKoordError(null);
                }}
                className="w-full"
              >
                <UserPlus className="w-4 h-4" /> Dodaj koordinatora
              </Button>
            </article>
          ))}
        </div>
      )}

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

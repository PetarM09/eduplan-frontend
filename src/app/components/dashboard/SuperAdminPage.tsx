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
  CalendarClock,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Power,
  PowerOff,
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
  vaziDo: string | null;
}

interface KreirajSkoluRequest {
  naziv: string;
  grad?: string | null;
  adresa?: string | null;
  vaziDo?: string | null;
}

const PRAZNA_SKOLA: KreirajSkoluRequest = {
  naziv: '',
  grad: '',
  adresa: '',
  vaziDo: '',
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

  const neaktivnih = useMemo(() => {
    const danas = new Date().toISOString().slice(0, 10);
    return skole.filter((s) => !s.aktivan || (!!s.vaziDo && s.vaziDo < danas)).length;
  }, [skole]);
  const aktivnih = skole.length - neaktivnih;

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
        vaziDo: novaSkola.vaziDo?.trim() || null,
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

  const azurirajSkoluUListi = (s: SkolaResponse) =>
    setSkole((prev) => prev.map((x) => (x.id === s.id ? s : x)));

  const aktivirajSkolu = async (id: string) => {
    try {
      const s = await api.post<SkolaResponse>(`/super/skole/${id}/aktiviraj`);
      azurirajSkoluUListi(s);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  const deaktivirajSkolu = async (id: string) => {
    if (!confirm('Deaktivirati skolu? Svi korisnici skole nece moci da se loguju.')) return;
    try {
      const s = await api.post<SkolaResponse>(`/super/skole/${id}/deaktiviraj`);
      azurirajSkoluUListi(s);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  const postaviVaziDo = async (id: string, trenutni: string | null) => {
    const ulaz = prompt(
      'Datum automatske deaktivacije (YYYY-MM-DD). Ostavi prazno da uklonis ogranicenje.',
      trenutni ?? ''
    );
    if (ulaz === null) return;
    const novi = ulaz.trim() || null;
    if (novi && !/^\d{4}-\d{2}-\d{2}$/.test(novi)) {
      alert('Datum mora biti u formatu YYYY-MM-DD');
      return;
    }
    try {
      const s = await api.patch<SkolaResponse>(`/super/skole/${id}/vazi-do`, { vaziDo: novi });
      azurirajSkoluUListi(s);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
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
              <button className="h-12 px-6 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:from-orange-400 hover:to-amber-500 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Dodaj skolu
              </button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-slate-200">
              <DialogHeader>
                <DialogTitle className="text-white">Nova skola</DialogTitle>
                <DialogDescription className="text-slate-400">
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
                  id="vaziDo"
                  label="Datum vazenja (opcionalno)"
                  type="date"
                  value={novaSkola.vaziDo ?? ''}
                  onChange={(v) => setNovaSkola({ ...novaSkola, vaziDo: v })}
                  placeholder="YYYY-MM-DD"
                />
                <p className="text-xs text-slate-400 -mt-2">
                  Kada datum prodje, login svih korisnika skole se automatski blokira.
                  Mail za primanje planova postavlja koordinator skole.
                </p>
              </div>
              {skolaError && <ErrorBox message={skolaError} />}
              <DialogFooter>
                <button
                  onClick={() => setSkolaOpen(false)}
                  disabled={skolaSubmit}
                  className="h-10 px-4 rounded-xl border border-slate-600 bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
                >
                  Odustani
                </button>
                <button
                  onClick={dodajSkolu}
                  disabled={skolaSubmit}
                  className="h-10 px-4 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-medium shadow hover:from-orange-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {skolaSubmit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Kreiraj skolu
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatBox label="Ukupno skola" value={skole.length} accent="text-white" />
        <StatBox label="Aktivnih" value={aktivnih} accent="text-emerald-400" />
        <StatBox label="Neaktivnih" value={neaktivnih} accent="text-slate-400" />
      </div>

      {loading ? (
        <CenteredLoader tamna />
      ) : error ? (
        <ErrorRow message={error} onRetry={ucitaj} />
      ) : skole.length === 0 ? (
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 p-12 text-center text-slate-300">
          Nema kreiranih skola. Klikni "Dodaj skolu" da napravis prvu.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skole.map((s) => {
            const istekla = !!s.vaziDo && s.vaziDo < new Date().toISOString().slice(0, 10);
            const problematicna = !s.aktivan || istekla;
            return (
              <article
                key={s.id}
                className={`rounded-2xl border p-5 backdrop-blur transition-colors ${
                  problematicna
                    ? 'bg-amber-900/20 border-amber-500/40'
                    : 'bg-slate-800/60 border-slate-700 hover:border-orange-500/40'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      problematicna
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}
                  >
                    <School className="w-5 h-5" />
                  </div>
                  {!s.aktivan ? (
                    <span className="text-xs font-medium rounded-full bg-slate-700 text-slate-300 px-2 py-0.5">
                      Deaktivirana
                    </span>
                  ) : istekla ? (
                    <span className="text-xs font-medium rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5">
                      Istekla
                    </span>
                  ) : null}
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{s.naziv}</h3>
                <div className="space-y-1.5 text-sm text-slate-300 mb-4">
                  {s.grad && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      {s.grad}
                      {s.adresa && `, ${s.adresa}`}
                    </div>
                  )}
                  {s.mailPlanovi && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{s.mailPlanovi}</span>
                    </div>
                  )}
                  <button
                    onClick={() => postaviVaziDo(s.id, s.vaziDo)}
                    className="w-full flex items-center gap-2 text-left text-slate-300 hover:text-orange-300 transition-colors"
                    title="Klikni da promenis datum"
                  >
                    <CalendarClock className="w-4 h-4 text-slate-500" />
                    {s.vaziDo ? (
                      <span>Vazi do <strong className="text-white">{s.vaziDo}</strong></span>
                    ) : (
                      <span className="text-slate-500">Bez ogranicenja — postavi datum</span>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => otvoriKorisnike(s)}
                    className="h-9 px-3 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-200 text-sm font-medium hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" /> Korisnici
                  </button>
                  <button
                    onClick={() => {
                      setKoordZaSkolu(s);
                      setKoordForma(PRAZAN_KOORDINATOR);
                      setKoordError(null);
                    }}
                    className="h-9 px-3 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-200 text-sm font-medium hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Koordinator
                  </button>
                  {s.aktivan ? (
                    <button
                      onClick={() => deaktivirajSkolu(s.id)}
                      className="col-span-2 h-9 px-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm font-medium hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <PowerOff className="w-4 h-4" /> Deaktiviraj skolu
                    </button>
                  ) : (
                    <button
                      onClick={() => aktivirajSkolu(s.id)}
                      className="col-span-2 h-9 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-medium hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Power className="w-4 h-4" /> Aktiviraj skolu
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Dijalog za korisnike skole */}
      <Dialog open={!!korisniciSkola} onOpenChange={(o) => !o && setKorisniciSkola(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-200 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Korisnici: {korisniciSkola?.naziv}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Promeni ulogu inline, deaktiviraj umesto brisanja ako korisnik ima vezane podatke.
            </DialogDescription>
          </DialogHeader>

          {korisniciLoading ? (
            <CenteredLoader tamna />
          ) : korisniciError ? (
            <ErrorBox message={korisniciError} />
          ) : korisnici.length === 0 ? (
            <p className="p-6 text-sm text-slate-400 text-center">
              Skola jos nema kreiranih korisnika.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full">
                <thead className="bg-slate-800/80 border-b border-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Ime i prezime
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Username / Email
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Uloga
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                  {korisnici.map((k) => {
                    const radi = akcijaInProgress === k.id;
                    return (
                      <tr key={k.id} className={`hover:bg-slate-800/60 transition-colors ${k.aktivan ? '' : 'opacity-60'}`}>
                        <td className="px-3 py-2 text-sm font-medium text-white">
                          {k.ime} {k.prezime}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-300">
                          <div>{k.username}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">{k.email}</div>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <select
                            value={k.uloga}
                            onChange={(e) => promeniUlogu(k.id, e.target.value as Uloga)}
                            disabled={radi}
                            className={`h-8 px-2 rounded-full border-0 text-xs font-medium cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-orange-400 ${ULOGA_BADGE[k.uloga]}`}
                            title="Promeni ulogu"
                          >
                            {ULOGE_U_SKOLI.map((u) => (
                              <option key={u} value={u} className="bg-slate-800 text-white">
                                {u}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {k.aktivan ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Aktivan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-700 text-slate-300 px-2 py-0.5 text-xs font-medium">
                              <UserX className="w-3 h-3" /> Neaktivan
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="inline-flex items-center gap-1">
                            {radi && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                            {k.aktivan ? (
                              <button
                                onClick={() => deaktiviraj(k.id)}
                                disabled={radi}
                                title="Deaktiviraj"
                                className="h-8 w-8 rounded-lg text-amber-400 hover:bg-amber-500/15 hover:text-amber-300 transition-colors flex items-center justify-center disabled:opacity-50"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => aktiviraj(k.id)}
                                disabled={radi}
                                title="Aktiviraj"
                                className="h-8 w-8 rounded-lg text-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-300 transition-colors flex items-center justify-center disabled:opacity-50"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => obrisi(k)}
                              disabled={radi}
                              title="Obrisi"
                              className="h-8 w-8 rounded-lg text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
            <button
              onClick={() => setKorisniciSkola(null)}
              className="h-10 px-4 rounded-xl border border-slate-600 bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors"
            >
              Zatvori
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dijalog za koordinatora */}
      <Dialog open={!!koordZaSkolu} onOpenChange={(o) => !o && setKoordZaSkolu(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">Koordinator za: {koordZaSkolu?.naziv}</DialogTitle>
            <DialogDescription className="text-slate-400">
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
            <button
              onClick={() => setKoordZaSkolu(null)}
              disabled={koordSubmit}
              className="h-10 px-4 rounded-xl border border-slate-600 bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
            >
              Odustani
            </button>
            <button
              onClick={dodajKoordinatora}
              disabled={koordSubmit}
              className="h-10 px-4 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-medium shadow hover:from-orange-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {koordSubmit ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Kreiraj koordinatora
            </button>
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
      <Label htmlFor={id} className="text-slate-300">{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800/60 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-orange-500 focus-visible:ring-orange-500/30"
      />
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${accent ?? 'text-white'}`}>{value}</div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      {message}
    </div>
  );
}

function CenteredLoader({ tamna = false }: { tamna?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-12 flex items-center justify-center ${
        tamna
          ? 'bg-slate-800/60 backdrop-blur border-slate-700 text-slate-300'
          : 'bg-white border-gray-200 text-gray-500'
      }`}
    >
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam...
    </div>
  );
}

function ErrorRow({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-2 text-red-300">
      <AlertCircle className="w-5 h-5" />
      <span>{message}</span>
      <button
        onClick={onRetry}
        className="ml-auto h-8 px-3 rounded-lg border border-red-500/40 text-sm text-red-200 hover:bg-red-500/10 transition-colors"
      >
        Pokusaj ponovo
      </button>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Link2,
  Loader2,
  Power,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { KorisnikResponse } from '@/lib/types';

interface VerzijaResponse {
  id: string;
  naziv: string | null;
  skolskaGodina: string | null;
  datumOd: string | null;
  aktivan: boolean;
  brojStavki: number;
  brojProfesora: number;
  createdAt: string;
}

interface NemapiraniProfesor {
  nastavnikLabel: string;
  brojStavki: number;
}

export function VerzijeRasporedaPage() {
  const { user } = useAuth();
  const mozeAktivirati = user?.uloga === 'KOORDINATOR' || user?.uloga === 'ADMIN';
  const mozeBrisati = user?.uloga === 'KOORDINATOR';

  const [verzije, setVerzije] = useState<VerzijaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [nemapirani, setNemapirani] = useState<NemapiraniProfesor[]>([]);
  const [nastavniciDostupni, setNastavniciDostupni] = useState<KorisnikResponse[]>([]);
  const [izbor, setIzbor] = useState<Record<string, string>>({});
  const [mapBusy, setMapBusy] = useState<string | null>(null);

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<VerzijaResponse[]>('/raspored/verzije');
      setVerzije(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju');
    } finally {
      setLoading(false);
    }
  };

  const ucitajNemapirane = async () => {
    if (user?.uloga !== 'KOORDINATOR') return;
    try {
      const [nem, n, k] = await Promise.all([
        api.get<NemapiraniProfesor[]>('/raspored/nemapirani-profesori'),
        api.get<KorisnikResponse[]>('/korisnici/po-ulozi/NASTAVNIK'),
        api.get<KorisnikResponse[]>('/korisnici/po-ulozi/KOORDINATOR'),
      ]);
      setNemapirani(nem);
      setNastavniciDostupni([...n, ...k].sort((a, b) => a.prezime.localeCompare(b.prezime)));
    } catch {
      // tiho — sekcija je sekundarna
    }
  };

  useEffect(() => {
    ucitaj();
    ucitajNemapirane();
  }, []);

  const mapiraj = async (label: string) => {
    const korisnikId = izbor[label];
    if (!korisnikId) {
      alert('Izaberi korisnika iz padajuceg menija');
      return;
    }
    setMapBusy(label);
    try {
      await api.post('/raspored/mapiraj-profesora', { nastavnikLabel: label, korisnikId });
      setNemapirani((prev) => prev.filter((x) => x.nastavnikLabel !== label));
      setIzbor((prev) => {
        const copy = { ...prev };
        delete copy[label];
        return copy;
      });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri mapiranju');
    } finally {
      setMapBusy(null);
    }
  };

  const aktiviraj = async (id: string) => {
    setBusy(id);
    try {
      await api.post(`/raspored/verzije/${id}/aktiviraj`);
      setVerzije((prev) => prev.map((v) => ({ ...v, aktivan: v.id === id })));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setBusy(null);
    }
  };

  const obrisi = async (v: VerzijaResponse) => {
    const ime = v.naziv ?? '(bez naziva)';
    if (!confirm(`Obrisati verziju rasporeda "${ime}"? Sve stavke ce biti uklonjene.`)) return;
    setBusy(v.id);
    try {
      await api.delete(`/raspored/verzije/${v.id}`);
      setVerzije((prev) => prev.filter((x) => x.id !== v.id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Verzije rasporeda"
        description="Sve uvezene XML verzije rasporeda. Aktivna verzija se koristi za moj raspored, zamene i rotacije."
      />

      {user?.uloga === 'KOORDINATOR' && nemapirani.length > 0 && (
        <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-amber-200">
          <header className="p-4 border-b border-amber-200 bg-amber-50/50 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-foreground">Nemapirani profesori iz rasporeda</h2>
            <span className="ml-auto text-xs text-amber-700">{nemapirani.length} stavki</span>
          </header>
          <div className="p-4 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              Ovo su imena iz XML rasporeda koja nisu povezana sa korisnickim nalogom. Izaberi
              postojeceg korisnika za svako ime i klikni "Mapiraj" da povezes sve casove tog
              profesora. Pri dodavanju novog korisnika sa istim imenom auto-mapiranje radi
              automatski.
            </p>
            {nemapirani.map((nm) => (
              <div
                key={nm.nastavnikLabel}
                className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-3 py-2 rounded-lg border border-border"
              >
                <div>
                  <div className="font-medium text-foreground">{nm.nastavnikLabel}</div>
                  <div className="text-xs text-muted-foreground">{nm.brojStavki} casova u rasporedu</div>
                </div>
                <select
                  value={izbor[nm.nastavnikLabel] ?? ''}
                  onChange={(e) =>
                    setIzbor((prev) => ({ ...prev, [nm.nastavnikLabel]: e.target.value }))
                  }
                  className="h-9 px-2 rounded-md border border-input text-sm min-w-[220px]"
                >
                  <option value="">— izaberi korisnika —</option>
                  {nastavniciDostupni.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.prezime} {k.ime} ({k.uloga === 'KOORDINATOR' ? 'koord.' : 'nastavnik'})
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={() => mapiraj(nm.nastavnikLabel)}
                  disabled={mapBusy === nm.nastavnikLabel || !izbor[nm.nastavnikLabel]}
                >
                  {mapBusy === nm.nastavnikLabel ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  Mapiraj
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border p-12 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={ucitaj} className="ml-auto">
            Pokusaj ponovo
          </Button>
        </div>
      ) : verzije.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border p-12 text-center text-muted-foreground">
          Nema uvezenih verzija rasporeda. Uvezi XML kroz stranicu "Raspored".
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Naziv</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sk. godina</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Datum od</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profesora</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Casova</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {verzije.map((v) => (
                <tr key={v.id} className={v.aktivan ? 'bg-emerald-50/40' : ''}>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <History className="w-4 h-4 text-brand-500" />
                      {v.naziv ?? <span className="text-muted-foreground italic">(bez naziva)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(v.createdAt).toLocaleString('sr-Latn-RS')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{v.skolskaGodina ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{v.datumOd ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{v.brojProfesora}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{v.brojStavki}</td>
                  <td className="px-6 py-4">
                    {v.aktivan ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Aktivna
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-secondary text-muted-foreground px-2.5 py-0.5 text-xs font-medium">
                        Neaktivna
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      {busy === v.id && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                      {!v.aktivan && mozeAktivirati && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => aktiviraj(v.id)}
                          disabled={busy === v.id}
                          className="text-emerald-700 hover:bg-emerald-50"
                        >
                          <Power className="w-3.5 h-3.5" /> Aktiviraj
                        </Button>
                      )}
                      {mozeBrisati && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => obrisi(v)}
                          disabled={busy === v.id}
                          title="Obrisi"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}

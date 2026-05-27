import { useEffect, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  Power,
  Trash2,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface VerzijaResponse {
  id: string;
  naziv: string | null;
  skolskaGodina: string | null;
  datumOd: string | null;
  aktivan: boolean;
  brojStavki: number;
  createdAt: string;
}

export function VerzijeRasporedaPage() {
  const { user } = useAuth();
  const mozeAktivirati = user?.uloga === 'KOORDINATOR' || user?.uloga === 'ADMIN';
  const mozeBrisati = user?.uloga === 'KOORDINATOR';

  const [verzije, setVerzije] = useState<VerzijaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

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

  useEffect(() => {
    ucitaj();
  }, []);

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

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex items-center justify-center text-gray-500">
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
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          Nema uvezenih verzija rasporeda. Uvezi XML kroz stranicu "Raspored".
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Naziv</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sk. godina</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Datum od</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stavki</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {verzije.map((v) => (
                <tr key={v.id} className={v.aktivan ? 'bg-emerald-50/40' : ''}>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <History className="w-4 h-4 text-indigo-500" />
                      {v.naziv ?? <span className="text-gray-400 italic">(bez naziva)</span>}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(v.createdAt).toLocaleString('sr-Latn-RS')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{v.skolskaGodina ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{v.datumOd ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{v.brojStavki}</td>
                  <td className="px-6 py-4">
                    {v.aktivan ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Aktivna
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 text-xs font-medium">
                        Neaktivna
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      {busy === v.id && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
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

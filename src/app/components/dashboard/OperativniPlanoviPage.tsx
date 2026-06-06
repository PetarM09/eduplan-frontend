import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import { AlertCircle, Check, ClipboardList, Copy, Download, Loader2, Pencil, Plus, Send, Trash2, XCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { OperativniPlanResponse, PlanStatus } from '@/lib/types';

const STATUS_META: Record<PlanStatus, { label: string; bg: string; text: string }> = {
  NACRT: { label: 'Nacrt', bg: 'bg-gray-100', text: 'text-gray-700' },
  PODNET: { label: 'Podnet', bg: 'bg-blue-100', text: 'text-blue-700' },
  VRACENO_NA_DORADU: { label: 'Vracen', bg: 'bg-amber-100', text: 'text-amber-700' },
  ARHIVIRAN: { label: 'Arhiviran', bg: 'bg-gray-100', text: 'text-gray-500' },
};

const MESEC_LABEL = [
  '', 'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
];

export function OperativniPlanoviPage() {
  const { user } = useAuth();
  const [planovi, setPlanovi] = useState<OperativniPlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sviRezim = user?.uloga !== 'NASTAVNIK';

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const path = sviRezim ? '/planovi/operativni/svi' : '/planovi/operativni/me';
      const data = await api.get<OperativniPlanResponse[]>(path);
      setPlanovi(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju planova');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ucitaj();
  }, [sviRezim]);

  const podnesi = async (id: string) => {
    try {
      const azurirano = await api.post<OperativniPlanResponse>(`/planovi/operativni/${id}/podnesi`);
      setPlanovi((prev) => prev.map((p) => (p.id === id ? azurirano : p)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri podnosenju');
    }
  };

  const odobri = async (id: string) => {
    if (!confirm('Odobriti plan? Plan ce biti arhiviran kao zvanicno prihvacen.')) return;
    try {
      const azurirano = await api.post<OperativniPlanResponse>(`/planovi/operativni/${id}/odobri`);
      setPlanovi((prev) => prev.map((p) => (p.id === id ? azurirano : p)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri odobravanju');
    }
  };

  const odbij = async (id: string) => {
    const razlog = prompt('Razlog vracanja na doradu (bice prosledjen nastavniku):');
    if (razlog === null) return;
    if (!razlog.trim()) {
      alert('Razlog je obavezan');
      return;
    }
    try {
      const azurirano = await api.post<OperativniPlanResponse>(`/planovi/operativni/${id}/odbij`, { razlog });
      setPlanovi((prev) => prev.map((p) => (p.id === id ? azurirano : p)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri vracanju na doradu');
    }
  };

  const obrisi = async (id: string) => {
    if (!confirm('Obrisati operativni plan? Operacija je trajna.')) return;
    try {
      await api.delete(`/planovi/operativni/${id}`);
      setPlanovi((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri brisanju');
    }
  };

  const kloniraj = async (id: string) => {
    const novaGodina = prompt('Kloniraj u koju skolsku godinu? (format: 2025/2026)');
    if (!novaGodina) return;
    if (!novaGodina.match(/^\d{4}\/\d{4}$/)) {
      alert('Format mora biti 2025/2026');
      return;
    }
    try {
      const klon = await api.post<OperativniPlanResponse>(
        `/planovi/operativni/${id}/kloniraj`,
        undefined,
        { params: { novaSkolskaGodina: novaGodina } }
      );
      setPlanovi((prev) => [klon, ...prev]);
      alert(`Plan kloniran. Status: ${klon.status}, godina: ${klon.skolskaGodina}`);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri kloniranju');
    }
  };

  const skiniFajl = async (planId: string, format: 'word' | 'pdf') => {
    try {
      const blob = await api.get<Blob>(`/planovi/operativni/${planId}/download/${format}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `operativni-plan-${planId.slice(0, 8)}.${format === 'word' ? 'docx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri preuzimanju');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={sviRezim ? 'Operativni planovi (sve u skoli)' : 'Moji operativni planovi'}
        description={
          sviRezim
            ? 'Pregled svih mesecnih operativnih planova u skoli'
            : 'Mesecni operativni plan po predmetu i odeljenju. Word i PDF se automatski generisu.'
        }
        action={
          (user?.uloga === 'NASTAVNIK' || user?.uloga === 'KOORDINATOR') && (
            <Link to="/planovi/operativni/novi">
              <Button size="lg">
                <Plus className="w-4 h-4" /> Novi plan
              </Button>
            </Link>
          )
        }
      />

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam planove...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={ucitaj} className="ml-auto">
            Pokusaj ponovo
          </Button>
        </div>
      ) : planovi.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          {sviRezim ? 'Jos nema operativnih planova u skoli.' : 'Klikni "Novi plan" da kreiras prvi operativni plan.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {sviRezim && <Th>Nastavnik</Th>}
                <Th>Predmet</Th>
                <Th>Odeljenje</Th>
                <Th>Mesec</Th>
                <Th>Sk. godina</Th>
                <Th>Status</Th>
                <Th>Casovi</Th>
                <Th className="text-right">Akcije</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {planovi.map((p) => {
                const sm = STATUS_META[p.status];
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    {sviRezim && <Td className="font-medium text-gray-900">{p.nastavnikIme}</Td>}
                    <Td>
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-purple-500" />
                        {p.predmetNaziv}
                      </div>
                    </Td>
                    <Td>{p.odeljenjeLabel}</Td>
                    <Td>{MESEC_LABEL[p.mesec] ?? p.mesec}</Td>
                    <Td>{p.skolskaGodina}</Td>
                    <Td>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sm.bg} ${sm.text}`}>
                        {sm.label}
                      </span>
                      {p.status === 'VRACENO_NA_DORADU' && p.razlogVracanja && (
                        <div className="mt-1 text-xs text-amber-700 max-w-xs whitespace-normal" title={p.razlogVracanja}>
                          <span className="font-medium">Razlog:</span> {p.razlogVracanja}
                        </div>
                      )}
                    </Td>
                    <Td className="text-xs text-gray-500">{p.stavke?.length ?? 0} casova</Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {p.imaWord && (
                          <Button size="sm" variant="outline" onClick={() => skiniFajl(p.id, 'word')}>
                            <Download className="w-3.5 h-3.5" /> .docx
                          </Button>
                        )}
                        {p.imaPdf && (
                          <Button size="sm" variant="outline" onClick={() => skiniFajl(p.id, 'pdf')}>
                            <Download className="w-3.5 h-3.5" /> .pdf
                          </Button>
                        )}
                        {(user?.uloga === 'PP_SLUZBA' || user?.uloga === 'KOORDINATOR') &&
                          p.status === 'PODNET' && (
                            <>
                              <Button size="sm" onClick={() => odobri(p.id)} title="Odobri (arhivira plan)"
                                className="bg-green-600 hover:bg-green-700">
                                <Check className="w-3.5 h-3.5" /> Odobri
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => odbij(p.id)} title="Vrati na doradu"
                                className="text-amber-700 border-amber-300 hover:bg-amber-50">
                                <XCircle className="w-3.5 h-3.5" /> Odbij
                              </Button>
                            </>
                          )}
                        {user?.uloga === 'KOORDINATOR' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => obrisi(p.id)}
                            title="Obrisi plan"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {(user?.uloga === 'NASTAVNIK' || user?.uloga === 'KOORDINATOR') && p.nastavnikId === user.id && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => kloniraj(p.id)} title="Kloniraj u drugu godinu">
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            {(p.status === 'NACRT' || p.status === 'VRACENO_NA_DORADU') && (
                              <>
                                <Link to={`/planovi/operativni/${p.id}`}>
                                  <Button size="sm" variant="outline" title="Izmeni nacrt">
                                    <Pencil className="w-3.5 h-3.5" /> Izmeni
                                  </Button>
                                </Link>
                                <Button size="sm" onClick={() => podnesi(p.id)} title="Podnesi plan">
                                  <Send className="w-3.5 h-3.5" /> Podnesi
                                </Button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-4 text-sm text-gray-700 ${className}`}>{children}</td>;
}

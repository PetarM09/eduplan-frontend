import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import { AlertCircle, Download, FileText, Loader2, Plus, Send, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { GodisnjiPlanResponse, PlanStatus } from '@/lib/types';

const STATUS_META: Record<PlanStatus, { label: string; bg: string; text: string }> = {
  NACRT: { label: 'Nacrt', bg: 'bg-gray-100', text: 'text-gray-700' },
  PODNET: { label: 'Podnet', bg: 'bg-blue-100', text: 'text-blue-700' },
  VRACENO_NA_DORADU: { label: 'Vracen na doradu', bg: 'bg-amber-100', text: 'text-amber-700' },
  ARHIVIRAN: { label: 'Arhiviran', bg: 'bg-gray-100', text: 'text-gray-500' },
};

export function GodisnjiPlanoviPage() {
  const { user } = useAuth();
  const [planovi, setPlanovi] = useState<GodisnjiPlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sviRezim = user?.uloga !== 'NASTAVNIK';

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const path = sviRezim ? '/planovi/godisnji/svi' : '/planovi/godisnji/me';
      const data = await api.get<GodisnjiPlanResponse[]>(path);
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
      const azurirano = await api.post<GodisnjiPlanResponse>(`/planovi/godisnji/${id}/podnesi`);
      setPlanovi((prev) => prev.map((p) => (p.id === id ? azurirano : p)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri podnosenju');
    }
  };

  const obrisi = async (id: string) => {
    if (!confirm('Obrisati godisnji plan? Operacija je trajna.')) return;
    try {
      await api.delete(`/planovi/godisnji/${id}`);
      setPlanovi((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri brisanju');
    }
  };

  const skiniFajl = async (planId: string, format: 'word' | 'pdf') => {
    try {
      const blob = await api.get<Blob>(`/planovi/godisnji/${planId}/download/${format}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `godisnji-plan-${planId.slice(0, 8)}.${format === 'word' ? 'docx' : 'pdf'}`;
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
        title={sviRezim ? 'Godisnji planovi (sve u skoli)' : 'Moji godisnji planovi'}
        description={
          sviRezim
            ? 'Pregled svih godisnjih planova rada u skoli'
            : 'Globalni plan rada po predmetu. Word i PDF se automatski generisu pri cuvanju.'
        }
        action={
          user?.uloga === 'NASTAVNIK' && (
            <Link to="/planovi/godisnji/novi">
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
          {sviRezim
            ? 'Jos nema unetih godisnjih planova u skoli.'
            : 'Jos nemas nijedan godisnji plan. Klikni "Novi plan" da kreiras prvi.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {sviRezim && <Th>Nastavnik</Th>}
                <Th>Predmet</Th>
                <Th>Razred</Th>
                <Th>Skolska godina</Th>
                <Th>Status</Th>
                <Th>Tema</Th>
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
                        <FileText className="w-4 h-4 text-blue-500" />
                        {p.predmetNaziv}
                      </div>
                    </Td>
                    <Td>{p.razred ? `${p.razred}.` : '—'}</Td>
                    <Td>{p.skolskaGodina}</Td>
                    <Td>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sm.bg} ${sm.text}`}>
                        {sm.label}
                      </span>
                    </Td>
                    <Td className="text-xs text-gray-500">{p.teme?.length ?? 0} tema</Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {p.imaWord && (
                          <Button size="sm" variant="outline" onClick={() => skiniFajl(p.id, 'word')} title="Word">
                            <Download className="w-3.5 h-3.5" /> .docx
                          </Button>
                        )}
                        {p.imaPdf && (
                          <Button size="sm" variant="outline" onClick={() => skiniFajl(p.id, 'pdf')} title="PDF">
                            <Download className="w-3.5 h-3.5" /> .pdf
                          </Button>
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
                        {user?.uloga === 'NASTAVNIK' && p.status === 'NACRT' && p.nastavnikId === user.id && (
                          <Button size="sm" onClick={() => podnesi(p.id)} title="Podnesi">
                            <Send className="w-3.5 h-3.5" /> Podnesi
                          </Button>
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

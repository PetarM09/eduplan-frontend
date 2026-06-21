import { useEffect, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import {
  AlertCircle,
  BookOpen,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';

interface TipSkoleResponse {
  id: string;
  kod: string;
  naziv: string;
  ukupnoRazreda: number;
  brojProfila: number;
}

interface ObrazovniProfilResponse {
  id: string;
  tipSkoleId: string;
  tipSkoleNaziv: string;
  ukupnoRazreda: number;
  kod: string;
  naziv: string;
  opis: string | null;
  brojPredmeta: number;
}

interface MasterPredmetResponse {
  id: string;
  obrazovniProfilId: string;
  razred: number;
  naziv: string;
  fondTeorija: number;
  fondVezbe: number;
  fondBlok: number;
  obavezan: boolean;
  redosled: number | null;
}

export function MasterKatalogPage() {
  const [tipovi, setTipovi] = useState<TipSkoleResponse[]>([]);
  const [profili, setProfili] = useState<ObrazovniProfilResponse[]>([]);
  const [predmeti, setPredmeti] = useState<MasterPredmetResponse[]>([]);

  const [izabraniTipId, setIzabraniTipId] = useState<string | null>(null);
  const [izabraniProfilId, setIzabraniProfilId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ucitajTipove();
  }, []);

  useEffect(() => {
    if (izabraniTipId) {
      ucitajProfile(izabraniTipId);
      setIzabraniProfilId(null);
      setPredmeti([]);
    }
  }, [izabraniTipId]);

  useEffect(() => {
    if (izabraniProfilId) {
      ucitajPredmete(izabraniProfilId);
    }
  }, [izabraniProfilId]);

  const ucitajTipove = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<TipSkoleResponse[]>('/master/tipovi-skole');
      setTipovi(data);
      if (data.length > 0 && !izabraniTipId) {
        setIzabraniTipId(data[0].id);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju');
    } finally {
      setLoading(false);
    }
  };

  const ucitajProfile = async (tipId: string) => {
    try {
      const data = await api.get<ObrazovniProfilResponse[]>('/master/profili', { params: { tipSkoleId: tipId } });
      setProfili(data);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri ucitavanju profila');
    }
  };

  const ucitajPredmete = async (profilId: string) => {
    try {
      const data = await api.get<MasterPredmetResponse[]>(`/master/profili/${profilId}/predmeti`);
      setPredmeti(data);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri ucitavanju predmeta');
    }
  };

  const dodajTip = async () => {
    const naziv = prompt('Naziv tipa skole (npr. "Gimnazija"):');
    if (!naziv?.trim()) return;
    const kod = prompt('Kod (npr. "GIMNAZIJA"):', naziv.toUpperCase().replace(/\s+/g, '_'));
    if (!kod?.trim()) return;
    const razredaStr = prompt('Ukupno razreda (1-12):', '4');
    const razreda = Number(razredaStr);
    if (!Number.isFinite(razreda) || razreda < 1 || razreda > 12) {
      alert('Razreda mora biti 1-12');
      return;
    }
    try {
      const novi = await api.post<TipSkoleResponse>('/master/tipovi-skole', {
        kod: kod.trim(),
        naziv: naziv.trim(),
        ukupnoRazreda: razreda,
      });
      setTipovi((prev) => [...prev, novi].sort((a, b) => a.naziv.localeCompare(b.naziv)));
      setIzabraniTipId(novi.id);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  const obrisiTip = async (t: TipSkoleResponse) => {
    if (t.brojProfila > 0) {
      alert(`Tip "${t.naziv}" ima ${t.brojProfila} profila — prvo obrisi profile.`);
      return;
    }
    if (!confirm(`Obrisati tip "${t.naziv}"?`)) return;
    try {
      await api.delete(`/master/tipovi-skole/${t.id}`);
      setTipovi((prev) => prev.filter((x) => x.id !== t.id));
      if (izabraniTipId === t.id) setIzabraniTipId(null);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  const dodajProfil = async () => {
    if (!izabraniTipId) return;
    const naziv = prompt('Naziv profila (npr. "Drustveno-jezicki smer"):');
    if (!naziv?.trim()) return;
    const kod = prompt('Kod profila (npr. "GIMNAZIJA_DRUSTVENI"):',
      naziv.toUpperCase().replace(/[^A-Z0-9]+/g, '_'));
    if (!kod?.trim()) return;
    const opis = prompt('Opis (opcionalno):') ?? '';
    try {
      const novi = await api.post<ObrazovniProfilResponse>('/master/profili', {
        tipSkoleId: izabraniTipId,
        kod: kod.trim(),
        naziv: naziv.trim(),
        opis: opis.trim() || null,
      });
      setProfili((prev) => [...prev, novi].sort((a, b) => a.naziv.localeCompare(b.naziv)));
      ucitajTipove();
      setIzabraniProfilId(novi.id);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  const obrisiProfil = async (p: ObrazovniProfilResponse) => {
    if (!confirm(`Obrisati profil "${p.naziv}"? Svi predmeti (${p.brojPredmeta}) ce takodje biti obrisani.`)) return;
    try {
      await api.delete(`/master/profili/${p.id}`);
      setProfili((prev) => prev.filter((x) => x.id !== p.id));
      ucitajTipove();
      if (izabraniProfilId === p.id) {
        setIzabraniProfilId(null);
        setPredmeti([]);
      }
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  const dodajPredmet = async (razred: number) => {
    if (!izabraniProfilId) return;
    const naziv = prompt(`Naziv predmeta (razred ${razred}):`);
    if (!naziv?.trim()) return;
    const fondStr = prompt('Nedeljni fond u formatu T+V+B (npr. 2+1+0):', '2+0+0');
    if (!fondStr?.trim()) return;
    const m = fondStr.trim().match(/^(\d+)\s*\+\s*(\d+)\s*\+\s*(\d+)$/);
    if (!m) {
      alert('Format mora biti T+V+B (npr. 2+1+0)');
      return;
    }
    const [, tStr, vStr, bStr] = m;
    const t = Number(tStr), v = Number(vStr), b = Number(bStr);
    if (t + v + b <= 0) {
      alert('Bar jedan od T/V/B mora biti veci od 0');
      return;
    }
    try {
      const novi = await api.post<MasterPredmetResponse>(`/master/profili/${izabraniProfilId}/predmeti`, {
        razred,
        naziv: naziv.trim(),
        fondTeorija: t,
        fondVezbe: v,
        fondBlok: b,
        obavezan: true,
      });
      setPredmeti((prev) => [...prev, novi]);
      setProfili((prev) => prev.map((p) =>
        p.id === izabraniProfilId ? { ...p, brojPredmeta: p.brojPredmeta + 1 } : p));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  const obrisiPredmet = async (p: MasterPredmetResponse) => {
    if (!confirm(`Obrisati "${p.naziv}" (razred ${p.razred})?`)) return;
    try {
      await api.delete(`/master/predmeti/${p.id}`);
      setPredmeti((prev) => prev.filter((x) => x.id !== p.id));
      setProfili((prev) => prev.map((pr) =>
        pr.id === izabraniProfilId ? { ...pr, brojPredmeta: Math.max(0, pr.brojPredmeta - 1) } : pr));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  const izabraniProfil = profili.find((p) => p.id === izabraniProfilId);
  const ukupnoRazreda = izabraniProfil?.ukupnoRazreda ?? 0;

  return (
    <AppLayout>
      <PageHeader
        title="Master katalog"
        description="Globalna baza tipova skole, obrazovnih profila i predmeta. Skole biraju iz ovog kataloga prilikom onboardinga."
      />

      {loading ? (
        <div className="bg-card backdrop-blur rounded-2xl border border-border p-12 flex items-center justify-center text-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam katalog...
        </div>
      ) : error ? (
        <div className="bg-accent/15 border border-accent/40 rounded-2xl p-6 flex items-center gap-2 text-accent-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tipovi skole */}
          <div className="bg-card backdrop-blur rounded-2xl border border-border">
            <header className="p-4 border-b border-border flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-foreground">Tipovi skole</h2>
              <button onClick={dodajTip}
                className="ml-auto h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow shadow-primary/25 hover:bg-primary/90 transition-all flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Novi
              </button>
            </header>
            <ul className="divide-y divide-border">
              {tipovi.map((t) => (
                <li key={t.id}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    izabraniTipId === t.id
                      ? 'bg-accent/15 border-l-2 border-l-accent'
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => setIzabraniTipId(t.id)}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{t.naziv}</div>
                      <div className="text-xs text-muted-foreground">{t.kod} · {t.ukupnoRazreda} razreda · {t.brojProfila} profil(a)</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); obrisiTip(t); }}
                      className="text-muted-foreground hover:text-red-400" title="Obrisi">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
              {tipovi.length === 0 && (
                <li className="px-4 py-8 text-center text-muted-foreground text-sm">Nema tipova skole</li>
              )}
            </ul>
          </div>

          {/* Profili */}
          <div className="bg-card backdrop-blur rounded-2xl border border-border">
            <header className="p-4 border-b border-border flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-foreground">Obrazovni profili</h2>
              <button onClick={dodajProfil} disabled={!izabraniTipId}
                className="ml-auto h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Novi
              </button>
            </header>
            <ul className="divide-y divide-border">
              {izabraniTipId ? (
                profili.length === 0 ? (
                  <li className="px-4 py-8 text-center text-muted-foreground text-sm">Nema profila za ovaj tip</li>
                ) : (
                  profili.map((p) => (
                    <li key={p.id}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        izabraniProfilId === p.id
                          ? 'bg-accent/15 border-l-2 border-l-accent'
                          : 'hover:bg-secondary'
                      }`}
                      onClick={() => setIzabraniProfilId(p.id)}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{p.naziv}</div>
                          <div className="text-xs text-muted-foreground">{p.kod} · {p.brojPredmeta} predmet(a)</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); obrisiProfil(p); }}
                          className="text-muted-foreground hover:text-red-400" title="Obrisi">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))
                )
              ) : (
                <li className="px-4 py-8 text-center text-muted-foreground text-sm">Izaberi tip skole</li>
              )}
            </ul>
          </div>

          {/* Predmeti */}
          <div className="bg-card backdrop-blur rounded-2xl border border-border">
            <header className="p-4 border-b border-border flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-foreground">Predmeti</h2>
              {izabraniProfil && (
                <span className="ml-auto text-xs text-muted-foreground truncate max-w-[180px]" title={izabraniProfil.naziv}>
                  {izabraniProfil.naziv}
                </span>
              )}
            </header>
            {izabraniProfilId ? (
              <div className="divide-y divide-border">
                {Array.from({ length: ukupnoRazreda }, (_, i) => i + 1).map((razred) => {
                  const grupa = predmeti.filter((p) => p.razred === razred);
                  return (
                    <div key={razred} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-accent-700">{razred}. razred</h3>
                        <span className="text-xs text-muted-foreground">({grupa.length})</span>
                        <button onClick={() => dodajPredmet(razred)}
                          className="ml-auto h-7 px-2 rounded-md bg-accent/15 text-accent-700 text-xs hover:bg-accent/15 transition-colors flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Predmet
                        </button>
                      </div>
                      {grupa.length === 0 ? (
                        <p className="text-xs text-muted-foreground pl-2">Nema predmeta</p>
                      ) : (
                        <ul className="space-y-1">
                          {grupa.map((p) => (
                            <li key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary transition-colors">
                              <div className="flex-1">
                                <div className="text-sm text-foreground">{p.naziv}</div>
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-mono text-accent-700">{p.fondTeorija}+{p.fondVezbe}+{p.fondBlok}</span>
                                  {' '} (T+V+B nedeljno)
                                </div>
                              </div>
                              <button onClick={() => obrisiPredmet(p)}
                                className="text-muted-foreground hover:text-red-400" title="Obrisi">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">Izaberi profil</div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

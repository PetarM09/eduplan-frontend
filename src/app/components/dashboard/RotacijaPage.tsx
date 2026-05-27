import { useEffect, useMemo, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Plus,
  Repeat,
  Trash2,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type {
  Dan,
  DetekcijaVezbiResponse,
  KreirajRotacijuRequest,
  OdeljenjeResponse,
  RotacijaResponse,
} from '@/lib/types';

const DAN_LABEL: Record<Dan, string> = {
  PONEDELJAK: 'Pon',
  UTORAK: 'Uto',
  SREDA: 'Sre',
  CETVRTAK: 'Cet',
  PETAK: 'Pet',
  SUBOTA: 'Sub',
};

const DAN_REDOSLED: Dan[] = ['PONEDELJAK', 'UTORAK', 'SREDA', 'CETVRTAK', 'PETAK', 'SUBOTA'];

type Tab = 'lista' | 'novi' | 'detalj';

export function RotacijaPage() {
  const [tab, setTab] = useState<Tab>('lista');
  const [izabranaRotacijaId, setIzabranaRotacijaId] = useState<string | null>(null);

  return (
    <AppLayout>
      {tab === 'lista' && (
        <ListaRotacija
          onKreiraj={() => setTab('novi')}
          onOtvori={(id) => {
            setIzabranaRotacijaId(id);
            setTab('detalj');
          }}
        />
      )}
      {tab === 'novi' && (
        <NoviRotacijaWizard
          onOtkazi={() => setTab('lista')}
          onSnimljeno={(id) => {
            setIzabranaRotacijaId(id);
            setTab('detalj');
          }}
        />
      )}
      {tab === 'detalj' && izabranaRotacijaId && (
        <DetaljRotacije rotacijaId={izabranaRotacijaId} onNazad={() => setTab('lista')} />
      )}
    </AppLayout>
  );
}

// ============= LISTA =============

function ListaRotacija({
  onKreiraj,
  onOtvori,
}: {
  onKreiraj: () => void;
  onOtvori: (id: string) => void;
}) {
  const { user } = useAuth();
  const mojRezim = user?.uloga === 'NASTAVNIK';
  const [rotacije, setRotacije] = useState<RotacijaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const path = mojRezim ? '/rotacija/moje' : '/rotacija';
      const data = await api.get<RotacijaResponse[]>(path);
      setRotacije(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ucitaj();
  }, [mojRezim]);

  const obrisi = async (id: string) => {
    if (!confirm('Obrisati rotaciju sa svim dodelama?')) return;
    try {
      await api.delete(`/rotacija/${id}`);
      setRotacije((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  return (
    <>
      <PageHeader
        title={mojRezim ? 'Moje rotacije' : 'Rotacije'}
        description="Rotacioni raspored grupa ucenika za casove vezbi (auto-detekcija iz rasporeda)"
        action={
          user?.uloga === 'NASTAVNIK' && (
            <Button size="lg" onClick={onKreiraj}>
              <Plus className="w-4 h-4" /> Nova rotacija
            </Button>
          )
        }
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
      ) : rotacije.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          Jos nema rotacija. {user?.uloga === 'NASTAVNIK' && 'Klikni "Nova rotacija" da kreiras prvu.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <Th>Naziv</Th>
                {!mojRezim && <Th>Nastavnik</Th>}
                <Th>Odeljenje</Th>
                <Th>Sk. godina</Th>
                <Th>Grupe / nedelje</Th>
                <Th>Predmeti</Th>
                <Th className="text-right">Akcije</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rotacije.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onOtvori(r.id)}>
                  <Td className="font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-indigo-500" />
                      {r.naziv}
                    </div>
                  </Td>
                  {!mojRezim && <Td>{r.nastavnikIme}</Td>}
                  <Td>{r.odeljenjeLabel}</Td>
                  <Td>{r.skolskaGodina}</Td>
                  <Td>
                    {r.brojGrupa} grupa × {r.brojNedelja} ned.
                  </Td>
                  <Td className="text-xs text-gray-500">{r.predmeti.length}</Td>
                  <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                    {user?.uloga === 'NASTAVNIK' && r.nastavnikId === user.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => obrisi(r.id)}
                        title="Obrisi"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ============= WIZARD =============

interface UnosPredmet {
  profesorId: string;
  naziv: string;
  casovaNedeljno: number;
}

function NoviRotacijaWizard({
  onOtkazi,
  onSnimljeno,
}: {
  onOtkazi: () => void;
  onSnimljeno: (id: string) => void;
}) {
  const [korak, setKorak] = useState<1 | 2 | 3>(1);

  // Korak 1
  const [naziv, setNaziv] = useState('');
  const [odeljenja, setOdeljenja] = useState<OdeljenjeResponse[]>([]);
  const [odeljenjeId, setOdeljenjeId] = useState<string>('');
  const [skolskaGodina, setSkolskaGodina] = useState<string>('');

  // Korak 2
  const [detekcija, setDetekcija] = useState<DetekcijaVezbiResponse | null>(null);
  const [detekcijaLoading, setDetekcijaLoading] = useState(false);
  const [detekcijaError, setDetekcijaError] = useState<string | null>(null);
  const [predmeti, setPredmeti] = useState<UnosPredmet[]>([]);

  // Korak 3
  const [brojGrupa, setBrojGrupa] = useState<number>(2);
  const [brojNedelja, setBrojNedelja] = useState<number>(2);
  const [snimanje, setSnimanje] = useState(false);

  useEffect(() => {
    api
      .get<OdeljenjeResponse[]>('/odeljenja')
      .then((od) => {
        setOdeljenja(od);
        if (od.length > 0) setSkolskaGodina(od[0].skolskaGodina);
      })
      .catch(() => setOdeljenja([]));
  }, []);

  const idiNaKorak2 = async () => {
    if (!naziv.trim()) {
      alert('Naziv je obavezan');
      return;
    }
    if (!odeljenjeId) {
      alert('Izaberi odeljenje');
      return;
    }
    if (!/^\d{4}\/\d{4}$/.test(skolskaGodina)) {
      alert('Skolska godina mora biti u formatu 2025/2026');
      return;
    }
    setDetekcijaLoading(true);
    setDetekcijaError(null);
    try {
      const d = await api.get<DetekcijaVezbiResponse>(`/rotacija/vezbe/${odeljenjeId}`);
      setDetekcija(d);
      // Inicijalno: jedan red po profesoru sa svim njegovim casovima
      setPredmeti(
        d.profesori.map((p) => ({ profesorId: p.profesorId, naziv: '', casovaNedeljno: p.brojCasovaVezbi }))
      );
      setKorak(2);
    } catch (e) {
      setDetekcijaError(e instanceof ApiError ? e.message : 'Greska pri detekciji vezbi');
    } finally {
      setDetekcijaLoading(false);
    }
  };

  const sumePoProfesoru = useMemo(() => {
    const m: Record<string, number> = {};
    predmeti.forEach((p) => {
      m[p.profesorId] = (m[p.profesorId] ?? 0) + (p.casovaNedeljno || 0);
    });
    return m;
  }, [predmeti]);

  const sumeOK = useMemo(() => {
    if (!detekcija) return false;
    return detekcija.profesori.every(
      (p) => (sumePoProfesoru[p.profesorId] ?? 0) === p.brojCasovaVezbi
    );
  }, [detekcija, sumePoProfesoru]);

  const sviNaziviUneti = useMemo(() => predmeti.every((p) => p.naziv.trim().length > 0), [predmeti]);

  const dodajPredmet = (profesorId: string) => {
    setPredmeti((prev) => [...prev, { profesorId, naziv: '', casovaNedeljno: 1 }]);
  };

  const obrisiPredmet = (idx: number) => {
    setPredmeti((prev) => prev.filter((_, i) => i !== idx));
  };

  const azurirajPredmet = (idx: number, key: 'naziv' | 'casovaNedeljno', vrednost: string | number) => {
    setPredmeti((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [key]: vrednost } : p))
    );
  };

  const snimi = async () => {
    if (!detekcija) return;
    if (brojGrupa < 2 || brojGrupa > 12) {
      alert('Broj grupa mora biti izmedju 2 i 12');
      return;
    }
    if (brojNedelja < 1 || brojNedelja > 52) {
      alert('Broj nedelja mora biti izmedju 1 i 52');
      return;
    }
    setSnimanje(true);
    try {
      const body: KreirajRotacijuRequest = {
        naziv: naziv.trim(),
        odeljenjeId,
        skolskaGodina,
        brojGrupa,
        brojNedelja,
        predmeti: predmeti.map((p) => ({
          profesorId: p.profesorId,
          naziv: p.naziv.trim(),
          casovaNedeljno: p.casovaNedeljno,
        })),
      };
      const rez = await api.post<RotacijaResponse>('/rotacija', body);
      onSnimljeno(rez.id);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri snimanju');
    } finally {
      setSnimanje(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Nova rotacija"
        description={`Korak ${korak} od 3 — ${
          korak === 1 ? 'odeljenje' : korak === 2 ? 'profesori i predmeti vezbi' : 'grupe i nedelje'
        }`}
        action={
          <Button variant="outline" onClick={onOtkazi}>
            <ArrowLeft className="w-4 h-4" /> Otkazi
          </Button>
        }
      />

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <KorakIndikator broj={1} aktivan={korak === 1} prosao={korak > 1} label="Odeljenje" />
        <div className="flex-1 h-px bg-gray-200" />
        <KorakIndikator broj={2} aktivan={korak === 2} prosao={korak > 2} label="Predmeti" />
        <div className="flex-1 h-px bg-gray-200" />
        <KorakIndikator broj={3} aktivan={korak === 3} prosao={false} label="Generisi" />
      </div>

      {korak === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="naziv">Naziv rotacije</Label>
              <Input
                id="naziv"
                value={naziv}
                onChange={(e) => setNaziv(e.target.value)}
                placeholder="npr. Vezbe IV-4, prvo polugodiste"
              />
            </div>
            <div>
              <Label htmlFor="sk">Skolska godina</Label>
              <Input
                id="sk"
                value={skolskaGodina}
                onChange={(e) => setSkolskaGodina(e.target.value)}
                placeholder="2025/2026"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="od">Odeljenje</Label>
              <select
                id="od"
                value={odeljenjeId}
                onChange={(e) => setOdeljenjeId(e.target.value)}
                className="h-10 px-3 rounded-lg border border-gray-300 text-sm w-full"
              >
                <option value="">— izaberi —</option>
                {odeljenja.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} ({o.skolskaGodina})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sistem ce auto-detektovati profesore vezbi za izabrano odeljenje iz aktivne verzije rasporeda.
              </p>
            </div>
          </div>
          {detekcijaError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {detekcijaError}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="outline" onClick={onOtkazi}>
              Otkazi
            </Button>
            <Button onClick={idiNaKorak2} disabled={detekcijaLoading}>
              {detekcijaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Dalje
            </Button>
          </div>
        </div>
      )}

      {korak === 2 && detekcija && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Profesori vezbi — {detekcija.odeljenjeLabel}
              </h2>
              <p className="text-sm text-gray-500">
                Detektovano {detekcija.termini.length} termina vezbi, {detekcija.profesori.length} profesora.
                Suma casova po predmetima mora biti jednaka detektovanom broju casova.
              </p>
            </div>
          </div>

          {detekcija.profesori.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              U ovom odeljenju nema termina sa 2+ profesora — nema casova vezbi za rotaciju.
            </div>
          ) : (
            <div className="space-y-3">
              {detekcija.profesori.map((p) => {
                const suma = sumePoProfesoru[p.profesorId] ?? 0;
                const ok = suma === p.brojCasovaVezbi;
                const predmetiProfesora = predmeti
                  .map((pred, idx) => ({ ...pred, idx }))
                  .filter((x) => x.profesorId === p.profesorId);
                return (
                  <div
                    key={p.profesorId}
                    className={`rounded-xl border p-4 ${
                      ok ? 'border-gray-200' : 'border-amber-300 bg-amber-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{p.profesorIme}</p>
                        <p className="text-xs text-gray-500">
                          Iz rasporeda: <strong>{p.brojCasovaVezbi}</strong> casova vezbi
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        Suma: {suma} / {p.brojCasovaVezbi}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {predmetiProfesora.map((pred) => (
                        <div key={pred.idx} className="grid grid-cols-[1fr_120px_40px] gap-2 items-center">
                          <Input
                            value={pred.naziv}
                            onChange={(e) => azurirajPredmet(pred.idx, 'naziv', e.target.value)}
                            placeholder="Naziv predmeta"
                          />
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={pred.casovaNedeljno}
                            onChange={(e) => azurirajPredmet(pred.idx, 'casovaNedeljno', Number(e.target.value) || 0)}
                            title="Casova nedeljno"
                          />
                          <button
                            onClick={() => obrisiPredmet(pred.idx)}
                            disabled={predmetiProfesora.length === 1}
                            className="h-9 w-9 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                            title="Obrisi predmet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => dodajPredmet(p.profesorId)}
                        className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Jos jedan predmet
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between items-center gap-2 pt-2 border-t border-gray-100">
            <Button variant="outline" onClick={() => setKorak(1)}>
              <ArrowLeft className="w-4 h-4" /> Nazad
            </Button>
            <Button onClick={() => setKorak(3)} disabled={!sumeOK || !sviNaziviUneti}>
              <ArrowRight className="w-4 h-4" /> Dalje
            </Button>
          </div>
        </div>
      )}

      {korak === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Grupe i nedelje</h2>
            <p className="text-sm text-gray-500">
              Odeljenje se deli na grupe; rotacija prati casove vezbi kroz N nedelja.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grupe">Broj grupa</Label>
              <Input
                id="grupe"
                type="number"
                min={2}
                max={12}
                value={brojGrupa}
                onChange={(e) => setBrojGrupa(Number(e.target.value) || 2)}
              />
            </div>
            <div>
              <Label htmlFor="nedelje">Broj nedelja u ciklusu</Label>
              <Input
                id="nedelje"
                type="number"
                min={1}
                max={52}
                value={brojNedelja}
                onChange={(e) => setBrojNedelja(Number(e.target.value) || 1)}
              />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            Rotacija ce kreirati ukupno{' '}
            <strong>
              {brojNedelja} × {(detekcija?.termini.length ?? 0)} termina = {brojNedelja * (detekcija?.termini.length ?? 0)}
            </strong>{' '}
            dodela grupa.
          </div>

          <div className="flex justify-between items-center gap-2 pt-2 border-t border-gray-100">
            <Button variant="outline" onClick={() => setKorak(2)}>
              <ArrowLeft className="w-4 h-4" /> Nazad
            </Button>
            <Button onClick={snimi} disabled={snimanje}>
              {snimanje ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Kreiraj rotaciju
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function KorakIndikator({
  broj,
  aktivan,
  prosao,
  label,
}: {
  broj: number;
  aktivan: boolean;
  prosao: boolean;
  label: string;
}) {
  const klasa = aktivan
    ? 'bg-blue-600 text-white'
    : prosao
    ? 'bg-emerald-500 text-white'
    : 'bg-gray-200 text-gray-600';
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${klasa}`}>
        {prosao ? <CheckCircle2 className="w-4 h-4" /> : broj}
      </div>
      <span className={`text-xs font-medium ${aktivan ? 'text-blue-700' : prosao ? 'text-emerald-700' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}

// ============= DETALJ =============

function DetaljRotacije({ rotacijaId, onNazad }: { rotacijaId: string; onNazad: () => void }) {
  const [rot, setRot] = useState<RotacijaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<RotacijaResponse>(`/rotacija/${rotacijaId}`);
        setRot(data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Greska');
      } finally {
        setLoading(false);
      }
    })();
  }, [rotacijaId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 flex items-center justify-center text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam...
      </div>
    );
  }
  if (error || !rot) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-2 text-red-700">
        <AlertCircle className="w-5 h-5" />
        <span>{error ?? 'Nije pronadjeno'}</span>
        <Button size="sm" variant="outline" onClick={onNazad} className="ml-auto">
          Nazad
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={rot.naziv}
        description={`${rot.odeljenjeLabel} • ${rot.skolskaGodina} • ${rot.brojGrupa} grupa × ${rot.brojNedelja} nedelja • ${rot.nastavnikIme}`}
        action={
          <Button variant="outline" onClick={onNazad}>
            <ArrowLeft className="w-4 h-4" /> Nazad
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Predmeti vezbi</h3>
        <div className="flex flex-wrap gap-2">
          {rot.predmeti.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-medium"
            >
              {p.profesorIme} → <strong className="ml-1">{p.naziv}</strong> ({p.casovaNedeljno}č)
            </span>
          ))}
        </div>
      </div>

      {rot.nedelje.map((n) => (
        <NedeljaTabela key={n.brojNedelje} brojNedelje={n.brojNedelje} termini={n.termini} />
      ))}
    </>
  );
}

function NedeljaTabela({
  brojNedelje,
  termini,
}: {
  brojNedelje: number;
  termini: RotacijaResponse['nedelje'][number]['termini'];
}) {
  // Grupisi termine po (profesorIme, predmetNaziv) redovima i (dan, cas) kolonama
  const kljucevi = new Map<string, { profesorIme: string; predmetNaziv: string }>();
  const koloneSet = new Set<string>();
  const koloneSorted: { dan: Dan; cas: number; key: string }[] = [];

  for (const t of termini) {
    const key = `${t.profesorIme}|${t.predmetNaziv}`;
    if (!kljucevi.has(key)) kljucevi.set(key, { profesorIme: t.profesorIme, predmetNaziv: t.predmetNaziv });
    const colKey = `${t.dan}|${t.cas}`;
    if (!koloneSet.has(colKey)) {
      koloneSet.add(colKey);
      koloneSorted.push({ dan: t.dan, cas: t.cas, key: colKey });
    }
  }

  koloneSorted.sort((a, b) => {
    const da = DAN_REDOSLED.indexOf(a.dan);
    const db = DAN_REDOSLED.indexOf(b.dan);
    if (da !== db) return da - db;
    return a.cas - b.cas;
  });

  const redovi = Array.from(kljucevi.values()).sort((a, b) =>
    a.profesorIme.localeCompare(b.profesorIme) || a.predmetNaziv.localeCompare(b.predmetNaziv)
  );

  const dodelaMapa = new Map<string, number>();
  termini.forEach((t) => {
    const k = `${t.profesorIme}|${t.predmetNaziv}|${t.dan}|${t.cas}`;
    dodelaMapa.set(k, t.brojGrupe);
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <header className="p-4 border-b border-gray-200 flex items-center gap-2">
        <span className="inline-flex w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 items-center justify-center text-xs font-semibold">
          {brojNedelje}
        </span>
        <h3 className="font-semibold text-gray-900">Nedelja {brojNedelje}</h3>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Profesor (Predmet)
              </th>
              {koloneSorted.map((c) => (
                <th
                  key={c.key}
                  className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {DAN_LABEL[c.dan]} {c.cas}.č
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {redovi.map((r) => (
              <tr key={`${r.profesorIme}|${r.predmetNaziv}`}>
                <td className="px-4 py-2 font-medium text-gray-900">
                  {r.profesorIme} <span className="text-gray-500 font-normal">({r.predmetNaziv})</span>
                </td>
                {koloneSorted.map((c) => {
                  const g = dodelaMapa.get(`${r.profesorIme}|${r.predmetNaziv}|${c.dan}|${c.cas}`);
                  return (
                    <td key={c.key} className="px-3 py-2 text-center">
                      {g != null ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                          G{g}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============= HELPERI =============

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <td className={`px-6 py-4 text-sm text-gray-700 ${className}`} onClick={onClick}>
      {children}
    </td>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { SkolskaGodinaSelect } from '@/app/components/ui/SkolskaGodinaSelect';
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
  const nastavnikRezim = user?.uloga === 'NASTAVNIK';
  const mozePraviti = user?.uloga === 'KOORDINATOR';
  const mozeBrisati = user?.uloga === 'KOORDINATOR';
  const [rotacije, setRotacije] = useState<RotacijaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const path = nastavnikRezim ? '/rotacija/moje' : '/rotacija';
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
  }, [nastavnikRezim]);

  const obrisi = async (id: string) => {
    if (!confirm('Obrisati rotaciju sa svim dodelama?')) return;
    try {
      await api.delete(`/rotacija/${id}`);
      setRotacije((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  const opis = nastavnikRezim
    ? 'Rotacije u odeljenjima u kojima predajes vezbe (kreira koordinator skole)'
    : 'Rotacioni raspored grupa ucenika za casove vezbi (auto-detekcija iz rasporeda)';

  return (
    <>
      <PageHeader
        title={nastavnikRezim ? 'Rotacije u kojima predajem vezbe' : 'Rotacije'}
        description={opis}
        action={
          mozePraviti && (
            <Button size="lg" onClick={onKreiraj}>
              <Plus className="w-4 h-4" /> Nova rotacija
            </Button>
          )
        }
      />

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
      ) : rotacije.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border p-12 text-center text-muted-foreground">
          {nastavnikRezim
            ? 'Trenutno nisi ukljucen ni u jednu rotaciju. Koordinator skole pravi rotacije i bira profesore.'
            : mozePraviti
              ? 'Jos nema rotacija. Klikni "Nova rotacija" da kreiras prvu.'
              : 'Jos nema rotacija.'}
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <Th>Naziv</Th>
                <Th>Kreirao</Th>
                <Th>Odeljenje</Th>
                <Th>Sk. godina</Th>
                <Th>Grupe / nedelje</Th>
                <Th>Predmeti</Th>
                {mozeBrisati && <Th className="text-right">Akcije</Th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rotacije.map((r) => (
                <tr key={r.id} className="hover:bg-secondary cursor-pointer" onClick={() => onOtvori(r.id)}>
                  <Td className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-brand-500" />
                      {r.naziv}
                    </div>
                  </Td>
                  <Td>{r.nastavnikIme}</Td>
                  <Td>{r.odeljenjeLabel}</Td>
                  <Td>{r.skolskaGodina}</Td>
                  <Td>
                    {r.brojGrupa} grupa × {r.brojNedelja} ned.
                  </Td>
                  <Td className="text-xs text-muted-foreground">{r.predmeti.length}</Td>
                  {mozeBrisati && (
                    <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => obrisi(r.id)}
                        title="Obrisi"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </Td>
                  )}
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
  profesorId: string | null;
  profesorLabel: string;
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
  const [iskljuceni, setIskljuceni] = useState<Set<string>>(new Set());

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
      // Inicijalno: jedan red po SVAKOM profesoru (mapiranom ili ne) sa punim brojem casova.
      // Po default svi su ukljuceni (skup iskljucenih je prazan).
      setPredmeti(
        d.profesori.map((p) => ({
          profesorId: p.profesorId ?? null,
          profesorLabel: p.profesorIme,
          naziv: '',
          casovaNedeljno: p.brojCasovaVezbi,
        }))
      );
      setIskljuceni(new Set());
      setKorak(2);
    } catch (e) {
      setDetekcijaError(e instanceof ApiError ? e.message : 'Greska pri detekciji vezbi');
    } finally {
      setDetekcijaLoading(false);
    }
  };

  const toggleIskljucen = (p: { profesorId: string | null; profesorIme: string; brojCasovaVezbi: number }) => {
    setIskljuceni((prev) => {
      const novi = new Set(prev);
      const kljuc = p.profesorIme;
      const beseUkljucen = !novi.has(kljuc);
      if (beseUkljucen) {
        novi.add(kljuc);
        setPredmeti((prev2) => prev2.filter((pred) => pred.profesorLabel !== p.profesorIme));
      } else {
        novi.delete(kljuc);
        setPredmeti((prev2) => [
          ...prev2,
          {
            profesorId: p.profesorId ?? null,
            profesorLabel: p.profesorIme,
            naziv: '',
            casovaNedeljno: p.brojCasovaVezbi,
          },
        ]);
      }
      return novi;
    });
  };

  const sumePoLabelu = useMemo(() => {
    const m: Record<string, number> = {};
    predmeti.forEach((p) => {
      m[p.profesorLabel] = (m[p.profesorLabel] ?? 0) + (p.casovaNedeljno || 0);
    });
    return m;
  }, [predmeti]);

  const sumeOK = useMemo(() => {
    if (!detekcija) return false;
    return detekcija.profesori.every((p) => {
      if (iskljuceni.has(p.profesorIme)) return true;
      return (sumePoLabelu[p.profesorIme] ?? 0) === p.brojCasovaVezbi;
    });
  }, [detekcija, sumePoLabelu, iskljuceni]);

  const sviNaziviUneti = useMemo(() => predmeti.every((p) => p.naziv.trim().length > 0), [predmeti]);

  const barJedanUkljucen = useMemo(() => predmeti.length > 0, [predmeti]);

  const dodajPredmet = (profesorLabel: string, profesorId: string | null) => {
    setPredmeti((prev) => [...prev, { profesorId, profesorLabel, naziv: '', casovaNedeljno: 1 }]);
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
          profesorLabel: p.profesorLabel,
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

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <KorakIndikator broj={1} aktivan={korak === 1} prosao={korak > 1} label="Odeljenje" />
        <div className="flex-1 h-px bg-secondary" />
        <KorakIndikator broj={2} aktivan={korak === 2} prosao={korak > 2} label="Predmeti" />
        <div className="flex-1 h-px bg-secondary" />
        <KorakIndikator broj={3} aktivan={korak === 3} prosao={false} label="Generisi" />
      </div>

      {korak === 1 && (
        <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border p-6 space-y-5">
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
              <SkolskaGodinaSelect id="sk" value={skolskaGodina} onChange={setSkolskaGodina} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="od">Odeljenje</Label>
              <select
                id="od"
                value={odeljenjeId}
                onChange={(e) => setOdeljenjeId(e.target.value)}
                className="h-10 px-3 rounded-lg border border-input text-sm w-full"
              >
                <option value="">— izaberi —</option>
                {odeljenja.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} ({o.skolskaGodina})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Sistem ce auto-detektovati profesore vezbi za izabrano odeljenje iz aktivne verzije rasporeda.
              </p>
            </div>
          </div>
          {detekcijaError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {detekcijaError}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
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
        <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Profesori vezbi — {detekcija.odeljenjeLabel}
              </h2>
              <p className="text-sm text-muted-foreground">
                Iz rasporeda: <strong>{detekcija.ukupnoStavki}</strong> stavki kroz{' '}
                <strong>{detekcija.ukupnoTerminaUkupno}</strong> termina. Detektovano{' '}
                <strong>{detekcija.termini.length}</strong> termina vezbi (sa 2+ profesora),{' '}
                <strong>{detekcija.profesori.length}</strong> profesora ukljuceno.
              </p>
            </div>
          </div>

          {detekcija.profesori.length === 0 ? (
            <DebugRaspored detekcija={detekcija} />
          ) : (
            <div className="space-y-3">
              <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-xs text-brand-800">
                Profesori koji nisu u sistemu se i dalje mogu ukljuciti — rotacija ce raditi po
                imenu iz rasporeda. Kad takav profesor bude dodat kao korisnik (rucno ili kroz
                mapiranje u "Verzije rasporeda"), automatski se povezuje sa svojim rotacijama.
                Checkbox iskljucuje profesora iz OVE rotacije.
              </div>
              {detekcija.profesori.map((p) => {
                const iskljucen = iskljuceni.has(p.profesorIme);
                const inactive = iskljucen;
                const suma = sumePoLabelu[p.profesorIme] ?? 0;
                const ok = suma === p.brojCasovaVezbi;
                const predmetiProfesora = iskljucen
                  ? []
                  : predmeti
                      .map((pred, idx) => ({ ...pred, idx }))
                      .filter((x) => x.profesorLabel === p.profesorIme);
                return (
                  <div
                    key={p.profesorIme}
                    className={`rounded-xl border p-4 ${
                      iskljucen
                        ? 'border-border bg-muted opacity-70'
                        : ok
                          ? 'border-border'
                          : 'border-amber-300 bg-amber-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!iskljucen}
                          onChange={() => toggleIskljucen(p)}
                          className="w-4 h-4 rounded border-input text-brand-600 focus:ring-brand-500 cursor-pointer"
                          title="Ukljuci u rotaciju"
                        />
                        <div>
                          <p className={`font-medium ${iskljucen ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {p.profesorIme}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Iz rasporeda: <strong>{p.brojCasovaVezbi}</strong> casova vezbi
                          </p>
                        </div>
                        {!p.uSistemu && (
                          <span className="inline-flex items-center rounded-full bg-amber-200 text-amber-900 px-2 py-0.5 text-xs font-semibold">
                            Nije u sistemu
                          </span>
                        )}
                        {iskljucen && (
                          <span className="inline-flex items-center rounded-full bg-secondary text-foreground px-2 py-0.5 text-xs font-semibold">
                            Iskljucen
                          </span>
                        )}
                      </div>
                      {!inactive && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          Suma: {suma} / {p.brojCasovaVezbi}
                        </span>
                      )}
                    </div>
                    {iskljucen ? (
                      <p className="text-xs text-muted-foreground">
                        Profesor je iskljucen iz ove rotacije. Njegovi termini se nece uracunati u dodele grupa.
                      </p>
                    ) : (
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
                          onClick={() => dodajPredmet(p.profesorIme, p.profesorId)}
                          className="text-sm text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Jos jedan predmet
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between items-center gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setKorak(1)}>
              <ArrowLeft className="w-4 h-4" /> Nazad
            </Button>
            <Button
              onClick={() => setKorak(3)}
              disabled={!sumeOK || !sviNaziviUneti || !barJedanUkljucen}
            >
              <ArrowRight className="w-4 h-4" /> Dalje
            </Button>
          </div>
        </div>
      )}

      {korak === 3 && (
        <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Grupe i nedelje</h2>
            <p className="text-sm text-muted-foreground">
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
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-sm text-brand-800">
            Rotacija ce kreirati ukupno{' '}
            <strong>
              {brojNedelja} × {(detekcija?.termini.length ?? 0)} termina = {brojNedelja * (detekcija?.termini.length ?? 0)}
            </strong>{' '}
            dodela grupa.
          </div>

          <div className="flex justify-between items-center gap-2 pt-2 border-t border-border">
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

function DebugRaspored({ detekcija }: { detekcija: DetekcijaVezbiResponse }) {
  if (detekcija.ukupnoStavki === 0) {
    return (
      <div className="space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <p className="font-medium">Za ovo odeljenje raspored ne sadrzi nijednu stavku.</p>
          <p className="mt-1">
            Moguci razlozi: aktivna verzija rasporeda ne sadrzi ovo odeljenje, ili XML nije uspeo
            da povezivanje na ovo odeljenje. Proveri uvoz rasporeda.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <p className="font-medium">U ovom odeljenju nema termina sa 2+ profesora.</p>
        <p className="mt-1">
          Vezbe se detektuju kada vise profesora ima cas u istom terminu istog odeljenja. Sirovo
          stanje rasporeda za ovo odeljenje:
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">Dan</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">Cas</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">Profesori</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">Broj</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {detekcija.sviTermini.map((t, i) => {
              const vezba = t.profesoriIds.length >= 2;
              return (
                <tr key={i} className={vezba ? 'bg-emerald-50/40' : ''}>
                  <td className="px-3 py-1.5 text-foreground">{DAN_LABEL[t.dan]}</td>
                  <td className="px-3 py-1.5 text-foreground">{t.cas}.</td>
                  <td className="px-3 py-1.5 text-foreground">{t.profesoriImena.join(', ')}</td>
                  <td className="px-3 py-1.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        vezba ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {t.profesoriIds.length}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
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
    ? 'bg-brand-600 text-white'
    : prosao
    ? 'bg-emerald-500 text-white'
    : 'bg-secondary text-muted-foreground';
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${klasa}`}>
        {prosao ? <CheckCircle2 className="w-4 h-4" /> : broj}
      </div>
      <span className={`text-xs font-medium ${aktivan ? 'text-brand-700' : prosao ? 'text-emerald-700' : 'text-muted-foreground'}`}>
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
      <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border p-12 flex items-center justify-center text-muted-foreground">
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

      <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border p-5">
        <h3 className="font-semibold text-foreground mb-3">Predmeti vezbi</h3>
        <div className="flex flex-wrap gap-2">
          {rot.predmeti.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs font-medium"
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
    <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border overflow-hidden">
      <header className="p-4 border-b border-border flex items-center gap-2">
        <span className="inline-flex w-7 h-7 rounded-full bg-brand-100 text-brand-700 items-center justify-center text-xs font-semibold">
          {brojNedelje}
        </span>
        <h3 className="font-semibold text-foreground">Nedelja {brojNedelje}</h3>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Profesor (Predmet)
              </th>
              {koloneSorted.map((c) => (
                <th
                  key={c.key}
                  className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {DAN_LABEL[c.dan]} {c.cas}.č
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {redovi.map((r) => (
              <tr key={`${r.profesorIme}|${r.predmetNaziv}`}>
                <td className="px-4 py-2 font-medium text-foreground">
                  {r.profesorIme} <span className="text-muted-foreground font-normal">({r.predmetNaziv})</span>
                </td>
                {koloneSorted.map((c) => {
                  const g = dodelaMapa.get(`${r.profesorIme}|${r.predmetNaziv}|${c.dan}|${c.cas}`);
                  return (
                    <td key={c.key} className="px-3 py-2 text-center">
                      {g != null ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
                          G{g}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
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
    <th className={`px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider ${className}`}>
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
    <td className={`px-6 py-4 text-sm text-foreground ${className}`} onClick={onClick}>
      {children}
    </td>
  );
}

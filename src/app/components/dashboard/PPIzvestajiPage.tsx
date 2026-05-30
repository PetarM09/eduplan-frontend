import { useEffect, useMemo, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  AlertCircle,
  ArrowLeftCircle,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Plus,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type {
  OdeljenjeResponse,
  PPIzvestajRequest,
  PPIzvestajResponse,
  PPPeriod,
  PPStatus,
} from '@/lib/types';

const PERIOD_LABEL: Record<PPPeriod, string> = {
  PRVO_TROMESECJE: 'Prvo tromesecje',
  PRVO_POLUGODISTE: 'Prvo polugodiste',
  TRECE_TROMESECJE: 'Trece tromesecje',
  KRAJ_GODINE: 'Kraj godine',
};

const STATUS_META: Record<PPStatus, { label: string; bg: string }> = {
  NACRT: { label: 'Nacrt', bg: 'bg-gray-100 text-gray-700' },
  PODNET: { label: 'Podnet', bg: 'bg-blue-100 text-blue-700' },
  PRIHVACEN: { label: 'Prihvacen', bg: 'bg-emerald-100 text-emerald-700' },
  VRACENO_NA_DORADU: { label: 'Vracen na doradu', bg: 'bg-amber-100 text-amber-700' },
};

const VLADANJE_KLJUCEVI = ['primerno', 'vrloDobro', 'dobro', 'zadovoljavajuce', 'nezadovoljavajuce'] as const;
const VLADANJE_LABEL: Record<(typeof VLADANJE_KLJUCEVI)[number], string> = {
  primerno: 'Primerno',
  vrloDobro: 'Vrlo dobro',
  dobro: 'Dobro',
  zadovoljavajuce: 'Zadovoljavajuce',
  nezadovoljavajuce: 'Nezadovoljavajuce',
};

const USPEH_KLJUCEVI = ['odlican', 'vrloDobar', 'dobar', 'dovoljan', 'nedovoljan'] as const;
const USPEH_LABEL: Record<(typeof USPEH_KLJUCEVI)[number], string> = {
  odlican: 'Odlican (5)',
  vrloDobar: 'Vrlo dobar (4)',
  dobar: 'Dobar (3)',
  dovoljan: 'Dovoljan (2)',
  nedovoljan: 'Nedovoljan (1)',
};

interface FormaPodaci {
  ukupnoUcenika: number;
  ucenikaMuski: number;
  ucenikaZenski: number;
  opravdanaIzostanci: number;
  neopravdanaIzostanci: number;
  vladanje: Record<string, number>;
  uspeh: Record<string, number>;
  problemi: string;
  mere: string;
}

function praznaForma(): FormaPodaci {
  return {
    ukupnoUcenika: 0,
    ucenikaMuski: 0,
    ucenikaZenski: 0,
    opravdanaIzostanci: 0,
    neopravdanaIzostanci: 0,
    vladanje: Object.fromEntries(VLADANJE_KLJUCEVI.map((k) => [k, 0])),
    uspeh: Object.fromEntries(USPEH_KLJUCEVI.map((k) => [k, 0])),
    problemi: '',
    mere: '',
  };
}

function formaIzPodataka(podaci: Record<string, unknown> | null | undefined): FormaPodaci {
  const f = praznaForma();
  if (!podaci) return f;
  const broj = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);
  f.ukupnoUcenika = broj(podaci.ukupnoUcenika);
  f.ucenikaMuski = broj(podaci.ucenikaMuski);
  f.ucenikaZenski = broj(podaci.ucenikaZenski);
  const pris = podaci.prisustvo as Record<string, unknown> | undefined;
  if (pris) {
    f.opravdanaIzostanci = broj(pris.opravdana);
    f.neopravdanaIzostanci = broj(pris.neopravdana);
  }
  const vlad = podaci.vladanje as Record<string, unknown> | undefined;
  if (vlad) VLADANJE_KLJUCEVI.forEach((k) => (f.vladanje[k] = broj(vlad[k])));
  const usp = podaci.uspeh as Record<string, unknown> | undefined;
  if (usp) USPEH_KLJUCEVI.forEach((k) => (f.uspeh[k] = broj(usp[k])));
  f.problemi = typeof podaci.problemi === 'string' ? podaci.problemi : '';
  f.mere = typeof podaci.mere === 'string' ? podaci.mere : '';
  return f;
}

function formaUPodatke(f: FormaPodaci): Record<string, unknown> {
  return {
    ukupnoUcenika: f.ukupnoUcenika,
    ucenikaMuski: f.ucenikaMuski,
    ucenikaZenski: f.ucenikaZenski,
    prisustvo: { opravdana: f.opravdanaIzostanci, neopravdana: f.neopravdanaIzostanci },
    vladanje: f.vladanje,
    uspeh: f.uspeh,
    problemi: f.problemi,
    mere: f.mere,
  };
}

function trenutnaSkolskaGodina(): string {
  const d = new Date();
  const m = d.getMonth() + 1;
  const y = d.getFullYear();
  return m >= 9 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

export function PPIzvestajiPage() {
  const { user } = useAuth();
  const sviRezim = user?.uloga !== 'NASTAVNIK';
  const mozePrihvati = user?.uloga === 'PP_SLUZBA' || user?.uloga === 'DIREKTOR';

  const [izvestaji, setIzvestaji] = useState<PPIzvestajResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filteri
  const [filterSkolskaGodina, setFilterSkolskaGodina] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<PPPeriod | ''>('');
  const [filterStatus, setFilterStatus] = useState<PPStatus | ''>('');

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editIzv, setEditIzv] = useState<PPIzvestajResponse | null>(null);
  const [editOdeljenjeId, setEditOdeljenjeId] = useState<string>('');
  const [editPeriod, setEditPeriod] = useState<PPPeriod>('PRVO_POLUGODISTE');
  const [editSkolskaGodina, setEditSkolskaGodina] = useState<string>(trenutnaSkolskaGodina());
  const [formaPodaci, setFormaPodaci] = useState<FormaPodaci>(praznaForma());
  const [snimanje, setSnimanje] = useState(false);

  // moja odeljenja (samo nastavnik kad pravi novi)
  const [mojaOdeljenja, setMojaOdeljenja] = useState<OdeljenjeResponse[]>([]);

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const path = sviRezim ? '/pp/izvestaji/svi' : '/pp/izvestaji/moji';
      const data = await api.get<PPIzvestajResponse[]>(path, {
        params: {
          skolskaGodina: filterSkolskaGodina || undefined,
          period: sviRezim ? filterPeriod || undefined : undefined,
          status: sviRezim ? filterStatus || undefined : undefined,
        },
      });
      setIzvestaji(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ucitaj();
  }, [sviRezim, filterSkolskaGodina, filterPeriod, filterStatus]);

  useEffect(() => {
    if (user?.uloga !== 'NASTAVNIK' && user?.uloga !== 'KOORDINATOR') return;
    api
      .get<OdeljenjeResponse[]>('/odeljenja')
      .then((sve) => setMojaOdeljenja(sve.filter((o) => o.staresinaId === user.id)))
      .catch(() => setMojaOdeljenja([]));
  }, [user]);

  const otvoriNovi = () => {
    setEditIzv(null);
    setEditOdeljenjeId(mojaOdeljenja[0]?.id ?? '');
    setEditPeriod('PRVO_POLUGODISTE');
    setEditSkolskaGodina(trenutnaSkolskaGodina());
    setFormaPodaci(praznaForma());
    setModalOpen(true);
  };

  const otvoriEdit = (iz: PPIzvestajResponse) => {
    setEditIzv(iz);
    setEditOdeljenjeId(iz.odeljenjeId);
    setEditPeriod(iz.period);
    setEditSkolskaGodina(iz.skolskaGodina);
    setFormaPodaci(formaIzPodataka(iz.podaci));
    setModalOpen(true);
  };

  const snimi = async () => {
    if (!editOdeljenjeId || !/^\d{4}\/\d{4}$/.test(editSkolskaGodina)) {
      alert('Odeljenje i sk. godina (format 2025/2026) su obavezni');
      return;
    }
    setSnimanje(true);
    try {
      const body: PPIzvestajRequest = {
        odeljenjeId: editOdeljenjeId,
        period: editPeriod,
        skolskaGodina: editSkolskaGodina,
        podaci: formaUPodatke(formaPodaci),
      };
      const rez = await api.post<PPIzvestajResponse>('/pp/izvestaj', body);
      setIzvestaji((prev) => {
        const idx = prev.findIndex((p) => p.id === rez.id);
        if (idx >= 0) {
          const kopija = [...prev];
          kopija[idx] = rez;
          return kopija;
        }
        return [rez, ...prev];
      });
      setModalOpen(false);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri snimanju');
    } finally {
      setSnimanje(false);
    }
  };

  const podnesi = async (id: string) => {
    try {
      const rez = await api.post<PPIzvestajResponse>(`/pp/izvestaj/${id}/podnesi`);
      setIzvestaji((prev) => prev.map((p) => (p.id === id ? rez : p)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  const prihvati = async (id: string) => {
    try {
      const rez = await api.post<PPIzvestajResponse>(`/pp/izvestaj/${id}/prihvati`);
      setIzvestaji((prev) => prev.map((p) => (p.id === id ? rez : p)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  const vratiNaDoradu = async (id: string) => {
    if (!confirm('Vratiti izvestaj na doradu staresini?')) return;
    try {
      const rez = await api.post<PPIzvestajResponse>(`/pp/izvestaj/${id}/vrati-na-doradu`);
      setIzvestaji((prev) => prev.map((p) => (p.id === id ? rez : p)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    }
  };

  const obrisi = async (id: string) => {
    if (!confirm('Obrisati PP izvestaj? Operacija je trajna.')) return;
    try {
      await api.delete(`/pp/izvestaj/${id}`);
      setIzvestaji((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri brisanju');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={sviRezim ? 'PP izvestaji (svi staresine)' : 'Moji PP izvestaji'}
        description="Tromesecje / polugodiste / kraj godine — izvestaj staresine o odeljenju"
        action={
          (user?.uloga === 'NASTAVNIK' || user?.uloga === 'KOORDINATOR') &&
          mojaOdeljenja.length > 0 && (
            <Button size="lg" onClick={otvoriNovi}>
              <Plus className="w-4 h-4" /> Novi izvestaj
            </Button>
          )
        }
      />

      {/* Filteri */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="f-godina">Skolska godina</Label>
          <Input
            id="f-godina"
            value={filterSkolskaGodina}
            onChange={(e) => setFilterSkolskaGodina(e.target.value)}
            placeholder="2025/2026"
            className="w-32"
          />
        </div>
        {sviRezim && (
          <>
            <div>
              <Label htmlFor="f-period">Period</Label>
              <select
                id="f-period"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as PPPeriod | '')}
                className="h-10 px-3 rounded-lg border border-gray-300 text-sm"
              >
                <option value="">— svi —</option>
                {(Object.keys(PERIOD_LABEL) as PPPeriod[]).map((p) => (
                  <option key={p} value={p}>
                    {PERIOD_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="f-status">Status</Label>
              <select
                id="f-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as PPStatus | '')}
                className="h-10 px-3 rounded-lg border border-gray-300 text-sm"
              >
                <option value="">— svi —</option>
                {(Object.keys(STATUS_META) as PPStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        {(filterSkolskaGodina || filterPeriod || filterStatus) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterSkolskaGodina('');
              setFilterPeriod('');
              setFilterStatus('');
            }}
          >
            Resetuj
          </Button>
        )}
      </div>

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
      ) : izvestaji.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          {user?.uloga === 'NASTAVNIK' && mojaOdeljenja.length === 0
            ? 'Nisi staresina ni jednom odeljenju, pa ne mozes praviti izvestaje.'
            : 'Nema izvestaja po ovim filterima.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {sviRezim && <Th>Staresina</Th>}
                <Th>Odeljenje</Th>
                <Th>Period</Th>
                <Th>Sk. godina</Th>
                <Th>Status</Th>
                <Th>Ucenika</Th>
                <Th className="text-right">Akcije</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {izvestaji.map((iz) => {
                const sm = STATUS_META[iz.status];
                const mojIzvestaj = iz.staresinaId === user?.id;
                const ukupno = (iz.podaci?.ukupnoUcenika as number | undefined) ?? '—';
                return (
                  <tr key={iz.id} className="hover:bg-gray-50">
                    {sviRezim && <Td className="font-medium text-gray-900">{iz.staresinaIme}</Td>}
                    <Td>
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                        {iz.odeljenjeLabel}
                      </div>
                    </Td>
                    <Td>{PERIOD_LABEL[iz.period]}</Td>
                    <Td>{iz.skolskaGodina}</Td>
                    <Td>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sm.bg}`}
                      >
                        {sm.label}
                      </span>
                    </Td>
                    <Td className="text-xs text-gray-500">{ukupno}</Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => otvoriEdit(iz)}>
                          Pregled
                        </Button>
                        {(user?.uloga === 'NASTAVNIK' || user?.uloga === 'KOORDINATOR') && mojIzvestaj && iz.status !== 'PRIHVACEN' && iz.status !== 'PODNET' && (
                          <Button size="sm" onClick={() => podnesi(iz.id)}>
                            <Send className="w-3.5 h-3.5" /> Podnesi
                          </Button>
                        )}
                        {mozePrihvati && iz.status === 'PODNET' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => vratiNaDoradu(iz.id)} title="Vrati na doradu">
                              <ArrowLeftCircle className="w-3.5 h-3.5" /> Vrati
                            </Button>
                            <Button size="sm" onClick={() => prihvati(iz.id)} title="Prihvati">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Prihvati
                            </Button>
                          </>
                        )}
                        {user?.uloga === 'KOORDINATOR' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => obrisi(iz.id)}
                            title="Obrisi izvestaj"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      <PPModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editIzv={editIzv}
        odeljenja={mojaOdeljenja}
        odeljenjeId={editOdeljenjeId}
        setOdeljenjeId={setEditOdeljenjeId}
        period={editPeriod}
        setPeriod={setEditPeriod}
        skolskaGodina={editSkolskaGodina}
        setSkolskaGodina={setEditSkolskaGodina}
        forma={formaPodaci}
        setForma={setFormaPodaci}
        onSnimi={snimi}
        snimanje={snimanje}
        readonly={editIzv ? editIzv.staresinaId !== user?.id || editIzv.status === 'PRIHVACEN' : false}
      />
    </AppLayout>
  );
}

// ============= MODAL =============

interface ModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editIzv: PPIzvestajResponse | null;
  odeljenja: OdeljenjeResponse[];
  odeljenjeId: string;
  setOdeljenjeId: (v: string) => void;
  period: PPPeriod;
  setPeriod: (v: PPPeriod) => void;
  skolskaGodina: string;
  setSkolskaGodina: (v: string) => void;
  forma: FormaPodaci;
  setForma: (v: FormaPodaci) => void;
  onSnimi: () => void;
  snimanje: boolean;
  readonly: boolean;
}

function PPModal({
  open,
  onOpenChange,
  editIzv,
  odeljenja,
  odeljenjeId,
  setOdeljenjeId,
  period,
  setPeriod,
  skolskaGodina,
  setSkolskaGodina,
  forma,
  setForma,
  onSnimi,
  snimanje,
  readonly,
}: ModalProps) {
  const updateNum = (kljuc: keyof FormaPodaci, vrednost: number) =>
    setForma({ ...forma, [kljuc]: vrednost });
  const updateVladanje = (k: string, v: number) =>
    setForma({ ...forma, vladanje: { ...forma.vladanje, [k]: v } });
  const updateUspeh = (k: string, v: number) =>
    setForma({ ...forma, uspeh: { ...forma.uspeh, [k]: v } });

  const sumaVladanja = useMemo(
    () => Object.values(forma.vladanje).reduce((a, b) => a + b, 0),
    [forma.vladanje]
  );
  const sumaUspeha = useMemo(
    () => Object.values(forma.uspeh).reduce((a, b) => a + b, 0),
    [forma.uspeh]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editIzv ? `Pregled / izmena (${editIzv.odeljenjeLabel})` : 'Novi PP izvestaj'}
          </DialogTitle>
          <DialogDescription>
            {readonly
              ? 'Izvestaj je samo za pregled (prihvacen ili nisi vlasnik).'
              : 'Polja se mogu menjati dok izvestaj nije prihvacen.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Osnovni podaci */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Odeljenje</Label>
              {editIzv ? (
                <p className="h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm flex items-center">
                  {editIzv.odeljenjeLabel}
                </p>
              ) : (
                <select
                  value={odeljenjeId}
                  onChange={(e) => setOdeljenjeId(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-gray-300 text-sm w-full"
                  disabled={readonly}
                >
                  {odeljenja.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label} ({o.skolskaGodina})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <Label>Period</Label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PPPeriod)}
                className="h-10 px-3 rounded-lg border border-gray-300 text-sm w-full"
                disabled={!!editIzv || readonly}
              >
                {(Object.keys(PERIOD_LABEL) as PPPeriod[]).map((p) => (
                  <option key={p} value={p}>
                    {PERIOD_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Skolska godina</Label>
              <Input
                value={skolskaGodina}
                onChange={(e) => setSkolskaGodina(e.target.value)}
                placeholder="2025/2026"
                disabled={!!editIzv || readonly}
              />
            </div>
          </div>

          {/* Brojke učenika */}
          <Sekcija naslov="Struktura odeljenja">
            <div className="grid grid-cols-3 gap-3">
              <NumPolje
                label="Ukupno ucenika"
                value={forma.ukupnoUcenika}
                onChange={(v) => updateNum('ukupnoUcenika', v)}
                readonly={readonly}
              />
              <NumPolje
                label="Muski"
                value={forma.ucenikaMuski}
                onChange={(v) => updateNum('ucenikaMuski', v)}
                readonly={readonly}
              />
              <NumPolje
                label="Zenski"
                value={forma.ucenikaZenski}
                onChange={(v) => updateNum('ucenikaZenski', v)}
                readonly={readonly}
              />
            </div>
          </Sekcija>

          {/* Izostanci */}
          <Sekcija naslov="Izostanci">
            <div className="grid grid-cols-2 gap-3">
              <NumPolje
                label="Opravdani"
                value={forma.opravdanaIzostanci}
                onChange={(v) => updateNum('opravdanaIzostanci', v)}
                readonly={readonly}
              />
              <NumPolje
                label="Neopravdani"
                value={forma.neopravdanaIzostanci}
                onChange={(v) => updateNum('neopravdanaIzostanci', v)}
                readonly={readonly}
              />
            </div>
          </Sekcija>

          {/* Vladanje */}
          <Sekcija
            naslov="Vladanje"
            badge={
              forma.ukupnoUcenika > 0 && sumaVladanja !== forma.ukupnoUcenika
                ? `Suma ${sumaVladanja} (od ${forma.ukupnoUcenika})`
                : `Suma ${sumaVladanja}`
            }
            badgeColor={
              forma.ukupnoUcenika > 0 && sumaVladanja !== forma.ukupnoUcenika
                ? 'amber'
                : 'gray'
            }
          >
            <div className="grid grid-cols-5 gap-3">
              {VLADANJE_KLJUCEVI.map((k) => (
                <NumPolje
                  key={k}
                  label={VLADANJE_LABEL[k]}
                  value={forma.vladanje[k] ?? 0}
                  onChange={(v) => updateVladanje(k, v)}
                  readonly={readonly}
                />
              ))}
            </div>
          </Sekcija>

          {/* Uspeh */}
          <Sekcija
            naslov="Uspeh"
            badge={
              forma.ukupnoUcenika > 0 && sumaUspeha !== forma.ukupnoUcenika
                ? `Suma ${sumaUspeha} (od ${forma.ukupnoUcenika})`
                : `Suma ${sumaUspeha}`
            }
            badgeColor={
              forma.ukupnoUcenika > 0 && sumaUspeha !== forma.ukupnoUcenika ? 'amber' : 'gray'
            }
          >
            <div className="grid grid-cols-5 gap-3">
              {USPEH_KLJUCEVI.map((k) => (
                <NumPolje
                  key={k}
                  label={USPEH_LABEL[k]}
                  value={forma.uspeh[k] ?? 0}
                  onChange={(v) => updateUspeh(k, v)}
                  readonly={readonly}
                />
              ))}
            </div>
          </Sekcija>

          {/* Tekstualna polja */}
          <Sekcija naslov="Problemi">
            <Textarea
              value={forma.problemi}
              onChange={(e) => setForma({ ...forma, problemi: e.target.value })}
              placeholder="Uoceni problemi (vladanje, izostajanje, motivacija...)"
              rows={3}
              disabled={readonly}
            />
          </Sekcija>

          <Sekcija naslov="Mere">
            <Textarea
              value={forma.mere}
              onChange={(e) => setForma({ ...forma, mere: e.target.value })}
              placeholder="Preduzete i planirane mere..."
              rows={3}
              disabled={readonly}
            />
          </Sekcija>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {readonly ? <><XCircle className="w-4 h-4" /> Zatvori</> : 'Otkazi'}
          </Button>
          {!readonly && (
            <Button onClick={onSnimi} disabled={snimanje}>
              {snimanje ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Sacuvaj
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= HELPERI =============

function Sekcija({
  naslov,
  badge,
  badgeColor = 'gray',
  children,
}: {
  naslov: string;
  badge?: string;
  badgeColor?: 'gray' | 'amber';
  children: React.ReactNode;
}) {
  const bg = badgeColor === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700';
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{naslov}</h3>
        {badge && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${bg}`}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function NumPolje({
  label,
  value,
  onChange,
  readonly,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  readonly: boolean;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        disabled={readonly}
        className="h-9"
      />
    </div>
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

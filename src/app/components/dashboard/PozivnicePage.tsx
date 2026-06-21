import { useEffect, useRef, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  AlertCircle,
  Calendar,
  Download,
  FileSpreadsheet,
  Loader2,
  Send,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { PredmetResponse } from '@/lib/types';

interface PozvaniKorisnikResponse {
  id: string;
  ime: string;
  prezime: string;
  username: string;
  email: string;
  poreklo: 'RUCNO' | 'RASPORED' | 'EXCEL';
  imaPozivnicu: boolean;
  pozivnicaIstice: string | null;
  predmetiIds: string[];
  predmetiNazivi: string[];
  odeljenjaIzRasporeda: string[];
}

interface BootstrapRezultat {
  novihKorisnika: number;
  preskocenih: number;
  upozorenja: string[];
}

const POREKLO_LABEL: Record<PozvaniKorisnikResponse['poreklo'], { label: string; bg: string }> = {
  RASPORED: { label: 'XML', bg: 'bg-brand-100 text-brand-700' },
  EXCEL: { label: 'Excel', bg: 'bg-emerald-100 text-emerald-700' },
  RUCNO: { label: 'Rucno', bg: 'bg-secondary text-muted-foreground' },
};

export function PozivnicePage() {
  const [pozvani, setPozvani] = useState<PozvaniKorisnikResponse[]>([]);
  const [predmeti, setPredmeti] = useState<PredmetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState<'xml' | 'excel' | null>(null);
  const [poslednjiRezultat, setPoslednjiRezultat] = useState<BootstrapRezultat | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const [k, p] = await Promise.all([
        api.get<PozvaniKorisnikResponse[]>('/pozivnice'),
        api.get<PredmetResponse[]>('/predmeti/svi'),
      ]);
      setPozvani(k);
      setPredmeti(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ucitaj();
  }, []);

  const bootstrapXml = async () => {
    if (!confirm('Kreirati POZVAN naloge za sve nemapirane nastavnike iz aktivne verzije rasporeda?')) return;
    setImportBusy('xml');
    setPoslednjiRezultat(null);
    try {
      const r = await api.post<BootstrapRezultat>('/pozivnice/bootstrap-iz-rasporeda');
      setPoslednjiRezultat(r);
      await ucitaj();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri bootstrap-u');
    } finally {
      setImportBusy(null);
    }
  };

  const uploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImportBusy('excel');
    setPoslednjiRezultat(null);
    try {
      const fd = new FormData();
      fd.append('fajl', f);
      const r = await api.post<BootstrapRezultat>('/pozivnice/import-xlsx', fd);
      setPoslednjiRezultat(r);
      await ucitaj();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Greska pri uvozu Excel-a');
    } finally {
      setImportBusy(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const skiniSablon = async () => {
    try {
      const blob = await api.get<Blob>('/pozivnice/sablon-xlsx');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pozivnice-sablon.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri preuzimanju');
    }
  };

  const sacuvajPredmete = async (k: PozvaniKorisnikResponse, novi: string[]) => {
    setBusy(k.id);
    try {
      const aw = await api.put<PozvaniKorisnikResponse>(`/pozivnice/${k.id}/predmeti`, { predmetiIds: novi });
      setPozvani((prev) => prev.map((x) => (x.id === k.id ? aw : x)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setBusy(null);
    }
  };

  const sacuvajEmail = async (k: PozvaniKorisnikResponse, email: string) => {
    if (!email.trim() || email === k.email) return;
    setBusy(k.id);
    try {
      const aw = await api.put<PozvaniKorisnikResponse>(`/pozivnice/${k.id}/email`, { email });
      setPozvani((prev) => prev.map((x) => (x.id === k.id ? aw : x)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setBusy(null);
    }
  };

  const posalji = async (k: PozvaniKorisnikResponse) => {
    if (!confirm(`Poslati pozivnicu na ${k.email}?`)) return;
    setBusy(k.id);
    try {
      await api.post(`/pozivnice/${k.id}/posalji`);
      alert('Pozivnica poslata.');
      await ucitaj();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska');
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Pozivnice nastavnika"
        description="POZVAN nalozi cekaju da im postavis predmete koje predaju i posaljes magic-link mail."
        action={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={skiniSablon}>
              <Download className="w-4 h-4" /> Excel sablon
            </Button>
            <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={uploadExcel} />
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importBusy !== null}>
              {importBusy === 'excel'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <FileSpreadsheet className="w-4 h-4" />}
              Uvezi Excel
            </Button>
            <Button onClick={bootstrapXml} disabled={importBusy !== null}>
              {importBusy === 'xml'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Sparkles className="w-4 h-4" />}
              Bootstrap iz rasporeda
            </Button>
          </div>
        }
      />

      {poslednjiRezultat && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm">
          <div className="font-medium text-emerald-900">
            Kreirano: {poslednjiRezultat.novihKorisnika} novih,
            preskoceno: {poslednjiRezultat.preskocenih}
          </div>
          {poslednjiRezultat.upozorenja.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-amber-800">
              {poslednjiRezultat.upozorenja.map((u, i) => <li key={i}>{u}</li>)}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <div className="bg-card rounded-2xl border border-border p-12 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ucitavam...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      ) : pozvani.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <UserPlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          Nema POZVAN naloga. Kliknite "Bootstrap iz rasporeda" ili uvezite Excel.
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nastavnik</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Predmeti</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Izvor</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pozvani.map((k) => (
                <PozvaniRed key={k.id} k={k} svipredmeti={predmeti} busy={busy === k.id}
                  onPredmeti={(ids) => sacuvajPredmete(k, ids)}
                  onEmail={(e) => sacuvajEmail(k, e)}
                  onPosalji={() => posalji(k)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}

function PozvaniRed({ k, svipredmeti, busy, onPredmeti, onEmail, onPosalji }: {
  k: PozvaniKorisnikResponse;
  svipredmeti: PredmetResponse[];
  busy: boolean;
  onPredmeti: (ids: string[]) => void;
  onEmail: (e: string) => void;
  onPosalji: () => void;
}) {
  const [emailLokalno, setEmailLokalno] = useState(k.email);
  const [otvoreniPredmeti, setOtvoreniPredmeti] = useState(false);
  const placeholderEmail = k.email.endsWith('@placeholder.local');
  const odeljenja = k.odeljenjaIzRasporeda;
  const meta = POREKLO_LABEL[k.poreklo];

  const togglePredmet = (id: string) => {
    const novi = k.predmetiIds.includes(id)
      ? k.predmetiIds.filter((x) => x !== id)
      : [...k.predmetiIds, id];
    onPredmeti(novi);
  };

  return (
    <tr className="hover:bg-secondary/50">
      <td className="px-4 py-3 align-top">
        <div className="font-medium text-foreground">{k.ime} {k.prezime}</div>
        <div className="text-xs text-muted-foreground">@{k.username}</div>
        {odeljenja.length > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {odeljenja.join(', ')}
          </div>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2">
          <Input
            value={emailLokalno}
            onChange={(e) => setEmailLokalno(e.target.value)}
            onBlur={() => emailLokalno !== k.email && onEmail(emailLokalno)}
            className={`text-sm h-9 ${placeholderEmail ? 'border-amber-300 bg-amber-50/40' : ''}`}
            type="email"
          />
        </div>
        {placeholderEmail && (
          <p className="text-xs text-amber-600 mt-1">Placeholder — postavi pravi pre slanja</p>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        <button onClick={() => setOtvoreniPredmeti((o) => !o)}
          className="text-sm text-brand-600 hover:underline">
          {k.predmetiNazivi.length === 0 ? 'Nijedan — dodaj' : k.predmetiNazivi.join(', ')}
        </button>
        {otvoreniPredmeti && (
          <div className="mt-2 max-h-60 overflow-y-auto p-2 border border-border rounded-lg space-y-1">
            {svipredmeti.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={k.predmetiIds.includes(p.id)}
                  onChange={() => togglePredmet(p.id)}
                  className="w-4 h-4 accent-brand-600"
                />
                <span>{p.naziv} {p.razred ? `(${p.razred}.)` : ''}</span>
              </label>
            ))}
            {svipredmeti.length === 0 && (
              <p className="text-xs text-muted-foreground">Nema predmeta u skoli — pokreni onboarding wizard.</p>
            )}
          </div>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${meta.bg}`}>
          {meta.label}
        </span>
      </td>
      <td className="px-4 py-3 text-right align-top">
        <Button size="sm" onClick={onPosalji} disabled={busy || placeholderEmail}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Posalji pozivnicu
        </Button>
      </td>
    </tr>
  );
}

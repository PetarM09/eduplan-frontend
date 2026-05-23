import { useEffect, useState } from 'react';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  School,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface MojaSkolaResponse {
  id: string;
  naziv: string;
  grad: string | null;
  adresa: string | null;
  mailPlanovi: string | null;
  aktivan: boolean;
  vaziDo: string | null;
}

export function PostavkeSkolePage() {
  const { user } = useAuth();
  const mozeMenjati = user?.uloga === 'KOORDINATOR';

  const [skola, setSkola] = useState<MojaSkolaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mail, setMail] = useState('');
  const [snimanje, setSnimanje] = useState(false);
  const [poruka, setPoruka] = useState<string | null>(null);
  const [greska, setGreska] = useState<string | null>(null);

  const ucitaj = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await api.get<MojaSkolaResponse>('/skola');
      setSkola(s);
      setMail(s.mailPlanovi ?? '');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Greska pri ucitavanju skole');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ucitaj();
  }, []);

  const sacuvajMail = async () => {
    setPoruka(null);
    setGreska(null);
    const value = mail.trim();
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setGreska('Email nije validan');
      return;
    }
    setSnimanje(true);
    try {
      const s = await api.patch<MojaSkolaResponse>('/skola/mail-planovi', {
        mailPlanovi: value || null,
      });
      setSkola(s);
      setMail(s.mailPlanovi ?? '');
      setPoruka(value ? 'Mail za primanje planova je sacuvan.' : 'Mail za primanje planova je uklonjen.');
    } catch (e) {
      setGreska(e instanceof ApiError ? e.message : 'Greska pri snimanju');
    } finally {
      setSnimanje(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Postavke skole"
        description={
          mozeMenjati
            ? 'Promeni mail na koji se salju generisani planovi i pregledaj osnovne informacije skole.'
            : 'Osnovne informacije skole. Izmene moze raditi samo koordinator skole.'
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
      ) : skola ? (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <School className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{skola.naziv}</h2>
                <div className="text-sm text-gray-600 mt-1 space-y-1">
                  {(skola.grad || skola.adresa) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {[skola.grad, skola.adresa].filter(Boolean).join(', ')}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-gray-400" />
                    {skola.vaziDo
                      ? <>Vazi do <strong>{skola.vaziDo}</strong></>
                      : <span className="text-gray-500">Bez vremenskog ogranicenja</span>}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                  skola.aktivan ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {skola.aktivan ? 'Aktivna' : 'Deaktivirana'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Mail za primanje planova</h3>
            </div>
            <p className="text-sm text-gray-600">
              Kada nastavnik podnese plan, generisani Word i PDF se salju na ovu adresu.
              Ostavi prazno da onemogucis automatsko slanje.
            </p>
            <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <Label htmlFor="mail-planovi">Email adresa</Label>
                <Input
                  id="mail-planovi"
                  type="email"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  placeholder="planovi@skola.rs"
                  disabled={!mozeMenjati || snimanje}
                />
              </div>
              {mozeMenjati && (
                <Button onClick={sacuvajMail} disabled={snimanje || mail === (skola.mailPlanovi ?? '')}>
                  {snimanje ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Sacuvaj
                </Button>
              )}
            </div>
            {poruka && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {poruka}
              </div>
            )}
            {greska && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {greska}
              </div>
            )}
          </div>
        </>
      ) : null}
    </AppLayout>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { AlertCircle, CheckCircle2, GraduationCap, Loader2, Lock } from 'lucide-react';

interface PozivnicaInfo {
  ime: string;
  prezime: string;
  email: string;
  skolaNaziv: string;
  istekla: boolean;
}

export function PozivnicaAktivacijaPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [info, setInfo] = useState<PozivnicaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lozinka, setLozinka] = useState('');
  const [potvrda, setPotvrda] = useState('');
  const [submit, setSubmit] = useState(false);
  const [uspeh, setUspeh] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await api.get<PozivnicaInfo>(`/pozivnice/info/${token}`);
        setInfo(data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Pozivnica nije pronadjena');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const aktiviraj = async () => {
    if (lozinka.length < 8) {
      alert('Lozinka mora imati najmanje 8 karaktera');
      return;
    }
    if (lozinka !== potvrda) {
      alert('Lozinke se ne poklapaju');
      return;
    }
    setSubmit(true);
    try {
      await api.post(`/pozivnice/aktiviraj/${token}`, { lozinka });
      setUspeh(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Greska pri aktivaciji');
    } finally {
      setSubmit(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-0 to-brand-50 flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border w-full max-w-md p-8">
        <div className="flex items-center gap-2 text-brand-600 mb-6">
          <GraduationCap className="w-7 h-7" />
          <span className="text-xl font-bold">BehindClasses</span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Ucitavam pozivnicu...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : info?.istekla ? (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-5 h-5" />
              <span>Pozivnica je istekla. Trazi od koordinatora da posalje novu.</span>
            </div>
            <Button variant="outline" onClick={() => navigate('/login')}>Nazad na prijavu</Button>
          </div>
        ) : uspeh ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-medium">Nalog aktiviran!</span>
            </div>
            <p className="text-sm text-muted-foreground">Prebacujemo te na ekran za prijavu...</p>
          </div>
        ) : info ? (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Dobrodosao, {info.ime} {info.prezime}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {info.skolaNaziv && <>Skola: <span className="font-medium">{info.skolaNaziv}</span><br /></>}
                Mejl: <span className="font-medium">{info.email}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Postavi svoju sifru da bi aktivirao nalog.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="loz">Nova sifra</Label>
                <Input id="loz" type="password" value={lozinka}
                  onChange={(e) => setLozinka(e.target.value)}
                  autoComplete="new-password" />
              </div>
              <div>
                <Label htmlFor="pot">Ponovi sifru</Label>
                <Input id="pot" type="password" value={potvrda}
                  onChange={(e) => setPotvrda(e.target.value)}
                  autoComplete="new-password" />
              </div>
            </div>

            <Button onClick={aktiviraj} disabled={submit} className="w-full">
              {submit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Aktiviraj nalog
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

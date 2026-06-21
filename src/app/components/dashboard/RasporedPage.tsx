import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { SkolskaGodinaSelect } from '../ui/SkolskaGodinaSelect';
import { 
  Calendar, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  Users, 
  Layers, 
  Sparkles 
} from 'lucide-react';

interface RasporedStavka {
  id: string;
  dan: 'PONEDELJAK' | 'UTORAK' | 'SREDA' | 'CETVRTAK' | 'PETAK' | 'SUBOTA';
  cas: number;
  korisnikId: string;
  korisnikIme: string;
  odeljenjeId: string;
  odeljenjeLabel: string;
  predmetLabel: string;
}

interface UvozResponse {
  verzijaId: string;
  naziv: string;
  skolskaGodina: string;
  ukupnoRedova: number;
  mapiranihNastavnika: number;
  kreiranihStavki: number;
  kreiranihOdeljenja: number;
  nemapiraniNastavnici: string[];
}

const DANI = ['PONEDELJAK', 'UTORAK', 'SREDA', 'CETVRTAK', 'PETAK'];
const DANI_LABELS = {
  PONEDELJAK: 'Ponedeljak',
  UTORAK: 'Utorak',
  SREDA: 'Sreda',
  CETVRTAK: 'Četvrtak',
  PETAK: 'Petak',
  SUBOTA: 'Subota'
};

const CASOVI = [1, 2, 3, 4, 5, 6, 7];

export function RasporedPage() {
  const { user } = useAuth();
  const [raspored, setRaspored] = useState<RasporedStavka[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for XML import
  const [file, setFile] = useState<File | null>(null);
  const [skolskaGodina, setSkolskaGodina] = useState('2024/2025');
  const [naziv, setNaziv] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uvozResult, setUvozResult] = useState<UvozResponse | null>(null);

  const fetchRaspored = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<RasporedStavka[]>('/raspored/me');
      setRaspored(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Neuspešno učitavanje rasporeda. Proverite da li je učitana aktivna verzija rasporeda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRaspored();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUvozResult(null);

    const formData = new FormData();
    formData.append('fajl', file);
    formData.append('skolskaGodina', skolskaGodina);
    formData.append('naziv', naziv || `Raspored_${skolskaGodina.replace('/', '_')}`);
    formData.append('aktivan', 'true');

    try {
      const result = await api.post<UvozResponse>('/raspored/uvoz', formData);
      setUvozResult(result);
      setFile(null);
      setNaziv('');
      // Refresh schedule
      fetchRaspored();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Greška tokom uvoza XML rasporeda. Proverite format fajla.');
    } finally {
      setIsUploading(false);
    }
  };

  // Organize schedule by day and lesson
  const getStavka = (dan: string, cas: number) => {
    return raspored.find(s => s.dan === dan && s.cas === cas);
  };

  const isEduAdmin = user?.uloga === 'KOORDINATOR' || user?.uloga === 'ADMIN';

  return (
    <div className="flex h-screen bg-muted overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <TopBar />
        <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Calendar className="w-8 h-8 text-brand-600" />
                Raspored časova
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pregled Vaših časova u aktivnom rasporedu nastave.
              </p>
            </div>
            {isEduAdmin && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Sparkles className="w-3.5 h-3.5" />
                Administracija aktivna
              </span>
            )}
          </div>

          {/* Grid Layout for Grid and Import */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Schedule View */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">Moj nedeljni raspored</h3>
                  <Button variant="outline" size="sm" onClick={fetchRaspored} className="text-xs">
                    Osveži
                  </Button>
                </div>

                {isLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center space-y-3">
                    <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                    <span className="text-sm text-muted-foreground font-medium">Učitavanje rasporeda...</span>
                  </div>
                ) : error && raspored.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-600">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <p className="font-semibold text-foreground">Nema aktivnog rasporeda</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {error}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted border-b border-border">
                          <th className="p-4 text-left text-xs font-bold text-muted-foreground uppercase w-20">Čas</th>
                          {DANI.map(dan => (
                            <th key={dan} className="p-4 text-left text-xs font-bold text-muted-foreground uppercase w-48">
                              {DANI_LABELS[dan as keyof typeof DANI_LABELS]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {CASOVI.map(cas => (
                          <tr key={cas} className="hover:bg-secondary/50 transition-colors">
                            <td className="p-4 align-middle">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-sm font-bold text-foreground">
                                {cas}
                              </span>
                            </td>
                            {DANI.map(dan => {
                              const stavka = getStavka(dan, cas);
                              return (
                                <td key={dan} className="p-3 align-top">
                                  {stavka ? (
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-brand-50 to-brand-50 border border-brand-100 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
                                      <p className="text-xs font-bold text-brand-700 tracking-wide uppercase">
                                        {stavka.odeljenjeLabel}
                                      </p>
                                      <p className="text-sm font-semibold text-foreground mt-1 leading-tight">
                                        {stavka.predmetLabel}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="h-16 rounded-xl border border-dashed border-border flex items-center justify-center bg-muted/30">
                                      <span className="text-xs text-muted-foreground font-medium">Slobodno</span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* XML Import Panel (Admin/Koordinator only) */}
            {isEduAdmin && (
              <div className="space-y-6">
                <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 border border-border p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Uvoz XML rasporeda</h3>
                      <p className="text-xs text-muted-foreground">SpreadsheetML 2003 format</p>
                    </div>
                  </div>

                  <form onSubmit={handleImport} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="skolskaGodina">Školska godina</Label>
                      <SkolskaGodinaSelect
                        id="skolskaGodina"
                        value={skolskaGodina}
                        onChange={setSkolskaGodina}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="naziv">Naziv verzije (opciono)</Label>
                      <Input
                        id="naziv"
                        value={naziv}
                        onChange={(e) => setNaziv(e.target.value)}
                        placeholder="npr. Septembar V1"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fajl">Odaberite XML fajl</Label>
                      <div className="border-2 border-dashed border-border hover:border-brand-400 rounded-xl p-6 transition-all bg-muted/50 cursor-pointer relative group">
                        <input
                          id="fajl"
                          type="file"
                          accept=".xml"
                          onChange={handleFileChange}
                          required
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center space-y-2 text-center">
                          <FileSpreadsheet className="w-8 h-8 text-muted-foreground group-hover:text-brand-500 transition-colors" />
                          <span className="text-sm font-semibold text-foreground">
                            {file ? file.name : 'Izaberite raspored.xml'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Prevucite fajl ovde'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isUploading || !file}
                      className="w-full h-11 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-600/10"
                    >
                      {isUploading ? 'Uvoženje...' : 'Uvezi raspored'}
                    </Button>
                  </form>

                  {/* Result Details */}
                  {uvozResult && (
                    <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100 space-y-3 animate-fadeIn">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        Raspored uspešno uvezen!
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs text-emerald-950 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-600" />
                          Odeljenja: {uvozResult.kreiranihOdeljenja}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          Nastavnici: {uvozResult.mapiranihNastavnika}
                        </div>
                      </div>
                      {uvozResult.nemapiraniNastavnici && uvozResult.nemapiraniNastavnici.length > 0 && (
                        <div className="pt-2 border-t border-emerald-200/50">
                          <p className="text-xs font-bold text-amber-800">
                            Nemapirani nastavnici ({uvozResult.nemapiraniNastavnici.length}):
                          </p>
                          <div className="max-h-20 overflow-y-auto mt-1 space-y-0.5 text-xxs text-amber-900 bg-amber-50/50 p-2 rounded-lg">
                            {uvozResult.nemapiraniNastavnici.map((name, i) => (
                              <div key={i}>{name}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex gap-2 text-rose-800 text-xs font-medium animate-fadeIn">
                      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Greška:</span> {error}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

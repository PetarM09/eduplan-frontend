import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  UserX, 
  UserCheck, 
  Calendar, 
  Plus, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  Users, 
  CheckCircle,
  FileText
} from 'lucide-react';

interface Zamena {
  id: string;
  datum: string;
  cas: number;
  odsutniId: string;
  odsutniIme: string;
  zamenikId: string | null;
  zamenikIme: string | null;
  odeljenjeId: string;
  odeljenjeLabel: string;
  predmetLabel: string;
  razlog: string;
  napomena: string;
  status: 'PREDLOZENA' | 'ODOBRENA' | 'ODBIJENA' | 'OTKAZANA';
  odobrioId: string | null;
  odobrioIme: string | null;
  odobrioAt: string | null;
  createdAt: string;
}

interface Kandidat {
  korisnikId: string;
  username: string;
  ime: string;
  prezime: string;
  brojZamena30d: number;
}

export function ZamenePage() {
  const { user } = useAuth();
  
  // Lists
  const [zameneDanas, setZameneDanas] = useState<Zamena[]>([]);
  const [mojeKaoOdsutni, setMojeKaoOdsutni] = useState<Zamena[]>([]);
  const [mojeKaoZamenik, setMojeKaoZamenik] = useState<Zamena[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter
  const [filterDatum, setFilterDatum] = useState(new Date().toISOString().split('T')[0]);

  // Request absence form states
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [selectedDatum, setSelectedDatum] = useState(() => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1); // Default to tomorrow
    return tom.toISOString().split('T')[0];
  });
  const [selectedCasovi, setSelectedCasovi] = useState<number[]>([]);
  const [razlogOdsustva, setRazlogOdsustva] = useState('');
  const [isSubmittingOdsustvo, setIsSubmittingOdsustvo] = useState(false);

  // Assign substitute modal states
  const [showZamenikModal, setShowZamenikModal] = useState(false);
  const [activeZamenaId, setActiveZamenaId] = useState<string | null>(null);
  const [kandidati, setKandidati] = useState<Kandidat[]>([]);
  const [isLoadingKandidati, setIsLoadingKandidati] = useState(false);
  const [zamenikNapomena, setZamenikNapomena] = useState('');

  // Reject states
  const [showOdbijInputId, setShowOdbijInputId] = useState<string | null>(null);
  const [razlogOdbijanja, setRazlogOdbijanja] = useState('');

  const fetchZamene = async () => {
    setIsLoading(true);
    try {
      if (['ADMIN', 'DIREKTOR', 'KOORDINATOR', 'PP_SLUZBA'].includes(user?.uloga || '')) {
        const data = await api.get<Zamena[]>(`/zamene/danas?datum=${filterDatum}`);
        setZameneDanas(data);
      }
      
      if (user?.uloga === 'NASTAVNIK') {
        const [odsutniData, zamenikData] = await Promise.all([
          api.get<Zamena[]>('/zamene/moje/odsutni'),
          api.get<Zamena[]>('/zamene/moje/zamenik')
        ]);
        setMojeKaoOdsutni(odsutniData);
        setMojeKaoZamenik(zamenikData);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Neuspešno učitavanje zamena.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZamene();
  }, [filterDatum]);

  const handleCasToggle = (cas: number) => {
    setSelectedCasovi(prev => 
      prev.includes(cas) ? prev.filter(c => c !== cas) : [...prev, cas]
    );
  };

  const handlePrijaviOdsustvo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCasovi.length === 0) {
      setError('Morate izabrati bar jedan čas.');
      return;
    }

    setIsSubmittingOdsustvo(true);
    setError(null);
    
    try {
      await api.post('/zamene', {
        datum: selectedDatum,
        casovi: selectedCasovi,
        razlog: razlogOdsustva
      });
      setSuccessMessage('Odsustvo je uspešno prijavljeno.');
      setShowAbsenceForm(false);
      setSelectedCasovi([]);
      setRazlogOdsustva('');
      fetchZamene();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Greška prilikom prijave odsustva.');
    } finally {
      setIsSubmittingOdsustvo(false);
    }
  };

  const openZamenikModal = async (zamenaId: string) => {
    setActiveZamenaId(zamenaId);
    setShowZamenikModal(true);
    setIsLoadingKandidati(true);
    try {
      const data = await api.get<Kandidat[]>(`/zamene/${zamenaId}/kandidati`);
      setKandidati(data);
    } catch (err) {
      console.error(err);
      setError('Greška pri učitavanju kandidata za zamenu.');
    } finally {
      setIsLoadingKandidati(false);
    }
  };

  const handleDodeliZamenika = async (kandidatId: string) => {
    if (!activeZamenaId) return;
    try {
      await api.put(`/zamene/${activeZamenaId}/zamenik`, {
        zamenikId: kandidatId,
        napomena: zamenikNapomena
      });
      setSuccessMessage('Zamenik je uspešno dodeljen.');
      setShowZamenikModal(false);
      setZamenikNapomena('');
      fetchZamene();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Greška pri dodeljivanju zamenika.');
    }
  };

  const handleOdobri = async (zamenaId: string) => {
    try {
      await api.put(`/zamene/${zamenaId}/odobri`, {});
      setSuccessMessage('Zamena je odobrena.');
      fetchZamene();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Greška pri odobravanju zamene.');
    }
  };

  const handleOdbij = async (zamenaId: string) => {
    if (!razlogOdbijanja) {
      setError('Morate uneti razlog odbijanja.');
      return;
    }
    try {
      await api.put(`/zamene/${zamenaId}/odbij`, {
        razlog: razlogOdbijanja
      });
      setSuccessMessage('Zamena je odbijena.');
      setShowOdbijInputId(null);
      setRazlogOdbijanja('');
      fetchZamene();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Greška pri odbijanju zamene.');
    }
  };

  const handleOtkazi = async (zamenaId: string) => {
    if (!confirm('Da li ste sigurni da želite da otkažete ovu zamenu?')) return;
    try {
      await api.put(`/zamene/${zamenaId}/otkazi`, {});
      setSuccessMessage('Zamena je otkazana.');
      fetchZamene();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Greška pri otkazivanju zamene.');
    }
  };

  const isEduAdmin = ['ADMIN', 'DIREKTOR', 'KOORDINATOR'].includes(user?.uloga || '');

  return (
    <AppLayout>
      <PageHeader
        title="Dnevne Zamene Nastavnika"
        description="Prijava odsustva, automatizovan predlog zamenika i praćenje odobravanja."
        action={
          user?.uloga === 'NASTAVNIK' ? (
            <Button
              onClick={() => setShowAbsenceForm(true)}
              className="rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 h-11"
            >
              <Plus className="w-5 h-5" />
              Prijavi odsustvo
            </Button>
          ) : undefined
        }
      />

          {/* Success / Error Messages */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-emerald-800 text-sm font-semibold animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>{successMessage}</span>
              <button className="ml-auto hover:text-emerald-950" onClick={() => setSuccessMessage(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-rose-800 text-sm font-medium animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
              <button className="ml-auto hover:text-rose-950" onClick={() => setError(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Grid Layout for Teachers and Admins */}
          <div className="grid grid-cols-1 gap-8">
            {/* Admin/Director/Coordinator View - Today's Replacements */}
            {['ADMIN', 'DIREKTOR', 'KOORDINATOR', 'PP_SLUZBA'].includes(user?.uloga || '') && (
              <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border overflow-hidden p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <h3 className="text-lg font-bold text-foreground">Zamene na dan</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={filterDatum}
                      onChange={(e) => setFilterDatum(e.target.value)}
                      className="h-10 rounded-xl bg-muted border-border text-sm font-medium"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center space-y-3">
                    <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                    <span className="text-sm text-muted-foreground font-medium">Učitavanje zamena...</span>
                  </div>
                ) : zameneDanas.length === 0 ? (
                  <div className="p-16 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto text-brand-600">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Nema evidentiranih zamena za ovaj dan</p>
                      <p className="text-sm text-muted-foreground mt-1">Svi nastavnici su prisutni ili zamene nisu kreirane.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="p-4 text-left text-xs font-bold text-muted-foreground uppercase">Čas</th>
                          <th className="p-4 text-left text-xs font-bold text-muted-foreground uppercase">Odeljenje</th>
                          <th className="p-4 text-left text-xs font-bold text-muted-foreground uppercase">Predmet</th>
                          <th className="p-4 text-left text-xs font-bold text-muted-foreground uppercase">Odsutni</th>
                          <th className="p-4 text-left text-xs font-bold text-muted-foreground uppercase">Zamenik</th>
                          <th className="p-4 text-left text-xs font-bold text-muted-foreground uppercase">Status</th>
                          {isEduAdmin && <th className="p-4 text-right text-xs font-bold text-muted-foreground uppercase">Akcije</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {zameneDanas.map(zamena => (
                          <tr key={zamena.id} className="hover:bg-secondary/50 transition-colors">
                            <td className="p-4 font-semibold text-foreground">{zamena.cas}. čas</td>
                            <td className="p-4 font-bold text-brand-700">{zamena.odeljenjeLabel}</td>
                            <td className="p-4 font-semibold text-foreground">{zamena.predmetLabel}</td>
                            <td className="p-4 text-muted-foreground">{zamena.odsutniIme}</td>
                            <td className="p-4 text-muted-foreground">
                              {zamena.zamenikIme ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                                  {zamena.zamenikIme}
                                </span>
                              ) : (
                                <span className="text-amber-600 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                                  Nije dodeljen
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                zamena.status === 'ODOBRENA' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                  : zamena.status === 'PREDLOZENA' 
                                  ? 'bg-brand-50 text-brand-700 border-brand-100'
                                  : zamena.status === 'ODBIJENA'
                                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}>
                                {zamena.status}
                              </span>
                            </td>
                            {isEduAdmin && (
                              <td className="p-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  {!zamena.zamenikId && zamena.status === 'PREDLOZENA' && (
                                    <Button
                                      size="sm"
                                      onClick={() => openZamenikModal(zamena.id)}
                                      className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-xs"
                                    >
                                      Dodeli zamenika
                                    </Button>
                                  )}
                                  {zamena.zamenikId && zamena.status === 'PREDLOZENA' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleOdobri(zamena.id)}
                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs"
                                      >
                                        Odobri
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => setShowOdbijInputId(zamena.id)}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs"
                                      >
                                        Odbij
                                      </Button>
                                    </>
                                  )}
                                  {zamena.status !== 'OTKAZANA' && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleOtkazi(zamena.id)}
                                      className="text-muted-foreground hover:text-rose-600 rounded-lg text-xs"
                                    >
                                      Otkaži
                                    </Button>
                                  )}
                                </div>

                                {/* inline rejection reason input */}
                                {showOdbijInputId === zamena.id && (
                                  <div className="mt-3 p-3 bg-muted rounded-xl border border-border text-left space-y-2 max-w-xs ml-auto">
                                    <Label htmlFor="razlogOdb">Razlog odbijanja</Label>
                                    <Input
                                      id="razlogOdb"
                                      value={razlogOdbijanja}
                                      onChange={(e) => setRazlogOdbijanja(e.target.value)}
                                      placeholder="Nema slobodnih ili drugi razlog..."
                                      className="h-9 text-xs"
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => handleOdbij(zamena.id)} className="h-8 text-xs bg-rose-600 text-white">
                                        Potvrdi odbijanje
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setShowOdbijInputId(null)} className="h-8 text-xs">
                                        Nazad
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Teacher View - My Absences & My Substitution Assignments */}
            {user?.uloga === 'NASTAVNIK' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* My Absences */}
                <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border p-6 space-y-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <UserX className="w-5 h-5 text-rose-500" />
                    Moja odsustva (Prijavljeno)
                  </h3>

                  {isLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                    </div>
                  ) : mojeKaoOdsutni.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">Niste prijavili nijedno odsustvo.</p>
                  ) : (
                    <div className="space-y-4">
                      {mojeKaoOdsutni.map(zamena => (
                        <div key={zamena.id} className="p-4 rounded-xl border border-border bg-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold">{zamena.datum} | {zamena.cas}. čas</p>
                            <p className="font-semibold text-foreground mt-0.5">{zamena.predmetLabel} ({zamena.odeljenjeLabel})</p>
                            {zamena.zamenikIme && (
                              <p className="text-xs text-muted-foreground mt-1">Zamenik: <span className="font-medium text-foreground">{zamena.zamenikIme}</span></p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-bold border ${
                              zamena.status === 'ODOBRENA' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : zamena.status === 'PREDLOZENA' 
                                ? 'bg-brand-50 text-brand-700 border-brand-100'
                                : zamena.status === 'ODBIJENA'
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}>
                              {zamena.status}
                            </span>
                            {zamena.status === 'PREDLOZENA' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOtkazi(zamena.id)}
                                className="text-muted-foreground hover:text-rose-600 p-1 h-auto"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* My Assignments as Substitute */}
                <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border p-6 space-y-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <UserCheck className="w-5 h-5 text-emerald-500" />
                    Moja zaduženja (Zamene)
                  </h3>

                  {isLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                    </div>
                  ) : mojeKaoZamenik.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">Nemate dodeljenih zamena.</p>
                  ) : (
                    <div className="space-y-4">
                      {mojeKaoZamenik.map(zamena => (
                        <div key={zamena.id} className="p-4 rounded-xl border border-border bg-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold">{zamena.datum} | {zamena.cas}. čas</p>
                            <p className="font-semibold text-foreground mt-0.5">{zamena.predmetLabel} ({zamena.odeljenjeLabel})</p>
                            <p className="text-xs text-muted-foreground mt-1">Zamenjujete kolegu: <span className="font-medium text-foreground">{zamena.odsutniIme}</span></p>
                          </div>
                          <span className={`inline-flex self-start sm:self-center items-center px-2 py-0.5 rounded-full text-xxs font-bold border ${
                            zamena.status === 'ODOBRENA' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-brand-50 text-brand-700 border-brand-100'
                          }`}>
                            {zamena.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal - Request Absence Form */}
          {showAbsenceForm && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-border animate-scaleIn">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="text-lg font-bold text-foreground">Prijavi odsustvo</h4>
                  <button onClick={() => setShowAbsenceForm(false)} className="text-muted-foreground hover:text-muted-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handlePrijaviOdsustvo} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="datumOds">Datum odsustva</Label>
                    <Input
                      id="datumOds"
                      type="date"
                      value={selectedDatum}
                      onChange={(e) => setSelectedDatum(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Izaberite časove</Label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[1, 2, 3, 4, 5, 6, 7].map(cas => {
                        const isSelected = selectedCasovi.includes(cas);
                        return (
                          <button
                            key={cas}
                            type="button"
                            onClick={() => handleCasToggle(cas)}
                            className={`w-10 h-10 rounded-xl font-bold transition-all border flex items-center justify-center text-sm ${
                              isSelected
                                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/10'
                                : 'bg-card text-foreground border-border hover:border-input'
                            }`}
                          >
                            {cas}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="razlogOds">Razlog odsustva (opciono)</Label>
                    <Input
                      id="razlogOds"
                      value={razlogOdsustva}
                      onChange={(e) => setRazlogOdsustva(e.target.value)}
                      placeholder="Službeni put, bolovanje, seminar..."
                      className="rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmittingOdsustvo}
                    className="w-full h-11 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-600/10"
                  >
                    {isSubmittingOdsustvo ? 'Slanje...' : 'Prijavi'}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Modal - Assign Substitute */}
          {showZamenikModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 border border-border animate-scaleIn">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h4 className="text-lg font-bold text-foreground">Dodeljivanje zamenika</h4>
                    <p className="text-xs text-muted-foreground">Prikaz slobodnih nastavnika u ovom času</p>
                  </div>
                  <button onClick={() => setShowZamenikModal(false)} className="text-muted-foreground hover:text-muted-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="zamenikNapomena">Napomena pri dodeli (opciono)</Label>
                    <Input
                      id="zamenikNapomena"
                      value={zamenikNapomena}
                      onChange={(e) => setZamenikNapomena(e.target.value)}
                      placeholder="Npr. Drži dvočas ili spaja grupe..."
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Slobodni nastavnici (Sortirano po opterećenju u 30 dana)</Label>
                    {isLoadingKandidati ? (
                      <div className="py-8 flex flex-col items-center justify-center space-y-2">
                        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                        <span className="text-xs text-muted-foreground">Analiza rasporeda slobodnih...</span>
                      </div>
                    ) : kandidati.length === 0 ? (
                      <div className="p-6 bg-amber-50 border border-amber-100 rounded-xl flex gap-2 text-xs text-amber-800">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        Nema slobodnih nastavnika u ovom terminu. Možda ćete morati spojiti grupe ili organizovati dežurstvo.
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                        {kandidati.map(k => (
                          <div 
                            key={k.korisnikId} 
                            className="p-3.5 rounded-xl border border-border bg-muted hover:bg-brand-50/50 hover:border-brand-200 flex items-center justify-between gap-4 transition-all group cursor-pointer"
                            onClick={() => handleDodeliZamenika(k.korisnikId)}
                          >
                            <div>
                              <p className="font-semibold text-foreground group-hover:text-brand-700 transition-colors">
                                {k.ime} {k.prezime}
                              </p>
                              <p className="text-xxs text-muted-foreground">@{k.username}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xxs font-bold text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">
                                {k.brojZamena30d} zamena (30d)
                              </span>
                              <p className="text-xxs font-bold text-brand-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 justify-end">
                                Odaberi
                                <Check className="w-3 h-3" />
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
    </AppLayout>
  );
}

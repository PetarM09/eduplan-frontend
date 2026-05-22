import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { 
  Plus, 
  Trash2,
  FileText,
  Target,
  CheckCircle2,
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';

interface Predmet {
  id: number;
  naziv: string;
}

interface Tema {
  id: number;
  razred: 1 | 2 | 3 | 4;
  naziv: string;
  brojCasova: number;
  predmetId: number;
}

interface NastavnaJedinica {
  id: number;
  naziv: string;
  temaId: number;
  ishodiIds: number[];
}

interface Ishod {
  id: number;
  opis: string;
  temaId: number;
}

interface NastavneJedinicePageProps {
  tema: Tema;
  predmet: Predmet;
}

const mockNastavneJedinice: NastavnaJedinica[] = [
  { id: 1, naziv: 'Uvod u linearne funkcije', temaId: 1, ishodiIds: [1, 2] },
  { id: 2, naziv: 'Grafik linearne funkcije', temaId: 1, ishodiIds: [1, 3] },
  { id: 3, naziv: 'Primena linearnih funkcija', temaId: 1, ishodiIds: [2, 3, 4] },
];

const mockIshodi: Ishod[] = [
  { id: 1, opis: 'Učenik će moći da definiše linearnu funkciju i prepozna njene osnovne karakteristike', temaId: 1 },
  { id: 2, opis: 'Učenik će biti u stanju da nacrta grafik linearne funkcije u koordinatnom sistemu', temaId: 1 },
  { id: 3, opis: 'Učenik će znati da odredi nagib i odsečak linearne funkcije', temaId: 1 },
  { id: 4, opis: 'Učenik će moći da primeni linearne funkcije u rešavanju praktičnih problema', temaId: 1 },
  { id: 5, opis: 'Učenik će razumeti vezu između jednačine prave i linearne funkcije', temaId: 1 },
  { id: 6, opis: 'Učenik će znati da uporedi različite linearne funkcije', temaId: 1 },
];

export function NastavneJedinicePage({ tema, predmet }: NastavneJedinicePageProps) {
  const [nastavneJedinice, setNastavneJedinice] = useState<NastavnaJedinica[]>(mockNastavneJedinice);
  const [ishodi, setIshodi] = useState<Ishod[]>(mockIshodi);
  const [newNJ, setNewNJ] = useState('');
  const [newIshod, setNewIshod] = useState('');
  const [selectedNJ, setSelectedNJ] = useState<NastavnaJedinica | null>(null);
  const [isAddNJDialogOpen, setIsAddNJDialogOpen] = useState(false);
  const [isAddIshodDialogOpen, setIsAddIshodDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const handleAddNJ = () => {
    if (newNJ.trim()) {
      const novaNJ: NastavnaJedinica = {
        id: Math.max(...nastavneJedinice.map(nj => nj.id), 0) + 1,
        naziv: newNJ.trim(),
        temaId: tema.id,
        ishodiIds: []
      };
      setNastavneJedinice([...nastavneJedinice, novaNJ]);
      setNewNJ('');
      setIsAddNJDialogOpen(false);
    }
  };

  const handleDeleteNJ = (id: number) => {
    setNastavneJedinice(nastavneJedinice.filter(nj => nj.id !== id));
  };

  const handleAddIshod = () => {
    if (newIshod.trim()) {
      const noviIshod: Ishod = {
        id: Math.max(...ishodi.map(i => i.id), 0) + 1,
        opis: newIshod.trim(),
        temaId: tema.id
      };
      setIshodi([...ishodi, noviIshod]);
      setNewIshod('');
      setIsAddIshodDialogOpen(false);
    }
  };

  const handleDeleteIshod = (id: number) => {
    setIshodi(ishodi.filter(i => i.id !== id));
    setNastavneJedinice(nastavneJedinice.map(nj => ({
      ...nj,
      ishodiIds: nj.ishodiIds.filter(ishodId => ishodId !== id)
    })));
  };

  const handleToggleIshod = (njId: number, ishodId: number) => {
    setNastavneJedinice(nastavneJedinice.map(nj => {
      if (nj.id === njId) {
        const isAssigned = nj.ishodiIds.includes(ishodId);
        return {
          ...nj,
          ishodiIds: isAssigned
            ? nj.ishodiIds.filter(id => id !== ishodId)
            : [...nj.ishodiIds, ishodId]
        };
      }
      return nj;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{nastavneJedinice.length}</div>
              <div className="text-sm text-gray-600">Nastavnih jedinica</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{ishodi.length}</div>
              <div className="text-sm text-gray-600">Ishoda učenja</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nastavne Jedinice */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Nastavne jedinice</h3>
              <p className="text-sm text-gray-600 mt-0.5">Dodajte i organizujte nastavne jedinice</p>
            </div>
            <Dialog open={isAddNJDialogOpen} onOpenChange={setIsAddNJDialogOpen}>
              <DialogTrigger asChild>
                <button className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dodaj nastavnu jedinicu</DialogTitle>
                  <DialogDescription>
                    Unesite naziv nove nastavne jedinice
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="naziv-nj">Naziv</Label>
                    <Input
                      id="naziv-nj"
                      placeholder="npr. Uvod u linearne funkcije"
                      value={newNJ}
                      onChange={(e) => setNewNJ(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNJ()}
                      className="h-11"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddNJDialogOpen(false)}>
                    Otkaži
                  </Button>
                  <Button onClick={handleAddNJ} className="bg-blue-600 hover:bg-blue-700">
                    Dodaj
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {nastavneJedinice.map((nj, index) => (
              <div key={nj.id} className="p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-2">{nj.naziv}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {nj.ishodiIds.length > 0 ? (
                        <>
                          <span className="text-xs text-gray-500">Dodeljeni ishodi:</span>
                          {nj.ishodiIds.map(ishodId => {
                            const ishod = ishodi.find(i => i.id === ishodId);
                            return (
                              <span key={ishodId} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                                #{ishodId}
                              </span>
                            );
                          })}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Nema dodeljenih ishoda</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Dialog open={isAssignDialogOpen && selectedNJ?.id === nj.id} onOpenChange={(open) => {
                      setIsAssignDialogOpen(open);
                      if (!open) setSelectedNJ(null);
                    }}>
                      <DialogTrigger asChild>
                        <button
                          className="w-9 h-9 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 flex items-center justify-center transition-colors"
                          onClick={() => setSelectedNJ(nj)}
                        >
                          <LinkIcon className="w-4 h-4 text-purple-600" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Dodeli ishode</DialogTitle>
                          <DialogDescription>
                            Izaberite ishode za: {nj.naziv}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {ishodi.map((ishod) => {
                              const isAssigned = nj.ishodiIds.includes(ishod.id);
                              return (
                                <label
                                  key={ishod.id}
                                  className={`
                                    flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                    ${isAssigned
                                      ? 'bg-purple-50 border-purple-200 hover:bg-purple-100'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    }
                                  `}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isAssigned}
                                    onChange={() => handleToggleIshod(nj.id, ishod.id)}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-gray-500">#{ishod.id}</span>
                                      {isAssigned && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                                    </div>
                                    <p className="text-sm text-gray-700">{ishod.opis}</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => setIsAssignDialogOpen(false)} className="bg-purple-600 hover:bg-purple-700">
                            Zatvori
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <button
                      className="w-9 h-9 rounded-lg border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => handleDeleteNJ(nj.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {nastavneJedinice.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nema nastavnih jedinica</p>
            </div>
          )}
        </div>

        {/* Ishodi */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ishodi učenja</h3>
              <p className="text-sm text-gray-600 mt-0.5">Definiši ishode za ovu temu</p>
            </div>
            <Dialog open={isAddIshodDialogOpen} onOpenChange={setIsAddIshodDialogOpen}>
              <DialogTrigger asChild>
                <button className="w-9 h-9 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dodaj ishod učenja</DialogTitle>
                  <DialogDescription>
                    Unesite opis novog ishoda učenja
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="opis-ishoda">Opis ishoda</Label>
                    <Textarea
                      id="opis-ishoda"
                      placeholder="npr. Učenik će moći da..."
                      value={newIshod}
                      onChange={(e) => setNewIshod(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddIshodDialogOpen(false)}>
                    Otkaži
                  </Button>
                  <Button onClick={handleAddIshod} className="bg-purple-600 hover:bg-purple-700">
                    Dodaj
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2 p-4 max-h-[600px] overflow-y-auto">
            {ishodi.map((ishod, index) => {
              const assignedCount = nastavneJedinice.filter(nj => nj.ishodiIds.includes(ishod.id)).length;
              return (
                <div key={ishod.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 mb-2">{ishod.opis}</p>
                    {assignedCount > 0 && (
                      <div className="flex items-center gap-2 text-xs text-purple-600">
                        <CheckCircle2 className="w-3 h-3" />
                        Dodeljen {assignedCount} {assignedCount === 1 ? 'jedinici' : 'jedinica'}
                      </div>
                    )}
                  </div>
                  <button
                    className="w-9 h-9 rounded-lg border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    onClick={() => handleDeleteIshod(ishod.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              );
            })}
          </div>

          {ishodi.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nema definisanih ishoda</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-1">Kako koristiti ishode?</h4>
          <p className="text-sm text-blue-700">
            Kliknite na <LinkIcon className="w-3 h-3 inline" /> ikonu pored nastavne jedinice da dodelite ishode učenja. 
            Jedan ishod može biti dodeljen više nastavnih jedinica.
          </p>
        </div>
      </div>
    </div>
  );
}
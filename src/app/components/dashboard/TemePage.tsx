import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { 
  Plus, 
  Pencil, 
  Trash2,
  BookText,
  Clock,
  ChevronRight,
  GraduationCap
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
  brojTema?: number;
  brojUcenika?: number;
}

interface Tema {
  id: number;
  razred: 1 | 2 | 3 | 4;
  naziv: string;
  brojCasova: number;
  predmetId: number;
}

interface TemePageProps {
  predmet: Predmet;
  onOpenNJ: (tema: Tema) => void;
}

const mockTeme: Record<number, Tema[]> = {
  1: [
    { id: 1, razred: 1, naziv: 'Uvod u matematiku', brojCasova: 12, predmetId: 1 },
    { id: 2, razred: 1, naziv: 'Osnovne operacije', brojCasova: 15, predmetId: 1 },
  ],
  2: [
    { id: 3, razred: 2, naziv: 'Množenje i deljenje', brojCasova: 18, predmetId: 1 },
    { id: 4, razred: 2, naziv: 'Razlomci', brojCasova: 20, predmetId: 1 },
  ],
  3: [
    { id: 5, razred: 3, naziv: 'Jednačine', brojCasova: 16, predmetId: 1 },
    { id: 6, razred: 3, naziv: 'Geometrija', brojCasova: 14, predmetId: 1 },
  ],
  4: [
    { id: 7, razred: 4, naziv: 'Funkcije', brojCasova: 22, predmetId: 1 },
    { id: 8, razred: 4, naziv: 'Trigonometrija', brojCasova: 18, predmetId: 1 },
  ],
};

export function TemePage({ predmet, onOpenNJ }: TemePageProps) {
  const [temeByRazred, setTemeByRazred] = useState<Record<number, Tema[]>>(mockTeme);
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4>(1);
  const [newTema, setNewTema] = useState({ naziv: '', brojCasova: '' });
  const [editingTema, setEditingTema] = useState<Tema | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddTema = () => {
    if (newTema.naziv.trim() && newTema.brojCasova) {
      const novaTema: Tema = {
        id: Math.max(...Object.values(temeByRazred).flat().map(t => t.id), 0) + 1,
        razred: activeTab,
        naziv: newTema.naziv.trim(),
        brojCasova: parseInt(newTema.brojCasova),
        predmetId: predmet.id
      };
      
      setTemeByRazred({
        ...temeByRazred,
        [activeTab]: [...(temeByRazred[activeTab] || []), novaTema]
      });
      
      setNewTema({ naziv: '', brojCasova: '' });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditTema = () => {
    if (editingTema && editingTema.naziv.trim()) {
      setTemeByRazred({
        ...temeByRazred,
        [editingTema.razred]: temeByRazred[editingTema.razred].map(t =>
          t.id === editingTema.id ? editingTema : t
        )
      });
      setEditingTema(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteTema = (tema: Tema) => {
    setTemeByRazred({
      ...temeByRazred,
      [tema.razred]: temeByRazred[tema.razred].filter(t => t.id !== tema.id)
    });
  };

  const currentTeme = temeByRazred[activeTab] || [];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex gap-2">
          {([1, 2, 3, 4] as const).map((razred) => {
            const count = (temeByRazred[razred] || []).length;
            return (
              <button
                key={razred}
                onClick={() => setActiveTab(razred)}
                className={`
                  flex-1 h-11 rounded-lg font-medium text-sm transition-all
                  ${activeTab === razred
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {razred}. razred
                  {count > 0 && (
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-semibold
                      ${activeTab === razred ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}
                    `}>
                      {count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{activeTab}. razred</h2>
          <p className="text-sm text-gray-600 mt-1">
            {currentTeme.length} {currentTeme.length === 1 ? 'tema' : currentTeme.length < 5 ? 'teme' : 'tema'}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-lg shadow-blue-600/25 transition-all">
              <Plus className="w-4 h-4" />
              Dodaj temu
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj novu temu</DialogTitle>
              <DialogDescription>
                Unesite podatke za {activeTab}. razred
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="naziv-teme">Naziv teme</Label>
                <Input
                  id="naziv-teme"
                  placeholder="npr. Uvod u matematiku"
                  value={newTema.naziv}
                  onChange={(e) => setNewTema({ ...newTema, naziv: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="broj-casova">Broj časova</Label>
                <Input
                  id="broj-casova"
                  type="number"
                  placeholder="npr. 12"
                  value={newTema.brojCasova}
                  onChange={(e) => setNewTema({ ...newTema, brojCasova: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Otkaži
              </Button>
              <Button onClick={handleAddTema} className="bg-blue-600 hover:bg-blue-700">
                Dodaj
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teme List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tema
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Broj časova
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentTeme.map((tema) => (
                <tr key={tema.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                        <BookText className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{tema.naziv}</div>
                        <div className="text-sm text-gray-500">{tema.razred}. razred</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{tema.brojCasova}</span>
                      <span className="text-sm text-gray-500">časova</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                        onClick={() => onOpenNJ(tema)}
                      >
                        Nastavne jedinice
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Dialog open={isEditDialogOpen && editingTema?.id === tema.id} onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) setEditingTema(null);
                      }}>
                        <DialogTrigger asChild>
                          <button
                            className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
                            onClick={() => setEditingTema({ ...tema })}
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Izmeni temu</DialogTitle>
                            <DialogDescription>
                              Promenite podatke o temi
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-naziv-teme">Naziv teme</Label>
                              <Input
                                id="edit-naziv-teme"
                                value={editingTema?.naziv || ''}
                                onChange={(e) => setEditingTema(editingTema ? { ...editingTema, naziv: e.target.value } : null)}
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-broj-casova">Broj časova</Label>
                              <Input
                                id="edit-broj-casova"
                                type="number"
                                value={editingTema?.brojCasova || ''}
                                onChange={(e) => setEditingTema(editingTema ? { ...editingTema, brojCasova: parseInt(e.target.value) } : null)}
                                className="h-11"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              Otkaži
                            </Button>
                            <Button onClick={handleEditTema} className="bg-blue-600 hover:bg-blue-700">
                              Sačuvaj
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <button
                        className="w-9 h-9 rounded-lg border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center transition-colors"
                        onClick={() => handleDeleteTema(tema)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentTeme.length === 0 && (
          <div className="text-center py-12">
            <BookText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nema tema za {activeTab}. razred</p>
            <p className="text-sm text-gray-400">Dodajte prvu temu koristeći dugme iznad</p>
          </div>
        )}
      </div>
    </div>
  );
}

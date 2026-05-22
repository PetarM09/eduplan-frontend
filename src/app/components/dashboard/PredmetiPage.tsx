import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { 
  BookOpen, 
  Plus, 
  Pencil, 
  Trash2, 
  List,
  Search,
  ArrowLeft,
  BookText,
  MoreVertical,
  ChevronRight
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
import { TemePage } from './TemePage';
import { NastavneJedinicePage } from './NastavneJedinicePage';

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

const mockPredmeti: Predmet[] = [
  { id: 1, naziv: 'Matematika', brojTema: 12, brojUcenika: 145 },
  { id: 2, naziv: 'Srpski jezik', brojTema: 10, brojUcenika: 145 },
  { id: 3, naziv: 'Engleski jezik', brojTema: 8, brojUcenika: 120 },
  { id: 4, naziv: 'Istorija', brojTema: 15, brojUcenika: 145 },
  { id: 5, naziv: 'Geografija', brojTema: 11, brojUcenika: 145 },
  { id: 6, naziv: 'Fizika', brojTema: 14, brojUcenika: 90 },
  { id: 7, naziv: 'Hemija', brojTema: 13, brojUcenika: 90 },
  { id: 8, naziv: 'Biologija', brojTema: 12, brojUcenika: 90 },
];

type View = 'predmeti' | 'teme' | 'nastavne-jedinice';

export function PredmetiPage() {
  const [predmeti, setPredmeti] = useState<Predmet[]>(mockPredmeti);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPredmet, setNewPredmet] = useState('');
  const [editingPredmet, setEditingPredmet] = useState<Predmet | null>(null);
  const [selectedPredmet, setSelectedPredmet] = useState<Predmet | null>(null);
  const [selectedTema, setSelectedTema] = useState<Tema | null>(null);
  const [currentView, setCurrentView] = useState<View>('predmeti');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddPredmet = () => {
    if (newPredmet.trim()) {
      const novPredmet: Predmet = {
        id: Math.max(...predmeti.map(p => p.id), 0) + 1,
        naziv: newPredmet.trim(),
        brojTema: 0,
        brojUcenika: 0
      };
      setPredmeti([...predmeti, novPredmet]);
      setNewPredmet('');
      setIsAddDialogOpen(false);
    }
  };

  const handleEditPredmet = () => {
    if (editingPredmet && editingPredmet.naziv.trim()) {
      setPredmeti(predmeti.map(p => 
        p.id === editingPredmet.id ? editingPredmet : p
      ));
      setEditingPredmet(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeletePredmet = (id: number) => {
    setPredmeti(predmeti.filter(p => p.id !== id));
  };

  const handleOpenTeme = (predmet: Predmet) => {
    setSelectedPredmet(predmet);
    setCurrentView('teme');
  };

  const handleBackToPredmeti = () => {
    setCurrentView('predmeti');
    setSelectedPredmet(null);
    setSelectedTema(null);
  };

  const handleBackToTeme = () => {
    setCurrentView('teme');
    setSelectedTema(null);
  };

  const handleOpenNJ = (tema: Tema) => {
    setSelectedTema(tema);
    setCurrentView('nastavne-jedinice');
  };

  const filteredPredmeti = predmeti.filter(p =>
    p.naziv.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto">
          {currentView === 'predmeti' && (
            <div className="p-8">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Predmeti</h1>
                    <p className="text-gray-600">Upravljajte predmetima, temama i nastavnim jedinicama</p>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/25 transition-all">
                        <Plus className="w-4 h-4" />
                        Dodaj predmet
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Dodaj novi predmet</DialogTitle>
                        <DialogDescription>
                          Unesite naziv novog predmeta
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="naziv">Naziv predmeta</Label>
                          <Input
                            id="naziv"
                            placeholder="npr. Matematika"
                            value={newPredmet}
                            onChange={(e) => setNewPredmet(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddPredmet()}
                            className="h-11"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Otkaži
                        </Button>
                        <Button onClick={handleAddPredmet} className="bg-blue-600 hover:bg-blue-700">
                          Dodaj
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Pretraži predmete..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-11 h-11 bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Predmet
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Teme
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Akcije
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredPredmeti.map((predmet) => (
                          <tr key={predmet.id} className="group hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                  <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{predmet.naziv}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-gray-900">{predmet.brojTema}</div>
                                <div className="text-sm text-gray-500">tema</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                                  onClick={() => handleOpenTeme(predmet)}
                                >
                                  Teme
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                                <Dialog open={isEditDialogOpen && editingPredmet?.id === predmet.id} onOpenChange={(open) => {
                                  setIsEditDialogOpen(open);
                                  if (!open) setEditingPredmet(null);
                                }}>
                                  <DialogTrigger asChild>
                                    <button
                                      className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
                                      onClick={() => setEditingPredmet({ ...predmet })}
                                    >
                                      <Pencil className="w-4 h-4 text-gray-600" />
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Izmeni predmet</DialogTitle>
                                      <DialogDescription>
                                        Promenite naziv predmeta
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-naziv">Naziv predmeta</Label>
                                        <Input
                                          id="edit-naziv"
                                          value={editingPredmet?.naziv || ''}
                                          onChange={(e) => setEditingPredmet(editingPredmet ? { ...editingPredmet, naziv: e.target.value } : null)}
                                          onKeyDown={(e) => e.key === 'Enter' && handleEditPredmet()}
                                          className="h-11"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                        Otkaži
                                      </Button>
                                      <Button onClick={handleEditPredmet} className="bg-blue-600 hover:bg-blue-700">
                                        Sačuvaj
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <button
                                  className="w-9 h-9 rounded-lg border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center transition-colors"
                                  onClick={() => handleDeletePredmet(predmet.id)}
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

                  {filteredPredmeti.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nema pronađenih predmeta</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentView === 'teme' && selectedPredmet && (
            <div className="p-8">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={handleBackToPredmeti}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Nazad
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Teme - {selectedPredmet.naziv}</h1>
                    <p className="text-gray-600">Upravljajte temama predmeta po razredima</p>
                  </div>
                </div>

                {/* Teme Page */}
                <TemePage predmet={selectedPredmet} onOpenNJ={handleOpenNJ} />
              </div>
            </div>
          )}

          {currentView === 'nastavne-jedinice' && selectedPredmet && selectedTema && (
            <div className="p-8">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={handleBackToTeme}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Nazad
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{selectedTema.naziv}</h1>
                    <p className="text-gray-600">{selectedPredmet.naziv} - {selectedTema.razred}. razred</p>
                  </div>
                </div>

                {/* Nastavne Jedinice Page */}
                <NastavneJedinicePage tema={selectedTema} predmet={selectedPredmet} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
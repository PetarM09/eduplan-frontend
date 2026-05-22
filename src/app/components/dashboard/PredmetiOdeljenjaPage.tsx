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
  ArrowLeft,
  Users as UsersIcon,
  X
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface Odeljenje {
  id: number;
  razred: string;
  indeks: string;
  smerId: number;
}

interface Predmet {
  id: number;
  naziv: string;
}

interface PredmetOdeljenja {
  id: number;
  predmetId: number;
  brojTeorije: number;
  brojVezbi: number;
}

interface Profesor {
  id: number;
  ime: string;
  prezime: string;
}

interface ProfesorPredmet {
  id: number;
  profesorId: number;
  predmetOdeljenjaId: number;
}

const mockPredmeti: Predmet[] = [
  { id: 1, naziv: 'Математика' },
  { id: 2, naziv: 'Српски језик' },
  { id: 3, naziv: 'Енглески језик' },
  { id: 4, naziv: 'Историја' },
  { id: 5, naziv: 'Географија' },
  { id: 6, naziv: 'Физика' },
  { id: 7, naziv: 'Хемија' },
  { id: 8, naziv: 'Биологија' },
];

const mockProfesori: Profesor[] = [
  { id: 1, ime: 'Марко', prezime: 'Марковић' },
  { id: 2, ime: 'Јана', prezime: 'Јанковић' },
  { id: 3, ime: 'Петар', prezime: 'Петровић' },
  { id: 4, ime: 'Ана', prezime: 'Николић' },
  { id: 5, ime: 'Иван', prezime: 'Ивановић' },
];

interface PredmetiOdeljenjaPageProps {
  odeljenje: Odeljenje;
  smer: string;
  onBack: () => void;
}

export function PredmetiOdeljenjaPage({ odeljenje, smer, onBack }: PredmetiOdeljenjaPageProps) {
  const [predmetiOdeljenja, setPredmetiOdeljenja] = useState<PredmetOdeljenja[]>([]);
  const [profesoriPredmeta, setProfesoriPredmeta] = useState<ProfesorPredmet[]>([]);
  const [dostupniPredmeti] = useState<Predmet[]>(mockPredmeti);
  const [profesori] = useState<Profesor[]>(mockProfesori);
  
  const [newPredmet, setNewPredmet] = useState<{predmetId: number | null; brojTeorije: string; brojVezbi: string}>({
    predmetId: null,
    brojTeorije: '',
    brojVezbi: ''
  });
  const [editingPredmet, setEditingPredmet] = useState<PredmetOdeljenja | null>(null);
  const [selectedPredmetZaProfesore, setSelectedPredmetZaProfesore] = useState<PredmetOdeljenja | null>(null);
  const [selectedProfesorId, setSelectedProfesorId] = useState<number | null>(null);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProfesoriDialogOpen, setIsProfesoriDialogOpen] = useState(false);
  const [isAddProfesorDialogOpen, setIsAddProfesorDialogOpen] = useState(false);

  const handleAddPredmet = () => {
    if (newPredmet.predmetId && newPredmet.brojTeorije && newPredmet.brojVezbi) {
      const novPredmet: PredmetOdeljenja = {
        id: Math.max(...predmetiOdeljenja.map(p => p.id), 0) + 1,
        predmetId: newPredmet.predmetId,
        brojTeorije: parseInt(newPredmet.brojTeorije),
        brojVezbi: parseInt(newPredmet.brojVezbi)
      };
      setPredmetiOdeljenja([...predmetiOdeljenja, novPredmet]);
      setNewPredmet({ predmetId: null, brojTeorije: '', brojVezbi: '' });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditPredmet = () => {
    if (editingPredmet) {
      setPredmetiOdeljenja(predmetiOdeljenja.map(p => 
        p.id === editingPredmet.id ? editingPredmet : p
      ));
      setEditingPredmet(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeletePredmet = (id: number) => {
    setPredmetiOdeljenja(predmetiOdeljenja.filter(p => p.id !== id));
    // Delete all professors for this predmet
    setProfesoriPredmeta(profesoriPredmeta.filter(pp => pp.predmetOdeljenjaId !== id));
  };

  const handleAddProfesor = () => {
    if (selectedProfesorId && selectedPredmetZaProfesore) {
      const novProfesor: ProfesorPredmet = {
        id: Math.max(...profesoriPredmeta.map(p => p.id), 0) + 1,
        profesorId: selectedProfesorId,
        predmetOdeljenjaId: selectedPredmetZaProfesore.id
      };
      setProfesoriPredmeta([...profesoriPredmeta, novProfesor]);
      setSelectedProfesorId(null);
      setIsAddProfesorDialogOpen(false);
    }
  };

  const handleDeleteProfesor = (id: number) => {
    setProfesoriPredmeta(profesoriPredmeta.filter(p => p.id !== id));
  };

  const handleOpenProfesori = (predmet: PredmetOdeljenja) => {
    setSelectedPredmetZaProfesore(predmet);
    setIsProfesoriDialogOpen(true);
  };

  const getPredmetNaziv = (predmetId: number) => {
    const predmet = dostupniPredmeti.find(p => p.id === predmetId);
    return predmet ? predmet.naziv : 'N/A';
  };

  const getProfesorFullName = (profesorId: number) => {
    const profesor = profesori.find(p => p.id === profesorId);
    return profesor ? `${profesor.ime} ${profesor.prezime}` : 'N/A';
  };

  const getProfesoriForPredmet = (predmetOdeljenjaId: number) => {
    return profesoriPredmeta.filter(pp => pp.predmetOdeljenjaId === predmetOdeljenjaId);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={onBack}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Nazad
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Predmeti i profesori - {odeljenje.razred}-{odeljenje.indeks}</h1>
                  <p className="text-gray-600">Smer: {smer}</p>
                </div>
              </div>

              {/* Add Button */}
              <div className="flex justify-end">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/25 transition-all">
                      <Plus className="w-4 h-4" />
                      Dodaj predmet
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dodaj predmet odeljenju</DialogTitle>
                      <DialogDescription>
                        Izaberite predmet i unesite broj časova
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="predmet">Predmet</Label>
                        <Select 
                          value={newPredmet.predmetId?.toString()} 
                          onValueChange={(value) => setNewPredmet({...newPredmet, predmetId: parseInt(value)})}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Izaberite predmet" />
                          </SelectTrigger>
                          <SelectContent>
                            {dostupniPredmeti.map((predmet) => (
                              <SelectItem key={predmet.id} value={predmet.id.toString()}>
                                {predmet.naziv}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brojTeorije">Broj časova teorije</Label>
                        <Input
                          id="brojTeorije"
                          type="number"
                          placeholder="npr. 2"
                          value={newPredmet.brojTeorije}
                          onChange={(e) => setNewPredmet({...newPredmet, brojTeorije: e.target.value})}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brojVezbi">Broj časova vežbi</Label>
                        <Input
                          id="brojVezbi"
                          type="number"
                          placeholder="npr. 1"
                          value={newPredmet.brojVezbi}
                          onChange={(e) => setNewPredmet({...newPredmet, brojVezbi: e.target.value})}
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

              {/* Predmeti List */}
              <div className="space-y-4">
                {predmetiOdeljenja.map((predmet) => (
                  <div key={predmet.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{getPredmetNaziv(predmet.predmetId)}</h3>
                          <p className="text-sm text-gray-500">
                            Teorija: {predmet.brojTeorije}č | Vežbe: {predmet.brojVezbi}č
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                                Promenite broj časova
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Predmet</Label>
                                <Input
                                  value={getPredmetNaziv(editingPredmet?.predmetId || 0)}
                                  disabled
                                  className="h-11 bg-gray-50"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-brojTeorije">Broj časova teorije</Label>
                                <Input
                                  id="edit-brojTeorije"
                                  type="number"
                                  value={editingPredmet?.brojTeorije || ''}
                                  onChange={(e) => setEditingPredmet(editingPredmet ? { ...editingPredmet, brojTeorije: parseInt(e.target.value) || 0 } : null)}
                                  className="h-11"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-brojVezbi">Broj časova vežbi</Label>
                                <Input
                                  id="edit-brojVezbi"
                                  type="number"
                                  value={editingPredmet?.brojVezbi || ''}
                                  onChange={(e) => setEditingPredmet(editingPredmet ? { ...editingPredmet, brojVezbi: parseInt(e.target.value) || 0 } : null)}
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
                          className="w-9 h-9 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 flex items-center justify-center transition-colors"
                          onClick={() => handleOpenProfesori(predmet)}
                        >
                          <UsersIcon className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          className="w-9 h-9 rounded-lg border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center transition-colors"
                          onClick={() => handleDeletePredmet(predmet.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Profesori za predmet */}
                    {getProfesoriForPredmet(predmet.id).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Angažovani profesori:</h4>
                        <div className="flex flex-wrap gap-2">
                          {getProfesoriForPredmet(predmet.id).map((pp) => (
                            <div key={pp.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                              {getProfesorFullName(pp.profesorId)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {predmetiOdeljenja.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nema dodatih predmeta</p>
                  </div>
                )}
              </div>

              {/* Profesori Dialog */}
              <Dialog open={isProfesoriDialogOpen} onOpenChange={setIsProfesoriDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Profesori - {selectedPredmetZaProfesore && getPredmetNaziv(selectedPredmetZaProfesore.predmetId)}</DialogTitle>
                    <DialogDescription>
                      Upravljajte profesorima koji predaju ovaj predmet
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Add profesor */}
                    <Dialog open={isAddProfesorDialogOpen} onOpenChange={setIsAddProfesorDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Dodaj profesora
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Dodaj profesora</DialogTitle>
                          <DialogDescription>
                            Izaberite profesora koji će predavati ovaj predmet
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="profesor">Profesor</Label>
                            <Select 
                              value={selectedProfesorId?.toString()} 
                              onValueChange={(value) => setSelectedProfesorId(parseInt(value))}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Izaberite profesora" />
                              </SelectTrigger>
                              <SelectContent>
                                {profesori.map((profesor) => (
                                  <SelectItem key={profesor.id} value={profesor.id.toString()}>
                                    {profesor.ime} {profesor.prezime}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddProfesorDialogOpen(false)}>
                            Otkaži
                          </Button>
                          <Button onClick={handleAddProfesor} className="bg-blue-600 hover:bg-blue-700">
                            Dodaj
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Lista profesora */}
                    <div className="space-y-2">
                      {selectedPredmetZaProfesore && getProfesoriForPredmet(selectedPredmetZaProfesore.id).map((pp) => (
                        <div key={pp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <UsersIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">{getProfesorFullName(pp.profesorId)}</span>
                          </div>
                          <button
                            className="w-8 h-8 rounded-lg border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center transition-colors"
                            onClick={() => handleDeleteProfesor(pp.id)}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ))}

                      {selectedPredmetZaProfesore && getProfesoriForPredmet(selectedPredmetZaProfesore.id).length === 0 && (
                        <div className="text-center py-8">
                          <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Nema dodeljenih profesora</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsProfesoriDialogOpen(false)}>
                      Zatvori
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

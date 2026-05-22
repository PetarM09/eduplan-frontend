import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { 
  School, 
  Plus, 
  Pencil, 
  Trash2,
  Search,
  BookOpen,
  Users,
  ArrowLeft,
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
import { PredmetiOdeljenjaPage } from './PredmetiOdeljenjaPage';

interface Smer {
  id: number;
  naziv: string;
}

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

const mockSmerovi: Smer[] = [
  { id: 1, naziv: 'Друштвено-језички' },
  { id: 2, naziv: 'Природно-математички' },
  { id: 3, naziv: 'IT смер' },
];

const mockOdeljenja: Odeljenje[] = [
  { id: 1, razred: '1', indeks: '1', smerId: 1 },
  { id: 2, razred: '1', indeks: '2', smerId: 2 },
  { id: 3, razred: '2', indeks: '1', smerId: 1 },
  { id: 4, razred: '3', indeks: '1', smerId: 3 },
];

export function OdeljenjaPage() {
  const [odeljenja, setOdeljenja] = useState<Odeljenje[]>(mockOdeljenja);
  const [smerovi] = useState<Smer[]>(mockSmerovi);
  const [searchQuery, setSearchQuery] = useState('');
  const [newOdeljenje, setNewOdeljenje] = useState<{razred: string; indeks: string; smerId: number | null}>({
    razred: '',
    indeks: '',
    smerId: null
  });
  const [editingOdeljenje, setEditingOdeljenje] = useState<Odeljenje | null>(null);
  const [selectedOdeljenje, setSelectedOdeljenje] = useState<Odeljenje | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingPredmeti, setViewingPredmeti] = useState(false);

  const handleAddOdeljenje = () => {
    if (newOdeljenje.razred.trim() && newOdeljenje.indeks.trim() && newOdeljenje.smerId) {
      const novoOdeljenje: Odeljenje = {
        id: Math.max(...odeljenja.map(o => o.id), 0) + 1,
        razred: newOdeljenje.razred.trim(),
        indeks: newOdeljenje.indeks.trim(),
        smerId: newOdeljenje.smerId
      };
      setOdeljenja([...odeljenja, novoOdeljenje]);
      setNewOdeljenje({ razred: '', indeks: '', smerId: null });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditOdeljenje = () => {
    if (editingOdeljenje && editingOdeljenje.razred.trim() && editingOdeljenje.indeks.trim()) {
      setOdeljenja(odeljenja.map(o => 
        o.id === editingOdeljenje.id ? editingOdeljenje : o
      ));
      setEditingOdeljenje(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteOdeljenje = (id: number) => {
    setOdeljenja(odeljenja.filter(o => o.id !== id));
  };

  const handleOpenPredmeti = (odeljenje: Odeljenje) => {
    setSelectedOdeljenje(odeljenje);
    setViewingPredmeti(true);
  };

  const handleBackToOdeljenja = () => {
    setViewingPredmeti(false);
    setSelectedOdeljenje(null);
  };

  const getSmerNaziv = (smerId: number) => {
    const smer = smerovi.find(s => s.id === smerId);
    return smer ? smer.naziv : 'N/A';
  };

  const filteredOdeljenja = odeljenja.filter(o =>
    `${o.razred}-${o.indeks}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getSmerNaziv(o.smerId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (viewingPredmeti && selectedOdeljenje) {
    return <PredmetiOdeljenjaPage odeljenje={selectedOdeljenje} smer={getSmerNaziv(selectedOdeljenje.smerId)} onBack={handleBackToOdeljenja} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Odeljenja</h1>
                  <p className="text-gray-600">Upravljajte odeljenjima i njihovim predmetima</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/25 transition-all">
                      <Plus className="w-4 h-4" />
                      Dodaj odeljenje
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dodaj novo odeljenje</DialogTitle>
                      <DialogDescription>
                        Unesite informacije o novom odeljenju
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="razred">Razred</Label>
                        <Input
                          id="razred"
                          placeholder="npr. 1"
                          value={newOdeljenje.razred}
                          onChange={(e) => setNewOdeljenje({...newOdeljenje, razred: e.target.value})}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="indeks">Indeks</Label>
                        <Input
                          id="indeks"
                          placeholder="npr. 1"
                          value={newOdeljenje.indeks}
                          onChange={(e) => setNewOdeljenje({...newOdeljenje, indeks: e.target.value})}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smer">Smer</Label>
                        <Select 
                          value={newOdeljenje.smerId?.toString()} 
                          onValueChange={(value) => setNewOdeljenje({...newOdeljenje, smerId: parseInt(value)})}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Izaberite smer" />
                          </SelectTrigger>
                          <SelectContent>
                            {smerovi.map((smer) => (
                              <SelectItem key={smer.id} value={smer.id.toString()}>
                                {smer.naziv}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Otkaži
                      </Button>
                      <Button onClick={handleAddOdeljenje} className="bg-blue-600 hover:bg-blue-700">
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
                    placeholder="Pretraži odeljenja..."
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
                          Odeljenje
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Smer
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Akcije
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOdeljenja.map((odeljenje) => (
                        <tr key={odeljenje.id} className="group hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                                <School className="w-5 h-5 text-cyan-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{odeljenje.razred}-{odeljenje.indeks}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{getSmerNaziv(odeljenje.smerId)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={() => handleOpenPredmeti(odeljenje)}
                              >
                                <BookOpen className="w-4 h-4" />
                                Predmeti i profesori
                              </Button>
                              <Dialog open={isEditDialogOpen && editingOdeljenje?.id === odeljenje.id} onOpenChange={(open) => {
                                setIsEditDialogOpen(open);
                                if (!open) setEditingOdeljenje(null);
                              }}>
                                <DialogTrigger asChild>
                                  <button
                                    className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
                                    onClick={() => setEditingOdeljenje({ ...odeljenje })}
                                  >
                                    <Pencil className="w-4 h-4 text-gray-600" />
                                  </button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Izmeni odeljenje</DialogTitle>
                                    <DialogDescription>
                                      Promenite informacije o odeljenju
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-razred">Razred</Label>
                                      <Input
                                        id="edit-razred"
                                        value={editingOdeljenje?.razred || ''}
                                        onChange={(e) => setEditingOdeljenje(editingOdeljenje ? { ...editingOdeljenje, razred: e.target.value } : null)}
                                        className="h-11"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-indeks">Indeks</Label>
                                      <Input
                                        id="edit-indeks"
                                        value={editingOdeljenje?.indeks || ''}
                                        onChange={(e) => setEditingOdeljenje(editingOdeljenje ? { ...editingOdeljenje, indeks: e.target.value } : null)}
                                        className="h-11"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-smer">Smer</Label>
                                      <Select 
                                        value={editingOdeljenje?.smerId.toString()} 
                                        onValueChange={(value) => setEditingOdeljenje(editingOdeljenje ? { ...editingOdeljenje, smerId: parseInt(value) } : null)}
                                      >
                                        <SelectTrigger className="h-11">
                                          <SelectValue placeholder="Izaberite smer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {smerovi.map((smer) => (
                                            <SelectItem key={smer.id} value={smer.id.toString()}>
                                              {smer.naziv}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                      Otkaži
                                    </Button>
                                    <Button onClick={handleEditOdeljenje} className="bg-blue-600 hover:bg-blue-700">
                                      Sačuvaj
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <button
                                className="w-9 h-9 rounded-lg border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center transition-colors"
                                onClick={() => handleDeleteOdeljenje(odeljenje.id)}
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

                {filteredOdeljenja.length === 0 && (
                  <div className="text-center py-12">
                    <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nema pronađenih odeljenja</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

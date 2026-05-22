import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { 
  Plus, 
  Search,
  MoreVertical,
  Mail,
  Shield,
  UserCheck,
  Pencil,
  Trash2,
  Filter
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface User {
  id: number;
  ime: string;
  email: string;
  uloga: 'admin' | 'nastavnik' | 'ucenik';
  status: 'aktivan' | 'neaktivan';
  avatar?: string;
}

const mockUsers: User[] = [
  { id: 1, ime: 'Marko Marković', email: 'marko@example.com', uloga: 'admin', status: 'aktivan' },
  { id: 2, ime: 'Ana Anić', email: 'ana@example.com', uloga: 'nastavnik', status: 'aktivan' },
  { id: 3, ime: 'Petar Petrović', email: 'petar@example.com', uloga: 'nastavnik', status: 'aktivan' },
  { id: 4, ime: 'Jovana Jovanović', email: 'jovana@example.com', uloga: 'ucenik', status: 'aktivan' },
  { id: 5, ime: 'Stefan Stefanović', email: 'stefan@example.com', uloga: 'ucenik', status: 'aktivan' },
  { id: 6, ime: 'Milica Milić', email: 'milica@example.com', uloga: 'ucenik', status: 'neaktivan' },
  { id: 7, ime: 'Nikola Nikolić', email: 'nikola@example.com', uloga: 'nastavnik', status: 'aktivan' },
  { id: 8, ime: 'Jelena Jelenković', email: 'jelena@example.com', uloga: 'ucenik', status: 'aktivan' },
];

const roleColors = {
  admin: { bg: 'bg-red-100', text: 'text-red-700', label: 'Administrator' },
  nastavnik: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Nastavnik' },
  ucenik: { bg: 'bg-green-100', text: 'text-green-700', label: 'Učenik' }
};

const statusColors = {
  aktivan: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  neaktivan: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' }
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('sve');
  const [statusFilter, setStatusFilter] = useState<string>('sve');
  const [newUser, setNewUser] = useState({
    ime: '',
    email: '',
    uloga: 'ucenik' as 'admin' | 'nastavnik' | 'ucenik',
    status: 'aktivan' as 'aktivan' | 'neaktivan'
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddUser = () => {
    if (newUser.ime.trim() && newUser.email.trim()) {
      const noviUser: User = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ime: newUser.ime.trim(),
        email: newUser.email.trim(),
        uloga: newUser.uloga,
        status: newUser.status
      };
      setUsers([...users, noviUser]);
      setNewUser({ ime: '', email: '', uloga: 'ucenik', status: 'aktivan' });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditUser = () => {
    if (editingUser && editingUser.ime.trim() && editingUser.email.trim()) {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.ime.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'sve' || user.uloga === roleFilter;
    const matchesStatus = statusFilter === 'sve' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    admin: users.filter(u => u.uloga === 'admin').length,
    nastavnik: users.filter(u => u.uloga === 'nastavnik').length,
    ucenik: users.filter(u => u.uloga === 'ucenik').length,
    active: users.filter(u => u.status === 'aktivan').length
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Korisnici</h1>
                <p className="text-gray-600">Upravljajte korisnicima i njihovim ulogama</p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/25 transition-all">
                    <Plus className="w-4 h-4" />
                    Dodaj korisnika
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dodaj novog korisnika</DialogTitle>
                    <DialogDescription>
                      Popunite podatke za novog korisnika
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="ime">Ime i prezime</Label>
                      <Input
                        id="ime"
                        placeholder="Marko Marković"
                        value={newUser.ime}
                        onChange={(e) => setNewUser({ ...newUser, ime: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="marko@example.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uloga">Uloga</Label>
                      <Select value={newUser.uloga} onValueChange={(value: any) => setNewUser({ ...newUser, uloga: value })}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ucenik">Učenik</SelectItem>
                          <SelectItem value="nastavnik">Nastavnik</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Otkaži
                    </Button>
                    <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                      Dodaj
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
                <div className="text-sm text-gray-600">Ukupno</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">{stats.admin}</div>
                <div className="text-sm text-gray-600">Administratora</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.nastavnik}</div>
                <div className="text-sm text-gray-600">Nastavnika</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.ucenik}</div>
                <div className="text-sm text-gray-600">Učenika</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.active}</div>
                <div className="text-sm text-gray-600">Aktivnih</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Pretraži korisnike..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-11 bg-gray-50 border-gray-200"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-11">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <SelectValue placeholder="Sve uloge" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sve">Sve uloge</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="nastavnik">Nastavnik</SelectItem>
                    <SelectItem value="ucenik">Učenik</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-11">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <SelectValue placeholder="Svi statusi" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sve">Svi statusi</SelectItem>
                    <SelectItem value="aktivan">Aktivni</SelectItem>
                    <SelectItem value="neaktivan">Neaktivni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Korisnik
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Uloga
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Akcije
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                              {getInitials(user.ime)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{user.ime}</div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium ${roleColors[user.uloga].bg} ${roleColors[user.uloga].text}`}>
                            {user.uloga === 'admin' && <Shield className="w-3 h-3" />}
                            {user.uloga === 'nastavnik' && <UserCheck className="w-3 h-3" />}
                            {roleColors[user.uloga].label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium ${statusColors[user.status].bg} ${statusColors[user.status].text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusColors[user.status].dot}`}></span>
                            {user.status === 'aktivan' ? 'Aktivan' : 'Neaktivan'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors">
                                  <MoreVertical className="w-4 h-4 text-gray-600" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setEditingUser({ ...user });
                                  setIsEditDialogOpen(true);
                                }}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Izmeni
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Pošalji email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Obriši
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nema pronađenih korisnika</p>
                </div>
              )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Izmeni korisnika</DialogTitle>
                  <DialogDescription>
                    Promenite podatke o korisniku
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-ime">Ime i prezime</Label>
                    <Input
                      id="edit-ime"
                      value={editingUser?.ime || ''}
                      onChange={(e) => setEditingUser(editingUser ? { ...editingUser, ime: e.target.value } : null)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingUser?.email || ''}
                      onChange={(e) => setEditingUser(editingUser ? { ...editingUser, email: e.target.value } : null)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-uloga">Uloga</Label>
                    <Select 
                      value={editingUser?.uloga} 
                      onValueChange={(value: any) => setEditingUser(editingUser ? { ...editingUser, uloga: value } : null)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ucenik">Učenik</SelectItem>
                        <SelectItem value="nastavnik">Nastavnik</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select 
                      value={editingUser?.status} 
                      onValueChange={(value: any) => setEditingUser(editingUser ? { ...editingUser, status: value } : null)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aktivan">Aktivan</SelectItem>
                        <SelectItem value="neaktivan">Neaktivan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Otkaži
                  </Button>
                  <Button onClick={handleEditUser} className="bg-blue-600 hover:bg-blue-700">
                    Sačuvaj
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}

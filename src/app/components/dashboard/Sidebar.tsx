import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  LogOut,
  GraduationCap,
  ChevronRight,
  School,
  FileText,
  Shield,
  UserX,
  Repeat,
  ClipboardList,
  BarChart3,
  Library,
  ClipboardCheck,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { useAuth, type Uloga } from '@/context/AuthContext';

interface MenuItem {
  path: string;
  icon: LucideIcon;
  label: string;
  uloge?: Uloga[]; // undefined znaci dostupno svima ulogovanim
}

/**
 * Stavke menija se filtriraju po ulozi korisnika. Sidebar prirodno prilagodjava
 * sadrzaj za nastavnika, koordinatora/direktora, PP sluzbu i super admin-a.
 */
const STAVKE_GLAVNO: MenuItem[] = [
  { path: '/super-dashboard', icon: Shield, label: 'Skole', uloge: ['SUPER_ADMIN'] },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', uloge: ['NASTAVNIK'] },
  { path: '/admin-dashboard', icon: Shield, label: 'Dashboard', uloge: ['KOORDINATOR', 'ADMIN', 'DIREKTOR'] },
  { path: '/pp/dashboard', icon: BarChart3, label: 'PP Dashboard', uloge: ['PP_SLUZBA'] },
  { path: '/raspored', icon: Calendar, label: 'Raspored', uloge: ['NASTAVNIK', 'KOORDINATOR', 'ADMIN', 'DIREKTOR', 'PP_SLUZBA'] },
  { path: '/zamene', icon: UserX, label: 'Zamene', uloge: ['NASTAVNIK', 'KOORDINATOR', 'ADMIN', 'DIREKTOR', 'PP_SLUZBA'] },
  { path: '/rotacija', icon: Repeat, label: 'Rotacija', uloge: ['NASTAVNIK', 'KOORDINATOR', 'ADMIN', 'DIREKTOR'] },
  { path: '/planovi/godisnji', icon: FileText, label: 'Godisnji planovi', uloge: ['NASTAVNIK', 'PP_SLUZBA', 'DIREKTOR', 'KOORDINATOR'] },
  { path: '/planovi/operativni', icon: ClipboardList, label: 'Operativni planovi', uloge: ['NASTAVNIK', 'PP_SLUZBA', 'DIREKTOR', 'KOORDINATOR'] },
  { path: '/pp/izvestaji', icon: ClipboardCheck, label: 'PP izvestaji', uloge: ['NASTAVNIK', 'PP_SLUZBA', 'DIREKTOR', 'KOORDINATOR'] },
  { path: '/katalog', icon: Library, label: 'Katalog', uloge: ['NASTAVNIK', 'KOORDINATOR', 'ADMIN', 'DIREKTOR', 'PP_SLUZBA'] },
];

const STAVKE_ADMIN: MenuItem[] = [
  { path: '/korisnici', icon: Users, label: 'Korisnici', uloge: ['KOORDINATOR', 'DIREKTOR'] },
  { path: '/predmeti', icon: BookOpen, label: 'Predmeti', uloge: ['KOORDINATOR', 'ADMIN', 'DIREKTOR'] },
  { path: '/odeljenja', icon: School, label: 'Odeljenja', uloge: ['KOORDINATOR', 'ADMIN', 'DIREKTOR'] },
  { path: '/skola/postavke', icon: Settings, label: 'Postavke skole', uloge: ['KOORDINATOR', 'DIREKTOR'] },
];

function imaPristup(item: MenuItem, uloga: Uloga | undefined): boolean {
  if (!uloga) return false;
  if (!item.uloge) return true;
  return item.uloge.includes(uloga);
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const glavnoZaUlogu = STAVKE_GLAVNO.filter((s) => imaPristup(s, user?.uloga));
  const adminZaUlogu = STAVKE_ADMIN.filter((s) => imaPristup(s, user?.uloga));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 px-6 flex items-center gap-3 border-b border-gray-200">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Skolska platforma</h1>
          <p className="text-xs text-gray-500">{user?.uloga ?? '—'}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <SekcijaMenija naziv="Glavno" stavke={glavnoZaUlogu} activeColor="blue" location={location.pathname} />
        {adminZaUlogu.length > 0 && (
          <SekcijaMenija
            naziv="Administracija"
            stavke={adminZaUlogu}
            activeColor="indigo"
            location={location.pathname}
          />
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-4 h-11 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
          <span className="font-medium text-sm">Odjavi se</span>
        </button>
      </div>
    </aside>
  );
}

interface SekcijaProps {
  naziv: string;
  stavke: MenuItem[];
  activeColor: 'blue' | 'indigo';
  location: string;
}

function SekcijaMenija({ naziv, stavke, activeColor, location }: SekcijaProps) {
  const activeBg = activeColor === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700';
  const activeIcon = activeColor === 'blue' ? 'text-blue-600' : 'text-indigo-600';

  return (
    <div>
      <div className="px-3 mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{naziv}</p>
      </div>
      <div className="space-y-1">
        {stavke.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-4 h-11 rounded-xl transition-all ${
                isActive ? `${activeBg} shadow-sm` : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? activeIcon : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && <ChevronRight className={`w-4 h-4 ml-auto ${activeIcon}`} />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

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
  History,
  type LucideIcon,
} from 'lucide-react';
import { useAuth, type Uloga } from '@/context/AuthContext';

interface MenuItem {
  path: string;
  icon: LucideIcon;
  label: string;
  uloge?: Uloga[]; // undefined znaci dostupno svima ulogovanim
}

const STAVKE_GLAVNO: MenuItem[] = [
  { path: '/super-dashboard', icon: Shield, label: 'Skole', uloge: ['SUPER_ADMIN'] },
  { path: '/master-katalog', icon: GraduationCap, label: 'Master katalog', uloge: ['SUPER_ADMIN'] },
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
  { path: '/skola-onboarding', icon: GraduationCap, label: 'Onboarding wizard', uloge: ['KOORDINATOR'] },
  { path: '/korisnici', icon: Users, label: 'Korisnici', uloge: ['KOORDINATOR', 'DIREKTOR'] },
  { path: '/predmeti', icon: BookOpen, label: 'Predmeti', uloge: ['KOORDINATOR', 'ADMIN', 'DIREKTOR'] },
  { path: '/odeljenja', icon: School, label: 'Odeljenja', uloge: ['KOORDINATOR', 'ADMIN', 'DIREKTOR'] },
  { path: '/skola/postavke', icon: Settings, label: 'Postavke skole', uloge: ['KOORDINATOR', 'DIREKTOR'] },
  { path: '/raspored/verzije', icon: History, label: 'Verzije rasporeda', uloge: ['KOORDINATOR', 'DIREKTOR', 'ADMIN'] },
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
  const sa = user?.uloga === 'SUPER_ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Paleta sidebar-a — tamna sa narandzastim accent-om za super admina
  const sidebarBg = sa ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const logoGradient = sa ? 'from-orange-500 to-amber-600 shadow-orange-500/30' : 'from-blue-600 to-indigo-600 shadow-blue-600/20';
  const headerTitle = sa ? 'text-white' : 'text-gray-900';
  const headerSub = sa ? 'text-orange-300' : 'text-gray-500';
  const logoutClass = sa
    ? 'text-slate-300 hover:bg-red-900/40 hover:text-red-300'
    : 'text-gray-700 hover:bg-red-50 hover:text-red-700';
  const logoutIconClass = sa ? 'text-slate-500 group-hover:text-red-400' : 'text-gray-400 group-hover:text-red-600';
  const borderTop = sa ? 'border-slate-800' : 'border-gray-200';
  const borderBottom = sa ? 'border-slate-800' : 'border-gray-200';

  return (
    <aside className={`w-72 border-r flex flex-col ${sidebarBg}`}>
      <div className={`h-16 px-6 flex items-center gap-3 border-b ${borderBottom}`}>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${logoGradient} flex items-center justify-center shadow-lg`}>
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className={`text-lg font-bold ${headerTitle}`}>Skolska platforma</h1>
          <p className={`text-xs ${headerSub}`}>{user?.uloga ?? '—'}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <SekcijaMenija
          naziv="Glavno"
          stavke={glavnoZaUlogu}
          activeColor={sa ? 'orange' : 'blue'}
          location={location.pathname}
          tamna={sa}
        />
        {adminZaUlogu.length > 0 && (
          <SekcijaMenija
            naziv="Administracija"
            stavke={adminZaUlogu}
            activeColor={sa ? 'orange' : 'indigo'}
            location={location.pathname}
            tamna={sa}
          />
        )}
      </nav>

      <div className={`p-4 border-t ${borderTop}`}>
        <button
          onClick={handleLogout}
          className={`group w-full flex items-center gap-3 px-4 h-11 rounded-xl transition-all ${logoutClass}`}
        >
          <LogOut className={`w-5 h-5 transition-colors ${logoutIconClass}`} />
          <span className="font-medium text-sm">Odjavi se</span>
        </button>
      </div>
    </aside>
  );
}

interface SekcijaProps {
  naziv: string;
  stavke: MenuItem[];
  activeColor: 'blue' | 'indigo' | 'orange';
  location: string;
  tamna: boolean;
}

function SekcijaMenija({ naziv, stavke, activeColor, location, tamna }: SekcijaProps) {
  const activeStilovi = {
    blue: { bg: 'bg-blue-50 text-blue-700', icon: 'text-blue-600' },
    indigo: { bg: 'bg-indigo-50 text-indigo-700', icon: 'text-indigo-600' },
    orange: { bg: 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30', icon: 'text-orange-400' },
  };
  const { bg: activeBg, icon: activeIcon } = activeStilovi[activeColor];

  const labelText = tamna ? 'text-slate-500' : 'text-gray-400';
  const inactiveText = tamna
    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900';
  const inactiveIcon = tamna
    ? 'text-slate-500 group-hover:text-slate-300'
    : 'text-gray-400 group-hover:text-gray-600';

  return (
    <div>
      <div className="px-3 mb-2">
        <p className={`text-xs font-semibold uppercase tracking-wider ${labelText}`}>{naziv}</p>
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
                isActive ? `${activeBg} shadow-sm` : inactiveText
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${isActive ? activeIcon : inactiveIcon}`}
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

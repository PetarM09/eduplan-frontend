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
  Mail,
  type LucideIcon,
} from 'lucide-react';
import { useAuth, type Uloga } from '@/context/AuthContext';
import logoIcon from '@/assets/logo-icon.svg';

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
  { path: '/pozivnice', icon: Mail, label: 'Pozivnice', uloge: ['KOORDINATOR'] },
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

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      <div className="h-16 px-6 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-white/10 ring-1 ring-white/10 flex items-center justify-center overflow-hidden">
          <img src={logoIcon} alt="BehindClasses" className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">BehindClasses</h1>
          <p className="text-xs text-sidebar-foreground/70">{user?.uloga ?? '—'}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <SekcijaMenija naziv="Glavno" stavke={glavnoZaUlogu} location={location.pathname} />
        {adminZaUlogu.length > 0 && (
          <SekcijaMenija naziv="Administracija" stavke={adminZaUlogu} location={location.pathname} />
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-4 h-11 rounded-xl transition-all text-sidebar-foreground hover:bg-destructive/15 hover:text-destructive-foreground"
        >
          <LogOut className="w-5 h-5 text-sidebar-foreground/60 transition-colors group-hover:text-destructive-foreground" />
          <span className="font-medium text-sm">Odjavi se</span>
        </button>
      </div>
    </aside>
  );
}

interface SekcijaProps {
  naziv: string;
  stavke: MenuItem[];
  location: string;
}

function SekcijaMenija({ naziv, stavke, location }: SekcijaProps) {
  return (
    <div>
      <div className="px-3 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">{naziv}</p>
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
                isActive
                  ? 'bg-sidebar-primary/15 text-sidebar-primary ring-1 ring-sidebar-primary/30'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground'
                }`}
              />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-sidebar-primary" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

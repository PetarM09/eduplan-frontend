import { User, ChevronDown, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function ulogaLabel(uloga: string | undefined): string {
  switch (uloga) {
    case 'SUPER_ADMIN':
      return 'Super administrator';
    case 'KOORDINATOR':
      return 'Koordinator';
    case 'DIREKTOR':
      return 'Direktor';
    case 'ADMIN':
      return 'Administrator';
    case 'PP_SLUZBA':
      return 'PP sluzba';
    case 'NASTAVNIK':
      return 'Nastavnik';
    default:
      return uloga ?? '';
  }
}

export function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Zatvori dropdown na klik izvan njega
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const sa = user?.uloga === 'SUPER_ADMIN';
  const barBg = sa ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const btnHover = sa ? 'hover:bg-slate-800' : 'hover:bg-gray-50';
  const userGradient = sa ? 'from-orange-500 to-amber-600' : 'from-blue-600 to-indigo-600';
  const usernameClass = sa ? 'text-white' : 'text-gray-900';
  const subClass = sa ? 'text-orange-300' : 'text-gray-500';
  const chevronClass = sa
    ? 'text-slate-400 group-hover:text-slate-200'
    : 'text-gray-400 group-hover:text-gray-600';

  // Dropdown stilovi
  const dropdownBg = sa
    ? 'bg-slate-900 border-slate-700'
    : 'bg-white border-gray-200';
  const dropdownDivider = sa ? 'border-slate-800' : 'border-gray-100';
  const dropdownUsername = sa ? 'text-white' : 'text-gray-900';
  const dropdownEmail = sa ? 'text-slate-400' : 'text-gray-500';
  const roleBadge = sa
    ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/30'
    : 'bg-blue-50 text-blue-700';
  const logoutBtn = sa
    ? 'text-red-400 hover:bg-red-500/15 hover:text-red-300'
    : 'text-red-600 hover:bg-red-50';

  return (
    <header className={`h-16 border-b px-8 flex items-center justify-end ${barBg}`}>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-3 px-3 h-10 rounded-xl transition-colors group ${btnHover}`}
        >
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${userGradient} flex items-center justify-center`}>
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="text-left hidden xl:block">
            <div className={`text-sm font-medium ${usernameClass}`}>{user?.username ?? '—'}</div>
            <div className={`text-xs ${subClass}`}>{ulogaLabel(user?.uloga)}</div>
          </div>
          <ChevronDown className={`w-4 h-4 transition-colors hidden xl:block ${chevronClass}`} />
        </button>

        {open && (
          <div className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl border py-2 z-50 ${dropdownBg}`}>
            <div className={`px-4 py-3 border-b ${dropdownDivider}`}>
              <div className={`font-medium ${dropdownUsername}`}>{user?.username ?? '—'}</div>
              <div className={`text-sm ${dropdownEmail}`}>{user?.email ?? ''}</div>
              <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge}`}>
                {ulogaLabel(user?.uloga)}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${logoutBtn}`}
            >
              <LogOut className="w-4 h-4" />
              Odjavi se
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

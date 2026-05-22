import { User, ChevronDown, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/** Citljiv label za enum ulogu (prikaz u UI). */
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

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-end">
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-3 px-3 h-10 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="text-left hidden xl:block">
            <div className="text-sm font-medium text-gray-900">{user?.username ?? '—'}</div>
            <div className="text-xs text-gray-500">{ulogaLabel(user?.uloga)}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors hidden xl:block" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="font-medium text-gray-900">{user?.username ?? '—'}</div>
              <div className="text-sm text-gray-500">{user?.email ?? ''}</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {ulogaLabel(user?.uloga)}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
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

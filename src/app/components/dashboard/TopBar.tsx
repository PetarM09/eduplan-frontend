import { User, ChevronDown, LogOut, Sun, Moon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();
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

  // SUPER_ADMIN traka prati tamnu "command center" podlogu tih ekrana.
  const sa = user?.uloga === 'SUPER_ADMIN';
  const barClass = sa ? 'bg-brand-900 border-brand-800' : 'bg-card border-border';
  const iconBtnClass = sa
    ? 'text-brand-200 hover:bg-white/10 hover:text-white'
    : 'text-muted-foreground hover:bg-secondary hover:text-foreground';
  const triggerHover = sa ? 'hover:bg-white/10' : 'hover:bg-secondary';
  const nameClass = sa ? 'text-white' : 'text-foreground';
  const subClass = sa ? 'text-brand-200' : 'text-muted-foreground';
  const chevronClass = sa
    ? 'text-brand-300 group-hover:text-white'
    : 'text-muted-foreground group-hover:text-foreground';

  return (
    <header className={`h-16 border-b px-8 flex items-center justify-end gap-2 ${barClass}`}>
      <button
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Svetla tema' : 'Tamna tema'}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${iconBtnClass}`}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-3 px-3 h-10 rounded-xl transition-colors group ${triggerHover}`}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-left hidden xl:block">
            <div className={`text-sm font-medium ${nameClass}`}>{user?.username ?? '—'}</div>
            <div className={`text-xs ${subClass}`}>{ulogaLabel(user?.uloga)}</div>
          </div>
          <ChevronDown className={`w-4 h-4 transition-colors hidden xl:block ${chevronClass}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl border border-border bg-popover py-2 z-50">
            <div className="px-4 py-3 border-b border-border">
              <div className="font-medium text-popover-foreground">{user?.username ?? '—'}</div>
              <div className="text-sm text-muted-foreground">{user?.email ?? ''}</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-accent/15 text-foreground ring-1 ring-accent/40">
                {ulogaLabel(user?.uloga)}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 text-destructive hover:bg-destructive/10"
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

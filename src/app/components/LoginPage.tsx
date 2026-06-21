import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ApiError } from '@/lib/api';
import { Eye, EyeOff, ArrowRight, CheckCircle2, Sun, Moon } from 'lucide-react';
import logoIcon from '@/assets/logo-icon.svg';
import logoWordmark from '@/assets/logo-wordmark.svg';

function pocetnaPoUlogi(uloga: string): string {
  switch (uloga) {
    case 'SUPER_ADMIN':
      return '/super-dashboard';
    case 'KOORDINATOR':
    case 'ADMIN':
    case 'DIREKTOR':
      return '/admin-dashboard';
    case 'PP_SLUZBA':
      return '/pp/dashboard';
    case 'NASTAVNIK':
    default:
      return '/dashboard';
  }
}

const FEATURES = [
  'Kompletan pregled svih predmeta i tema',
  'Organizacija nastavnih jedinica',
  'Praćenje ishoda učenja',
  'Kolaboracija sa kolegama',
];

const STATS = [
  { label: 'Korisnika', value: '2,500+' },
  { label: 'Škola', value: '150+' },
  { label: 'Planova', value: '50K+' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      await login(username, password);
      const savedUser = JSON.parse(localStorage.getItem('sp.user') ?? '{}');
      navigate(pocetnaPoUlogi(savedUser.uloga), { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(
          err.code === 'NEISPRAVNI_KREDENCIJALI'
            ? 'Pogresno korisnicko ime ili lozinka'
            : err.message
        );
      } else {
        setErrorMessage('Doslo je do greske prilikom prijave');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Dekorativni blur akcenti */}
      <div className="absolute top-[-6rem] right-[-6rem] w-96 h-96 bg-accent-400/15 rounded-full blur-3xl" />
      <div className="absolute bottom-[-8rem] left-[-6rem] w-[28rem] h-[28rem] bg-brand-600/30 rounded-full blur-3xl" />

      {/* Prebacivac teme */}
      <button
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Svetla tema' : 'Tamna tema'}
        className="absolute top-6 right-6 z-20 w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Jedinstvena kartica: levo brend panel, desno forma */}
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">

        {/* LEVI BREND PANEL */}
        <div className="hidden lg:flex bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-10 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-14">
              <div className="w-12 h-12 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center overflow-hidden">
                <img src={logoIcon} alt="BehindClasses" className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">BehindClasses</h1>
                <p className="text-sm text-brand-100">Sistem za planiranje nastave</p>
              </div>
            </div>

            <div className="space-y-6 max-w-md">
              <h2 className="text-3xl font-bold text-white leading-tight">
                Organizujte nastavu{' '}
                <span className="text-accent-400">brže i efikasnije</span>
              </h2>
              <p className="text-brand-100">
                Moderna platforma za upravljanje predmetima, temama i nastavnim jedinicama
              </p>
              <div className="space-y-3 pt-2">
                {FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-accent-400/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-accent-300" />
                    </div>
                    <span className="text-brand-50 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-10">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-brand-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DESNI PANEL — FORMA */}
        <div className="bg-card p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
          <img src={logoWordmark} alt="BehindClasses" className="h-12 w-auto mb-8 dark:hidden" />
          <div className="hidden dark:flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center overflow-hidden">
              <img src={logoIcon} alt="BehindClasses" className="w-7 h-7" />
            </div>
            <span className="text-xl font-bold text-foreground">BehindClasses</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Dobrodošli nazad</h2>
            <p className="text-muted-foreground">Prijavite se na svoj nalog</p>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Korisničko ime
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Unesite korisničko ime"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 px-4 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">
                  Lozinka
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Zaboravili ste?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 px-4 pr-12 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full h-12 shadow-lg shadow-primary/25 group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Prijavljivanje...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Prijavite se
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
            <p className="text-center">
              Nalog kreira koordinator vase skole. Ako jos nemate pristup, kontaktirajte
              administraciju.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ApiError } from '@/lib/api';
import { Eye, EyeOff, ArrowRight, CheckCircle2, Sun, Moon, Mail } from 'lucide-react';
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

const GODINA = new Date().getFullYear();

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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-brand-100 via-background to-accent-50/60 dark:from-brand-900 dark:via-brand-950 dark:to-brand-900">
      {/* Dekorativni blur akcenti — jedinstvena pozadina za celu stranicu */}
      <div className="absolute top-[-8rem] right-[-6rem] w-[30rem] h-[30rem] bg-accent-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10rem] left-[-8rem] w-[34rem] h-[34rem] bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Prebacivac teme — menja celu stranicu */}
      <button
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Svetla tema' : 'Tamna tema'}
        className="absolute top-6 right-6 z-20 w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Sadrzaj: brend levo, forma desno — sve na istoj pozadini (bez sava) */}
      <div className="relative z-10 flex-1 w-full max-w-7xl 2xl:max-w-[96rem] mx-auto px-6 sm:px-10 grid lg:grid-cols-2 items-center gap-12 lg:gap-24 py-12">

        {/* LEVO — brend / marketing */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-4 mb-14">
            <img src={logoIcon} alt="BehindClasses" className="w-20 h-20 rounded-3xl" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">BehindClasses</h1>
              <p className="text-base text-muted-foreground">Sistem za planiranje nastave</p>
            </div>
          </div>

          <div className="space-y-8 max-w-xl">
            <h2 className="text-5xl xl:text-6xl font-bold text-foreground leading-[1.1]">
              Organizujte nastavu{' '}
              <span className="text-accent-600 dark:text-accent-400">brže i efikasnije</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Moderna platforma za upravljanje predmetima, temama i nastavnim jedinicama
            </p>
            <div className="space-y-4 pt-2">
              {FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-accent-400/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-accent-600 dark:text-accent-300" />
                  </div>
                  <span className="text-lg text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-4xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DESNO — forma */}
        <div className="w-full max-w-xl mx-auto lg:mx-0 lg:justify-self-end bg-card rounded-3xl shadow-xl shadow-gray-200/50 border border-border p-10 sm:p-12">
          <img src={logoWordmark} alt="BehindClasses" className="h-24 sm:h-28 w-auto mb-10" />

          <div className="mb-8">
            <h2 className="text-4xl font-bold text-foreground mb-2">Dobrodošli nazad</h2>
            <p className="text-lg text-muted-foreground">Prijavite se na svoj nalog</p>
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

      {/* Podnozje */}
      <footer className="relative z-10 border-t border-border/60 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {GODINA} BehindClasses. Sva prava zadržana.</p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:podrska@behindclasses.rs"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              podrska@behindclasses.rs
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Uslovi
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privatnost
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

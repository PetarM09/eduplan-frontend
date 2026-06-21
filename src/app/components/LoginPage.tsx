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
    <div className="min-h-screen flex">
      {/* LEVA STRANA — brend panel (puna visina) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 p-12 xl:p-16 flex-col justify-between">
        <div className="absolute top-[-6rem] right-[-6rem] w-96 h-96 bg-accent-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-6rem] w-[28rem] h-[28rem] bg-brand-600/30 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center overflow-hidden">
              <img src={logoIcon} alt="BehindClasses" className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">BehindClasses</h1>
              <p className="text-sm text-brand-100">Sistem za planiranje nastave</p>
            </div>
          </div>

          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Organizujte nastavu <span className="text-accent-400">brže i efikasnije</span>
            </h2>
            <p className="text-lg text-brand-100">
              Moderna platforma za upravljanje predmetima, temama i nastavnim jedinicama
            </p>
            <div className="space-y-3 pt-4">
              {FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-accent-400/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-accent-300" />
                  </div>
                  <span className="text-brand-50">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-brand-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DESNA STRANA — forma + footer (puna visina) */}
      <div className="flex-1 flex flex-col min-h-screen bg-background relative">
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Svetla tema' : 'Tamna tema'}
          className="absolute top-6 right-6 z-20 w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl p-8 sm:p-10">
            <img src={logoWordmark} alt="BehindClasses" className="h-12 w-auto mb-8" />

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

        {/* Podnozje */}
        <footer className="border-t border-border px-6 py-6">
          <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
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
    </div>
  );
}

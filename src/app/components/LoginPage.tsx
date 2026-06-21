import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import logoIcon from '@/assets/logo-icon.svg';

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

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  // Forma
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      await login(username, password);
      // login() vec sacuvao user u localStorage i postavio state — sad samo navigiraj
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
      {/* LEVA STRANA */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 p-12 flex-col justify-between relative overflow-hidden">

        {/* Blur efekti */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/25 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
              <img src={logoIcon} alt="BehindClasses" className="w-9 h-9" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                BehindClasses
              </h1>

              <p className="text-sm text-brand-100">
                Sistem za planiranje nastave
              </p>
            </div>
          </div>

          {/* Naslov */}
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Organizujte nastavu{' '}
              <span className="text-accent-300">
                brže i efikasnije
              </span>
            </h2>

            <p className="text-lg text-brand-100">
              Moderna platforma za upravljanje predmetima,
              temama i nastavnim jedinicama
            </p>

            {/* Feature lista */}
            <div className="space-y-4 pt-6">
              {[
                'Kompletan pregled svih predmeta i tema',
                'Organizacija nastavnih jedinica',
                'Praćenje ishoda učenja',
                'Kolaboracija sa kolegama',
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-accent-400/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-accent-300" />
                  </div>

                  <span className="text-brand-50">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistika */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { label: 'Korisnika', value: '2,500+' },
            { label: 'Škola', value: '150+' },
            { label: 'Planova', value: '50K+' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>

              <div className="text-sm text-brand-200">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DESNA STRANA */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center overflow-hidden">
              <img src={logoIcon} alt="BehindClasses" className="w-7 h-7" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-foreground">
                BehindClasses
              </h1>
            </div>
          </div>

          <div>
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Dobrodošli nazad
              </h2>

              <p className="text-muted-foreground">
                Prijavite se na svoj nalog
              </p>
            </div>

            {/* Greska */}
            {errorMessage && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Forma */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Username */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-foreground"
                >
                  Korisničko ime
                </Label>

                <Input
                  id="username"
                  type="text"
                  placeholder="Unesite korisničko ime"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  required
                  className="h-12 px-4 bg-input-background border-input focus:border-ring focus:ring-ring/30 rounded-xl transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-foreground"
                  >
                    Lozinka
                  </Label>

                  <Link
                    to="/forgot-password"
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                  >
                    Zaboravili ste?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                    className="h-12 px-4 pr-12 bg-input-background border-input focus:border-ring focus:ring-ring/30 rounded-xl transition-all"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Dugme */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-lg shadow-brand-600/25 transition-all hover:shadow-xl hover:shadow-brand-600/30 group"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>

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

            {/* Info — registracija nije javna (admin skole kreira naloge) */}
            <div className="mt-8 rounded-xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
              <p className="text-center">
                Nalog kreira koordinator vase skole. Ako jos nemate pristup,
                kontaktirajte administraciju.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
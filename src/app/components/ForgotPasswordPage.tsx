import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldQuestion, UserCog } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import logoIcon from '@/assets/logo-icon.svg';

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-brand-50/30 to-brand-50/50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-900 flex items-center justify-center shadow-xl shadow-brand-900/25 overflow-hidden">
              <img src={logoIcon} alt="BehindClasses" className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">BehindClasses</h1>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <ShieldQuestion className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Zaboravljena lozinka</h2>
            <p className="text-muted-foreground text-sm">
              U ovom sistemu samo koordinator skole moze da resetuje lozinke.
              To je svesna odluka — nalozi su vezani za zaposlene, a koordinator
              direktno potvrdjuje identitet.
            </p>
          </div>

          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <UserCog className="w-5 h-5 text-brand-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-brand-900">
                <p className="font-medium">Sta da uradis:</p>
                <ol className="mt-2 space-y-1 list-decimal list-inside text-brand-800">
                  <li>Javi se koordinatoru tvoje skole</li>
                  <li>On ce ti postaviti novu pocetnu lozinku</li>
                  <li>Promenis je pri prvom logovanju</li>
                </ol>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-2 border-t border-brand-200">
              <Mail className="w-5 h-5 text-brand-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-brand-800">
                Ako ne znas ko je koordinator, kontakt info ces dobiti od direktora ili
                sekretarijata.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full">
                <ArrowLeft className="w-4 h-4" />
                Nazad na prijavu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

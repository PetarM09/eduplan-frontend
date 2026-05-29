import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Mail, ShieldQuestion, UserCog } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-600/25">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Skolska platforma</h1>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ShieldQuestion className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Zaboravljena lozinka</h2>
            <p className="text-gray-600 text-sm">
              U ovom sistemu samo koordinator skole moze da resetuje lozinke.
              To je svesna odluka — nalozi su vezani za zaposlene, a koordinator
              direktno potvrdjuje identitet.
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <UserCog className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium">Sta da uradis:</p>
                <ol className="mt-2 space-y-1 list-decimal list-inside text-blue-800">
                  <li>Javi se koordinatoru tvoje skole</li>
                  <li>On ce ti postaviti novu pocetnu lozinku</li>
                  <li>Promenis je pri prvom logovanju</li>
                </ol>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-2 border-t border-blue-200">
              <Mail className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
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

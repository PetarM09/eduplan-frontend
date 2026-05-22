import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { GraduationCap, ArrowRight, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      <div className="w-full max-w-md">
        <div className="animate-fadeIn">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-600/25">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EduPlan</h1>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {!isSuccess ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Zaboravili ste lozinku?</h2>
                  <p className="text-gray-600">Unesite vašu email adresu i poslaćemo vam link za resetovanje lozinke</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email adresa</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vas.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 px-4 bg-gray-50 border-gray-300 focus:border-blue-600 focus:ring-blue-600/20 rounded-xl transition-all"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Slanje...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Pošaljite link
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <Link 
                    to="/login"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Nazad na prijavu
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center animate-scaleIn">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Email poslat!</h2>
                  <p className="text-gray-600 mb-6">
                    Proverite vaš inbox na <span className="font-medium text-gray-900">{email}</span> za link za resetovanje lozinke
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-900">
                      <strong>Napomena:</strong> Link ističe za 15 minuta. Ako ne vidite email, proverite spam folder.
                    </p>
                  </div>

                  <Link to="/login">
                    <Button className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all">
                      Vratite se na prijavu
                    </Button>
                  </Link>

                  <button
                    onClick={() => setIsSuccess(false)}
                    className="mt-4 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Niste primili email? Pošaljite ponovo
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Imate problema? <Link to="#" className="text-blue-600 hover:text-blue-700 font-medium">Kontaktirajte podršku</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
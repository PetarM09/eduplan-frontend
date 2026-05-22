import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/app/components/LoginPage';
import { ForgotPasswordPage } from '@/app/components/ForgotPasswordPage';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { ProfessorDashboardPage } from '@/app/components/dashboard/ProfessorDashboardPage';
import { AdminDashboardPage } from '@/app/components/dashboard/AdminDashboardPage';
import { UsersPage } from '@/app/components/dashboard/UsersPage';
import { PredmetiPage } from '@/app/components/dashboard/PredmetiPage';
import { OdeljenjaPage } from '@/app/components/dashboard/OdeljenjaPage';
import { RasporedPage } from '@/app/components/dashboard/RasporedPage';
import { ZamenePage } from '@/app/components/dashboard/ZamenePage';
import { PlaceholderPage } from '@/app/components/dashboard/PlaceholderPage';
import { Repeat, FileText, ClipboardList, BarChart3, Shield } from 'lucide-react';

/** Preusmerava ulogovanog korisnika na njegovu pocetnu rutu. */
function HomeRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const target =
    user.uloga === 'SUPER_ADMIN'
      ? '/super-dashboard'
      : ['KOORDINATOR', 'ADMIN', 'DIREKTOR'].includes(user.uloga)
      ? '/admin-dashboard'
      : user.uloga === 'PP_SLUZBA'
      ? '/pp/dashboard'
      : '/dashboard';
  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Javne rute */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Pocetni redirect na osnovu uloge */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Nastavnik */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['NASTAVNIK']}>
            <ProfessorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/raspored"
        element={
          <ProtectedRoute>
            <RasporedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/zamene"
        element={
          <ProtectedRoute>
            <ZamenePage />
          </ProtectedRoute>
        }
      />

      {/* Administracija skole */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['KOORDINATOR', 'ADMIN', 'DIREKTOR']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/korisnici"
        element={
          <ProtectedRoute allowedRoles={['KOORDINATOR', 'DIREKTOR']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/predmeti"
        element={
          <ProtectedRoute allowedRoles={['KOORDINATOR', 'ADMIN', 'DIREKTOR']}>
            <PredmetiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/odeljenja"
        element={
          <ProtectedRoute allowedRoles={['KOORDINATOR', 'ADMIN', 'DIREKTOR']}>
            <OdeljenjaPage />
          </ProtectedRoute>
        }
      />
      {/* Rotacija, planovi, PP — placeholderi dok se UI ne dovrsi */}
      <Route
        path="/rotacija"
        element={
          <ProtectedRoute>
            <PlaceholderPage
              title="Rotacija grupa"
              description="Generisanje balansiranog ciklusa za grupne casove (vezbe) — C(N,K) algoritam"
              icon={Repeat}
              endpoints={[
                'POST   /api/v1/rotacija',
                'POST   /api/v1/rotacija/{id}/generisi',
                'GET    /api/v1/rotacija',
                'PUT    /api/v1/rotacija/nedelje/{id}',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/planovi/godisnji"
        element={
          <ProtectedRoute>
            <PlaceholderPage
              title="Godisnji planovi"
              description="Globalni plan rada po predmetu — generise Word/PDF i salje na mail skole"
              icon={FileText}
              endpoints={[
                'POST   /api/v1/planovi/godisnji',
                'GET    /api/v1/planovi/godisnji/me',
                'GET    /api/v1/planovi/godisnji/svi',
                'GET    /api/v1/planovi/godisnji/{id}/download/word',
                'GET    /api/v1/planovi/godisnji/{id}/download/pdf',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/planovi/operativni"
        element={
          <ProtectedRoute>
            <PlaceholderPage
              title="Operativni planovi"
              description="Mesecni operativni plan rada — 8-kolonska tabela casova"
              icon={ClipboardList}
              endpoints={[
                'POST   /api/v1/planovi/operativni',
                'POST   /api/v1/planovi/operativni/{id}/kloniraj',
                'GET    /api/v1/planovi/operativni/me',
                'GET    /api/v1/planovi/operativni/{id}/download/word',
                'GET    /api/v1/planovi/operativni/{id}/download/pdf',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pp/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PP_SLUZBA', 'DIREKTOR', 'KOORDINATOR']}>
            <PlaceholderPage
              title="PP dashboard"
              description="Pregled planova, izvestaja i statistike skole"
              icon={BarChart3}
              endpoints={[
                'GET    /api/v1/pp/dashboard',
                'GET    /api/v1/pp/statistika',
                'GET    /api/v1/pp/eksport/excel',
                'POST   /api/v1/pp/izvestaj',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-dashboard"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <PlaceholderPage
              title="Super admin"
              description="Kreiranje skola i njihovih koordinatora"
              icon={Shield}
              endpoints={[
                'GET    /api/v1/super/skole',
                'POST   /api/v1/super/skole',
                'POST   /api/v1/super/skole/{id}/koordinator',
              ]}
            />
          </ProtectedRoute>
        }
      />

      {/* Sve nepoznato vraca na home redirect */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

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
      {/* TemePage, NastavneJedinicePage i PredmetiOdeljenjaPage ce biti integrisani
          kao child rute / dijalozi unutar PredmetiPage i OdeljenjaPage u sledecem koraku.
          Trenutno zahtevaju props koji dolaze iz parent komponente. */}

      {/* TODO: rotacija, godisnji + operativni planovi, PP — dolaze u sledecim koracima */}

      {/* Sve nepoznato vraca na home redirect */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

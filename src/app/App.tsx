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
import { SuperAdminPage } from '@/app/components/dashboard/SuperAdminPage';
import { KatalogPage } from '@/app/components/dashboard/KatalogPage';
import { GodisnjiPlanoviPage } from '@/app/components/dashboard/GodisnjiPlanoviPage';
import { GodisnjiPlanEditorPage } from '@/app/components/dashboard/GodisnjiPlanEditorPage';
import { OperativniPlanoviPage } from '@/app/components/dashboard/OperativniPlanoviPage';
import { OperativniPlanEditorPage } from '@/app/components/dashboard/OperativniPlanEditorPage';
import { PPDashboardPage } from '@/app/components/dashboard/PPDashboardPage';
import { PPIzvestajiPage } from '@/app/components/dashboard/PPIzvestajiPage';
import { RotacijaPage } from '@/app/components/dashboard/RotacijaPage';
import { PostavkeSkolePage } from '@/app/components/dashboard/PostavkeSkolePage';
import { VerzijeRasporedaPage } from '@/app/components/dashboard/VerzijeRasporedaPage';
import { MasterKatalogPage } from '@/app/components/dashboard/MasterKatalogPage';

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
        path="/raspored/verzije"
        element={
          <ProtectedRoute allowedRoles={['KOORDINATOR', 'DIREKTOR', 'ADMIN']}>
            <VerzijeRasporedaPage />
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
      <Route
        path="/rotacija"
        element={
          <ProtectedRoute>
            <RotacijaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/planovi/godisnji"
        element={
          <ProtectedRoute>
            <GodisnjiPlanoviPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/planovi/godisnji/novi"
        element={
          <ProtectedRoute allowedRoles={['NASTAVNIK', 'KOORDINATOR']}>
            <GodisnjiPlanEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/planovi/godisnji/:id"
        element={
          <ProtectedRoute>
            <GodisnjiPlanEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/planovi/operativni"
        element={
          <ProtectedRoute>
            <OperativniPlanoviPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/planovi/operativni/novi"
        element={
          <ProtectedRoute allowedRoles={['NASTAVNIK', 'KOORDINATOR']}>
            <OperativniPlanEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/planovi/operativni/:id"
        element={
          <ProtectedRoute>
            <OperativniPlanEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pp/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PP_SLUZBA', 'DIREKTOR', 'KOORDINATOR']}>
            <PPDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pp/izvestaji"
        element={
          <ProtectedRoute allowedRoles={['NASTAVNIK', 'PP_SLUZBA', 'DIREKTOR', 'KOORDINATOR']}>
            <PPIzvestajiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-dashboard"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SuperAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/master-katalog"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <MasterKatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/katalog"
        element={
          <ProtectedRoute>
            <KatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/skola/postavke"
        element={
          <ProtectedRoute allowedRoles={['KOORDINATOR', 'DIREKTOR']}>
            <PostavkeSkolePage />
          </ProtectedRoute>
        }
      />

      {/* Sve nepoznato vraca na home redirect */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

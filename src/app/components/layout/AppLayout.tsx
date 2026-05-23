import { ReactNode } from 'react';
import { Sidebar } from '@/app/components/dashboard/Sidebar';
import { TopBar } from '@/app/components/dashboard/TopBar';
import { useAuth } from '@/context/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

/** Standardni layout za zasticene stranice — Sidebar levo, TopBar gore, sadrzaj desno. */
export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  // SUPER_ADMIN paleta — tamna sa narandzastim nagibom (command-center stil)
  const pozadina =
    user?.uloga === 'SUPER_ADMIN'
      ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800'
      : 'bg-gray-50';

  return (
    <div className={`flex h-screen overflow-hidden ${pozadina}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Header sekcija stranice — naslov + opis + akcija (npr. dugme "Dodaj"). */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  const { user } = useAuth();
  const sa = user?.uloga === 'SUPER_ADMIN';
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className={`text-3xl font-bold ${sa ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
        {description && (
          <p className={`mt-1 ${sa ? 'text-slate-300' : 'text-gray-600'}`}>{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  );
}

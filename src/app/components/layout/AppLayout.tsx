import { ReactNode } from 'react';
import { Sidebar } from '@/app/components/dashboard/Sidebar';
import { TopBar } from '@/app/components/dashboard/TopBar';
import { useAuth } from '@/context/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  // SUPER_ADMIN zadrzava tamni "command center" izgled u obe teme — beli tekst
  // i glass kartice tih ekrana su dizajnirani za tamnu navy podlogu.
  const sa = user?.uloga === 'SUPER_ADMIN';
  const pozadina = sa
    ? 'bg-gradient-to-br from-brand-900 via-brand-950 to-brand-900'
    : 'bg-background';

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

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const { user } = useAuth();
  const sa = user?.uloga === 'SUPER_ADMIN';
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className={`text-3xl font-bold ${sa ? 'text-white' : 'text-foreground'}`}>{title}</h1>
        {description && (
          <p className={`mt-1 ${sa ? 'text-brand-200' : 'text-muted-foreground'}`}>{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  );
}

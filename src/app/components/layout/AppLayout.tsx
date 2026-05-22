import { ReactNode } from 'react';
import { Sidebar } from '@/app/components/dashboard/Sidebar';
import { TopBar } from '@/app/components/dashboard/TopBar';

interface AppLayoutProps {
  children: ReactNode;
}

/** Standardni layout za zasticene stranice — Sidebar levo, TopBar gore, sadrzaj desno. */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
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
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-gray-600 mt-1">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  );
}

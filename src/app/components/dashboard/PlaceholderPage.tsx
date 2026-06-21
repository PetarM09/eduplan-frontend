import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Hammer, type LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  endpoints?: string[];
  icon?: LucideIcon;
}

export function PlaceholderPage({ title, description, endpoints, icon }: PlaceholderPageProps) {
  const Icon = icon ?? Hammer;
  return (
    <AppLayout>
      <PageHeader title={title} description={description} />
      <div className="bg-card rounded-2xl shadow-md shadow-gray-200/50 border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">U izradi</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          UI za ovu funkcionalnost je u toku. Backend API je vec spreman i moze se testirati direktno
          kroz Swagger ({' '}
          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 hover:underline"
          >
            /swagger-ui.html
          </a>
          ) ili curl-om.
        </p>
        {endpoints && endpoints.length > 0 && (
          <div className="mt-6 inline-block text-left bg-muted rounded-xl border border-border px-4 py-3 font-mono text-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Dostupni endpointi</div>
            <ul className="space-y-1 text-foreground">
              {endpoints.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

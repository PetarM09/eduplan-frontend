import { AppLayout, PageHeader } from '@/app/components/layout/AppLayout';
import { Hammer, type LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  endpoints?: string[];
  icon?: LucideIcon;
}

/**
 * Privremena stranica koja sluzi da odgovori na rutu dok se prava implementacija
 * ne uradi. Prikazuje listu backend endpoint-a koji su vec dostupni za tu funkciju.
 */
export function PlaceholderPage({ title, description, endpoints, icon }: PlaceholderPageProps) {
  const Icon = icon ?? Hammer;
  return (
    <AppLayout>
      <PageHeader title={title} description={description} />
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">U izradi</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          UI za ovu funkcionalnost je u toku. Backend API je vec spreman i moze se testirati direktno
          kroz Swagger ({' '}
          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline"
          >
            /swagger-ui.html
          </a>
          ) ili curl-om.
        </p>
        {endpoints && endpoints.length > 0 && (
          <div className="mt-6 inline-block text-left bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Dostupni endpointi</div>
            <ul className="space-y-1 text-gray-700">
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

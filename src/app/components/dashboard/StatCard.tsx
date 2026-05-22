import { type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  to?: string;
  accent?: 'blue' | 'indigo' | 'cyan' | 'orange' | 'green' | 'purple';
  hint?: string;
}

const ACCENT_MAP: Record<NonNullable<StatCardProps['accent']>, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
};

export function StatCard({ label, value, icon: Icon, to, accent = 'blue', hint }: StatCardProps) {
  const { bg, text } = ACCENT_MAP[accent];
  const content = (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${bg} ${text} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {hint && <div className="text-xs text-gray-500 mt-0.5">{hint}</div>}
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

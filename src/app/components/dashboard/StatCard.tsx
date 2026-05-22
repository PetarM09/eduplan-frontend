import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  color: 'blue' | 'orange' | 'green' | 'purple';
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-cyan-500',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-100',
  },
  orange: {
    bg: 'from-orange-500 to-amber-500',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    ring: 'ring-orange-100',
  },
  green: {
    bg: 'from-emerald-500 to-teal-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    ring: 'ring-emerald-100',
  },
  purple: {
    bg: 'from-purple-500 to-pink-500',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    ring: 'ring-purple-100',
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full -mr-16 -mt-16" 
           style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <div className={`w-12 h-12 ${colors.light} rounded-xl flex items-center justify-center ring-4 ${colors.ring}`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

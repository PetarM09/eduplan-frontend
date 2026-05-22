import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { 
  BookOpen, 
  Users, 
  School,
  FolderTree,
  Plus,
  MoreVertical,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { useState } from 'react';

const stats = [
  { 
    label: 'Predmeti', 
    value: '24', 
    change: '+3 ovog meseca', 
    icon: BookOpen, 
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    trend: 'up'
  },
  { 
    label: 'Korisnici', 
    value: '156', 
    change: '+12 novih', 
    icon: Users, 
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    trend: 'up'
  },
  { 
    label: 'Odeljenja', 
    value: '18', 
    change: '+2 ove godine', 
    icon: School, 
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    trend: 'up'
  },
  { 
    label: 'Smerovi', 
    value: '5', 
    change: 'Aktivan', 
    icon: FolderTree, 
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    trend: 'up'
  }
];

const quickActions = [
  { 
    icon: BookOpen, 
    label: 'Novi predmet', 
    description: 'Dodaj novi predmet u sistem',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    path: '/predmeti'
  },
  { 
    icon: Users, 
    label: 'Dodaj korisnika', 
    description: 'Kreiraj nalog profesora ili admina',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    path: '/korisnici'
  },
  { 
    icon: FolderTree, 
    label: 'Dodaj smer', 
    description: 'Dodaj novi obrazovni smer',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    path: '/smerovi'
  },
  { 
    icon: School, 
    label: 'Dodaj odeljenje', 
    description: 'Kreiraj novo odeljenje',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    path: '/odeljenja'
  }
];

export function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Pregled celokupnog sistema škole</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-200">
                  <p className="text-xs font-medium text-indigo-600">Administrator</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={stat.iconColor} />
                    </div>
                    <button className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Brze akcije</h3>
                <p className="text-sm text-gray-600 mt-0.5">Upravljajte sistemom</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <button 
                      key={index}
                      onClick={() => navigate(action.path)}
                      className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-lg hover:border-gray-300 transition-all group text-left"
                    >
                      <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <action.icon className={action.iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                          {action.label}
                        </h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Nedavna aktivnost</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Poslednje izmene u sistemu</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { action: 'Dodato novo odeljenje', detail: '4-1 Prirodno-matematički', time: 'Pre 2 sata' },
                      { action: 'Novi korisnik', detail: 'Ana Petrović - Profesor', time: 'Pre 5 sati' },
                      { action: 'Izmena predmeta', detail: 'Matematika - Dodato 5 tema', time: 'Juče' },
                      { action: 'Dodato novo odeljenje', detail: '1-3 Društveno-jezički', time: 'Pre 2 dana' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{item.action}</p>
                          <p className="text-sm text-gray-600">{item.detail}</p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Sistemske informacije</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Status sistema</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                      <div>
                        <p className="text-sm font-medium text-green-900">Status sistema</p>
                        <p className="text-xs text-green-700 mt-0.5">Sve je u redu</p>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Aktivnih profesora</span>
                        <span className="font-semibold text-gray-900">48</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Aktivnih učenika</span>
                        <span className="font-semibold text-gray-900">892</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ukupno časova nedeljno</span>
                        <span className="font-semibold text-gray-900">245</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Prosečno odeljenje</span>
                        <span className="font-semibold text-gray-900">24 učenika</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useState } from 'react';
import { 
  BookOpen, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  School,
  TrendingUp,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Mock data - u realnoj aplikaciji bi ovo došlo sa backend-a
const mockPredmetiSaOdeljenjima = [
  {
    id: 1,
    predmet: 'Matematika',
    odeljenja: [
      { id: 1, naziv: '1-1', smer: 'Prirodno-matematički', brCasovaNedeljno: 5 },
      { id: 2, naziv: '2-1', smer: 'Prirodno-matematički', brCasovaNedeljno: 5 },
      { id: 3, naziv: '3-1', smer: 'Prirodno-matematički', brCasovaNedeljno: 4 }
    ]
  },
  {
    id: 2,
    predmet: 'Geometrija',
    odeljenja: [
      { id: 4, naziv: '4-1', smer: 'Prirodno-matematički', brCasovaNedeljno: 3 }
    ]
  }
];

const mockRaspored = [
  { dan: 'Ponedeljak', casovi: [
    { vreme: '08:00 - 08:45', predmet: 'Matematika', odeljenje: '1-1', sala: '201' },
    { vreme: '09:00 - 09:45', predmet: 'Matematika', odeljenje: '2-1', sala: '201' },
    { vreme: '10:00 - 10:45', predmet: 'Geometrija', odeljenje: '4-1', sala: '305' },
  ]},
  { dan: 'Utorak', casovi: [
    { vreme: '08:00 - 08:45', predmet: 'Matematika', odeljenje: '3-1', sala: '201' },
    { vreme: '11:00 - 11:45', predmet: 'Matematika', odeljenje: '1-1', sala: '201' },
  ]},
  { dan: 'Sreda', casovi: [
    { vreme: '09:00 - 09:45', predmet: 'Matematika', odeljenje: '2-1', sala: '201' },
    { vreme: '10:00 - 10:45', predmet: 'Matematika', odeljenje: '3-1', sala: '201' },
    { vreme: '12:00 - 12:45', predmet: 'Geometrija', odeljenje: '4-1', sala: '305' },
  ]},
  { dan: 'Četvrtak', casovi: [
    { vreme: '08:00 - 08:45', predmet: 'Matematika', odeljenje: '1-1', sala: '201' },
    { vreme: '09:00 - 09:45', predmet: 'Matematika', odeljenje: '2-1', sala: '201' },
  ]},
  { dan: 'Petak', casovi: [
    { vreme: '08:00 - 08:45', predmet: 'Matematika', odeljenje: '3-1', sala: '201' },
    { vreme: '10:00 - 10:45', predmet: 'Matematika', odeljenje: '1-1', sala: '201' },
    { vreme: '11:00 - 11:45', predmet: 'Geometrija', odeljenje: '4-1', sala: '305' },
  ]},
];

const mockPlanoviStatistika = {
  urađenoOvajMesec: 15,
  neUrađenoOvajMesec: 5,
  neUrađeniPredmeti: [
    { predmet: 'Matematika', odeljenje: '1-1', tema: 'Trigonometrija' },
    { predmet: 'Matematika', odeljenje: '2-1', tema: 'Kvadratne funkcije' },
    { predmet: 'Matematika', odeljenje: '3-1', tema: 'Vektori' },
    { predmet: 'Geometrija', odeljenje: '4-1', tema: 'Stožaste preseke' },
    { predmet: 'Matematika', odeljenje: '1-1', tema: 'Logaritmi' }
  ]
};

export function ProfessorDashboardPage() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('Ponedeljak');

  const ukupnoCasovaNedeljno = mockPredmetiSaOdeljenjima.reduce((total, predmet) => {
    return total + predmet.odeljenja.reduce((sum, odeljenje) => sum + odeljenje.brCasovaNedeljno, 0);
  }, 0);

  const ukupnoOdeljenja = mockPredmetiSaOdeljenjima.reduce((total, predmet) => {
    return total + predmet.odeljenja.length;
  }, 0);

  const selectedDaySchedule = mockRaspored.find(r => r.dan === selectedDay);

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
                  Dobrodošli, Marko 👋
                </h1>
                <p className="text-gray-600">Pregled vaših predmeta i rasporeda</p>
              </div>
              <Button 
                className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                onClick={() => navigate('/planovi')}
              >
                <FileText className="w-4 h-4" />
                Kreiraj plan
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{mockPredmetiSaOdeljenjima.length}</div>
                    <div className="text-xs font-medium text-gray-600">Predmeta</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <School className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{ukupnoOdeljenja}</div>
                    <div className="text-xs font-medium text-gray-600">Odeljenja</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{ukupnoCasovaNedeljno}</div>
                    <div className="text-xs font-medium text-gray-600">Časova nedeljno</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{mockPlanoviStatistika.urađenoOvajMesec}</div>
                    <div className="text-xs font-medium text-gray-600">Planovi ovaj mesec</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Predmeti sa Odeljenjima */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Moji predmeti i odeljenja</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Pregled predmeta koje predajete</p>
                </div>
                <div className="p-6 space-y-4">
                  {mockPredmetiSaOdeljenjima.map((predmet) => (
                    <div key={predmet.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{predmet.predmet}</h4>
                            <p className="text-sm text-gray-600">{predmet.odeljenja.length} odeljenja</p>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {predmet.odeljenja.map((odeljenje) => (
                          <div key={odeljenje.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                  <School className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{odeljenje.naziv}</div>
                                  <div className="text-sm text-gray-600">{odeljenje.smer}</div>
                                </div>
                              </div>
                              <div className="text-sm font-medium text-gray-600">
                                {odeljenje.brCasovaNedeljno}č/ned
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nedeljni raspored */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Nedeljni raspored</h3>
                  </div>
                  <p className="text-sm text-gray-600">Vaš raspored časova</p>
                </div>
                
                {/* Day selector */}
                <div className="px-4 py-3 border-b border-gray-200 overflow-x-auto">
                  <div className="flex gap-2">
                    {mockRaspored.map((r) => (
                      <button
                        key={r.dan}
                        onClick={() => setSelectedDay(r.dan)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                          selectedDay === r.dan
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {r.dan}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {selectedDaySchedule?.casovi.map((cas, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">{cas.predmet}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{cas.vreme}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{cas.odeljenje}</span>
                          <span>•</span>
                          <span>Sala {cas.sala}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedDaySchedule?.casovi.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nema časova ovog dana</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Planovi statistika */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Plan Progress */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Planovi - Februar</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold text-green-900">{mockPlanoviStatistika.urađenoOvajMesec}</div>
                        <div className="text-sm text-green-700">Urađeno</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <div className="text-2xl font-bold text-red-900">{mockPlanoviStatistika.neUrađenoOvajMesec}</div>
                        <div className="text-sm text-red-700">Nije urađeno</div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="text-sm text-gray-600 mb-2">Napredak</div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full transition-all"
                        style={{ 
                          width: `${(mockPlanoviStatistika.urađenoOvajMesec / (mockPlanoviStatistika.urađenoOvajMesec + mockPlanoviStatistika.neUrađenoOvajMesec)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((mockPlanoviStatistika.urađenoOvajMesec / (mockPlanoviStatistika.urađenoOvajMesec + mockPlanoviStatistika.neUrađenoOvajMesec)) * 100)}% kompletno
                    </div>
                  </div>
                </div>
              </div>

              {/* Nedostajući planovi */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Nedostajući planovi</h3>
                    <p className="text-sm text-gray-600 mt-0.5">Potrebno je kreirati sledeće planove</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/planovi')}
                  >
                    Kreiraj planove
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {mockPlanoviStatistika.neUrađeniPredmeti.map((item, index) => (
                    <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.predmet} - {item.odeljenje}
                          </div>
                          <div className="text-sm text-gray-600">{item.tema}</div>
                        </div>
                        <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          Kreiraj
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

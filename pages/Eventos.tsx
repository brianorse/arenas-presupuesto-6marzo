import React from 'react';
import { 
  Calendar, 
  Users, 
  Utensils, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter,
  LayoutDashboard,
  Move,
  MessageSquare,
  DollarSign,
  Truck,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const MOCK_EVENTS = [
  { id: 1, name: 'Boda García-López', date: '25 May 2026', guests: 150, status: 'Confirmado', type: 'Boda', location: 'Finca La Alquería' },
  { id: 2, name: 'Evento Corporativo Tech', date: '12 Jun 2026', guests: 300, status: 'Pendiente', type: 'Corporativo', location: 'Hotel Palace' },
  { id: 3, name: 'Cena de Gala Rotary', date: '05 Jul 2026', guests: 80, status: 'Borrador', type: 'Gala', location: 'Club de Golf' },
];

export default function Eventos() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#654935] tracking-tight">Gestión de Eventos</h1>
          <p className="text-[#8c7a6b] font-medium">Control total de tu operativa de catering</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-[#654935] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-[#654935]/20 hover:scale-105 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          <span>Nuevo Evento</span>
        </button>
      </div>

      {/* Grid de Secciones del Evento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: LayoutDashboard, label: 'Resumen', to: 'Home' },
          { icon: Utensils, label: 'Menú', to: 'MenuEvento' },
          { icon: Users, label: 'Invitados', to: 'PlanificadorSala' },
          { icon: Clock, label: 'Timeline', to: 'Home' },
          { icon: Truck, label: 'Equipo & Logística', to: 'Home' },
          { icon: DollarSign, label: 'Costes & Rentabilidad', to: 'MisPresupuestos' },
          { icon: MessageSquare, label: 'Comunicación', to: 'Comunicaciones' },
          { icon: UserCheck, label: 'Portal Cliente', to: 'Home' },
        ].map((item, idx) => (
          <Link 
            key={idx}
            to={createPageUrl(item.to)}
            className="bg-white p-4 rounded-3xl border border-[#d6c7b2] hover:shadow-lg transition-all group text-center flex flex-col items-center justify-center gap-2"
          >
            <div className="w-12 h-12 bg-[#faf7f4] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <item.icon className="w-6 h-6 text-[#654935]" />
            </div>
            <span className="text-xs font-bold text-[#654935]">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Lista de Eventos Recientes */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#d6c7b2]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-[#654935]">Eventos Próximos</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7a6b]" />
              <input 
                type="text" 
                placeholder="Buscar evento..." 
                className="pl-10 pr-4 py-2 bg-[#faf7f4] border border-[#d6c7b2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#654935]/20"
              />
            </div>
            <button className="p-2 bg-[#faf7f4] border border-[#d6c7b2] rounded-xl text-[#8c7a6b] hover:bg-[#ede3d6] transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-[#f0f0f0]">
                <th className="pb-4 font-black text-[#8c7a6b] text-[10px] uppercase tracking-widest">Evento</th>
                <th className="pb-4 font-black text-[#8c7a6b] text-[10px] uppercase tracking-widest">Fecha</th>
                <th className="pb-4 font-black text-[#8c7a6b] text-[10px] uppercase tracking-widest">Ubicación</th>
                <th className="pb-4 font-black text-[#8c7a6b] text-[10px] uppercase tracking-widest">Invitados</th>
                <th className="pb-4 font-black text-[#8c7a6b] text-[10px] uppercase tracking-widest">Estado</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {MOCK_EVENTS.map((event) => (
                <tr key={event.id} className="group hover:bg-[#faf7f4] transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#ede3d6] rounded-xl flex items-center justify-center font-bold text-[#654935]">
                        {event.type[0]}
                      </div>
                      <div>
                        <p className="font-bold text-[#654935]">{event.name}</p>
                        <p className="text-[10px] text-[#8c7a6b]">{event.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm font-medium text-[#654935]">{event.date}</td>
                  <td className="py-4 text-sm text-[#8c7a6b]">{event.location}</td>
                  <td className="py-4 text-sm font-bold text-[#654935]">{event.guests}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                      event.status === 'Confirmado' ? 'bg-green-100 text-green-700' :
                      event.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="p-2 hover:bg-[#ede3d6] rounded-xl transition-colors text-[#8c7a6b]">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

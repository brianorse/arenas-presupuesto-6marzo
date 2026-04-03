import React from 'react';
import { 
  ChefHat, 
  Utensils, 
  BookOpen, 
  Layers, 
  ShoppingCart, 
  ClipboardList, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const KITCHEN_STATS = [
  { icon: BookOpen, label: 'Recetas', value: '124', color: 'bg-blue-50 text-blue-600' },
  { icon: Layers, label: 'Escandallos', value: '98', color: 'bg-green-50 text-green-600' },
  { icon: ShoppingCart, label: 'Ingredientes', value: '450', color: 'bg-amber-50 text-amber-600' },
  { icon: ClipboardList, label: 'Producción', value: '12', color: 'bg-purple-50 text-purple-600' },
];

const RECENT_RECIPES = [
  { id: 1, name: 'Solomillo al Pedro Ximénez', category: 'Principales', cost: '8.50€', margin: '65%', time: '45 min' },
  { id: 2, name: 'Tartar de Atún Rojo', category: 'Entrantes', cost: '12.20€', margin: '58%', time: '20 min' },
  { id: 3, name: 'Croquetas de Jamón Ibérico', category: 'Aperitivos', cost: '0.45€/ud', margin: '72%', time: '120 min' },
];

export default function Cocina() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#654935] tracking-tight">Cocina y Operativa</h1>
          <p className="text-[#8c7a6b] font-medium">Gestión gastronómica, escandallos y producción</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to={createPageUrl('GestionMenu')}
            className="flex items-center justify-center gap-2 bg-[#faf7f4] text-[#654935] border border-[#d6c7b2] px-6 py-3 rounded-2xl font-bold hover:bg-[#ede3d6] transition-all active:scale-95"
          >
            <Utensils className="w-5 h-5" />
            <span>Gestión de Menú</span>
          </Link>
          <button className="flex items-center justify-center gap-2 bg-[#654935] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-[#654935]/20 hover:scale-105 transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            <span>Nueva Receta</span>
          </button>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {KITCHEN_STATS.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-[#d6c7b2] shadow-sm">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#8c7a6b] mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-[#654935]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Recetas */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#d6c7b2]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-[#654935]">Recetas Recientes</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7a6b]" />
                  <input 
                    type="text" 
                    placeholder="Buscar receta..." 
                    className="pl-10 pr-4 py-2 bg-[#faf7f4] border border-[#d6c7b2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#654935]/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              {RECENT_RECIPES.map((recipe) => (
                <button 
                  key={recipe.id}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[#faf7f4] transition-all group text-left border border-transparent hover:border-[#d6c7b2]"
                >
                  <div className="w-12 h-12 bg-[#ede3d6] rounded-xl flex items-center justify-center font-bold text-[#654935]">
                    {recipe.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#654935]">{recipe.name}</p>
                    <div className="flex items-center gap-3 text-[10px] text-[#8c7a6b] font-bold uppercase tracking-widest mt-1">
                      <span>{recipe.category}</span>
                      <span className="w-1 h-1 bg-[#d6c7b2] rounded-full" />
                      <span>{recipe.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#654935]">{recipe.cost}</p>
                    <p className="text-[10px] font-bold text-green-600">{recipe.margin} Margen</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#d6c7b2] group-hover:text-[#654935] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar de Producción */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#d6c7b2]">
            <h2 className="text-xl font-black text-[#654935] mb-6">Producción Hoy</h2>
            <div className="space-y-4">
              {[
                { label: 'Preparación de Salsas', status: 'En curso', progress: 65 },
                { label: 'Limpieza de Pescado', status: 'Pendiente', progress: 0 },
                { label: 'Mise en place Postres', status: 'Completado', progress: 100 },
              ].map((task, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-[#654935]">{task.label}</p>
                    <span className="text-[10px] font-bold text-[#8c7a6b]">{task.status}</span>
                  </div>
                  <div className="h-2 bg-[#faf7f4] rounded-full overflow-hidden border border-[#d6c7b2]/30">
                    <div 
                      className="h-full bg-[#654935] rounded-full transition-all duration-500" 
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-[#faf7f4] text-[#654935] font-bold text-sm rounded-2xl border border-[#d6c7b2] hover:bg-[#ede3d6] transition-all">
              Ver Plan de Producción
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

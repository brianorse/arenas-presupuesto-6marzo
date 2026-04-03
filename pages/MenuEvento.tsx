import React, { useState } from 'react';
import { 
  Utensils, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'aperitivo' | 'primero' | 'segundo' | 'postre' | 'bodega';
  image?: string;
  allergens: string[];
  status: 'available' | 'unavailable';
}

const MOCK_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Jamón Ibérico de Bellota',
    description: 'Cortado a cuchillo con pan de cristal y tomate.',
    price: 24,
    category: 'aperitivo',
    allergens: ['gluten'],
    status: 'available'
  },
  {
    id: '2',
    name: 'Croquetas de Carabinero',
    description: 'Bechamel cremosa con intenso sabor a mar.',
    price: 18,
    category: 'aperitivo',
    allergens: ['gluten', 'lacteos', 'crustaceos'],
    status: 'available'
  },
  {
    id: '3',
    name: 'Salmorejo Cordobés',
    description: 'Con virutas de jamón y huevo duro.',
    price: 12,
    category: 'primero',
    allergens: ['gluten', 'huevo'],
    status: 'available'
  },
  {
    id: '4',
    name: 'Solomillo de Ternera',
    description: 'A la brasa con reducción de Pedro Ximénez.',
    price: 32,
    category: 'segundo',
    allergens: [],
    status: 'available'
  },
  {
    id: '5',
    name: 'Tarta de Queso Fluida',
    description: 'Receta artesana con base de galleta Lotus.',
    price: 9,
    category: 'postre',
    allergens: ['gluten', 'lacteos'],
    status: 'available'
  }
];

const CATEGORIES = [
  { id: 'aperitivo', label: 'Aperitivos', icon: '🍸' },
  { id: 'primero', label: 'Primeros', icon: '🥗' },
  { id: 'segundo', label: 'Segundos', icon: '🥩' },
  { id: 'postre', label: 'Postres', icon: '🍰' },
  { id: 'bodega', label: 'Bodega', icon: '🍷' },
];

export default function MenuEvento() {
  const [activeCategory, setActiveCategory] = useState<string>('aperitivo');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = MOCK_MENU.filter(item => 
    item.category === activeCategory && 
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            to={createPageUrl('Eventos')}
            className="p-2 hover:bg-white rounded-xl transition-colors text-[#8c7a6b] border border-transparent hover:border-[#d6c7b2]"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#654935] tracking-tight">Menú del evento</h1>
            <p className="text-[#8c7a6b] font-medium">Configura los platos, aperitivos y opciones gastronómicas del evento</p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 bg-[#654935] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-[#654935]/20 hover:scale-105 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          <span>Añadir plato</span>
        </button>
      </div>

      {/* Categories Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
              activeCategory === cat.id 
                ? 'bg-[#654935] text-white shadow-lg shadow-[#654935]/20 scale-105' 
                : 'bg-white text-[#8c7a6b] border border-[#d6c7b2] hover:bg-[#faf7f4]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#d6c7b2] mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7a6b]" />
          <input 
            type="text" 
            placeholder="Buscar en el menú..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#faf7f4] border border-[#d6c7b2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#654935]/20"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#faf7f4] border border-[#d6c7b2] rounded-xl text-sm font-bold text-[#8c7a6b] hover:bg-[#ede3d6] transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
        </button>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] overflow-hidden border border-[#d6c7b2] shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative h-48 bg-[#ede3d6] overflow-hidden">
                <img 
                  src={item.image || `https://picsum.photos/seed/${item.id}/800/600`} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-[#654935] shadow-sm hover:bg-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-red-500 shadow-sm hover:bg-white transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-[#654935] text-white text-xs font-bold rounded-full shadow-lg">
                    {item.price}€
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-black text-[#654935] leading-tight">{item.name}</h3>
                  <div className="flex gap-1">
                    {item.allergens.map(a => (
                      <div key={a} className="w-5 h-5 rounded-full bg-[#faf7f4] border border-[#d6c7b2] flex items-center justify-center text-[8px] font-bold text-[#8c7a6b] uppercase" title={a}>
                        {a[0]}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[#8c7a6b] line-clamp-2 mb-6 font-medium leading-relaxed">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Disponible</span>
                  </div>
                  <button className="text-[10px] font-black text-[#654935] uppercase tracking-widest flex items-center gap-1 hover:underline">
                    Ver ficha <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add New Card Placeholder */}
        <button className="bg-[#faf7f4] rounded-[32px] border-2 border-dashed border-[#d6c7b2] flex flex-col items-center justify-center p-12 group hover:bg-white hover:border-[#654935] transition-all min-h-[400px]">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-[#654935]" />
          </div>
          <span className="text-sm font-bold text-[#654935]">Añadir nuevo plato</span>
          <span className="text-xs text-[#8c7a6b] mt-1">Categoría: {CATEGORIES.find(c => c.id === activeCategory)?.label}</span>
        </button>
      </div>

      {/* Summary Section */}
      <div className="mt-12 bg-[#654935] rounded-[40px] p-8 text-white shadow-2xl shadow-[#654935]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Utensils className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black">Resumen del Menú</h3>
              <p className="text-white/70 text-sm font-medium">Total: {MOCK_MENU.length} platos seleccionados</p>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none px-6 py-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 text-center">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Coste Estimado</div>
              <div className="text-xl font-black">95.00€ <span className="text-xs opacity-60">/ pax</span></div>
            </div>
            <button className="flex-1 md:flex-none px-8 py-4 bg-white text-[#654935] font-black rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95">
              Generar Ficha Técnica
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

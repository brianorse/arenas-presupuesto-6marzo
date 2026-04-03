import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Copy,
  ChevronRight, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Info,
  Save,
  Check,
  Coffee,
  Wine,
  IceCream,
  Beef,
  Salad,
  X
} from 'lucide-react';

const MENU_CATEGORIES = [
  { id: 'aperitivos', name: 'Aperitivos', icon: <Coffee className="w-4 h-4" /> },
  { id: 'entrantes', name: 'Entrantes', icon: <Salad className="w-4 h-4" /> },
  { id: 'principales', name: 'Principales', icon: <Beef className="w-4 h-4" /> },
  { id: 'postres', name: 'Postres', icon: <IceCream className="w-4 h-4" /> },
  { id: 'bebidas', name: 'Bebidas', icon: <Wine className="w-4 h-4" /> },
];

const MOCK_MENU_ITEMS = [
  {
    id: '1',
    name: 'Croquetas de Jamón Ibérico',
    category: 'aperitivos',
    description: 'Croquetas cremosas elaboradas con leche de caserío y jamón de bellota.',
    allergens: ['Gluten', 'Lácteos'],
    quantity: '2 uds/persona',
    status: 'confirmado'
  },
  {
    id: '2',
    name: 'Tartar de Atún Rojo',
    category: 'entrantes',
    description: 'Atún rojo de almadraba con aguacate, lima y soja.',
    allergens: ['Pescado', 'Soja', 'Sésamo'],
    quantity: '1 ración/persona',
    status: 'confirmado'
  },
  {
    id: '3',
    name: 'Solomillo de Ternera',
    category: 'principales',
    description: 'Solomillo a la brasa con reducción de Pedro Ximénez y parmentier de patata.',
    allergens: ['Lácteos', 'Sulfitos'],
    quantity: '1 ración/persona',
    status: 'pendiente'
  },
  {
    id: '4',
    name: 'Coulant de Chocolate',
    category: 'postres',
    description: 'Bizcocho caliente con corazón fundente y helado de vainilla de Madagascar.',
    allergens: ['Gluten', 'Lácteos', 'Huevos'],
    quantity: '1 ración/persona',
    status: 'confirmado'
  }
];

export default function GestionMenu() {
  const [activeCategory, setActiveCategory] = useState('aperitivos');
  const [menuItems, setMenuItems] = useState(MOCK_MENU_ITEMS);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#ede3d6] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#d6c7b2] pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#654935] flex items-center justify-center text-white shadow-lg shadow-[#654935]/20">
                  <Utensils className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black text-[#654935] tracking-tight">Menú del evento</h1>
              </div>
              <p className="text-[#8c7a6b] font-medium">Configura los platos, aperitivos y opciones gastronómicas del evento</p>
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-[#654935] text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-[#654935]/20 hover:bg-[#4d3829] transition-all active:scale-95 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span>Añadir elemento al menú</span>
            </button>
          </div>

          {/* Resumen Superior */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-10">
            {[
              { label: 'Tipo de Servicio', value: 'Boda Real', icon: <Utensils className="w-4 h-4" /> },
              { label: 'Invitados', value: '150 pax', icon: <Users className="w-4 h-4" /> },
              { label: 'Menú Seleccionado', value: 'Gourmet Plus', icon: <CheckCircle2 className="w-4 h-4" /> },
              { label: 'Total Elementos', value: `${menuItems.length} platos`, icon: <Plus className="w-4 h-4" /> },
              { label: 'Estado', value: 'Borrador', icon: <AlertCircle className="w-4 h-4" />, color: 'text-amber-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#faf7f4] border border-[#d6c7b2] p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#8c7a6b]">{stat.icon}</span>
                  <span className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-wider">{stat.label}</span>
                </div>
                <div className={`text-sm font-black ${stat.color || 'text-[#654935]'}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs de Categorías */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
              {MENU_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-[#654935] text-white shadow-lg shadow-[#654935]/20' 
                      : 'bg-white text-[#8c7a6b] border border-[#d6c7b2] hover:bg-[#faf7f4]'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.name}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                    activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-[#faf7f4] text-[#8c7a6b]'
                  }`}>
                    {menuItems.filter(item => item.category === cat.id).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Lista de Platos */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-[#d6c7b2] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-black text-[#654935]">{item.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.status === 'confirmado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#8c7a6b] mb-4 leading-relaxed">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#8c7a6b] uppercase">Alérgenos:</span>
                            <div className="flex gap-1">
                              {item.allergens.map(a => (
                                <span key={a} className="px-2 py-0.5 bg-[#faf7f4] border border-[#d6c7b2] rounded-full text-[10px] text-[#654935] font-medium">
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#8c7a6b] uppercase">Formato:</span>
                            <span className="text-xs font-bold text-[#654935]">{item.quantity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-[#f0f0f0] pt-4 md:pt-0 md:pl-6">
                        <button className="p-2 hover:bg-[#faf7f4] rounded-xl text-[#8c7a6b] transition-colors" title="Editar">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-[#faf7f4] rounded-xl text-[#8c7a6b] transition-colors" title="Duplicar">
                          <Copy className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-xl text-red-400 transition-colors" title="Eliminar">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredItems.length === 0 && (
                <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-[#d6c7b2]">
                  <Utensils className="w-12 h-12 text-[#d6c7b2] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#654935]">No hay platos en esta categoría</h3>
                  <p className="text-[#8c7a6b]">Pulsa el botón superior para añadir el primer elemento.</p>
                </div>
              )}
            </div>

            {/* Bloque de Observaciones */}
            <div className="mt-12 bg-white border border-[#d6c7b2] rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-[#faf7f4] flex items-center justify-center text-[#654935]">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-[#654935]">Observaciones del Menú</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-widest block mb-2">Preferencias del Cliente</label>
                    <textarea 
                      placeholder="Ej: Sin frutos secos en los aperitivos..."
                      className="w-full h-32 p-4 bg-[#faf7f4] border border-[#d6c7b2] rounded-2xl text-sm text-[#654935] outline-none focus:ring-2 focus:ring-[#654935] transition-all no-scrollbar"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-widest block mb-2">Cambios Solicitados</label>
                    <textarea 
                      placeholder="Ej: Cambiar el solomillo por entrecot..."
                      className="w-full h-32 p-4 bg-[#faf7f4] border border-[#d6c7b2] rounded-2xl text-sm text-[#654935] outline-none focus:ring-2 focus:ring-[#654935] transition-all no-scrollbar"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-widest block mb-2">Observaciones Internas (Cocina)</label>
                  <textarea 
                    placeholder="Ej: Preparar 10 raciones especiales para celíacos..."
                    className="w-full h-[296px] p-4 bg-[#faf7f4] border border-[#d6c7b2] rounded-2xl text-sm text-[#654935] outline-none focus:ring-2 focus:ring-[#654935] transition-all no-scrollbar"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Resumen */}
          <div className="lg:w-80">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white border border-[#d6c7b2] rounded-[2.5rem] p-8 shadow-lg">
                <h3 className="text-xs font-black text-[#8c7a6b] uppercase tracking-widest mb-6">Resumen del Menú</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8c7a6b]">Total Elementos</span>
                    <span className="text-sm font-black text-[#654935]">{menuItems.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8c7a6b]">Invitados Estimados</span>
                    <span className="text-sm font-black text-[#654935]">150</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8c7a6b]">Estado</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase">Borrador</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 bg-[#654935] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#654935]/20 hover:bg-[#4d3829] transition-all active:scale-95">
                    <Save className="w-4 h-4" />
                    <span>Guardar cambios</span>
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 bg-white text-[#654935] border-2 border-[#654935] py-4 rounded-2xl font-bold hover:bg-[#faf7f4] transition-all active:scale-95">
                    <Check className="w-4 h-4" />
                    <span>Confirmar menú</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#654935] rounded-[2.5rem] p-8 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold">Próximos Pasos</h4>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Una vez confirmado el menú, se generarán automáticamente los escandallos y la lista de producción para cocina.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Añadir (Placeholder Visual) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-[#f0f0f0] flex justify-between items-center bg-[#faf7f4]">
                <h2 className="text-2xl font-black text-[#654935] tracking-tight">Añadir al Menú</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-[#ede3d6] rounded-full text-[#8c7a6b] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-widest block mb-2">Nombre del Plato</label>
                    <input type="text" className="w-full p-4 bg-[#faf7f4] border border-[#d6c7b2] rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#654935]" placeholder="Ej: Solomillo de Ternera..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-widest block mb-2">Categoría</label>
                    <select className="w-full p-4 bg-[#faf7f4] border border-[#d6c7b2] rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#654935]">
                      {MENU_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-full bg-[#654935] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#654935]/20 hover:bg-[#4d3829] transition-all"
                >
                  Añadir al Menú
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

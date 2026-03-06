import React, { useMemo } from 'react';
import { CATEGORY_LABELS, CATEGORY_IMAGES } from '../catalogo/CATALOG_DATA';
import { CATALOG_ITEMS } from '../catalogo/ITEMS_DATA';
import { Plus, Minus, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { calcularTotales } from '../presupuesto/calcularTotales';

export default function Step3Menu({ client, selectedItems, setSelectedItems, onNext, onBack }) {
  
  const handleAddItem = (item) => {
    const existing = selectedItems.find(i => i.id === item.id);
    if (existing) {
      const updated = selectedItems.map(i => 
        i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
      );
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (itemId) => {
    const existing = selectedItems.find(i => i.id === itemId);
    if (existing && existing.quantity > 1) {
      const updated = selectedItems.map(i => 
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
      setSelectedItems(updated);
    } else {
      setSelectedItems(selectedItems.filter(i => i.id !== itemId));
    }
  };

  const getQuantity = (itemId) => {
    const item = selectedItems.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  // Calculate live totals
  const liveTotals = useMemo(() => {
    return calcularTotales(selectedItems, client.pax, client.tipo_experiencia);
  }, [selectedItems, client.pax, client.tipo_experiencia]);

  // Filter categories based on event type
  const categoriesToShow = Object.keys(CATEGORY_LABELS).filter(cat => {
    if (client.tipo_evento === 'boda' && cat === 'coffee') return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#654935] mb-2">Diseña tu Menú</h2>
          <p className="text-[#8c7a6b]">Selecciona los platos y bebidas para tu evento.</p>
        </div>
        <div className="bg-[#654935] text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
          <ShoppingBag className="w-5 h-5" />
          <span className="font-bold">{selectedItems.length}</span>
          <span className="text-white/80 text-sm hidden sm:inline">seleccionados</span>
        </div>
      </div>
      
      {/* Items List Grouped by Category */}
      <div className="space-y-12">
        {/* Special Section: Menús Completos */}
        <div className="bg-[#1a0f0a] text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-[#654935]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#654935] rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-[#d4af37]">¿No sabes qué menú escoger?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl">
              Tranquilo, <span className="font-bold text-white">nosotros pensamos por ti</span>. Olvídate de combinar platos y deja que la magia fluya con nuestras propuestas diseñadas para triunfar. 🚀
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Menú 1: De Plato */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-[#d4af37]">Menú 1: De Plato</h3>
                  <div className="text-right">
                    <div className="text-xs text-white/60 uppercase tracking-wider">Ejemplo</div>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm text-white/80 mb-6 font-light">
                  <p className="italic text-white/60 mb-4">Una propuesta clásica y elegante con servicio en mesa.</p>
                  <div>
                    <strong className="text-white block mb-1">Aperitivo de Bienvenida</strong>
                    • Jamón Ibérico de Bellota<br/>
                    • Tabla de Quesos Nacionales
                  </div>
                  <div>
                    <strong className="text-white block mb-1">Entrante</strong>
                    • Ensalada de Bogavante con vinagreta de su coral
                  </div>
                  <div>
                    <strong className="text-white block mb-1">Plato Principal</strong>
                    • Solomillo de Ternera con patatas gratén
                  </div>
                  <div>
                    <strong className="text-white block mb-1">Postre</strong>
                    • Coulant de Chocolate con helado de vainilla
                  </div>
                  <div>
                    <strong className="text-white block mb-1">Bodega</strong>
                    • Vino Blanco, Tinto y Cava Selección
                  </div>
                </div>

                <div className="w-full py-3 rounded-xl bg-white/5 text-white/50 font-bold border border-white/10 flex items-center justify-center gap-2 cursor-default">
                  Menú de Ejemplo
                </div>
              </div>

              {/* Menú 2: Tipo Pica Pica */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-[#d4af37]">Menú 2: Cocktail</h3>
                  <div className="text-right">
                    <div className="text-xs text-white/60 uppercase tracking-wider">Ejemplo</div>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm text-white/80 mb-6 font-light">
                  <p className="italic text-white/60 mb-4">Una experiencia dinámica tipo "pica pica" con estaciones.</p>
                  <div>
                    <strong className="text-white block mb-1">Estaciones & Showcooking</strong>
                    • Estación de Quesos Nacionales e Internacionales<br/>
                    • Estación de Ibéricos con cortador<br/>
                    • Showcooking de Arroces (Senyoret y Fideuá)
                  </div>
                  <div>
                    <strong className="text-white block mb-1">Pase de Bandeja (Fríos)</strong>
                    • Gazpacho de remolacha<br/>
                    • Tartar de atún rojo<br/>
                    • Carpaccio de buey
                  </div>
                  <div>
                    <strong className="text-white block mb-1">Pase de Bandeja (Calientes)</strong>
                    • Mini hamburguesas Wagyu<br/>
                    • Mini croissant de sobrasada<br/>
                    • Bombones de foie
                  </div>
                  <div>
                    <strong className="text-white block mb-1">Postres</strong>
                    • Surtido de mini postres y fruta fresca
                  </div>
                </div>

                <div className="w-full py-3 rounded-xl bg-white/5 text-white/50 font-bold border border-white/10 flex items-center justify-center gap-2 cursor-default">
                   Menú de Ejemplo
                </div>
              </div>
            </div>
          </div>
        </div>

        {categoriesToShow.map(categoryKey => {
          const categoryItems = CATALOG_ITEMS.filter(item => item.category === categoryKey);
          if (categoryItems.length === 0) return null;

          return (
            <div key={categoryKey} className="space-y-4">
              {/* Category Header with Image */}
              <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden shadow-md group">
                <img 
                  src={CATEGORY_IMAGES[categoryKey]} 
                  alt={CATEGORY_LABELS[categoryKey]}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white shadow-sm">
                    {CATEGORY_LABELS[categoryKey]}
                  </h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryItems.map(item => {
                  const qty = getQuantity(item.id);
                  return (
                    <div key={item.id} className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${qty > 0 ? 'border-[#654935] ring-1 ring-[#654935]/20 bg-[#fffbf5]' : 'border-[#e8ddd0] hover:border-[#d6c7b2]'}`}>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <div className="font-bold text-[#3d2b1f] text-lg leading-tight mb-1">{item.name}</div>
                          <p className="text-sm text-[#8c7a6b] line-clamp-2">{item.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-[#654935] text-lg">
                            {item.price.toFixed(2)}€
                          </div>
                          <div className="text-xs text-[#8c7a6b]">
                            {item.pricingModel === 'per_person' ? '/pers' : item.pricingModel === 'per_piece' ? '/ud' : '/evento'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end pt-2 border-t border-[#f0e6db]">
                        {qty > 0 ? (
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleRemoveItem(item.id)} className="w-8 h-8 rounded-full bg-white text-[#654935] flex items-center justify-center hover:bg-[#ede3d6] transition-colors shadow-sm border border-[#e8ddd0]">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-[#3d2b1f] w-6 text-center text-lg">{qty}</span>
                            <button onClick={() => handleAddItem(item)} className="w-8 h-8 rounded-full bg-[#654935] text-white flex items-center justify-center hover:bg-[#4a3627] transition-colors shadow-md">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleAddItem(item)} className="px-4 py-2 rounded-xl bg-[#faf7f4] text-[#654935] text-sm font-bold hover:bg-[#654935] hover:text-white transition-all border border-[#e8ddd0] flex items-center gap-2">
                            Añadir <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Footer Total */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#d6c7b2] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#8c7a6b] uppercase font-bold tracking-wider">Total Estimado</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#654935]">{liveTotals.total.toFixed(0)}€</span>
              <span className="text-sm text-[#8c7a6b]">({liveTotals.perPax.toFixed(0)}€/pax)</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-2xl text-[#654935] font-bold hover:bg-[#e8ddd0]/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Atrás
            </button>
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#654935] text-white font-bold text-lg hover:bg-[#4a3627] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Ver Resumen <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

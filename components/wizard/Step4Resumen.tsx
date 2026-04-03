import React from 'react';
import { calcularTotales } from '../presupuesto/calcularTotales';
import { ChevronLeft, Save, Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { CATEGORY_LABELS } from '../catalogo/CATALOG_DATA';

export default function Step4Resumen({ client, selectedItems, onBack, onSave, saving }) {
  const totales = calcularTotales(selectedItems, client.pax, client.tipo_experiencia);
  const categorias = [...new Set(selectedItems.map(i => i.category))];

  // Sort categories based on CATEGORY_LABELS order
  const orderedCategories = Object.keys(CATEGORY_LABELS).filter(cat => categorias.includes(cat));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-[#654935] mb-2">Resumen Final</h2>
        <p className="text-[#8c7a6b]">Revisa los detalles antes de guardar tu presupuesto.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info Card */}
          <div className="bg-white rounded-3xl border border-[#e8ddd0] p-6 shadow-sm">
            <h3 className="font-bold text-[#654935] text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Datos del Evento
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <div className="text-xs text-[#8c7a6b] uppercase font-bold mb-1">Cliente</div>
                <div className="font-semibold text-[#3d2b1f] text-lg">{client.cliente_nombre}</div>
              </div>
              <div>
                <div className="text-xs text-[#8c7a6b] uppercase font-bold mb-1">Fecha</div>
                <div className="font-semibold text-[#3d2b1f] text-lg">{client.fecha_evento || 'Sin fecha'}</div>
              </div>
              <div>
                <div className="text-xs text-[#8c7a6b] uppercase font-bold mb-1">Invitados</div>
                <div className="font-semibold text-[#3d2b1f] text-lg flex items-center gap-1">
                  <Users className="w-4 h-4 text-[#8c7a6b]" /> {client.pax} pax
                </div>
              </div>
              <div>
                <div className="text-xs text-[#8c7a6b] uppercase font-bold mb-1">Lugar</div>
                <div className="font-semibold text-[#3d2b1f] text-lg flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#8c7a6b]" /> {client.lugar || 'Por definir'}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Items List */}
          <div className="bg-white rounded-3xl border border-[#e8ddd0] p-6 shadow-sm">
            <h3 className="font-bold text-[#654935] text-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Selección ({selectedItems.length})
            </h3>
            {selectedItems.length === 0 ? (
              <div className="text-center py-8 bg-[#faf7f4] rounded-2xl border border-dashed border-[#d6c7b2]">
                <p className="text-[#8c7a6b] italic">No has seleccionado ningún servicio.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orderedCategories.map(cat => (
                  <div key={cat}>
                    <h4 className="text-sm font-bold text-[#8c7a6b] uppercase mb-3 border-b border-[#e8ddd0] pb-1">
                      {CATEGORY_LABELS[cat] || cat}
                    </h4>
                    <div className="space-y-3">
                      {selectedItems.filter(i => i.category === cat).map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 hover:bg-[#faf7f4] rounded-xl transition-colors border border-transparent hover:border-[#e8ddd0]">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-bold text-[#3d2b1f] text-sm">{item.name}</div>
                              <div className="text-xs text-[#8c7a6b]">
                                {item.quantity} x {item.price}€ ({item.pricingModel === 'per_person' ? 'p/p' : 'ud'})
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-[#654935] bg-[#fffbf5] px-3 py-1 rounded-lg border border-[#e8ddd0]">
                            {(item.price * item.quantity * (item.pricingModel === 'per_person' ? client.pax : 1)).toFixed(0)}€
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Totals Sticky */}
        <div className="lg:col-span-1">
          <div className="bg-[#654935] text-white rounded-3xl p-6 shadow-xl sticky top-6">
            <h3 className="font-bold text-xl mb-6 text-white/90">Resumen Económico</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-white/80 text-sm">
                <span>Comida</span>
                <span className="font-semibold">{totales.food.toFixed(0)}€</span>
              </div>
              <div className="flex justify-between text-white/80 text-sm">
                <span>Bebida</span>
                <span className="font-semibold">{totales.drinks.toFixed(0)}€</span>
              </div>
              <div className="flex justify-between text-white/80 text-sm">
                <span>Personal</span>
                <span className="font-semibold">{totales.staff.toFixed(0)}€</span>
              </div>
              {totales.logistics > 0 && (
                <div className="flex justify-between text-white/80 text-sm">
                  <span>Logística</span>
                  <span className="font-semibold">{totales.logistics.toFixed(0)}€</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/20 pt-4 mb-6">
              <div className="flex justify-between items-end mb-1">
                <span className="text-white/60 text-sm font-medium">TOTAL ESTIMADO</span>
                <span className="text-3xl font-bold tracking-tight">{totales.total.toFixed(0)}€</span>
              </div>
              <div className="text-right text-white/60 text-xs">
                {totales.perPax.toFixed(0)}€ por persona
              </div>
            </div>

            <button
              onClick={onSave}
              disabled={saving}
              className="w-full py-4 rounded-xl bg-white text-[#654935] font-bold text-lg hover:bg-[#f0e9e0] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>Guardando...</>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Confirmar Presupuesto
                </>
              )}
            </button>
            
            <p className="text-center text-white/40 text-xs mt-4">
              *Precios sin IVA incluido
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-start pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[#654935] font-bold hover:bg-[#e8ddd0]/50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Volver a editar
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Edit, Save, X, Users, Calendar, MapPin, Phone, Mail, Download } from 'lucide-react';
import { createPageUrl } from '@/utils';
import EstadoBadge from '../components/presupuesto/EstadoBadge';
import { CATEGORY_LABELS, EVENT_TYPES, EXPERIENCE_TYPES } from '../components/catalogo/CATALOG_DATA';
import { generateBudgetPDF } from '@/utils/pdfGenerator';

export default function DetallePresupuesto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const [presupuesto, setPresupuesto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingNotas, setEditingNotas] = useState(false);
  const [notasAdmin, setNotasAdmin] = useState('');
  const [editingEstado, setEditingEstado] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const data = await base44.entities.Presupuesto.filter({ id });
      if (data && data.length > 0) {
        setPresupuesto(data[0]);
        setNotasAdmin(data[0].notas_admin || '');
      }
      setLoading(false);
    };
    init();
  }, [id]);

  const isAdmin = user?.role === 'admin';

  const handleSaveNotas = async () => {
    setSaving(true);
    const updated = await base44.entities.Presupuesto.update(presupuesto.id, { notas_admin: notasAdmin });
    setPresupuesto({ ...presupuesto, notas_admin: notasAdmin });
    setEditingNotas(false);
    setSaving(false);
  };

  const handleChangeEstado = async (nuevoEstado) => {
    setSaving(true);
    await base44.entities.Presupuesto.update(presupuesto.id, { estado: nuevoEstado });
    setPresupuesto({ ...presupuesto, estado: nuevoEstado });
    setEditingEstado(false);
    setSaving(false);
  };

  const handleDownloadPDF = () => {
    if (presupuesto) {
      generateBudgetPDF(presupuesto);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ede3d6] flex items-center justify-center">
        <div className="text-[#654935] font-semibold">Cargando presupuesto...</div>
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="min-h-screen bg-[#ede3d6] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-[#654935] font-bold text-xl">Presupuesto no encontrado</div>
          <a href={createPageUrl('MisPresupuestos')} className="mt-4 inline-block text-[#654935] hover:underline">← Volver</a>
        </div>
      </div>
    );
  }

  const items = presupuesto.items_seleccionados || [];
  const categorias = [...new Set(items.map(i => i.category))];
  const tipoEvento = EVENT_TYPES.find(e => e.id === presupuesto.tipo_evento);
  const tipoExp = EXPERIENCE_TYPES.find(e => e.id === presupuesto.tipo_experiencia);

  const calcItemTotal = (item) => {
    const pax = presupuesto.pax || 1;
    if (item.pricingModel === 'per_person') return item.price * pax;
    if (item.pricingModel === 'per_piece') return item.price * item.quantity * pax;
    if (item.pricingModel === 'per_event') return item.price * item.quantity;
    if (item.pricingModel === 'per_hour') return item.price * item.quantity;
    return 0;
  };

  const backUrl = isAdmin ? createPageUrl('AdminPanel') : createPageUrl('MisPresupuestos');

  return (
    <div className="min-h-screen bg-[#ede3d6]">
      {/* Header */}
      <div className="bg-white border-b border-[#d6c7b2] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href={backUrl} className="flex items-center gap-2 text-[#654935] hover:text-[#4a3627] font-semibold">
            <ArrowLeft className="w-5 h-5" /> Volver
          </a>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <a href={createPageUrl(`NuevoPresupuesto?id=${presupuesto.id}`)}
              className="flex items-center gap-1.5 text-sm border border-[#d6c7b2] px-3 py-1.5 rounded-xl hover:border-[#654935] transition-colors text-[#654935] font-semibold">
              <Edit className="w-3.5 h-3.5" /> Editar
            </a>
            <button onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 text-sm bg-[#654935] hover:bg-[#4a3627] text-white px-4 py-2 rounded-xl transition-colors font-semibold">
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
            {isAdmin && !editingEstado && (
              <button onClick={() => setEditingEstado(true)}
                className="flex items-center gap-1.5 text-sm border border-[#d6c7b2] px-3 py-1.5 rounded-xl hover:border-[#654935] transition-colors text-[#654935] font-semibold">
                <Edit className="w-3.5 h-3.5" /> Cambiar estado
              </button>
            )}
            {/* Botones para cliente: aceptar/rechazar si el presupuesto está enviado */}
            {!isAdmin && presupuesto.estado === 'enviado' && (
              <>
                <button onClick={() => handleChangeEstado('aprobado')} disabled={saving}
                  className="flex items-center gap-1.5 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors font-semibold disabled:opacity-50">
                  ✓ Aceptar presupuesto
                </button>
                <button onClick={() => handleChangeEstado('rechazado')} disabled={saving}
                  className="flex items-center gap-1.5 text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors font-semibold disabled:opacity-50">
                  ✗ Rechazar
                </button>
              </>
            )}
            <EstadoBadge estado={presupuesto.estado} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
        {/* Cambiar estado (admin) */}
        {isAdmin && editingEstado && (
          <div className="bg-white rounded-2xl border border-[#654935] p-5">
            <div className="font-bold text-[#654935] mb-3">Cambiar estado del presupuesto</div>
            <div className="flex flex-wrap gap-2">
              {['borrador', 'enviado', 'aprobado', 'rechazado'].map(est => (
                <button key={est} onClick={() => handleChangeEstado(est)} disabled={saving}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${presupuesto.estado === est ? 'bg-[#654935] text-white' : 'border border-[#d6c7b2] text-[#654935] hover:border-[#654935]'}`}>
                  {est.charAt(0).toUpperCase() + est.slice(1)}
                </button>
              ))}
              <button onClick={() => setEditingEstado(false)} className="px-4 py-2 text-[#8c7a6b] hover:text-[#654935]">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Info principal */}
        <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#3d2b1f] mb-1">{presupuesto.titulo || 'Presupuesto sin título'}</h1>
              <div className="flex items-center gap-2 text-sm text-[#8c7a6b]">
                <span>Ref: {presupuesto.id}</span>
                {presupuesto.codigo && <span className="font-mono bg-[#f5f5f0] text-[#654935] px-1.5 py-0.5 rounded border border-[#e8ddd0] font-bold">#{presupuesto.codigo}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#654935]">{presupuesto.total?.toFixed(2)}€</div>
              <div className="text-xs text-[#8c7a6b]">+ IVA</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-[#faf7f4] rounded-xl border border-[#e8ddd0]">
            <div>
              <div className="text-xs text-[#8c7a6b] uppercase font-bold mb-1">Personas</div>
              <div className="flex items-center gap-1 font-semibold text-[#3d2b1f]"><Users className="w-4 h-4 text-[#8c7a6b]" />{presupuesto.pax}</div>
            </div>
            {presupuesto.fecha_evento && (
              <div>
                <div className="text-xs text-[#8c7a6b] uppercase font-bold mb-1">Fecha</div>
                <div className="flex items-center gap-1 font-semibold text-[#3d2b1f]"><Calendar className="w-4 h-4 text-[#8c7a6b]" />{new Date(presupuesto.fecha_evento).toLocaleDateString('es-ES')}</div>
              </div>
            )}
            {presupuesto.lugar && (
              <div>
                <div className="text-xs text-[#8c7a6b] uppercase font-bold mb-1">Lugar</div>
                <div className="flex items-center gap-1 font-semibold text-[#3d2b1f]"><MapPin className="w-4 h-4 text-[#8c7a6b]" />{presupuesto.lugar}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-[#8c7a6b] uppercase font-bold mb-1">Tipo</div>
              <div className="font-semibold text-[#3d2b1f]">{tipoEvento ? `${tipoEvento.icon} ${tipoEvento.label}` : '—'}</div>
            </div>
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
          <h2 className="font-bold text-[#654935] mb-4">Datos de contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-[#3d2b1f]">
              <Users className="w-4 h-4 text-[#8c7a6b]" />
              <span>{presupuesto.cliente_nombre || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-[#3d2b1f]">
              <Mail className="w-4 h-4 text-[#8c7a6b]" />
              <span>{presupuesto.cliente_email || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-[#3d2b1f]">
              <Phone className="w-4 h-4 text-[#8c7a6b]" />
              <span>{presupuesto.cliente_telefono || '—'}</span>
            </div>
          </div>
          {presupuesto.notas && (
            <div className="mt-3 p-3 bg-[#faf7f4] rounded-xl text-sm text-[#3d2b1f] border border-[#e8ddd0]">
              <span className="font-semibold text-[#8c7a6b]">Notas: </span>{presupuesto.notas}
            </div>
          )}
        </div>

        {/* Menú */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
            <h2 className="font-bold text-[#654935] mb-4">Menú seleccionado</h2>
            <div className="space-y-6">
              {categorias.map(cat => (
                <div key={cat as string}>
                  <h3 className="text-sm font-bold text-[#8c7a6b] uppercase mb-3 border-b border-[#e8ddd0] pb-1">
                    {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}
                  </h3>
                  <div className="space-y-3">
                    {items.filter(i => i.category === cat).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#f5f5f0] flex items-center justify-center text-xs font-bold text-[#654935]">
                            {item.quantity}x
                          </div>
                          <div>
                            <div className="font-medium text-[#3d2b1f]">{item.name}</div>
                            <div className="text-xs text-[#8c7a6b]">{item.price}€ / {item.pricingModel === 'per_person' ? 'pax' : 'ud'}</div>
                          </div>
                        </div>
                        <div className="font-bold text-[#654935]">
                          {calcItemTotal(item).toFixed(2)}€
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas Admin */}
        {isAdmin && (
          <div className="bg-white rounded-2xl border border-[#654935] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-[#654935]">Notas internas (Admin)</h2>
              {!editingNotas ? (
                <button onClick={() => setEditingNotas(true)} className="text-sm text-[#8c7a6b] hover:text-[#654935] flex items-center gap-1">
                  <Edit className="w-3 h-3" /> Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditingNotas(false)} className="text-sm text-[#8c7a6b] hover:text-[#654935]">Cancelar</button>
                  <button onClick={handleSaveNotas} disabled={saving} className="text-sm bg-[#654935] text-white px-3 py-1 rounded-lg hover:bg-[#4a3627]">Guardar</button>
                </div>
              )}
            </div>
            {editingNotas ? (
              <textarea
                value={notasAdmin}
                onChange={(e) => setNotasAdmin(e.target.value)}
                className="w-full p-3 border border-[#e8ddd0] rounded-xl focus:border-[#654935] outline-none min-h-[100px]"
                placeholder="Escribe notas internas sobre este presupuesto..."
              />
            ) : (
              <div className="text-sm text-[#3d2b1f] whitespace-pre-wrap">
                {presupuesto.notas_admin || <span className="text-gray-400 italic">Sin notas internas.</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

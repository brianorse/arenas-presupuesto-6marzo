import React, { useState, useEffect } from 'react';
import { db, useAuth } from '@/firebase';
import { doc, getDoc, updateDoc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Edit, Save, X, Users, Calendar, MapPin, Phone, Mail, Download, Loader2, Layout } from 'lucide-react';
import { createPageUrl } from '@/utils';
import EstadoBadge from '../components/presupuesto/EstadoBadge';
import { CATEGORY_LABELS, EVENT_TYPES, EXPERIENCE_TYPES } from '../components/catalogo/CATALOG_DATA';
import { generateBudgetPDF } from '@/utils/pdfGenerator';

export default function DetallePresupuesto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const { user, loading: authLoading, isAdmin } = useAuth();
  const [presupuesto, setPresupuesto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingNotas, setEditingNotas] = useState(false);
  const [notasAdmin, setNotasAdmin] = useState('');
  const [editingEstado, setEditingEstado] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pagoEstado, setPagoEstado] = useState('pendiente');
  const [montoPagado, setMontoPagado] = useState(0);
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = createPageUrl('Login');
      return;
    }

    if (!id) {
      setLoading(false);
      return;
    }

    // Real-time listener for the specific document
    const unsubscribe = onSnapshot(doc(db, 'solicitudes', id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Security check: owner or admin
        if (data.cliente_uid !== user.uid && !isAdmin) {
          window.location.href = createPageUrl('MisPresupuestos');
          return;
        }
        setPresupuesto({ id: docSnap.id, ...data });
        setNotasAdmin(data.notas_admin || '');
        setPagoEstado(data.pago_estado || 'pendiente');
        setMontoPagado(data.monto_pagado || 0);
      } else {
        setPresupuesto(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching presupuesto:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, user, authLoading, isAdmin]);

  const handleUpdatePago = async () => {
    if (!isAdmin) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'solicitudes', id), {
        pago_estado: pagoEstado,
        monto_pagado: Number(montoPagado)
      });
      alert("Información de pago actualizada.");
    } catch (error) {
      console.error("Error updating pago:", error);
      alert("Error al actualizar el pago.");
    } finally {
      setSaving(false);
    }
  };

  const handleAgendarEvento = async () => {
    if (!isAdmin) return;
    if (!presupuesto.fecha_evento) {
      alert("El presupuesto no tiene una fecha definida.");
      return;
    }

    setSaving(true);
    try {
      console.log("Intentando agendar evento para presupuesto:", id);
      // Create event document
      const eventoData = {
        titulo: presupuesto.titulo || `Evento de ${presupuesto.cliente_nombre}`,
        fecha: presupuesto.fecha_evento,
        hora: presupuesto.hora_evento || '',
        cliente_nombre: presupuesto.cliente_nombre || '',
        cliente_email: presupuesto.cliente_email || '',
        cliente_telefono: presupuesto.cliente_telefono || '',
        presupuesto_id: id,
        tipo_evento: presupuesto.tipo_evento || 'otro',
        pax: Number(presupuesto.pax) || 0,
        lugar: presupuesto.lugar || '',
        pago_estado: pagoEstado,
        monto_pagado: Number(montoPagado),
        notas: presupuesto.notas || '',
        created_at: serverTimestamp()
      };
      
      console.log("Datos del evento:", eventoData);
      
      await addDoc(collection(db, 'eventos'), eventoData);
      console.log("Documento en 'eventos' creado con éxito");

      // Update budget status to approved if it wasn't already
      await updateDoc(doc(db, 'solicitudes', id), {
        estado: 'aprobado',
        agendado: true,
        updated_at: serverTimestamp()
      });
      console.log("Documento en 'solicitudes' actualizado con éxito");

      alert("Evento agendado correctamente en el calendario.");
      setIsScheduling(false);
    } catch (error) {
      console.error("Error detallado al agendar:", error);
      alert(`Error al agendar el evento: ${error.message || 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotas = async () => {
    if (!isAdmin) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'solicitudes', id), { notas_admin: notasAdmin });
      setEditingNotas(false);
    } catch (error) {
      console.error("Error updating notas:", error);
      alert("Error al guardar las notas.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEstado = async (nuevoEstado) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'solicitudes', id), { estado: nuevoEstado });
      setEditingEstado(false);

      // Notify admin if client changed status (approved/rejected)
      if (!isAdmin && (nuevoEstado === 'aprobado' || nuevoEstado === 'rechazado')) {
        try {
          await addDoc(collection(db, 'mail'), {
            to: ['app@cateringapp.com', 'BrianOrtegaXIV@gmail.com'],
            message: {
              subject: `🔔 Presupuesto ${nuevoEstado === 'aprobado' ? 'ACEPTADO' : 'RECHAZADO'}: ${presupuesto.titulo}`,
              text: `El cliente ${presupuesto.cliente_nombre} ha ${nuevoEstado} el presupuesto "${presupuesto.titulo}".\n\nEstado: ${nuevoEstado.toUpperCase()}\nTotal: ${presupuesto.total.toFixed(2)}€\n\nVer en el panel: https://ais-dev-4b7cyejxnzwa2wxjo2ntyd-8963002671.europe-west3.run.app/DetallePresupuesto?id=${id}`,
              html: `
                <div style="font-family: sans-serif; color: #3d2b1f; max-width: 600px; margin: 0 auto; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden;">
                  <div style="background-color: ${nuevoEstado === 'aprobado' ? '#16a34a' : '#dc2626'}; padding: 20px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">Presupuesto ${nuevoEstado === 'aprobado' ? 'Aceptado' : 'Rechazado'}</h2>
                  </div>
                  <div style="padding: 24px; background-color: #ffffff;">
                    <p>El cliente <b>${presupuesto.cliente_nombre}</b> ha actualizado el estado de su presupuesto:</p>
                    <div style="background-color: #faf7f4; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                      <p style="margin: 4px 0;"><b>Presupuesto:</b> ${presupuesto.titulo}</p>
                      <p style="margin: 4px 0;"><b>Estado:</b> <span style="color: ${nuevoEstado === 'aprobado' ? '#16a34a' : '#dc2626'}; font-weight: bold; text-transform: uppercase;">${nuevoEstado}</span></p>
                      <p style="margin: 4px 0;"><b>Total:</b> ${presupuesto.total.toFixed(2)}€</p>
                    </div>
                    <div style="text-align: center;">
                      <a href="https://ais-dev-4b7cyejxnzwa2wxjo2ntyd-8963002671.europe-west3.run.app/DetallePresupuesto?id=${id}" style="background-color: #654935; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Ver Detalles</a>
                    </div>
                  </div>
                </div>
              `
            },
            createdAt: serverTimestamp()
          });
        } catch (mailErr) {
          console.error("Error sending status change notification:", mailErr);
        }
      }
    } catch (error) {
      console.error("Error updating estado:", error);
      alert("Error al cambiar el estado.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (presupuesto) {
      generateBudgetPDF(presupuesto);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#ede3d6] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#654935]" />
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
    if (item.pricingModel === 'per_person') return item.price * item.quantity * pax;
    if (item.pricingModel === 'per_piece') return item.price * item.quantity;
    if (item.pricingModel === 'per_event') return item.price * item.quantity;
    if (item.pricingModel === 'per_hour') return item.price * item.quantity;
    return 0;
  };

  const backUrl = isAdmin ? createPageUrl('AdminPanel') : createPageUrl('MisPresupuestos');

  return (
    <div className="min-h-screen bg-[#ede3d6]">
      {user?.isMock && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-xs font-bold sticky top-0 z-[60]">
          ⚠️ MODO DE EMERGENCIA: Los datos mostrados pueden no ser reales o estar incompletos.
        </div>
      )}
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
            <a href={createPageUrl(`PlanificadorSala?presupuestoId=${presupuesto.id}`)}
              className="flex items-center gap-1.5 text-sm bg-[#654935] text-white px-4 py-2 rounded-xl hover:bg-[#4a3627] transition-colors font-bold shadow-sm">
              <Layout className="w-4 h-4" /> Planificador
            </a>
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
            <div className="flex items-center gap-2">
              {presupuesto.pago_estado && presupuesto.pago_estado !== 'pendiente' && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  presupuesto.pago_estado === 'pagado' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {presupuesto.pago_estado === 'pagado' ? 'Pagado Total' : 'Paga y Señal'}
                  {presupuesto.monto_pagado > 0 && (
                    <span className="ml-1 opacity-70">({presupuesto.monto_pagado}€)</span>
                  )}
                </div>
              )}
              <EstadoBadge estado={presupuesto.estado} />
            </div>
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
                    {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || (cat as string)}
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

        {/* Gestión de Reserva y Pago (Admin) */}
        {isAdmin && (
          <div className="bg-white rounded-2xl border border-[#654935] p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-[#654935] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Gestión Admin
            </div>
            <h2 className="font-bold text-[#654935] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Gestión de Reserva y Pago
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#8c7a6b] uppercase block mb-1.5">Estado del Pago</label>
                  <select 
                    value={pagoEstado}
                    onChange={(e) => setPagoEstado(e.target.value)}
                    className="w-full p-2.5 border border-[#e8ddd0] rounded-xl focus:border-[#654935] outline-none text-sm bg-[#faf7f4]"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="paga_y_señal">Paga y Señal</option>
                    <option value="pagado">Pagado Total</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8c7a6b] uppercase block mb-1.5">Monto Pagado (€)</label>
                  <input 
                    type="number"
                    value={montoPagado}
                    onChange={(e) => setMontoPagado(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#e8ddd0] rounded-xl focus:border-[#654935] outline-none text-sm bg-[#faf7f4]"
                  />
                </div>
                <button 
                  onClick={handleUpdatePago}
                  disabled={saving}
                  className="w-full py-2.5 bg-[#f5f5f0] border border-[#d6c7b2] text-[#654935] rounded-xl font-bold text-sm hover:bg-[#e8ddd0] transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Actualizar Pago
                </button>
              </div>

              <div className="bg-[#faf7f4] p-4 rounded-xl border border-[#e8ddd0] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#3d2b1f] mb-1">Agendar en Calendario</h3>
                  <p className="text-xs text-[#8c7a6b]">
                    Al agendar, la fecha quedará bloqueada para otros clientes y el presupuesto pasará a estado "Aprobado".
                  </p>
                </div>
                
                <div className="mt-4">
                  {presupuesto.agendado ? (
                    <div className="bg-green-100 text-green-700 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                      ✓ Este evento ya está en el calendario
                    </div>
                  ) : (
                    <button 
                      onClick={handleAgendarEvento}
                      disabled={saving || !presupuesto.fecha_evento}
                      className="w-full py-3 bg-[#654935] text-white rounded-xl font-bold text-sm hover:bg-[#4a3627] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                      Confirmar Reserva y Agendar
                    </button>
                  )}
                </div>
              </div>
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

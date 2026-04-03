import React, { useState, useEffect } from 'react';
import { db, useAuth } from '@/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { 
  Plus, Search, Users, Mail, Phone, FileText, ChevronRight, Edit, 
  MessageSquare, CheckSquare, File, Calendar, LayoutDashboard, 
  ArrowRightLeft, History, StickyNote, Target, MessageCircle, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPageUrl } from '@/utils';
import ClienteModal, { ETIQUETA_LABELS, ETIQUETA_COLORS } from '../components/clientes/ClienteModal';

const ORIGEN_LABELS = { referido: 'Referido', instagram: 'Instagram', web: 'Web', llamada: 'Llamada', otro: 'Otro' };

export default function GestionClientes() {
  const [clientes, setClientes] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [etiquetaFiltro, setEtiquetaFiltro] = useState('');
  const [modal, setModal] = useState(null); // null | { cliente } | { cliente: null }
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'comms' | 'tasks' | 'docs'

  useEffect(() => {
    if (!isAdmin) {
      if (user) window.location.href = createPageUrl('MisPresupuestos');
      return;
    }

    // In a real app, we might have a 'clientes' collection. 
    // For now, we'll use 'users' as clients if they are not admins.
    const unsubscribeUsers = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setClientes(usersData.filter(u => u.role !== 'admin'));
      setLoading(false);
    }, (err) => {
      console.error("Firestore Users Error:", err);
      setLoading(false);
    });

    const unsubscribePresupuestos = onSnapshot(query(collection(db, 'solicitudes'), orderBy('created_date', 'desc')), (snapshot) => {
      const presData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPresupuestos(presData);
    }, (err) => {
      console.error("Firestore Presupuestos Error:", err);
    });

    // Timeout loading if no data arrives in 7 seconds
    const t = setTimeout(() => setLoading(false), 7000);

    return () => {
      clearTimeout(t);
      unsubscribeUsers();
      unsubscribePresupuestos();
    };
  }, [isAdmin, user]);

  const presupuestosDeCliente = (cliente) =>
    presupuestos.filter(p =>
      p.cliente_email === cliente.email ||
      p.cliente_nombre?.toLowerCase() === cliente.nombre?.toLowerCase()
    );

  const filtered = clientes.filter(c => {
    const matchSearch = !search ||
      c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.telefono?.includes(search);
    const matchEtiqueta = !etiquetaFiltro || c.etiqueta === etiquetaFiltro;
    return matchSearch && matchEtiqueta;
  });

  const handleSave = (saved) => {
    setClientes(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    if (selectedCliente?.id === saved.id) setSelectedCliente(saved);
    setModal(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ede3d6] flex items-center justify-center">
        <div className="text-[#654935] font-semibold">Cargando clientes...</div>
      </div>
    );
  }

  const clientePresupuestos = selectedCliente ? presupuestosDeCliente(selectedCliente) : [];

  return (
    <div className="min-h-screen bg-[#ede3d6]">
      {modal && (
        <ClienteModal
          cliente={modal.cliente}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#d6c7b2] px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#654935]" />
            <h1 className="font-bold text-[#654935] text-lg">Gestión Comercial (CRM)</h1>
            <div className="flex bg-[#ede3d6] p-1 rounded-xl ml-4">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-[#654935] shadow-sm' : 'text-[#8c7a6b]'}`}
              >
                Lista
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-white text-[#654935] shadow-sm' : 'text-[#8c7a6b]'}`}
              >
                Pipeline (Kanban)
              </button>
            </div>
          </div>
          <button onClick={() => setModal({ cliente: null })}
            className="flex items-center gap-2 bg-[#654935] hover:bg-[#4a3627] text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors">
            <Plus className="w-4 h-4" /> Nuevo cliente
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-4" style={{ height: 'calc(100vh - 73px)' }}>

        {viewMode === 'kanban' ? (
          <div className="flex-1 bg-white/50 rounded-3xl border border-dashed border-[#d6c7b2] flex flex-col items-center justify-center text-[#8c7a6b] p-12 text-center">
            <LayoutDashboard className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="font-bold text-lg text-[#654935]">Pipeline de Ventas (Kanban)</h3>
            <p className="max-w-md mt-2">Visualiza tus leads por etapas: Nuevo, Contactado, Presupuesto, Negociación, Cerrado.</p>
            <button className="mt-6 bg-[#654935] text-white px-6 py-2 rounded-xl font-bold text-sm">Configurar Etapas</button>
          </div>
        ) : (
          <>
            {/* LEFT: list */}
            <div className="w-80 flex-shrink-0 flex flex-col gap-3">
              {/* Filters */}
              <div className="bg-white rounded-2xl border border-[#e8ddd0] p-3 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7a6b]" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar lead o cliente..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935]" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['', 'vip', 'recurrente', 'potencial', 'inactivo'].map(et => (
                    <button key={et} onClick={() => setEtiquetaFiltro(et)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                        etiquetaFiltro === et
                          ? 'bg-[#654935] text-white'
                          : 'bg-[#ede3d6] text-[#654935] hover:bg-[#d6c7b2]'
                      }`}>
                      {et ? ETIQUETA_LABELS[et] : 'Todos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client list */}
              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-[#8c7a6b] text-sm">
                    {clientes.length === 0 ? 'Aún no hay leads' : 'Sin resultados'}
                  </div>
                ) : filtered.map(c => {
                  const numPresupuestos = presupuestosDeCliente(c).length;
                  const isSelected = selectedCliente?.id === c.id;
                  return (
                    <button key={c.id} onClick={() => setSelectedCliente(c)}
                      className={`w-full text-left bg-white rounded-2xl border p-4 transition-all hover:shadow-md ${
                        isSelected ? 'border-[#654935] shadow-md' : 'border-[#e8ddd0]'
                      }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-[#3d2b1f] text-sm truncate">{c.nombre}</div>
                          {c.email && <div className="text-xs text-[#8c7a6b] truncate mt-0.5">{c.email}</div>}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] bg-[#faf7f4] border border-[#e8ddd0] px-1.5 py-0.5 rounded text-[#8c7a6b] font-bold uppercase tracking-tighter">Lead</span>
                            {numPresupuestos > 0 && (
                              <span className="text-[10px] text-[#654935] font-bold flex items-center gap-0.5">
                                <FileText className="w-2.5 h-2.5" />{numPresupuestos}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {c.etiqueta && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${ETIQUETA_COLORS[c.etiqueta]}`}>
                              {ETIQUETA_LABELS[c.etiqueta]}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: detail */}
            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
              {!selectedCliente ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#8c7a6b]">
                  <Target className="w-16 h-16 text-[#d6c7b2] mb-4" />
                  <p className="font-semibold text-lg text-[#654935]">Selecciona un Lead</p>
                  <p className="text-sm mt-1">Gestiona sus comunicaciones, tareas y documentos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Client card */}
                  <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#ede3d6] flex items-center justify-center text-[#654935] text-xl font-bold">
                          {selectedCliente.nombre[0].toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-[#654935]">{selectedCliente.nombre}</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[#8c7a6b] font-medium">{selectedCliente.empresa || 'Particular'}</span>
                            <span className="w-1 h-1 rounded-full bg-[#d6c7b2]" />
                            <span className="text-xs text-[#8c7a6b] font-medium">Desde {new Date(selectedCliente.createdAt || Date.now()).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => window.location.href = createPageUrl('NuevoPresupuesto')}
                          className="flex items-center gap-2 bg-[#654935] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-[#654935]/20 hover:scale-105 transition-all"
                        >
                          <Calendar className="w-4 h-4" /> Convertir en Evento
                        </button>
                        <button onClick={() => setModal({ cliente: selectedCliente })}
                          className="p-2 border border-[#d6c7b2] rounded-xl hover:bg-[#faf7f4] text-[#8c7a6b] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[#f0f0f0] mb-6">
                      {[
                        { id: 'details', label: 'Detalles', icon: UserIcon },
                        { id: 'comms', label: 'Comunicaciones', icon: MessageSquare },
                        { id: 'tasks', label: 'Tareas', icon: CheckSquare },
                        { id: 'docs', label: 'Documentos', icon: File },
                        { id: 'history', label: 'Historial', icon: History }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                            activeTab === tab.id 
                              ? 'border-[#654935] text-[#654935]' 
                              : 'border-transparent text-[#8c7a6b] hover:text-[#654935]'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {activeTab === 'details' && (
                        <motion.div 
                          key="details"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="grid grid-cols-2 gap-6"
                        >
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-widest block mb-1">Contacto</label>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-[#3d2b1f]">
                                  <Mail className="w-4 h-4 text-[#8c7a6b]" /> {selectedCliente.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[#3d2b1f]">
                                  <Phone className="w-4 h-4 text-[#8c7a6b]" /> {selectedCliente.telefono || 'Sin teléfono'}
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-widest block mb-1">Origen</label>
                              <span className="text-sm text-[#3d2b1f] bg-[#ede3d6] px-2 py-1 rounded-lg font-semibold">
                                {ORIGEN_LABELS[selectedCliente.origen] || 'Desconocido'}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-widest block mb-1">Notas Internas</label>
                              <div className="p-3 bg-[#faf7f4] rounded-xl text-sm text-[#3d2b1f] border border-[#e8ddd0] min-h-[80px]">
                                {selectedCliente.notas || 'Sin notas adicionales.'}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'comms' && (
                        <motion.div 
                          key="comms"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-[#654935]">Registro de Comunicaciones</h4>
                            <button className="text-xs bg-[#654935] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Registrar Mensaje
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div className="p-3 bg-[#faf7f4] rounded-xl border border-[#e8ddd0] flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <MessageCircle className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#3d2b1f]">WhatsApp enviado</p>
                                <p className="text-[10px] text-[#8c7a6b]">Hoy, 10:30 AM • Por Admin</p>
                                <p className="text-xs text-[#654935] mt-1">"Hola {selectedCliente.nombre}, te envío el presupuesto actualizado..."</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'tasks' && (
                        <motion.div 
                          key="tasks"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-[#654935]">Tareas Pendientes</h4>
                            <button className="text-xs bg-[#654935] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Nueva Tarea
                            </button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 bg-white border border-[#e8ddd0] rounded-xl">
                              <input type="checkbox" className="w-4 h-4 rounded border-[#d6c7b2] text-[#654935] focus:ring-[#654935]" />
                              <div className="flex-1">
                                <p className="text-xs font-bold text-[#3d2b1f]">Llamar para confirmar fecha</p>
                                <p className="text-[10px] text-red-500 font-bold">Vence mañana</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'docs' && (
                        <motion.div 
                          key="docs"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-[#654935]">Documentos del Lead</h4>
                            <button className="text-xs bg-[#654935] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Subir Archivo
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white border border-[#e8ddd0] rounded-xl flex items-center gap-3 hover:border-[#654935] cursor-pointer transition-all">
                              <FileText className="w-8 h-8 text-red-500" />
                              <div>
                                <p className="text-xs font-bold text-[#3d2b1f] truncate">Presupuesto_V1.pdf</p>
                                <p className="text-[10px] text-[#8c7a6b]">1.2 MB • PDF</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Presupuestos vinculados */}
                  <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-[#654935]">
                        Presupuestos vinculados
                        <span className="ml-2 text-xs bg-[#ede3d6] text-[#654935] px-2 py-0.5 rounded-full">{clientePresupuestos.length}</span>
                      </h3>
                    </div>

                    {clientePresupuestos.length === 0 ? (
                      <p className="text-sm text-[#8c7a6b] italic">Sin presupuestos asociados todavía.</p>
                    ) : (
                      <div className="space-y-2">
                        {clientePresupuestos.map(p => (
                          <a key={p.id} href={createPageUrl(`DetallePresupuesto?id=${p.id}`)}
                            className="flex items-center justify-between p-3 rounded-xl border border-[#e8ddd0] hover:border-[#654935] transition-colors group">
                            <div>
                              <div className="font-semibold text-sm text-[#3d2b1f] group-hover:text-[#654935] transition-colors">
                                {p.titulo || 'Presupuesto sin título'}
                              </div>
                              <div className="text-xs text-[#8c7a6b] mt-0.5 flex items-center gap-2">
                                {p.fecha_evento && <span>{new Date(p.fecha_evento).toLocaleDateString('es-ES')}</span>}
                                <span>{p.pax} pax</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {p.total && (
                                <span className="font-bold text-[#654935] text-sm">{Math.round(p.total)}€</span>
                              )}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                p.estado === 'aprobado' ? 'bg-green-100 text-green-700' :
                                p.estado === 'enviado' ? 'bg-blue-100 text-blue-700' :
                                p.estado === 'rechazado' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>{p.estado}</span>
                              <ChevronRight className="w-4 h-4 text-[#8c7a6b] group-hover:text-[#654935] transition-colors" />
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

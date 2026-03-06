import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Users, Mail, Phone, FileText, ChevronRight, Edit } from 'lucide-react';
import { createPageUrl } from '@/utils';
import ClienteModal, { ETIQUETA_LABELS, ETIQUETA_COLORS } from '../components/clientes/ClienteModal';

const ORIGEN_LABELS = { referido: 'Referido', instagram: 'Instagram', web: 'Web', llamada: 'Llamada', otro: 'Otro' };

export default function GestionClientes() {
  const [clientes, setClientes] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [etiquetaFiltro, setEtiquetaFiltro] = useState('');
  const [modal, setModal] = useState(null); // null | { cliente } | { cliente: null }
  const [selectedCliente, setSelectedCliente] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      if (me?.role !== 'admin') {
        window.location.href = createPageUrl('MisPresupuestos');
        return;
      }
      const [c, p] = await Promise.all([
        base44.entities.Cliente.list('-created_date'),
        base44.entities.Presupuesto.list('-created_date'),
      ]);
      setClientes(c);
      setPresupuestos(p);
      setLoading(false);
    };
    init();
  }, []);

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
            <h1 className="font-bold text-[#654935] text-lg">Gestión de Clientes</h1>
            <span className="text-xs bg-[#ede3d6] text-[#654935] px-2 py-0.5 rounded-full font-semibold">{clientes.length}</span>
          </div>
          <button onClick={() => setModal({ cliente: null })}
            className="flex items-center gap-2 bg-[#654935] hover:bg-[#4a3627] text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors">
            <Plus className="w-4 h-4" /> Nuevo cliente
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-4" style={{ height: 'calc(100vh - 73px)' }}>

        {/* LEFT: list */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-3">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-[#e8ddd0] p-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7a6b]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar cliente..."
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
          <div className="flex-1 overflow-y-auto space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-[#8c7a6b] text-sm">
                {clientes.length === 0 ? 'Aún no hay clientes' : 'Sin resultados'}
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
                      {c.telefono && <div className="text-xs text-[#8c7a6b] mt-0.5">{c.telefono}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {c.etiqueta && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ETIQUETA_COLORS[c.etiqueta]}`}>
                          {ETIQUETA_LABELS[c.etiqueta]}
                        </span>
                      )}
                      {numPresupuestos > 0 && (
                        <span className="text-xs text-[#8c7a6b] flex items-center gap-1">
                          <FileText className="w-3 h-3" />{numPresupuestos}
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
        <div className="flex-1 overflow-y-auto">
          {!selectedCliente ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#8c7a6b]">
              <Users className="w-16 h-16 text-[#d6c7b2] mb-4" />
              <p className="font-semibold text-lg text-[#654935]">Selecciona un cliente</p>
              <p className="text-sm mt-1">para ver sus detalles y presupuestos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Client card */}
              <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#654935]">{selectedCliente.nombre}</h2>
                    {selectedCliente.empresa && (
                      <p className="text-sm text-[#8c7a6b] mt-0.5">{selectedCliente.empresa}</p>
                    )}
                    {selectedCliente.etiqueta && (
                      <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-semibold ${ETIQUETA_COLORS[selectedCliente.etiqueta]}`}>
                        {ETIQUETA_LABELS[selectedCliente.etiqueta]}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setModal({ cliente: selectedCliente })}
                    className="flex items-center gap-1.5 text-sm border border-[#d6c7b2] px-3 py-1.5 rounded-xl hover:border-[#654935] text-[#654935] font-semibold transition-colors">
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedCliente.email && (
                    <div className="flex items-center gap-2 text-[#3d2b1f]">
                      <Mail className="w-4 h-4 text-[#8c7a6b] flex-shrink-0" />
                      <span className="truncate">{selectedCliente.email}</span>
                    </div>
                  )}
                  {selectedCliente.telefono && (
                    <div className="flex items-center gap-2 text-[#3d2b1f]">
                      <Phone className="w-4 h-4 text-[#8c7a6b] flex-shrink-0" />
                      <span>{selectedCliente.telefono}</span>
                    </div>
                  )}
                  {selectedCliente.origen && (
                    <div>
                      <span className="text-xs text-[#8c7a6b] font-bold uppercase">Origen: </span>
                      <span className="text-[#3d2b1f]">{ORIGEN_LABELS[selectedCliente.origen]}</span>
                    </div>
                  )}
                </div>

                {selectedCliente.notas && (
                  <div className="mt-4 p-3 bg-[#faf7f4] rounded-xl text-sm text-[#3d2b1f] border border-[#e8ddd0]">
                    <span className="font-bold text-[#8c7a6b] text-xs uppercase">Notas: </span>
                    {selectedCliente.notas}
                  </div>
                )}
              </div>

              {/* Presupuestos vinculados */}
              <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#654935]">
                    Presupuestos vinculados
                    <span className="ml-2 text-xs bg-[#ede3d6] text-[#654935] px-2 py-0.5 rounded-full">{clientePresupuestos.length}</span>
                  </h3>
                  <a href={createPageUrl('NuevoPresupuesto')}
                    className="text-xs text-[#654935] hover:underline font-semibold flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Nuevo presupuesto
                  </a>
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
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
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
      </div>
    </div>
  );
}

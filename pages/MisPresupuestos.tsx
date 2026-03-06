import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, FileText, Calendar, Users, ChevronRight, LogOut, Trash2 } from 'lucide-react';
import { createPageUrl, LOGO_URL } from '@/utils';
import EstadoBadge from '../components/presupuesto/EstadoBadge';

export default function MisPresupuestos() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      if (!me) {
        base44.auth.redirectToLogin();
        return;
      }
      setUser(me);
      // Admin ve todos, cliente solo los suyos
      const data = me?.role === 'admin'
        ? await base44.entities.Presupuesto.list('-created_date')
        : await base44.entities.Presupuesto.filter({ cliente_email: me.email }, '-created_date');
      setPresupuestos(data);
      setLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault(); // Prevent navigation
    if (window.confirm('¿Estás seguro de que quieres eliminar este presupuesto? Esta acción no se puede deshacer.')) {
      await base44.entities.Presupuesto.delete(id);
      setPresupuestos(presupuestos.filter(p => p.id !== id));
    }
  };

  const EVENT_ICONS = { boda: '💍', empresa: '🏢', cumple: '🎉', comunion: '✨', otro: '🎊' };

  return (
    <div className="min-h-screen bg-[#ede3d6]">
      {/* Header */}
      <div className="bg-white border-b border-[#d6c7b2] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Arenas Obrador" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
            <div>
              <div className="font-bold text-[#654935]">Arenas Obrador</div>
              <div className="text-xs text-[#8c7a6b]">Mis Presupuestos</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={createPageUrl('NuevoPresupuesto')}
              className="flex items-center gap-2 bg-[#654935] hover:bg-[#4a3627] text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors">
              <Plus className="w-4 h-4" /> Nuevo
            </a>
            <button onClick={() => base44.auth.logout()} 
              className="p-2 text-[#8c7a6b] hover:text-[#654935] hover:bg-[#f5f0eb] rounded-xl transition-colors"
              title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Bienvenida */}
        {user && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#654935]">Hola, {user.full_name} 👋</h1>
            <p className="text-[#8c7a6b] mt-1">Aquí tienes todos tus presupuestos guardados.</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : presupuestos.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-[#d6c7b2] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#654935] mb-2">Aún no tienes presupuestos</h3>
            <p className="text-[#8c7a6b] mb-6">Crea tu primer presupuesto para tu evento</p>
            <a href={createPageUrl('NuevoPresupuesto')}
              className="inline-flex items-center gap-2 bg-[#654935] hover:bg-[#4a3627] text-white px-6 py-3 rounded-2xl font-bold transition-colors">
              <Plus className="w-5 h-5" /> Crear presupuesto
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {presupuestos.map(p => (
              <a key={p.id} href={createPageUrl(`DetallePresupuesto?id=${p.id}`)}
                className="block bg-white rounded-2xl border border-[#e8ddd0] p-5 hover:shadow-md transition-all hover:border-[#654935] group relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{EVENT_ICONS[p.tipo_evento] || '📋'}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-[#3d2b1f] group-hover:text-[#654935] transition-colors">{p.titulo || 'Presupuesto sin título'}</div>
                        {p.codigo && <span className="text-xs font-mono bg-[#f5f5f0] text-[#654935] px-1.5 py-0.5 rounded border border-[#e8ddd0]">{p.codigo}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-[#8c7a6b]">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.pax} personas</span>
                        {p.fecha_evento && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.fecha_evento).toLocaleDateString('es-ES')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="font-bold text-[#654935] text-lg">{p.total ? p.total.toFixed(0) + '€' : '—'}</div>
                      <div className="text-xs text-[#8c7a6b]">{p.total_por_pax ? p.total_por_pax.toFixed(0) + '€/pax' : ''}</div>
                    </div>
                    <EstadoBadge estado={p.estado} />
                    <button 
                      onClick={(e) => handleDelete(e, p.id)}
                      className="p-2 text-[#8c7a6b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
                      title="Eliminar presupuesto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-[#8c7a6b] group-hover:text-[#654935] transition-colors" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

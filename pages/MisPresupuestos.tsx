import React, { useState, useEffect } from 'react';
import { auth, db, useAuth } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Plus, FileText, Calendar, Users, ChevronRight, LogOut, Trash2, Loader2, Layout } from 'lucide-react';
import { createPageUrl, LOGO_URL } from '@/utils';
import EstadoBadge from '../components/presupuesto/EstadoBadge';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function MisPresupuestos() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = createPageUrl('Login');
      return;
    }

    // Real-time listener
    const q = isAdmin 
      ? query(collection(db, 'solicitudes'), orderBy('created_date', 'desc'))
      : query(collection(db, 'solicitudes'), where('cliente_uid', '==', user.uid), orderBy('created_date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPresupuestos(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching presupuestos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, isAdmin]);

  const handleDeleteClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setBudgetToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!budgetToDelete) return;
    try {
      await deleteDoc(doc(db, 'solicitudes', budgetToDelete));
    } catch (error) {
      console.error("Error deleting presupuesto:", error);
      alert("No tienes permisos para eliminar este presupuesto.");
    } finally {
      setBudgetToDelete(null);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('mock_admin_session');
    localStorage.removeItem('is_anon_admin');
    await auth.signOut();
    window.location.href = createPageUrl('Home');
  };

  const EVENT_ICONS = { boda: '💍', empresa: '🏢', cumple: '🎉', comunion: '✨', otro: '🎊' };

  return (
    <div className="min-h-screen bg-[#ede3d6]">
      {user?.isMock && (
        <div className="bg-red-600 text-white px-4 py-3 sticky top-0 z-[60] shadow-lg">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                ⚠️
              </div>
              <div>
                <p className="font-bold text-sm uppercase tracking-tight">Modo de Emergencia Activo</p>
                <p className="text-[10px] opacity-90">No hay conexión real con la base de datos. Los registros reales no son visibles.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.location.href = createPageUrl('Login')}
                className="bg-white text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors shadow-sm"
              >
                REINTENTAR LOGIN REAL
              </button>
              <button 
                onClick={handleLogout}
                className="bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-800 transition-colors"
              >
                CERRAR SESIÓN
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-[#d6c7b2] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="CateringApp" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
            <div>
              <div className="font-bold text-[#654935]">CateringApp</div>
              <div className="text-xs text-[#8c7a6b]">{isAdmin ? 'Presupuestos Clientes' : 'Mis Presupuestos'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={createPageUrl('NuevoPresupuesto')}
              className="flex items-center gap-2 bg-[#654935] hover:bg-[#4a3627] text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors">
              <Plus className="w-4 h-4" /> Nuevo
            </a>
            <button onClick={handleLogout} 
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
            <h1 className="text-2xl font-bold text-[#654935]">Hola, {user.displayName || user.email} 👋</h1>
            <p className="text-[#8c7a6b] mt-1">
              {isAdmin ? 'Aquí tienes todos los presupuestos de los clientes.' : 'Aquí tienes todos tus presupuestos guardados.'}
            </p>
          </div>
        )}

        {loading || authLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : presupuestos.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-[#d6c7b2] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#654935] mb-2">Aún no tienes presupuestos</h3>
            <p className="text-[#8c7a6b] mb-6">Crea tu primer presupuesto para tu evento</p>
            {user?.isMock && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl max-w-sm mx-auto border border-red-100">
                <p className="text-red-700 text-xs leading-relaxed">
                  <strong>Nota:</strong> Estás en Modo de Emergencia. En este modo no se pueden cargar los datos reales de la base de datos por falta de conexión.
                </p>
              </div>
            )}
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
                    <a 
                      href={createPageUrl(`PlanificadorSala?presupuestoId=${p.id}`)}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-[#8c7a6b] hover:text-[#654935] hover:bg-[#f5f0eb] rounded-lg transition-colors z-10"
                      title="Planificador de Sala"
                    >
                      <Layout className="w-5 h-5" />
                    </a>
                    <button 
                      onClick={(e) => handleDeleteClick(e, p.id)}
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar presupuesto"
        message="¿Estás seguro de que quieres eliminar este presupuesto? Esta acción no se puede deshacer y se perderán todos los datos asociados."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

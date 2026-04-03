import React, { useState, useEffect } from 'react';
import { auth, db, useAuth } from '@/firebase';
import { collection, query, onSnapshot, orderBy, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { FileText, Users, TrendingUp, ChevronRight, Search, Filter, LogOut, Trash2, Eye, Calendar, X, Loader2, AlertTriangle, Send, Check, Ban, Download } from 'lucide-react';
import { createPageUrl, LOGO_URL, generateAppReport } from '@/utils';
import EstadoBadge from '../components/presupuesto/EstadoBadge';

export default function AdminPanel() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [presupuestos, setPresupuestos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingBloqueos, setLoadingBloqueos] = useState(true);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [activeTab, setActiveTab] = useState('presupuestos'); // 'presupuestos', 'usuarios', 'calendario'
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  
  // Calendario State
  const [nuevaFechaBloqueo, setNuevaFechaBloqueo] = useState('');
  const [motivoBloqueo, setMotivoBloqueo] = useState('');
  const [isAddingBloqueo, setIsAddingBloqueo] = useState(false);

  // Manual Event State
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: '',
    fecha: '',
    hora: '',
    cliente_nombre: '',
    cliente_email: '',
    tipo_evento: 'otro',
    notas: ''
  });
  const [isAddingEvento, setIsAddingEvento] = useState(false);
  const [showEventoForm, setShowEventoForm] = useState(false);
  
  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'solicitud' | 'usuario' | 'bloqueo', id: string }
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      window.location.href = createPageUrl('Home');
      return;
    }

    const q = query(collection(db, 'solicitudes'), orderBy('created_date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPresupuestos(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching presupuestos:", error);
      setLoading(false);
    });

    // Fetch Users
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(data);
      setLoadingUsers(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoadingUsers(false);
    });

    // Fetch Bloqueos
    const bloqueosQuery = query(collection(db, 'bloqueos'), orderBy('fecha', 'asc'));
    const unsubscribeBloqueos = onSnapshot(bloqueosQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBloqueos(data);
      setLoadingBloqueos(false);
    }, (error) => {
      console.error("Error fetching bloqueos:", error);
      setLoadingBloqueos(false);
    });

    // Fetch Eventos
    const eventosQuery = query(collection(db, 'eventos'), orderBy('fecha', 'asc'));
    const unsubscribeEventos = onSnapshot(eventosQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventos(data);
      setLoadingEventos(false);
    }, (error) => {
      console.error("Error fetching eventos:", error);
      setLoadingEventos(false);
    });

    // Safety timeout for loading
    const t = setTimeout(() => {
      setLoading(false);
      setLoadingUsers(false);
      setLoadingBloqueos(false);
      setLoadingEventos(false);
    }, 8000);

    return () => {
      clearTimeout(t);
      unsubscribe();
      unsubscribeUsers();
      unsubscribeBloqueos();
      unsubscribeEventos();
    };
  }, [user, authLoading, isAdmin]);

  const handleAddBloqueo = async (e) => {
    e.preventDefault();
    if (!nuevaFechaBloqueo) return;
    
    setIsAddingBloqueo(true);
    try {
      await addDoc(collection(db, 'bloqueos'), {
        fecha: nuevaFechaBloqueo,
        motivo: motivoBloqueo || 'Fecha completa',
        created_at: serverTimestamp()
      });
      setNuevaFechaBloqueo('');
      setMotivoBloqueo('');
    } catch (error) {
      console.error("Error adding bloqueo:", error);
      alert("Error al bloquear la fecha.");
    } finally {
      setIsAddingBloqueo(false);
    }
  };

  const handleAddEvento = async (e) => {
    e.preventDefault();
    if (!nuevoEvento.fecha || !nuevoEvento.titulo) return;
    
    setIsAddingEvento(true);
    try {
      await addDoc(collection(db, 'eventos'), {
        ...nuevoEvento,
        created_at: serverTimestamp()
      });
      setNuevoEvento({
        titulo: '',
        fecha: '',
        hora: '',
        cliente_nombre: '',
        cliente_email: '',
        tipo_evento: 'otro',
        notas: ''
      });
      setShowEventoForm(false);
    } catch (error) {
      console.error("Error adding evento:", error);
      alert("Error al añadir el evento.");
    } finally {
      setIsAddingEvento(false);
    }
  };

  const openDeleteModal = (e, type, id) => {
    e.preventDefault();
    e.stopPropagation();
    setItemToDelete({ type, id });
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      if (itemToDelete.type === 'presupuesto') {
        await deleteDoc(doc(db, 'solicitudes', itemToDelete.id));
      } else if (itemToDelete.type === 'usuario') {
        // Delete user profile
        await deleteDoc(doc(db, 'users', itemToDelete.id));
        
        // Optionally delete their presupuestos too
        const userPresupuestos = presupuestos.filter(p => p.cliente_uid === itemToDelete.id);
        for (const s of userPresupuestos) {
          await deleteDoc(doc(db, 'solicitudes', s.id));
        }
      } else if (itemToDelete.type === 'bloqueo') {
        await deleteDoc(doc(db, 'bloqueos', itemToDelete.id));
      } else if (itemToDelete.type === 'evento') {
        await deleteDoc(doc(db, 'eventos', itemToDelete.id));
      }
      closeDeleteModal();
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      alert(`Error al eliminar. Por favor, inténtalo de nuevo.`);
      setIsDeleting(false);
    }
  };

  const handleUpdateEstado = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'solicitudes', id), {
        estado: nuevoEstado,
        updated_at: serverTimestamp()
      });
      alert(`Presupuesto ${nuevoEstado === 'aprobado' ? 'aprobado' : 'rechazado'} correctamente.`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error al actualizar el estado.");
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('mock_admin_session');
    localStorage.removeItem('is_anon_admin');
    await auth.signOut();
    window.location.href = createPageUrl('Home');
  };

  const handleTestEmail = async () => {
    if (!user?.email) return;
    setSendingTest(true);
    try {
      await addDoc(collection(db, 'mail'), {
        to: user.email,
        message: {
          subject: '🧪 Prueba de Email - Eventing',
          text: 'Si recibes este correo, el sistema de notificaciones está funcionando correctamente.',
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e8ddd0; border-radius: 12px;">
              <h2 style="color: #654935;">¡Prueba Exitosa!</h2>
              <p>Este es un correo de prueba enviado desde el Panel de Administración.</p>
              <p><b>Usuario:</b> ${user.displayName || user.email}</p>
              <p><b>Fecha:</b> ${new Date().toLocaleString('es-ES')}</p>
              <hr style="border: none; border-top: 1px solid #e8ddd0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #8c7a6b;">Eventing - Sistema de Notificaciones</p>
            </div>
          `
        },
        createdAt: serverTimestamp()
      });
      alert(`Email de prueba enviado a ${user.email}. Por favor, revisa tu bandeja de entrada (y la carpeta de spam).`);
    } catch (err) {
      console.error("Error sending test email:", err);
      alert("Error al enviar el email de prueba. Revisa la consola para más detalles.");
    } finally {
      setSendingTest(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#654935]" />
      </div>
    );
  }

  const filtrados = presupuestos.filter(p => {
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    const matchBusqueda = !busqueda ||
      (p.cliente_nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.titulo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.cliente_email || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.codigo || '').toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });

  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusqueda = !busqueda ||
      (u.displayName || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(busqueda.toLowerCase());
    return matchBusqueda;
  });

  const stats = {
    total: presupuestos.length,
    aprobados: presupuestos.filter(p => p.estado === 'aprobado').length,
    pendientes: presupuestos.filter(p => p.estado === 'borrador' || p.estado === 'enviado').length,
    ingresos: presupuestos.filter(p => p.estado === 'aprobado').reduce((s, p) => s + (p.total || 0), 0)
  };

  const EVENT_ICONS = { boda: '💍', empresa: '🏢', cumple: '🎉', comunion: '✨', otro: '🎊' };

  return (
    <div className="min-h-screen bg-[#ede3d6]">
      {user?.isMock && (
        <div className="bg-red-600 text-white px-4 py-3 sticky top-0 z-[60] shadow-lg">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <div>
                <p className="font-bold text-sm">MODO DE EMERGENCIA ACTIVO</p>
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
      <div className="bg-[#654935] text-white px-4 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Eventing" className="w-10 h-10 object-contain bg-white/20 rounded-full p-1" referrerPolicy="no-referrer" />
              <div>
                <div className="font-bold text-lg">Panel de Chaima</div>
                <div className="text-xs text-white/70">Eventing - Gestión de presupuestos</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={generateAppReport}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-xs font-bold border border-white/20"
                title="Descargar informe de funcionalidades"
              >
                <Download className="w-3 h-3" />
                Informe App
              </button>
              <button
                onClick={handleTestEmail}
                disabled={sendingTest}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-xs font-bold border border-white/20 disabled:opacity-50"
                title="Enviar email de prueba a mi cuenta"
              >
                {sendingTest ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Probar Email
              </button>
              <button onClick={handleLogout} 
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Cerrar sesión">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total presupuestos', value: stats.total, icon: FileText, color: 'bg-blue-50 text-blue-700' },
            { label: 'Pendientes', value: stats.pendientes, icon: Users, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Aprobados', value: stats.aprobados, icon: TrendingUp, color: 'bg-green-50 text-green-700' },
            { label: 'Ingresos aprobados', value: `${stats.ingresos.toFixed(0)}€`, icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8ddd0] p-4">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-2 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-[#3d2b1f]">{s.value}</div>
              <div className="text-xs text-[#8c7a6b] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#e8ddd0]">
          <button 
            onClick={() => setActiveTab('presupuestos')}
            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'presupuestos' ? 'border-[#654935] text-[#654935]' : 'border-transparent text-[#8c7a6b] hover:text-[#654935]'}`}
          >
            Presupuestos
          </button>
          <button 
            onClick={() => setActiveTab('usuarios')}
            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'usuarios' ? 'border-[#654935] text-[#654935]' : 'border-transparent text-[#8c7a6b] hover:text-[#654935]'}`}
          >
            Usuarios
          </button>
          <button 
            onClick={() => setActiveTab('calendario')}
            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'calendario' ? 'border-[#654935] text-[#654935]' : 'border-transparent text-[#8c7a6b] hover:text-[#654935]'}`}
          >
            Calendario
          </button>
        </div>

        {/* Filtros */}
        {activeTab !== 'calendario' && (
          <div className="bg-white rounded-2xl border border-[#e8ddd0] p-4 mb-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8c7a6b]" />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder={activeTab === 'presupuestos' ? "Buscar por nombre, email..." : "Buscar usuario..."}
                className="w-full pl-9 pr-4 py-2 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] text-sm text-[#3d2b1f]" />
            </div>
            {activeTab === 'presupuestos' && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#8c7a6b]" />
                <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                  className="border border-[#d6c7b2] rounded-xl px-3 py-2 text-sm text-[#3d2b1f] focus:outline-none focus:border-[#654935]">
                  <option value="todos">Todos los estados</option>
                  <option value="borrador">Borrador</option>
                  <option value="enviado">Enviado</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Contenido Principal */}
        {activeTab === 'presupuestos' ? (
          <>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
              </div>
            ) : filtrados.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#e8ddd0]">
                <FileText className="w-12 h-12 text-[#d6c7b2] mx-auto mb-3" />
                <p className="text-[#8c7a6b] font-semibold">No hay presupuestos con estos filtros</p>
                {user?.isMock && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl max-w-sm mx-auto border border-red-100">
                    <p className="text-red-700 text-xs leading-relaxed">
                      <strong>Nota:</strong> Estás en Modo de Emergencia. En este modo no se pueden cargar los datos reales de la base de datos por falta de conexión.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#e8ddd0] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-[#f5f0eb]">
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0]">Tipo</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0]">Presupuesto / Ref</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0] hidden lg:table-cell">Cliente</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0] text-center">Pax</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0] text-right">Total</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0] text-center">Fecha</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0] text-center">Estado</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0] text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e8ddd0]">
                      {filtrados.map((p, idx) => (
                        <tr key={p.id} className="group hover:bg-[#654935]/5 transition-all duration-200 cursor-default">
                          <td className="px-6 py-5">
                            <div className="w-12 h-12 rounded-2xl bg-[#f5f0eb] flex items-center justify-center text-2xl shadow-sm border border-[#e8ddd0] group-hover:scale-110 transition-transform">
                              {EVENT_ICONS[p.tipo_evento] || '📋'}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#3d2b1f] group-hover:text-[#654935] transition-colors text-base">
                                {p.titulo || 'Sin título'}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-mono bg-[#f5f5f0] text-[#654935] px-2 py-0.5 rounded-md border border-[#e8ddd0] font-bold">
                                  #{p.codigo || p.id.substring(0, 8)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 hidden lg:table-cell">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-[#3d2b1f]">{p.cliente_nombre || '—'}</span>
                              <span className="text-xs text-[#8c7a6b] font-medium">{p.cliente_email || '—'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3d2b1f] bg-[#faf7f4] px-3 py-1 rounded-full border border-[#e8ddd0]">
                              <Users className="w-3.5 h-3.5 text-[#8c7a6b]" />
                              {p.pax || '—'}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className="font-bold text-[#654935] text-lg">
                              {p.total ? p.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) : '—'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-bold text-[#3d2b1f]">
                                {new Date(p.created_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                              </span>
                              <span className="text-[10px] text-[#8c7a6b] font-bold">
                                {new Date(p.created_date).getFullYear()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex justify-center">
                              <EstadoBadge estado={p.estado} />
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {p.estado === 'enviado' && (
                                <>
                                  <button 
                                    onClick={() => handleUpdateEstado(p.id, 'aprobado')}
                                    className="p-2.5 text-green-600 hover:text-white hover:bg-green-600 rounded-2xl transition-all shadow-sm hover:shadow-md"
                                    title="Aprobar presupuesto"
                                  >
                                    <Check className="w-5 h-5" />
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateEstado(p.id, 'rechazado')}
                                    className="p-2.5 text-red-600 hover:text-white hover:bg-red-600 rounded-2xl transition-all shadow-sm hover:shadow-md"
                                    title="Rechazar presupuesto"
                                  >
                                    <Ban className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                              <a 
                                href={createPageUrl(`DetallePresupuesto?id=${p.id}`)}
                                className="p-2.5 text-[#8c7a6b] hover:text-white hover:bg-[#654935] rounded-2xl transition-all shadow-sm hover:shadow-md"
                                title="Ver detalles"
                              >
                                <Eye className="w-5 h-5" />
                              </a>
                              <button 
                                onClick={(e) => openDeleteModal(e, 'presupuesto', p.id)}
                                className="p-2.5 text-[#8c7a6b] hover:text-white hover:bg-red-600 rounded-2xl transition-all shadow-sm hover:shadow-md"
                                title="Eliminar presupuesto"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'usuarios' ? (
          <>
            {loadingUsers ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#e8ddd0]">
                <Users className="w-12 h-12 text-[#d6c7b2] mx-auto mb-3" />
                <p className="text-[#8c7a6b] font-semibold">No hay usuarios registrados</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#e8ddd0] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-[#f5f0eb]">
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0]">Avatar</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0]">Nombre</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0]">Email</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0]">Rol</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0] text-center">Fecha Registro</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-[#654935] uppercase tracking-widest border-b border-[#e8ddd0] text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e8ddd0]">
                      {usuariosFiltrados.map((u, idx) => (
                        <tr key={u.id} className="group hover:bg-[#654935]/5 transition-all duration-200 cursor-default">
                          <td className="px-6 py-5">
                            <div className="w-12 h-12 rounded-full bg-[#654935] flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-110 transition-transform">
                              {u.displayName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-bold text-[#3d2b1f] text-base">{u.displayName || 'Sin nombre'}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm text-[#8c7a6b] font-medium">{u.email}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-sm font-bold text-[#8c7a6b]">
                              {u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : '—'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {u.email !== 'app@cateringapp.com' && u.email !== 'BrianOrtegaXIV@gmail.com' && (
                              <button 
                                onClick={(e) => openDeleteModal(e, 'usuario', u.id)}
                                className="p-2.5 text-[#8c7a6b] hover:text-white hover:bg-red-600 rounded-2xl transition-all shadow-sm hover:shadow-md"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {/* Cabecera Calendario */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[#3d2b1f] flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#654935]" /> Gestión del Calendario
              </h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setShowEventoForm(!showEventoForm)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#654935] text-white font-bold rounded-xl hover:bg-[#4a3627] transition-all text-sm flex items-center justify-center gap-2"
                >
                  {showEventoForm ? <X className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  {showEventoForm ? 'Cancelar' : 'Añadir Evento'}
                </button>
              </div>
            </div>

            {/* Formulario Evento Manual */}
            {showEventoForm && (
              <div className="bg-white rounded-3xl border border-[#e8ddd0] p-6 shadow-md animate-in slide-in-from-top duration-300">
                <h3 className="text-lg font-bold text-[#3d2b1f] mb-4">Añadir Evento Manual</h3>
                <form onSubmit={handleAddEvento} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1 ml-1">Título del Evento</label>
                    <input 
                      type="text" 
                      value={nuevoEvento.titulo} 
                      onChange={e => setNuevoEvento({...nuevoEvento, titulo: e.target.value})}
                      placeholder="Ej. Boda de Ana y Juan"
                      className="w-full px-4 py-2 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1 ml-1">Fecha</label>
                    <input 
                      type="date" 
                      value={nuevoEvento.fecha} 
                      onChange={e => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                      className="w-full px-4 py-2 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1 ml-1">Hora</label>
                    <input 
                      type="time" 
                      value={nuevoEvento.hora} 
                      onChange={e => setNuevoEvento({...nuevoEvento, hora: e.target.value})}
                      className="w-full px-4 py-2 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1 ml-1">Nombre Cliente</label>
                    <input 
                      type="text" 
                      value={nuevoEvento.cliente_nombre} 
                      onChange={e => setNuevoEvento({...nuevoEvento, cliente_nombre: e.target.value})}
                      className="w-full px-4 py-2 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1 ml-1">Email Cliente</label>
                    <input 
                      type="email" 
                      value={nuevoEvento.cliente_email} 
                      onChange={e => setNuevoEvento({...nuevoEvento, cliente_email: e.target.value})}
                      className="w-full px-4 py-2 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1 ml-1">Tipo de Evento</label>
                    <select 
                      value={nuevoEvento.tipo_evento} 
                      onChange={e => setNuevoEvento({...nuevoEvento, tipo_evento: e.target.value})}
                      className="w-full px-4 py-2 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] text-sm"
                    >
                      <option value="boda">Boda</option>
                      <option value="empresa">Empresa</option>
                      <option value="cumple">Cumpleaños</option>
                      <option value="comunion">Comunión</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1 ml-1">Notas Adicionales</label>
                    <textarea 
                      value={nuevoEvento.notas} 
                      onChange={e => setNuevoEvento({...nuevoEvento, notas: e.target.value})}
                      placeholder="Detalles adicionales del evento..."
                      rows={3}
                      className="w-full px-4 py-2 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] text-sm resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button 
                      type="submit"
                      disabled={isAddingEvento}
                      className="w-full py-3 bg-[#654935] text-white font-bold rounded-xl hover:bg-[#4a3627] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isAddingEvento ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                      Guardar Evento
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Izquierda: Bloqueos */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl border border-[#e8ddd0] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-[#3d2b1f] mb-4 flex items-center gap-2">
                    <X className="w-5 h-5 text-red-600" /> Bloquear Fecha
                  </h3>
                  <form onSubmit={handleAddBloqueo} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1 ml-1">Fecha</label>
                      <input 
                        type="date" 
                        value={nuevaFechaBloqueo} 
                        onChange={e => setNuevaFechaBloqueo(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1 ml-1">Motivo</label>
                      <input 
                        type="text" 
                        value={motivoBloqueo} 
                        onChange={e => setMotivoBloqueo(e.target.value)}
                        placeholder="Ej. Vacaciones"
                        className="w-full px-4 py-2 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] text-sm"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isAddingBloqueo || !nuevaFechaBloqueo}
                      className="w-full py-2 bg-[#f5f0eb] text-[#654935] font-bold rounded-xl hover:bg-[#e8ddd0] transition-all disabled:opacity-50 border border-[#d6c7b2] flex items-center justify-center gap-2"
                    >
                      {isAddingBloqueo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                      Bloquear
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-3xl border border-[#e8ddd0] overflow-hidden shadow-sm">
                  <div className="p-4 bg-[#f5f0eb] border-b border-[#e8ddd0]">
                    <h3 className="font-bold text-[#654935] text-xs uppercase tracking-wider">Fechas Bloqueadas</h3>
                  </div>
                  {loadingBloqueos ? (
                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#654935] mx-auto" /></div>
                  ) : bloqueos.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#8c7a6b]">No hay bloqueos</div>
                  ) : (
                    <div className="divide-y divide-[#e8ddd0] max-h-[400px] overflow-y-auto">
                      {bloqueos.map(b => (
                        <div key={b.id} className="p-3 flex items-center justify-between hover:bg-[#faf7f4]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#654935]/10 flex flex-col items-center justify-center text-[#654935] text-[10px]">
                              <span className="font-bold">{new Date(b.fecha).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}</span>
                              <span className="text-base font-bold leading-none">{new Date(b.fecha).getDate()}</span>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#3d2b1f]">{new Date(b.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                              <div className="text-[10px] text-[#8c7a6b] truncate max-w-[120px]">{b.motivo}</div>
                            </div>
                          </div>
                          <button onClick={(e) => openDeleteModal(e, 'bloqueo', b.id)} className="p-1.5 text-[#8c7a6b] hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Eventos */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl border border-[#e8ddd0] overflow-hidden shadow-sm h-full">
                  <div className="p-4 bg-[#f5f0eb] border-b border-[#e8ddd0] flex justify-between items-center">
                    <h3 className="font-bold text-[#654935] text-xs uppercase tracking-wider">Próximos Eventos Agendados</h3>
                    <span className="text-[10px] font-bold bg-[#654935] text-white px-2 py-0.5 rounded-full">{eventos.length}</span>
                  </div>
                  
                  {loadingEventos ? (
                    <div className="p-12 text-center"><Loader2 className="w-10 h-10 animate-spin text-[#654935] mx-auto" /></div>
                  ) : eventos.length === 0 ? (
                    <div className="p-20 text-center">
                      <Calendar className="w-16 h-16 text-[#d6c7b2] mx-auto mb-4 opacity-20" />
                      <p className="text-[#8c7a6b] font-medium">No hay eventos agendados</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e8ddd0]">
                      {eventos.map(ev => (
                        <div key={ev.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#faf7f4] transition-colors group">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#654935] flex flex-col items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                              <span className="text-[10px] font-bold uppercase opacity-80">{new Date(ev.fecha).toLocaleDateString('es-ES', { month: 'short' })}</span>
                              <span className="text-xl font-bold leading-none">{new Date(ev.fecha).getDate()}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">{EVENT_ICONS[ev.tipo_evento] || '📅'}</span>
                                <h4 className="font-bold text-[#3d2b1f] text-lg leading-tight">{ev.titulo}</h4>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8c7a6b] font-medium">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ev.cliente_nombre || 'Sin nombre'}</span>
                                {ev.hora && <span className="flex items-center gap-1">🕒 {ev.hora}</span>}
                                {ev.pax && <span className="flex items-center gap-1">👥 {ev.pax} pax</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 self-end sm:self-center">
                            {ev.presupuesto_id && (
                              <a 
                                href={createPageUrl(`DetallePresupuesto?id=${ev.presupuesto_id}`)}
                                className="p-2 text-[#654935] hover:bg-[#654935] hover:text-white rounded-xl border border-[#d6c7b2] transition-all"
                                title="Ver presupuesto"
                              >
                                <FileText className="w-5 h-5" />
                              </a>
                            )}
                            <button 
                              onClick={(e) => openDeleteModal(e, 'evento', ev.id)}
                              className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-xl border border-red-100 transition-all"
                              title="Eliminar evento"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-[#e8ddd0]">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-50 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#3d2b1f]">¿Eliminar {itemToDelete?.type === 'usuario' ? 'usuario' : itemToDelete?.type === 'bloqueo' ? 'bloqueo' : itemToDelete?.type === 'evento' ? 'evento' : 'presupuesto'}?</h3>
            </div>
            
            <p className="text-[#8c7a6b] mb-6">
              Esta acción eliminará permanentemente {itemToDelete?.type === 'usuario' ? 'el perfil del usuario y todos sus presupuestos asociados' : itemToDelete?.type === 'bloqueo' ? 'el bloqueo de esta fecha' : itemToDelete?.type === 'evento' ? 'el evento del calendario' : 'el presupuesto'} y no se podrá recuperar. ¿Estás seguro de que quieres continuar?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-[#654935] font-semibold hover:bg-[#f5f0eb] rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

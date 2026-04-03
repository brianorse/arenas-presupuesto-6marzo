import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Play, 
  Pause, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  Mail, 
  Bell, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Settings2,
  Sparkles,
  X
} from 'lucide-react';

const AUTOMATION_TEMPLATES = [
  {
    id: 't1',
    title: 'Recordatorio de Presupuesto',
    description: 'Envía un email automático 3 días después de crear un presupuesto si aún no ha sido aceptado.',
    icon: <Mail className="w-6 h-6" />,
    color: '#654935',
    category: 'Ventas',
    trigger: 'Presupuesto Creado',
    action: 'Enviar Email'
  },
  {
    id: 't2',
    title: 'Confirmación de Evento',
    description: 'Cuando un cliente acepta un presupuesto, notifica automáticamente al equipo de cocina.',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: '#10b981',
    category: 'Operaciones',
    trigger: 'Presupuesto Aceptado',
    action: 'Notificación Push'
  },
  {
    id: 't3',
    title: 'Encuesta Post-Evento',
    description: 'Envía una encuesta de satisfacción 24 horas después de la fecha del evento.',
    icon: <Sparkles className="w-6 h-6" />,
    color: '#8b5cf6',
    category: 'Fidelización',
    trigger: 'Evento Finalizado',
    action: 'Enviar Email'
  },
  {
    id: 't4',
    title: 'Alerta de Plano Modificado',
    description: 'Notifica al cliente cuando se realiza un cambio significativo en el plano de la sala.',
    icon: <FileText className="w-6 h-6" />,
    color: '#f59e0b',
    category: 'Planificación',
    trigger: 'Plano Actualizado',
    action: 'Notificación App'
  }
];

const MOCK_AUTOMATIONS = [
  {
    id: 'a1',
    name: 'Seguimiento de Presupuestos',
    status: 'active',
    lastRun: 'Hace 2 horas',
    runsCount: 124,
    trigger: 'Presupuesto Creado',
    action: 'Email de Seguimiento',
    category: 'Ventas'
  },
  {
    id: 'a2',
    name: 'Notificación Cocina',
    status: 'active',
    lastRun: 'Ayer',
    runsCount: 45,
    trigger: 'Presupuesto Aceptado',
    action: 'Notificar Equipo',
    category: 'Operaciones'
  },
  {
    id: 'a3',
    name: 'Limpieza de Borradores',
    status: 'paused',
    lastRun: 'Hace 1 semana',
    runsCount: 12,
    trigger: 'Presupuesto Expirado',
    action: 'Eliminar Borrador',
    category: 'Sistema'
  }
];

export default function Automatizaciones() {
  const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [view, setView] = useState<'list' | 'builder'>('list');
  const [editingAutomation, setEditingAutomation] = useState<any>(null);

  const categories = ['Todas', 'Ventas', 'Operaciones', 'Planificación', 'Fidelización', 'Sistema'];

  const handleCreateNew = () => {
    setEditingAutomation({
      name: 'Nueva Automatización',
      trigger: '',
      conditions: [],
      actions: []
    });
    setView('builder');
    setShowNewModal(false);
  };

  const handleUseTemplate = (template: any) => {
    setEditingAutomation({
      name: template.title,
      trigger: template.trigger,
      conditions: [],
      actions: [{ type: template.action, config: {} }]
    });
    setView('builder');
    setShowNewModal(false);
  };

  if (view === 'builder') {
    return (
      <div className="min-h-screen bg-[#ede3d6] pb-20">
        <div className="bg-white border-b border-[#d6c7b2] py-6 px-6 sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('list')}
                className="p-2 hover:bg-[#faf7f4] rounded-xl text-[#8c7a6b] transition-colors border border-[#d6c7b2]"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <input 
                  type="text" 
                  value={editingAutomation?.name}
                  onChange={(e) => setEditingAutomation({...editingAutomation, name: e.target.value})}
                  className="text-xl font-black text-[#654935] bg-transparent border-none outline-none focus:ring-0 p-0"
                />
                <p className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-widest">Configurando flujo automático</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('list')}
                className="px-6 py-3 text-sm font-bold text-[#8c7a6b] hover:text-[#654935] transition-colors"
              >
                Descartar
              </button>
              <button 
                onClick={() => {
                  setAutomations([...automations, { ...editingAutomation, id: Date.now().toString(), status: 'active', lastRun: 'Nunca', runsCount: 0, category: 'Personalizada', action: editingAutomation.actions[0]?.type || 'Sin acción' }]);
                  setView('list');
                }}
                className="bg-[#654935] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-[#654935]/20 hover:bg-[#4d3829] transition-all active:scale-95"
              >
                Guardar y Activar
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 mt-12">
          <div className="space-y-12 relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 border-l-2 border-dashed border-[#d6c7b2] -translate-x-1/2 -z-10" />

            <section className="relative">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-[#654935] text-white flex items-center justify-center shadow-xl mb-6 z-10">
                  <Zap className="w-8 h-8 fill-current" />
                </div>
                <div className="w-full bg-white rounded-[2.5rem] border border-[#d6c7b2] p-8 shadow-sm">
                  <h3 className="text-xs font-black text-[#8c7a6b] uppercase tracking-widest mb-4">1. ¿Cuándo debe ejecutarse? (Disparador)</h3>
                  <select 
                    value={editingAutomation?.trigger}
                    onChange={(e) => setEditingAutomation({...editingAutomation, trigger: e.target.value})}
                    className="w-full p-4 bg-[#faf7f4] border border-[#d6c7b2] rounded-2xl text-[#654935] font-bold outline-none focus:ring-2 focus:ring-[#654935]"
                  >
                    <option value="">Selecciona un evento...</option>
                    <option value="Presupuesto Creado">Al crear un presupuesto</option>
                    <option value="Presupuesto Aceptado">Al aceptar un presupuesto</option>
                    <option value="Presupuesto Rechazado">Al rechazar un presupuesto</option>
                    <option value="Plano Actualizado">Al modificar un plano</option>
                    <option value="X Días antes del Evento">Días antes de un evento</option>
                    <option value="Evento Finalizado">Al finalizar un evento</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#d6c7b2] text-[#8c7a6b] flex items-center justify-center shadow-md mb-6 z-10">
                  <Filter className="w-6 h-6" />
                </div>
                <div className="w-full bg-white rounded-[2.5rem] border border-[#d6c7b2] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-[#8c7a6b] uppercase tracking-widest">2. Filtros y Condiciones (Opcional)</h3>
                    <button className="text-[#654935] font-bold text-xs flex items-center gap-1 hover:underline">
                      <Plus className="w-3 h-3" /> Añadir Filtro
                    </button>
                  </div>
                  <div className="p-6 bg-[#faf7f4] border border-dashed border-[#d6c7b2] rounded-2xl text-center">
                    <p className="text-sm text-[#8c7a6b] font-medium italic">Ejecutar para todos los casos sin filtros adicionales.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-[#10b981] text-white flex items-center justify-center shadow-xl mb-6 z-10">
                  <Play className="w-8 h-8 fill-current" />
                </div>
                <div className="w-full bg-white rounded-[2.5rem] border border-[#d6c7b2] p-8 shadow-sm">
                  <h3 className="text-xs font-black text-[#8c7a6b] uppercase tracking-widest mb-4">3. ¿Qué acción debe realizar?</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'Email', icon: <Mail />, label: 'Enviar Email' },
                      { id: 'Notificación', icon: <Bell />, label: 'Notificación' },
                      { id: 'Tarea', icon: <CheckCircle2 />, label: 'Crear Tarea' },
                      { id: 'PDF', icon: <FileText />, label: 'Generar PDF' }
                    ].map(action => (
                      <button 
                        key={action.id}
                        onClick={() => setEditingAutomation({...editingAutomation, actions: [{ type: action.id, config: {} }]})}
                        className={`flex items-center gap-3 p-4 border rounded-2xl transition-all group ${
                          editingAutomation?.actions[0]?.type === action.id 
                            ? 'bg-[#654935] border-[#654935] text-white shadow-lg' 
                            : 'bg-[#faf7f4] border-[#d6c7b2] text-[#654935] hover:border-[#654935]'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                          editingAutomation?.actions[0]?.type === action.id 
                            ? 'bg-white/20 border-white/40 text-white' 
                            : 'bg-white border-[#d6c7b2] text-[#654935] group-hover:bg-[#654935] group-hover:text-white'
                        }`}>
                          {action.icon}
                        </div>
                        <span className="font-bold text-sm">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  const filteredAutomations = automations.filter(a => 
    (selectedCategory === 'Todas' || a.category === selectedCategory) &&
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#ede3d6] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#d6c7b2] pt-12 pb-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#654935] flex items-center justify-center text-white shadow-lg shadow-[#654935]/20">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <h1 className="text-3xl font-black text-[#654935] tracking-tight">Automatizaciones</h1>
              </div>
              <p className="text-[#8c7a6b] font-medium">Optimiza tu flujo de trabajo con procesos automáticos inteligentes.</p>
            </div>
            
            <button 
              onClick={() => setShowNewModal(true)}
              className="flex items-center justify-center gap-2 bg-[#654935] text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-[#654935]/20 hover:bg-[#4d3829] transition-all active:scale-95 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span>Nueva Automatización</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8">
        {/* Filtros y Búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7a6b]" />
            <input 
              type="text" 
              placeholder="Buscar automatizaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-[#d6c7b2] rounded-2xl text-[#654935] font-medium focus:ring-2 focus:ring-[#654935] outline-none shadow-sm"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-4 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-[#654935] text-white shadow-lg' 
                    : 'bg-white text-[#8c7a6b] border border-[#d6c7b2] hover:bg-[#faf7f4]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Automatizaciones */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAutomations.map((auto, index) => (
              <motion.div
                key={auto.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-[#d6c7b2] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      auto.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Zap className={`w-6 h-6 ${auto.status === 'active' ? 'fill-current' : ''}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#654935] truncate">{auto.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          auto.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {auto.status === 'active' ? 'Activa' : 'Pausada'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#8c7a6b]">
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" /> {auto.runsCount} ejecuciones
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {auto.lastRun}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-8 px-8 border-x border-[#f0f0f0]">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-[#8c7a6b] uppercase mb-1">Disparador</p>
                      <p className="text-sm font-bold text-[#654935]">{auto.trigger}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#d6c7b2]" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-[#8c7a6b] uppercase mb-1">Acción</p>
                      <p className="text-sm font-bold text-[#654935]">{auto.action}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-[#faf7f4] rounded-xl text-[#8c7a6b] transition-colors">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-xl text-red-400 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="w-px h-8 bg-[#f0f0f0] mx-1" />
                    <button className={`p-2 rounded-xl transition-all ${
                      auto.status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'
                    }`}>
                      {auto.status === 'active' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredAutomations.length === 0 && (
            <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-[#d6c7b2]">
              <Zap className="w-12 h-12 text-[#d6c7b2] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#654935]">No se encontraron automatizaciones</h3>
              <p className="text-[#8c7a6b]">Crea una nueva para empezar a optimizar tus procesos.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nueva Automatización */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#ede3d6] rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-white p-8 border-b border-[#d6c7b2] flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-[#654935] tracking-tight">Nueva Automatización</h2>
                  <p className="text-[#8c7a6b] text-sm font-medium">Elige una plantilla o empieza desde cero.</p>
                </div>
                <button 
                  onClick={() => setShowNewModal(false)}
                  className="p-3 hover:bg-[#faf7f4] rounded-2xl text-[#8c7a6b] transition-colors border border-[#d6c7b2]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                {/* Opción desde Cero */}
                <button 
                  onClick={handleCreateNew}
                  className="w-full flex items-center gap-6 p-8 bg-white border-2 border-dashed border-[#d6c7b2] rounded-[2rem] hover:border-[#654935] hover:bg-[#faf7f4] transition-all group mb-10"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#654935] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-black text-[#654935] mb-1">Empezar desde cero</h3>
                    <p className="text-[#8c7a6b] text-sm font-medium">Crea un flujo personalizado con disparadores y acciones a tu medida.</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-[#d6c7b2] ml-auto group-hover:translate-x-2 transition-transform" />
                </button>

                {/* Plantillas */}
                <h3 className="text-xs font-black text-[#8c7a6b] uppercase tracking-[0.2em] mb-6 px-2">Plantillas Recomendadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AUTOMATION_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleUseTemplate(t)}
                      className="flex flex-col p-6 bg-white border border-[#d6c7b2] rounded-[2rem] hover:shadow-xl hover:shadow-[#654935]/5 hover:-translate-y-1 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                          style={{ backgroundColor: t.color }}
                        >
                          {t.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#8c7a6b] bg-[#faf7f4] px-3 py-1 rounded-full border border-[#d6c7b2]">
                          {t.category}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-[#654935] mb-2 group-hover:text-[#4d3829]">{t.title}</h4>
                      <p className="text-sm text-[#8c7a6b] font-medium leading-relaxed mb-6 flex-1">{t.description}</p>
                      
                      <div className="pt-4 border-t border-[#f0f0f0] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-[#8c7a6b] uppercase">Listo para usar</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#654935] font-bold text-sm">
                          <span>Usar</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-white border-t border-[#d6c7b2] flex justify-end">
                <button 
                  onClick={() => setShowNewModal(false)}
                  className="px-8 py-4 text-sm font-bold text-[#8c7a6b] hover:text-[#654935] transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d6c7b2;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8c7a6b;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

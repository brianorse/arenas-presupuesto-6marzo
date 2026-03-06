import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Users, TrendingUp, ChevronRight, Search, Filter, LogOut, Trash2, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { createPageUrl, LOGO_URL } from '@/utils';
import EstadoBadge from '../components/presupuesto/EstadoBadge';
import { GoogleGenAI } from "@google/genai";

export default function AdminPanel() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  
  // Image Generator State
  const [prompt, setPrompt] = useState('Elegant catering setup, dark mood, cinematic lighting, high resolution, photorealistic, luxury food presentation');
  const [imageSize, setImageSize] = useState('1K');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [genError, setGenError] = useState(null);
  
  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      if (me?.role !== 'admin') return;
      const data = await base44.entities.Presupuesto.list('-created_date', 200);
      setPresupuestos(data);
      setLoading(false);
    };
    init();
  }, []);

  const openDeleteModal = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setBudgetToDelete(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setBudgetToDelete(null);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!budgetToDelete) return;
    
    setIsDeleting(true);
    try {
      await base44.entities.Presupuesto.delete(budgetToDelete);
      setPresupuestos(prev => prev.filter(p => p.id !== budgetToDelete));
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert("Error al eliminar el presupuesto. Por favor, inténtalo de nuevo.");
      setIsDeleting(false);
    }
  };

  const handleGenerateImage = async () => {
    setGenerating(true);
    setGenError(null);
    setGeneratedImage(null);

    try {
      // Ensure API Key is selected
      if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
        await window.aistudio.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            imageSize: imageSize,
            aspectRatio: "16:9"
          }
        }
      });

      let imageUrl = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        setGeneratedImage(imageUrl);
      } else {
        throw new Error('No image generated');
      }

    } catch (err) {
      console.error("Error generating image:", err);
      setGenError(err.message || "Error generando la imagen. Asegúrate de haber seleccionado una API Key válida.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveBackground = () => {
    if (generatedImage) {
      try {
        localStorage.setItem('custom_background', generatedImage);
        alert('¡Fondo actualizado! Ve a la página de inicio para verlo.');
      } catch (e) {
        alert('Error al guardar: La imagen es demasiado grande para el almacenamiento local. Intenta con 1K.');
      }
    }
  };

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#ede3d6] flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-10 shadow">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-[#654935]">Acceso restringido</h2>
          <p className="text-[#8c7a6b] mt-2">Solo Chaima puede acceder a este panel.</p>
          <a href={createPageUrl('MisPresupuestos')} className="mt-4 inline-block text-[#654935] hover:underline">← Volver a mis presupuestos</a>
        </div>
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

  const stats = {
    total: presupuestos.length,
    aprobados: presupuestos.filter(p => p.estado === 'aprobado').length,
    pendientes: presupuestos.filter(p => p.estado === 'borrador' || p.estado === 'enviado').length,
    ingresos: presupuestos.filter(p => p.estado === 'aprobado').reduce((s, p) => s + (p.total || 0), 0)
  };

  const EVENT_ICONS = { boda: '💍', empresa: '🏢', cumple: '🎉', comunion: '✨', otro: '🎊' };

  return (
    <div className="min-h-screen bg-[#ede3d6]">
      {/* Header */}
      <div className="bg-[#654935] text-white px-4 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Arenas Obrador" className="w-10 h-10 object-contain bg-white/20 rounded-full p-1" referrerPolicy="no-referrer" />
              <div>
                <div className="font-bold text-lg">Panel de Chaima</div>
                <div className="text-xs text-white/70">Arenas Obrador - Gestión de presupuestos</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href={createPageUrl('NuevoPresupuesto')} className="text-xs text-white/80 hover:text-white underline">
                Ver como cliente →
              </a>
              <button onClick={() => base44.auth.logout()} 
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

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-[#e8ddd0] p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8c7a6b]" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, email..."
              className="w-full pl-9 pr-4 py-2 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] text-sm text-[#3d2b1f]" />
          </div>
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
        </div>

        {/* Lista de presupuestos */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#e8ddd0]">
            <FileText className="w-12 h-12 text-[#d6c7b2] mx-auto mb-3" />
            <p className="text-[#8c7a6b] font-semibold">No hay presupuestos con estos filtros</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtrados.map(p => (
              <a key={p.id} href={createPageUrl(`DetallePresupuesto?id=${p.id}`)}
                className="flex items-center gap-4 bg-white rounded-2xl border border-[#e8ddd0] p-4 hover:shadow-md hover:border-[#654935] transition-all group">
                <div className="text-2xl">{EVENT_ICONS[p.tipo_evento] || '📋'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-[#3d2b1f] group-hover:text-[#654935] transition-colors truncate">{p.titulo || 'Sin título'}</div>
                    {p.codigo && <span className="text-xs font-mono bg-[#f5f5f0] text-[#654935] px-1.5 py-0.5 rounded border border-[#e8ddd0]">{p.codigo}</span>}
                  </div>
                  <div className="text-xs text-[#8c7a6b] mt-0.5 flex items-center gap-3">
                    <span>{p.cliente_nombre || 'Sin nombre'}</span>
                    <span>{p.cliente_email || ''}</span>
                    {p.pax && <span>· {p.pax} pax</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden md:block">
                    <div className="font-bold text-[#654935]">{p.total ? p.total.toFixed(0) + '€' : '—'}</div>
                    <div className="text-xs text-[#8c7a6b]">{new Date(p.created_date).toLocaleDateString('es-ES')}</div>
                  </div>
                  <EstadoBadge estado={p.estado} />
                  <button 
                    onClick={(e) => openDeleteModal(e, p.id)}
                    className="p-2 text-[#8c7a6b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
                    title="Eliminar presupuesto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-[#8c7a6b] group-hover:text-[#654935]" />
                </div>
              </a>
            ))}
          </div>
        )}
        {/* Herramientas de Diseño */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-bold text-[#654935] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Herramientas de Diseño (Nano Banana Pro)
          </h2>
          
          <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#654935] mb-1">Prompt de Imagen</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] min-h-[100px] text-sm"
                    placeholder="Describe la imagen que quieres generar..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#654935] mb-1">Tamaño</label>
                  <select 
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="w-full p-3 border border-[#d6c7b2] rounded-xl focus:outline-none focus:border-[#654935] text-sm"
                  >
                    <option value="1K">1K (Recomendado)</option>
                    <option value="2K">2K (Alta Calidad)</option>
                    <option value="4K">4K (Ultra HD)</option>
                  </select>
                  <p className="text-xs text-[#8c7a6b] mt-1">Nota: 2K y 4K pueden tardar más y ocupar más espacio.</p>
                </div>

                <button 
                  onClick={handleGenerateImage}
                  disabled={generating}
                  className="w-full py-3 bg-[#654935] text-white rounded-xl font-bold hover:bg-[#4a3627] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Generando...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" /> Generar Fondo
                    </>
                  )}
                </button>

                {genError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                    {genError}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center bg-[#f5f5f0] rounded-xl border border-[#e8ddd0] min-h-[300px] relative overflow-hidden">
                {generatedImage ? (
                  <>
                    <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                       <button 
                        onClick={handleSaveBackground}
                        className="px-4 py-2 bg-white/90 backdrop-blur text-[#654935] text-sm font-bold rounded-lg shadow-lg hover:bg-white transition-colors border border-[#d6c7b2]"
                      >
                        Establecer como Fondo
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-[#8c7a6b] p-8">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>La imagen generada aparecerá aquí</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-[#e8ddd0]">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-50 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#3d2b1f]">¿Eliminar presupuesto?</h3>
            </div>
            
            <p className="text-[#8c7a6b] mb-6">
              Esta acción eliminará permanentemente el presupuesto y no se podrá recuperar. ¿Estás seguro de que quieres continuar?
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

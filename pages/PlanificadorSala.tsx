import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Transformer, Ellipse } from 'react-konva';
import { db, useAuth } from '@/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, serverTimestamp, deleteDoc, getDoc } from 'firebase/firestore';
import { Plus, Trash2, Save, Move, MousePointer2, Users, Square, Circle as CircleIcon, Type, Loader2, ArrowLeft, Info, Copy, Grid3X3, Download, ZoomIn, ZoomOut, Maximize, Undo2, Redo2, AlignCenter, AlignVerticalJustifyCenter, Lock, Unlock, LayoutTemplate, Layout, X, Menu, Box, Trees, Sun, Waves, BoxSelect, View } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { ThreeDViewer } from '@/components/ThreeDViewer';
import ConfirmModal from '@/components/ui/ConfirmModal';

const GRID_SIZE = 20;

const TABLE_COLORS = {
  family: '#d6c7b2',
  friends: '#e8ddd0',
  corporate: '#654935',
  highTable: '#92A9BD',
  garden: '#6BCB77',
  water: '#4D96FF',
  other: '#faf7f4'
};

const INITIAL_ELEMENTS = [];

interface ElementoPlano {
  id: string;
  type: 'rect' | 'circle' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  rotation?: number;
  text?: string;
  category?: string;
  fontSize?: number;
  sillas?: number;
  invitados?: string;
  locked?: boolean;
}

interface PlanoData {
  id: string;
  nombre: string;
  cliente_uid: string;
  presupuestoId?: string;
  elementos: ElementoPlano[];
  tipo: 'interior' | 'exterior';
  created_at?: any;
  updated_at?: any;
}

const TEMPLATES = [
  {
    id: 'banquete',
    tipo: 'interior' as const,
    name: 'Banquete Real',
    description: 'Elegancia clásica para bodas y galas. 10 mesas redondas amplias.',
    icon: '🏰',
    color: '#FF6B6B',
    elements: Array.from({ length: 10 }).map((_, i) => ({
      id: `table-template-${i}-${Date.now()}`,
      type: 'circle' as const,
      x: 150 + (i % 5) * 200,
      y: 150 + Math.floor(i / 5) * 250,
      width: 120,
      height: 120,
      fill: '#FF6B6B',
      rotation: 0,
      text: `Mesa ${i + 1}`,
      category: 'family',
      sillas: 10,
      invitados: ''
    }))
  },
  {
    id: 'conferencia',
    tipo: 'interior' as const,
    name: 'Evento Corporativo',
    description: 'Disposición profesional en filas para presentaciones y conferencias.',
    icon: '💼',
    color: '#4D96FF',
    elements: Array.from({ length: 30 }).map((_, i) => ({
      id: `chair-template-${i}-${Date.now()}`,
      type: 'rect' as const,
      x: 100 + (i % 10) * 80,
      y: 150 + Math.floor(i / 10) * 100,
      width: 50,
      height: 50,
      fill: '#4D96FF',
      rotation: 0,
      text: `${i + 1}`,
      category: 'corporate',
      sillas: 0,
      invitados: ''
    }))
  },
  {
    id: 'boda-presidencial',
    tipo: 'interior' as const,
    name: 'Boda de Ensueño',
    description: 'Mesa presidencial destacada rodeada de mesas circulares para invitados.',
    icon: '✨',
    color: '#6BCB77',
    elements: [
      {
        id: `presidencial-${Date.now()}`,
        type: 'rect' as const,
        x: 400,
        y: 80,
        width: 300,
        height: 80,
        fill: '#6BCB77',
        rotation: 0,
        text: 'Mesa Presidencial',
        category: 'corporate',
        sillas: 12,
        invitados: ''
      },
      ...Array.from({ length: 8 }).map((_, i) => ({
        id: `table-boda-${i}-${Date.now()}`,
        type: 'circle' as const,
        x: 150 + (i % 4) * 250,
        y: 250 + Math.floor(i / 4) * 250,
        width: 110,
        height: 110,
        fill: '#FFD93D',
        rotation: 0,
        text: `Mesa ${i + 1}`,
        category: 'family',
        sillas: 8,
        invitados: ''
      }))
    ]
  },
  {
    id: 'cocktail',
    tipo: 'interior' as const,
    name: 'Cocktail & Lounge',
    description: 'Ambiente relajado con mesas altas y zonas de descanso.',
    icon: '🍸',
    color: '#92A9BD',
    elements: Array.from({ length: 12 }).map((_, i) => ({
      id: `cocktail-${i}-${Date.now()}`,
      type: 'circle' as const,
      x: 100 + (i % 4) * 200,
      y: 150 + Math.floor(i / 4) * 200,
      width: 60,
      height: 60,
      fill: '#92A9BD',
      rotation: 0,
      text: `Alta ${i + 1}`,
      category: 'other',
      sillas: 4,
      invitados: ''
    }))
  },
  {
    id: 'jardin',
    tipo: 'exterior' as const,
    name: 'Jardín & Exterior',
    description: 'Espacio al aire libre con zona de cocktail, piscina y áreas verdes.',
    icon: '🌳',
    color: '#6BCB77',
    elements: [
      {
        id: `piscina-${Date.now()}`,
        type: 'rect' as const,
        x: 100,
        y: 100,
        width: 400,
        height: 200,
        fill: '#4D96FF',
        rotation: 0,
        text: 'Piscina',
        category: 'water',
        sillas: 0,
        invitados: ''
      },
      ...Array.from({ length: 6 }).map((_, i) => ({
        id: `alta-jardin-${i}-${Date.now()}`,
        type: 'circle' as const,
        x: 550 + (i % 2) * 120,
        y: 100 + Math.floor(i / 2) * 150,
        width: 60,
        height: 60,
        fill: '#92A9BD',
        rotation: 0,
        text: `Alta ${i + 1}`,
        category: 'highTable',
        sillas: 4,
        invitados: ''
      })),
      {
        id: `cesped-${Date.now()}`,
        type: 'rect' as const,
        x: 100,
        y: 350,
        width: 600,
        height: 300,
        fill: '#6BCB77',
        rotation: 0,
        text: 'Zona de Césped',
        category: 'garden',
        sillas: 0,
        invitados: ''
      }
    ]
  }
];

export default function PlanificadorSala() {
  const { user, loading: authLoading } = useAuth();
  const [elements, setElements] = useState<ElementoPlano[]>(INITIAL_ELEMENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [planos, setPlanos] = useState<PlanoData[]>([]);
  const [currentPlanoId, setCurrentPlanoId] = useState<string | null>(null);
  const [isEditingNew, setIsEditingNew] = useState(false);
  const [planoNombre, setPlanoNombre] = useState('Mi Plano de Sala');
  const [planoTipo, setPlanoTipo] = useState<'interior' | 'exterior'>('interior');
  const [filterTipo, setFilterTipo] = useState<'interior' | 'exterior'>('interior');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [useGrid, setUseGrid] = useState(true);
  const [scale, setScale] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [history, setHistory] = useState<ElementoPlano[][]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [presupuestoId, setPresupuestoId] = useState<string | null>(null);
  const [targetPax, setTargetPax] = useState<number>(0);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isConfirmTemplateModalOpen, setIsConfirmTemplateModalOpen] = useState(false);
  const [isDeletePlanoModalOpen, setIsDeletePlanoModalOpen] = useState(false);
  const [planoToDelete, setPlanoToDelete] = useState<string | null>(null);
  const [templateToApply, setTemplateToApply] = useState<typeof TEMPLATES[0] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedId && trRef.current) {
      const node = stageRef.current.findOne('#' + selectedId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = createPageUrl('Login');
      return;
    }

    const q = query(collection(db, 'planos'), where('cliente_uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlanoData));
      setPlanos(docs);
      if (docs.length > 0 && !currentPlanoId) {
        // Load the first one by default if none selected
        const first = docs[0];
        setCurrentPlanoId(first.id);
        setPlanoNombre(first.nombre);
        setPlanoTipo(first.tipo || 'interior');
        const initialElements = first.elementos || [];
        setElements(initialElements);
        setHistory([initialElements]);
        setHistoryStep(0);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error cargando planos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pId = params.get('presupuestoId');
    if (pId) {
      setPresupuestoId(pId);
      const fetchBudget = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'solicitudes', pId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTargetPax(data.pax || 0);
          }
        } catch (error) {
          console.error("Error fetching budget for planner:", error);
        }
      };
      fetchBudget();
    }
  }, []);

  useEffect(() => {
    if (presupuestoId && planos.length > 0) {
      const linkedPlan = planos.find(p => p.presupuestoId === presupuestoId);
      if (linkedPlan && !currentPlanoId) {
        handleSelectPlano(linkedPlan);
      }
    }
  }, [presupuestoId, planos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteElement();
      } else if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleDuplicate();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (!selectedId) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const el = elements.find(item => item.id === selectedId);
        if (el) {
          const updates: any = {};
          if (e.key === 'ArrowUp') updates.y = el.y - step;
          if (e.key === 'ArrowDown') updates.y = el.y + step;
          if (e.key === 'ArrowLeft') updates.x = el.x - step;
          if (e.key === 'ArrowRight') updates.x = el.x + step;
          updateElement(selectedId, updates);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements]);

  const addElement = (type: 'rect' | 'circle' | 'text', category: string = 'family') => {
    const newElement: ElementoPlano = {
      id: `${type}-${Date.now()}`,
      type,
      x: 150,
      y: 150,
      width: type === 'rect' ? 120 : (category === 'highTable' ? 60 : 100),
      height: type === 'rect' ? 80 : (category === 'highTable' ? 60 : 100),
      fill: TABLE_COLORS[category] || '#d6c7b2',
      rotation: 0,
      text: type === 'text' ? 'Texto' : (category === 'highTable' ? 'Mesa Alta' : 'Mesa'),
      category,
      sillas: category === 'highTable' ? 4 : (type === 'text' ? 0 : 4),
      invitados: '',
      fontSize: type === 'text' ? 18 : undefined
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedId(newElement.id);
  };

  const saveToHistory = (newElements: ElementoPlano[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    // Limit history to 50 steps
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep <= 0) return;
    const prevStep = historyStep - 1;
    setHistoryStep(prevStep);
    setElements(history[prevStep]);
    setSelectedId(null);
  };

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return;
    const nextStep = historyStep + 1;
    setHistoryStep(nextStep);
    setElements(history[nextStep]);
    setSelectedId(null);
  };

  const handleDuplicate = () => {
    if (!selectedId) return;
    const original = elements.find(el => el.id === selectedId);
    if (!original) return;

    const newElement: ElementoPlano = {
      ...original,
      id: `${original.type}-${Date.now()}`,
      x: original.x + 20,
      y: original.y + 20,
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedId(newElement.id);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const data: any = {
        nombre: planoNombre,
        cliente_uid: user.uid,
        elementos: elements,
        tipo: planoTipo,
        updated_at: serverTimestamp()
      };

      if (presupuestoId) {
        data.presupuestoId = presupuestoId;
      }

      if (currentPlanoId) {
        await updateDoc(doc(db, 'planos', currentPlanoId), data);
      } else {
        const docRef = await addDoc(collection(db, 'planos'), {
          ...data,
          created_at: serverTimestamp()
        });
        setCurrentPlanoId(docRef.id);
        setIsEditingNew(false);
      }
      alert('Plano guardado correctamente');
    } catch (error) {
      console.error("Error saving plano:", error);
      alert('Error al guardar el plano');
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    if (elements.length > 0) {
      setTemplateToApply(template);
      setIsConfirmTemplateModalOpen(true);
      return;
    }
    confirmApplyTemplate(template);
  };

  const confirmApplyTemplate = (template: typeof TEMPLATES[0]) => {
    // Deep copy elements to avoid reference issues
    const newElements = JSON.parse(JSON.stringify(template.elements)).map(el => ({
      ...el,
      id: `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedId(null);
  };

  const handleExportImage = () => {
    if (!stageRef.current) return;
    
    // Deselect before export
    setSelectedId(null);
    
    // Small timeout to ensure transformer is gone
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${planoNombre}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 50);
  };

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 2));
  };

  const handleResetZoom = () => setScale(1);

  const handleAlignCenter = (axis: 'h' | 'v') => {
    if (!selectedId || !selectedElement) return;
    
    const stageWidth = stageSize.width;
    const stageHeight = stageSize.height;
    
    const updates: any = {};
    if (axis === 'h') {
      updates.x = (stageWidth / 2) - ((selectedElement.width || 0) / 2);
    } else {
      updates.y = (stageHeight / 2) - ((selectedElement.height || 0) / 2);
    }
    
    updateElement(selectedId, updates);
  };

  const handleDeleteElement = () => {
    if (selectedId) {
      const newElements = elements.filter(el => el.id !== selectedId);
      setElements(newElements);
      saveToHistory(newElements);
      setSelectedId(null);
    }
  };

  const handleNewPlano = () => {
    setShowTemplateModal(true);
  };

  const startNewPlano = (template?: typeof TEMPLATES[0]) => {
    setCurrentPlanoId(null);
    setIsEditingNew(true);
    setPlanoNombre('Nuevo Plano');
    setPlanoTipo(template?.tipo || 'interior');
    if (template) {
      const newElements = JSON.parse(JSON.stringify(template.elements)).map(el => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
      setElements(newElements);
      setHistory([newElements]);
    } else {
      setElements([]);
      setHistory([[]]);
    }
    setHistoryStep(0);
    setSelectedId(null);
    setShowTemplateModal(false);
  };

  const handleSelectPlano = (plano: PlanoData) => {
    setCurrentPlanoId(plano.id);
    setIsEditingNew(false);
    setPlanoNombre(plano.nombre);
    setPlanoTipo(plano.tipo || 'interior');
    setFilterTipo(plano.tipo || 'interior');
    const initialElements = plano.elementos || [];
    setElements(initialElements);
    setHistory([initialElements]);
    setHistoryStep(0);
    setSelectedId(null);
  };

  const handleDeletePlanoClick = (id: string) => {
    setPlanoToDelete(id);
    setIsDeletePlanoModalOpen(true);
  };

  const confirmDeletePlano = async () => {
    if (!planoToDelete) return;
    try {
      await deleteDoc(doc(db, 'planos', planoToDelete));
      if (currentPlanoId === planoToDelete) {
        setCurrentPlanoId(null);
        setIsEditingNew(false);
        handleNewPlano();
      }
    } catch (error) {
      console.error("Error deleting plano:", error);
    } finally {
      setPlanoToDelete(null);
    }
  };

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const updateElement = (id, newAttrs, isFinal = true) => {
    let finalAttrs = { ...newAttrs };
    
    // Apply grid snapping if enabled
    if (useGrid) {
      if (finalAttrs.x !== undefined) finalAttrs.x = Math.round(finalAttrs.x / GRID_SIZE) * GRID_SIZE;
      if (finalAttrs.y !== undefined) finalAttrs.y = Math.round(finalAttrs.y / GRID_SIZE) * GRID_SIZE;
      if (finalAttrs.width !== undefined) finalAttrs.width = Math.round(finalAttrs.width / GRID_SIZE) * GRID_SIZE;
      if (finalAttrs.height !== undefined) finalAttrs.height = Math.round(finalAttrs.height / GRID_SIZE) * GRID_SIZE;
    }

    const newElements = elements.map(el => el.id === id ? { ...el, ...finalAttrs } : el);
    setElements(newElements);
    if (isFinal) {
      saveToHistory(newElements);
    }
  };

  const totalChairs = elements.reduce((acc, el) => acc + (el.sillas || 0), 0);
  const totalGuests = elements.reduce((acc, el) => {
    const guests = (el.invitados || '').split('\n').filter(g => g.trim() !== '').length;
    return acc + guests;
  }, 0);

  const selectedElement = elements.find(el => el.id === selectedId);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#ede3d6] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#654935]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ede3d6] flex flex-col">
      {/* Toolbar Superior */}
      <div className="bg-white border-b border-[#d6c7b2] px-4 py-3 flex flex-wrap items-center justify-between sticky top-0 z-30 gap-y-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-[#ede3d6] rounded-xl transition-colors text-[#654935] lg:hidden"
          >
            <Layout className="w-5 h-5" />
          </button>
          <a href={createPageUrl('MisPresupuestos')} className="p-2 hover:bg-[#ede3d6] rounded-xl transition-colors text-[#654935]">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div className="flex flex-col">
            <input 
              type="text" 
              value={planoNombre} 
              onChange={e => setPlanoNombre(e.target.value)}
              className="font-bold text-[#654935] bg-transparent border-none focus:ring-0 p-0 text-base sm:text-lg w-32 sm:w-48"
            />
            <div className="text-[10px] text-[#8c7a6b] uppercase font-bold tracking-widest">Planificador</div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <div className="flex items-center bg-[#faf7f4] rounded-xl border border-[#d6c7b2] p-0.5 sm:p-1">
            <button 
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className="p-1 sm:p-1.5 hover:bg-[#ede3d6] rounded-lg text-[#654935] transition-colors disabled:opacity-30"
              title="Deshacer"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              className="p-1 sm:p-1.5 hover:bg-[#ede3d6] rounded-lg text-[#654935] transition-colors disabled:opacity-30"
              title="Rehacer"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-[#faf7f4] rounded-xl border border-[#d6c7b2] p-0.5 sm:p-1">
            <button 
              onClick={() => handleZoom(-0.1)}
              className="p-1 sm:p-1.5 hover:bg-[#ede3d6] rounded-lg text-[#654935] transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-bold text-[#8c7a6b] px-1 sm:px-2 min-w-[35px] sm:min-w-[45px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={() => handleZoom(0.1)}
              className="p-1 sm:p-1.5 hover:bg-[#ede3d6] rounded-lg text-[#654935] transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => setUseGrid(!useGrid)}
            className={`p-1.5 sm:p-2 rounded-xl transition-colors ${useGrid ? 'bg-[#654935] text-white' : 'bg-white text-[#654935] border border-[#d6c7b2]'}`}
          >
            <Grid3X3 className="w-4 h-4 sm:w-5" />
          </button>

          <button 
            onClick={handleExportImage}
            className="p-1.5 sm:p-2 bg-white text-[#654935] border border-[#d6c7b2] rounded-xl hover:bg-[#faf7f4] transition-colors hidden sm:block"
          >
            <Download className="w-4 h-4 sm:w-5" />
          </button>

          <button 
            onClick={() => setShow3D(true)}
            className="flex items-center gap-2 bg-[#6BCB77] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#5ab866] transition-all shadow-md active:scale-95"
          >
            <View className="w-4 h-4" />
            <span>Vista 3D</span>
          </button>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 sm:gap-2 bg-[#654935] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#4a3627] transition-all shadow-md disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden xs:inline">Guardar</span>
          </button>

          <button 
            onClick={handleNewPlano}
            className="flex items-center gap-2 px-4 py-2 bg-[#654935] text-white rounded-xl hover:bg-[#4d3829] transition-all shadow-md hover:shadow-lg active:scale-95 font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Plano</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Vista 3D */}
        {show3D && (
          <ThreeDViewer 
            elements={elements} 
            tipo={planoTipo}
            onClose={() => setShow3D(false)} 
          />
        )}

        {/* Pantalla de Bienvenida / Sin Plano Seleccionado */}
        {!currentPlanoId && !isEditingNew && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#ede3d6]/80 backdrop-blur-sm p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl text-center border border-[#d6c7b2] animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="w-24 h-24 bg-[#faf7f4] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#ede3d6]">
                <LayoutTemplate className="w-12 h-12 text-[#654935]" />
              </div>
              <h2 className="text-3xl font-bold text-[#654935] mb-4">¡Bienvenido al Planificador!</h2>
              <p className="text-[#8c7a6b] mb-8 leading-relaxed">
                Comienza a diseñar tu sala creando un nuevo plano desde cero o utilizando una de nuestras plantillas profesionales.
              </p>
              <button
                onClick={handleNewPlano}
                className="w-full py-4 bg-[#654935] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#654935]/20 hover:bg-[#4d3829] hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Plus className="w-6 h-6" />
                Añadir Planificador
              </button>
              
              {planos.length > 0 && (
                <div className="mt-8 pt-8 border-t border-[#f0f0f0]">
                  <p className="text-xs font-bold text-[#8c7a6b] uppercase tracking-widest mb-4">O selecciona uno existente</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {planos.slice(0, 3).map(p => (
                      <button 
                        key={p.id}
                        onClick={() => handleSelectPlano(p)}
                        className="px-4 py-2 bg-[#faf7f4] text-[#654935] rounded-lg text-sm font-medium border border-[#d6c7b2] hover:bg-[#ede3d6] transition-colors"
                      >
                        {p.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Sidebar Izquierdo - Herramientas */}
        <div className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#d6c7b2] flex flex-col transition-transform duration-300 transform
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isSidebarOpen ? 'shadow-2xl lg:shadow-none' : ''}
        `}>
          <div className="flex items-center justify-between p-4 border-b border-[#f0f0f0] lg:hidden">
            <span className="font-bold text-[#654935]">Herramientas</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-[#8c7a6b]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            <button 
              onClick={handleNewPlano}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#654935] text-white rounded-2xl font-bold text-sm shadow-md hover:bg-[#4d3829] transition-all active:scale-95 mb-4"
            >
              <Plus className="w-5 h-5" />
              Nuevo Plano
            </button>

            {/* Configuración del Plano */}
            <section className="bg-[#faf7f4] p-4 rounded-2xl border border-[#e8ddd0]">
              <h3 className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-wider mb-3">Configuración del Plano</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[#8c7a6b] uppercase block mb-1">Nombre</label>
                  <input 
                    type="text" 
                    value={planoNombre} 
                    onChange={e => setPlanoNombre(e.target.value)}
                    className="w-full text-sm p-2 border border-[#d6c7b2] rounded-lg focus:ring-1 focus:ring-[#654935] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8c7a6b] uppercase block mb-1">Tipo de Espacio</label>
                  <div className="flex bg-white p-1 rounded-xl border border-[#d6c7b2]">
                    <button 
                      onClick={() => setPlanoTipo('interior')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all ${planoTipo === 'interior' ? 'bg-[#654935] text-white shadow-md' : 'text-[#8c7a6b] hover:bg-[#faf7f4]'}`}
                    >
                      <Layout className="w-3.5 h-3.5" />
                      Interior
                    </button>
                    <button 
                      onClick={() => setPlanoTipo('exterior')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all ${planoTipo === 'exterior' ? 'bg-[#6BCB77] text-white shadow-md' : 'text-[#8c7a6b] hover:bg-[#faf7f4]'}`}
                    >
                      <Trees className="w-3.5 h-3.5" />
                      Exterior
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Resumen de Capacidad */}
            <section className="bg-[#654935] text-white p-4 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-80">Capacidad y Ocupación</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs opacity-80">Invitados</span>
                  <span className="text-lg font-bold">{totalGuests} <span className="text-[10px] opacity-60 font-normal">/ {targetPax || '—'}</span></span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${totalGuests > targetPax && targetPax > 0 ? 'bg-red-400' : 'bg-emerald-400'}`}
                    style={{ width: `${targetPax > 0 ? Math.min(100, (totalGuests / targetPax) * 100) : 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] opacity-80">
                  <span>Sillas totales: {totalChairs}</span>
                  {targetPax > 0 && (
                    <span>{totalGuests >= targetPax ? 'Completado' : `Faltan ${targetPax - totalGuests}`}</span>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-wider mb-3">Plantillas Rápidas</h3>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <button 
                  onClick={() => startNewPlano(TEMPLATES.find(t => t.id === 'jardin'))}
                  className="flex flex-col items-center justify-center gap-2 p-3 border border-[#6BCB77] bg-[#6BCB77]10 rounded-2xl hover:bg-[#6BCB77]20 transition-all group"
                  style={{ backgroundColor: '#6BCB7715', borderColor: '#6BCB77' }}
                >
                  <div className="w-8 h-8 rounded-xl bg-[#6BCB77] flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">🌳</div>
                  <span className="text-[10px] font-bold text-[#6BCB77] uppercase">Jardín</span>
                </button>
                <button 
                  onClick={() => setShowTemplateModal(true)}
                  className="flex flex-col items-center justify-center gap-2 p-3 border border-[#d6c7b2] rounded-2xl hover:border-[#654935] hover:bg-[#faf7f4] transition-all group"
                >
                  <Layout className="w-6 h-6 text-[#8c7a6b] group-hover:text-[#654935]" />
                  <span className="text-[10px] font-bold text-[#8c7a6b] uppercase">Ver Todas</span>
                </button>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-wider mb-3">Añadir Elementos</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => addElement('rect')}
                  className="flex flex-col items-center justify-center gap-2 p-3 border border-[#e8ddd0] rounded-2xl hover:border-[#654935] hover:bg-[#faf7f4] transition-all group"
                >
                  <Square className="w-6 h-6 text-[#8c7a6b] group-hover:text-[#654935]" />
                  <span className="text-[10px] font-bold text-[#8c7a6b] uppercase">Mesa Rect.</span>
                </button>
                <button 
                  onClick={() => addElement('circle')}
                  className="flex flex-col items-center justify-center gap-2 p-3 border border-[#e8ddd0] rounded-2xl hover:border-[#654935] hover:bg-[#faf7f4] transition-all group"
                >
                  <CircleIcon className="w-6 h-6 text-[#8c7a6b] group-hover:text-[#654935]" />
                  <span className="text-[10px] font-bold text-[#8c7a6b] uppercase">Mesa Red.</span>
                </button>
                <button 
                  onClick={() => addElement('circle', 'highTable')}
                  className="flex flex-col items-center justify-center gap-2 p-3 border border-[#e8ddd0] rounded-2xl hover:border-[#654935] hover:bg-[#faf7f4] transition-all group"
                >
                  <div className="w-6 h-6 rounded-full border-2 border-[#8c7a6b] flex items-center justify-center group-hover:border-[#654935]">
                    <div className="w-2 h-2 rounded-full bg-[#8c7a6b] group-hover:bg-[#654935]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#8c7a6b] uppercase">Mesa Alta</span>
                </button>
                <button 
                  onClick={() => addElement('text')}
                  className="flex flex-col items-center justify-center gap-2 p-3 border border-[#e8ddd0] rounded-2xl hover:border-[#654935] hover:bg-[#faf7f4] transition-all group"
                >
                  <Type className="w-6 h-6 text-[#8c7a6b] group-hover:text-[#654935]" />
                  <span className="text-[10px] font-bold text-[#8c7a6b] uppercase">Texto</span>
                </button>
              </div>
            </section>

            {selectedElement && (
              <section className="animate-in fade-in slide-in-from-left-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-wider">Propiedades</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleAlignCenter('h')} 
                      className="text-[#654935] hover:bg-[#ede3d6] p-1.5 rounded-lg transition-colors"
                      title="Centrar Horizontalmente"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleAlignCenter('v')} 
                      className="text-[#654935] hover:bg-[#ede3d6] p-1.5 rounded-lg transition-colors"
                      title="Centrar Verticalmente"
                    >
                      <AlignVerticalJustifyCenter className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => updateElement(selectedId, { locked: !selectedElement.locked })} 
                      className={`p-1.5 rounded-lg transition-colors ${selectedElement.locked ? 'text-red-500 bg-red-50' : 'text-[#654935] hover:bg-[#ede3d6]'}`}
                      title={selectedElement.locked ? "Desbloquear" : "Bloquear"}
                    >
                      {selectedElement.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={handleDuplicate} 
                      className="text-[#654935] hover:bg-[#ede3d6] p-1.5 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleDeleteElement} 
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4 bg-[#faf7f4] p-4 rounded-2xl border border-[#e8ddd0]">
                  {selectedElement.type !== 'text' && (
                    <>
                      <div>
                        <label className="text-[10px] font-bold text-[#8c7a6b] uppercase block mb-1">Nombre Mesa</label>
                        <input 
                          type="text" 
                          value={selectedElement.text} 
                          onChange={e => updateElement(selectedId, { text: e.target.value })}
                          className="w-full text-sm p-2 border border-[#d6c7b2] rounded-lg focus:ring-1 focus:ring-[#654935] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#8c7a6b] uppercase block mb-1">Nº de Sillas</label>
                        <input 
                          type="number" 
                          min="0"
                          max="20"
                          value={selectedElement.sillas || 0} 
                          onChange={e => updateElement(selectedId, { sillas: parseInt(e.target.value) || 0 })}
                          className="w-full text-sm p-2 border border-[#d6c7b2] rounded-lg focus:ring-1 focus:ring-[#654935] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#8c7a6b] uppercase block mb-1">Invitados por Silla</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {Array.from({ length: selectedElement.sillas || 0 }).map((_, i) => {
                            const invitadosArray = (selectedElement.invitados || '').split('\n');
                            return (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#8c7a6b] w-4">{i + 1}</span>
                                <input 
                                  type="text" 
                                  value={invitadosArray[i] || ''} 
                                  onChange={e => {
                                    const newArray = [...invitadosArray];
                                    // Ensure array is long enough
                                    while (newArray.length < (selectedElement.sillas || 0)) {
                                      newArray.push('');
                                    }
                                    newArray[i] = e.target.value;
                                    updateElement(selectedId, { invitados: newArray.join('\n') });
                                  }}
                                  placeholder={`Invitado ${i + 1}`}
                                  className="flex-1 text-xs p-1.5 border border-[#d6c7b2] rounded-lg focus:ring-1 focus:ring-[#654935] outline-none"
                                />
                              </div>
                            );
                          })}
                          {(selectedElement.sillas || 0) === 0 && (
                            <p className="text-[10px] text-[#8c7a6b] italic">Añade sillas para asignar invitados</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#8c7a6b] uppercase block mb-1">Categoría</label>
                        <div className="grid grid-cols-2 gap-1">
                          {Object.entries(TABLE_COLORS).map(([cat, color]) => (
                            <button 
                              key={cat}
                              onClick={() => updateElement(selectedId, { category: cat, fill: color })}
                              className={`h-8 rounded-lg border-2 transition-all ${selectedElement.category === cat ? 'border-[#654935]' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                              title={cat}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {selectedElement.type === 'text' && (
                    <div>
                      <label className="text-[10px] font-bold text-[#8c7a6b] uppercase block mb-1">Contenido</label>
                      <input 
                        type="text" 
                        value={selectedElement.text} 
                        onChange={e => updateElement(selectedId, { text: e.target.value })}
                        className="w-full text-sm p-2 border border-[#d6c7b2] rounded-lg focus:ring-1 focus:ring-[#654935] outline-none"
                      />
                    </div>
                  )}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-wider">Mis Planos</h3>
                <div className="flex bg-[#faf7f4] p-0.5 rounded-lg border border-[#e8ddd0]">
                  <button 
                    onClick={() => setFilterTipo('interior')}
                    className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${filterTipo === 'interior' ? 'bg-[#654935] text-white shadow-sm' : 'text-[#8c7a6b] hover:text-[#654935]'}`}
                  >
                    Interior
                  </button>
                  <button 
                    onClick={() => setFilterTipo('exterior')}
                    className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${filterTipo === 'exterior' ? 'bg-[#6BCB77] text-white shadow-sm' : 'text-[#8c7a6b] hover:text-[#6BCB77]'}`}
                  >
                    Exterior
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {planos.filter(p => (p.tipo || 'interior') === filterTipo).map(p => (
                  <div key={p.id} className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${currentPlanoId === p.id ? (p.tipo === 'exterior' ? 'bg-[#6BCB77] text-white border-[#6BCB77]' : 'bg-[#654935] text-white border-[#654935]') : 'bg-white text-[#654935] border-[#e8ddd0] hover:border-[#654935]'}`}>
                    <button 
                      onClick={() => handleSelectPlano(p)}
                      className="flex-1 text-left text-xs font-bold truncate mr-2"
                    >
                      {p.nombre}
                    </button>
                    <button 
                      onClick={() => handleDeletePlanoClick(p.id)}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 ${currentPlanoId === p.id ? 'text-white/70 hover:text-white' : 'text-[#8c7a6b] hover:text-red-500'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {planos.filter(p => (p.tipo || 'interior') === filterTipo).length === 0 && (
                  <div className="text-[10px] text-[#8c7a6b] italic text-center py-4">No hay planos en esta sección</div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Área de Canvas */}
        <div ref={containerRef} className="flex-1 bg-[#f5f5f0] relative overflow-hidden cursor-crosshair">
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 z-30 lg:hidden" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-[#d6c7b2] text-[10px] text-[#8c7a6b] flex items-center gap-2 max-w-[200px] sm:max-w-none">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Arrastra para mover. Usa los bordes para redimensionar o rotar.</span>
            <span className="xs:hidden">Arrastra para mover elementos.</span>
          </div>
          
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            draggable={!selectedId}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            ref={stageRef}
            scaleX={scale}
            scaleY={scale}
          >
            <Layer>
              {/* Grid Background */}
              {useGrid && Array.from({ length: 250 }).map((_, i) => (
                <Rect
                  key={`v-${i}`}
                  x={-2500 + i * GRID_SIZE}
                  y={-2500}
                  width={1}
                  height={5000}
                  fill="#d6c7b2"
                  opacity={0.1}
                  listening={false}
                />
              ))}
              {useGrid && Array.from({ length: 250 }).map((_, i) => (
                <Rect
                  key={`h-${i}`}
                  x={-2500}
                  y={-2500 + i * GRID_SIZE}
                  width={5000}
                  height={1}
                  fill="#d6c7b2"
                  opacity={0.1}
                  listening={false}
                />
              ))}

              {elements.map((el, i) => {
                const isSelected = el.id === selectedId;
                
                if (el.type === 'rect') {
                  return (
                    <Group
                      key={el.id}
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      draggable={!el.locked}
                      onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                      onClick={() => setSelectedId(el.id)}
                      onTap={() => setSelectedId(el.id)}
                      rotation={el.rotation}
                    >
                      <Rect
                        width={el.width}
                        height={el.height}
                        fill={el.fill}
                        cornerRadius={8}
                        stroke={isSelected ? '#654935' : '#d6c7b2'}
                        strokeWidth={isSelected ? 3 : 1}
                        shadowBlur={isSelected ? 10 : 0}
                        shadowOpacity={0.2}
                      />
                      <Text
                        text={el.text}
                        width={el.width}
                        height={el.height}
                        align="center"
                        verticalAlign="middle"
                        fontSize={12}
                        fontStyle="bold"
                        fill="#3d2b1f"
                      />
                      {/* Render Chairs and Guest Names per Chair */}
                      {Array.from({ length: el.sillas || 0 }).map((_, idx) => {
                        const total = el.sillas || 0;
                        const angle = (idx / total) * Math.PI * 2;
                        const radiusX = el.width / 2 + 15;
                        const radiusY = el.height / 2 + 15;
                        const cx = el.width / 2 + Math.cos(angle) * radiusX;
                        const cy = el.height / 2 + Math.sin(angle) * radiusY;
                        
                        const invitadosArray = (el.invitados || '').split('\n');
                        const guestName = invitadosArray[idx] || '';

                        return (
                          <Group key={`${el.id}-chair-group-${idx}`}>
                            <Circle
                              x={cx}
                              y={cy}
                              radius={8}
                              fill="#8c7a6b"
                              stroke="#654935"
                              strokeWidth={1}
                            />
                            {guestName && (
                              <Text
                                text={guestName}
                                x={cx + (Math.cos(angle) * 15) - 25}
                                y={cy + (Math.sin(angle) * 15) - 5}
                                width={50}
                                align="center"
                                fontSize={8}
                                fill="#3d2b1f"
                                fontStyle="bold"
                              />
                            )}
                          </Group>
                        );
                      })}
                    </Group>
                  );
                }
                
                if (el.type === 'circle') {
                  return (
                    <Group
                      key={el.id}
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      draggable={!el.locked}
                      onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                      onClick={() => setSelectedId(el.id)}
                      onTap={() => setSelectedId(el.id)}
                      rotation={el.rotation}
                    >
                      <Ellipse
                        radiusX={el.width / 2}
                        radiusY={el.height / 2}
                        fill={el.fill}
                        stroke={isSelected ? '#654935' : '#d6c7b2'}
                        strokeWidth={isSelected ? 3 : 1}
                        shadowBlur={isSelected ? 10 : 0}
                        shadowOpacity={0.2}
                      />
                      <Text
                        text={el.text}
                        x={-el.width / 2}
                        y={-el.height / 2}
                        width={el.width}
                        height={el.height}
                        align="center"
                        verticalAlign="middle"
                        fontSize={12}
                        fontStyle="bold"
                        fill="#3d2b1f"
                      />
                      {/* Render Chairs and Guest Names per Chair */}
                      {Array.from({ length: el.sillas || 0 }).map((_, idx) => {
                        const total = el.sillas || 0;
                        const angle = (idx / total) * Math.PI * 2;
                        const radiusX = el.width / 2 + 15;
                        const radiusY = el.height / 2 + 15;
                        const cx = Math.cos(angle) * radiusX;
                        const cy = Math.sin(angle) * radiusY;

                        const invitadosArray = (el.invitados || '').split('\n');
                        const guestName = invitadosArray[idx] || '';

                        return (
                          <Group key={`${el.id}-chair-group-${idx}`}>
                            <Circle
                              x={cx}
                              y={cy}
                              radius={8}
                              fill="#8c7a6b"
                              stroke="#654935"
                              strokeWidth={1}
                            />
                            {guestName && (
                              <Text
                                text={guestName}
                                x={cx + (Math.cos(angle) * 15) - 25}
                                y={cy + (Math.sin(angle) * 15) - 5}
                                width={50}
                                align="center"
                                fontSize={8}
                                fill="#3d2b1f"
                                fontStyle="bold"
                              />
                            )}
                          </Group>
                        );
                      })}
                    </Group>
                  );
                }

                if (el.type === 'text') {
                  return (
                    <Text
                      key={el.id}
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      text={el.text}
                      fontSize={el.fontSize}
                      fill={el.fill}
                      draggable={!el.locked}
                      onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                      onClick={() => setSelectedId(el.id)}
                      onTap={() => setSelectedId(el.id)}
                      fontStyle="bold"
                      padding={10}
                    />
                  );
                }
                return null;
              })}
              
              {/* Transformer for selected element */}
              {selectedId && !selectedElement?.locked && (
                <Transformer
                  ref={trRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 30 || newBox.height < 30) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                  onTransformEnd={() => {
                    const node = trRef.current.nodes()[0];
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    
                    // Reset scale to 1 to prevent distortion on re-render
                    node.scaleX(1);
                    node.scaleY(1);
                    
                    if (selectedElement) {
                      const newWidth = Math.max(30, (selectedElement.width || 100) * scaleX);
                      const newHeight = Math.max(30, (selectedElement.height || 100) * scaleY);
                      
                      updateElement(selectedId, {
                        x: node.x(),
                        y: node.y(),
                        width: newWidth,
                        height: newHeight,
                        rotation: node.rotation()
                      });
                    }
                  }}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Modal de Nueva Plantilla */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-[#f0f0f0] flex justify-between items-center bg-[#faf7f4]">
              <div>
                <h2 className="text-2xl font-bold text-[#654935]">Crear Nuevo Plano</h2>
                <p className="text-[#8c7a6b] text-sm mt-1">Elige cómo quieres empezar a diseñar tu sala.</p>
              </div>
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="p-2 hover:bg-[#ede3d6] rounded-full text-[#8c7a6b] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opción desde Cero */}
              <button
                onClick={() => startNewPlano()}
                className="flex flex-col items-center text-center p-8 border-2 border-dashed border-[#d6c7b2] rounded-3xl hover:border-[#654935] hover:bg-[#faf7f4] transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#d6c7b2] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <Plus className="w-8 h-8 text-[#654935]" />
                </div>
                <h3 className="text-lg font-bold text-[#654935] mb-2">Empezar de Cero</h3>
                <p className="text-xs text-[#8c7a6b] leading-relaxed">Lienzo en blanco para que diseñes la sala exactamente como la imaginas.</p>
              </button>

              {/* Plantillas */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#8c7a6b] uppercase tracking-widest mb-2">O elige una plantilla</h3>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => startNewPlano(t)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent hover:border-opacity-100 hover:shadow-md transition-all text-left group"
                      style={{ backgroundColor: `${t.color}15`, borderColor: t.color }}
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: t.color }}
                      >
                        {t.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#654935] group-hover:text-[#4d3829]">{t.name}</h4>
                        <p className="text-xs text-[#8c7a6b] line-clamp-1">{t.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-[#faf7f4] border-t border-[#f0f0f0] flex justify-end">
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="px-6 py-2 text-sm font-bold text-[#8c7a6b] hover:text-[#654935] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmTemplateModalOpen}
        onClose={() => setIsConfirmTemplateModalOpen(false)}
        onConfirm={() => templateToApply && confirmApplyTemplate(templateToApply)}
        title="Reemplazar diseño"
        message="Esto reemplazará tu diseño actual por la plantilla seleccionada. ¿Estás seguro de que quieres continuar?"
        confirmText="Reemplazar"
        cancelText="Cancelar"
        variant="warning"
      />

      <ConfirmModal
        isOpen={isDeletePlanoModalOpen}
        onClose={() => setIsDeletePlanoModalOpen(false)}
        onConfirm={confirmDeletePlano}
        title="Eliminar plano"
        message="¿Estás seguro de que quieres eliminar este plano? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

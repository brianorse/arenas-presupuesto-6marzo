import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl, LOGO_URL } from '@/utils';
import { auth, useAuth } from './firebase';
import { signOut } from 'firebase/auth';
import { 
  FileText, Plus, LayoutDashboard, LogOut, User as UserIcon, Users, Move, Menu, X, 
  ChevronDown, ChevronRight, MessageSquare, Target, Calendar, ChefHat, 
  DollarSign, Inbox, Mail, MessageCircle, Instagram, History, LayoutGrid, 
  StickyNote, PieChart, ClipboardList, Utensils, Scale, Package, Wrench, 
  TrendingUp, Receipt, CreditCard, ShoppingCart, Truck, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MENU_STRUCTURE = [
  {
    id: 'comunicaciones',
    label: 'Comunicaciones',
    icon: MessageSquare,
    subcategories: [
      { id: 'inbox', label: 'Bandeja de entrada (Inbox)', icon: Inbox, page: 'Comunicaciones' },
      { id: 'email', label: 'Email', icon: Mail, page: 'Comunicaciones' },
      { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, page: 'Comunicaciones' },
      { id: 'instagram', label: 'Instagram', icon: Instagram, page: 'Comunicaciones' },
      { id: 'historial_cliente', label: 'Historial por cliente', icon: History, page: 'Comunicaciones' },
      { id: 'mensajes_eventos', label: 'Mensajes vinculados a eventos', icon: MessageSquare, page: 'Comunicaciones' },
    ]
  },
  {
    id: 'crm',
    label: 'CRM (Clientes)',
    icon: Target,
    subcategories: [
      { id: 'leads', label: 'Leads', icon: Users, page: 'GestionClientes' },
      { id: 'pipeline', label: 'Pipeline (Kanban)', icon: LayoutGrid, page: 'GestionClientes' },
      { id: 'clientes', label: 'Clientes', icon: Users, page: 'GestionClientes' },
      { id: 'seguimiento', label: 'Seguimiento (notas)', icon: StickyNote, page: 'GestionClientes' },
      { id: 'historial_crm', label: 'Historial', icon: History, page: 'GestionClientes' },
    ]
  },
  {
    id: 'eventos',
    label: 'Eventos (CORE)',
    icon: Calendar,
    subcategories: [
      { id: 'resumen', label: 'Resumen', icon: FileText, page: 'Eventos' },
      { id: 'menu', label: 'Menú', icon: Utensils, page: 'MenuEvento' },
      { id: 'invitados', label: 'Invitados', icon: Users, page: 'Eventos' },
      { id: 'timeline', label: 'Timeline', icon: History, page: 'Eventos' },
      { id: 'logistica', label: 'Equipo & Logística', icon: Wrench, page: 'PlanificadorSala' },
      { id: 'rentabilidad_evento', label: 'Costes & Rentabilidad', icon: TrendingUp, page: 'Eventos' },
      { id: 'comunicacion_evento', label: 'Comunicación', icon: MessageSquare, page: 'Eventos' },
      { id: 'portal_cliente', label: 'Portal Cliente 🔥', icon: UserIcon, page: 'Eventos' },
    ]
  },
  {
    id: 'cocina',
    label: 'Cocina (GLOBAL)',
    icon: ChefHat,
    subcategories: [
      { id: 'recetas', label: 'Recetas', icon: ClipboardList, page: 'Cocina' },
      { id: 'escandallos', label: 'Escandallos', icon: Scale, page: 'Cocina' },
      { id: 'ingredientes', label: 'Ingredientes', icon: Package, page: 'Cocina' },
      { id: 'preparaciones', label: 'Preparaciones', icon: Utensils, page: 'Cocina' },
      { id: 'produccion', label: 'Producción automática', icon: LayoutGrid, page: 'Cocina' },
    ]
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    icon: DollarSign,
    subcategories: [
      { id: 'presupuestos', label: 'Presupuestos', icon: FileText, page: 'MisPresupuestos' },
      { id: 'facturacion', label: 'Facturación', icon: Receipt, page: 'Finanzas' },
      { id: 'pagos', label: 'Pagos', icon: CreditCard, page: 'Finanzas' },
      { id: 'compras', label: 'Compras', icon: ShoppingCart, page: 'Finanzas' },
      { id: 'proveedores', label: 'Proveedores', icon: Truck, page: 'Finanzas' },
      { id: 'rentabilidad', label: 'Rentabilidad', icon: TrendingUp, page: 'Finanzas' },
      { id: 'reportes', label: 'Reportes', icon: BarChart3, page: 'Finanzas' },
    ]
  },
  {
    id: 'general',
    label: 'Gestión General',
    icon: LayoutDashboard,
    subcategories: [
      { id: 'nuevo_presupuesto', label: 'Nuevo Presupuesto', icon: Plus, page: 'NuevoPresupuesto' },
      { id: 'ajustes', label: 'Ajustes', icon: Wrench, page: 'Ajustes' },
    ]
  }
];

function NavGroup({ group, currentPageName, setIsMenuOpen }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const Icon = group.icon;

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-[#654935] hover:bg-[#faf7f4] transition-all"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <span>{group.label}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-4 space-y-1"
          >
            {group.subcategories.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <Link
                  key={sub.id}
                  to={createPageUrl(sub.page)}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${currentPageName === sub.page ? 'bg-[#654935] text-white shadow-md' : 'text-[#8c7a6b] hover:bg-[#faf7f4] hover:text-[#654935]'}`}
                >
                  <SubIcon className="w-4 h-4" />
                  <span>{sub.label}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const { user, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('mock_admin_session');
      await signOut(auth);
      window.location.href = createPageUrl('Login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // No mostrar nav en el wizard de nuevo presupuesto para mantener la experiencia limpia
  const hideNav = currentPageName === 'NuevoPresupuesto' || currentPageName === 'PlanificadorSala';

  return (
    <div className="min-h-screen bg-[#ede3d6]">
      <style>{`
        body { background-color: #ede3d6; }
        * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
      `}</style>

      {/* {!hideNav && user && ( */}
      {!hideNav && user && (
        <nav className="bg-white border-b border-[#d6c7b2] px-4 py-3 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={LOGO_URL} alt="Eventing" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              <span className="font-bold text-[#654935] hidden sm:block">Eventing</span>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl text-[#654935] hover:bg-[#ede3d6] transition-all border border-[#d6c7b2] bg-[#faf7f4] shadow-sm active:scale-95"
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Menú Lateral / Mobile Overlay */}
            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="fixed top-0 right-0 h-full w-72 bg-white z-[70] shadow-2xl border-l border-[#d6c7b2] p-6 animate-in slide-in-from-right duration-300 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <img src={LOGO_URL} alt="Eventing" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                      <span className="font-bold text-[#654935]">Eventing</span>
                    </div>
                    <button 
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 hover:bg-[#ede3d6] rounded-full text-[#8c7a6b] transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar pr-1">
                    <p className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-widest mb-4 px-2">Navegación</p>
                    
                    {MENU_STRUCTURE.map((group) => (
                      <NavGroup 
                        key={group.id} 
                        group={group} 
                        currentPageName={currentPageName} 
                        setIsMenuOpen={setIsMenuOpen} 
                      />
                    ))}

                    {isAdmin && (
                      <Link 
                        to={createPageUrl('AdminPanel')}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${currentPageName === 'AdminPanel' ? 'bg-[#654935] text-white shadow-lg shadow-[#654935]/20' : 'text-[#654935] hover:bg-[#faf7f4]'}`}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Panel de Control</span>
                      </Link>
                    )}

                    <div className="h-px bg-[#f0f0f0] my-4" />
                    <p className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-widest mb-4 px-2">Cuenta</p>

                    {user ? (
                      <>
                        <Link 
                          to={createPageUrl('Perfil')}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${currentPageName === 'Perfil' ? 'bg-[#654935] text-white shadow-lg shadow-[#654935]/20' : 'text-[#654935] hover:bg-[#faf7f4]'}`}
                        >
                          <UserIcon className="w-5 h-5" />
                          <span>Mi Perfil</span>
                        </Link>

                        <button 
                          onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </>
                    ) : (
                      <Link 
                        to={createPageUrl('Login')}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#654935] hover:bg-[#faf7f4] transition-all"
                      >
                        <UserIcon className="w-5 h-5" />
                        <span>Acceso Clientes</span>
                      </Link>
                    )}
                  </div>

                  {user && (
                    <div className="mt-auto pt-6 border-t border-[#f0f0f0]">
                      <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-[#ede3d6] flex items-center justify-center text-[#654935] font-bold">
                          {(user.displayName || user.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#654935] truncate">{user.displayName || 'Usuario'}</p>
                          <p className="text-[10px] text-[#8c7a6b] truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </nav>
      )}

      {children}

      {user && (
        <footer className="bg-white border-t border-[#d6c7b2] py-8 px-4 mt-auto">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Eventing" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
              <div>
                <div className="font-bold text-[#654935]">Eventing</div>
                <div className="text-xs text-[#8c7a6b]">Catering de Autor & Eventos</div>
              </div>
            </div>
            
            <div className="text-sm text-[#8c7a6b] text-center md:text-left">
              © {new Date().getFullYear()} Eventing. Todos los derechos reservados.
            </div>

            <div className="flex items-center gap-6">
              <Link 
                to={createPageUrl('PoliticaPrivacidad')} 
                className="text-sm text-[#654935] hover:underline font-medium"
              >
                Política de Privacidad
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

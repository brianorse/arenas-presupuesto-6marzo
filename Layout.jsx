import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl, LOGO_URL } from '@/utils';
import { base44 } from '@/api/base44Client';
import { FileText, Plus, LayoutDashboard, LogOut, User, Users } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(me => setUser(me)).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin';

  // No mostrar nav en el wizard de nuevo presupuesto para mantener la experiencia limpia
  const hideNav = currentPageName === 'NuevoPresupuesto';

  return (
    <div className="min-h-screen bg-[#ede3d6]">
      <style>{`
        body { background-color: #ede3d6; }
        * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
      `}</style>

      {!hideNav && user && (
        <nav className="bg-white border-b border-[#d6c7b2] px-4 py-3 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={LOGO_URL} alt="Arenas Obrador" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              <span className="font-bold text-[#654935] hidden sm:block">Arenas Obrador</span>
            </div>

            <div className="flex items-center gap-1">
              {isAdmin && (
                <Link to={createPageUrl('AdminPanel')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${currentPageName === 'AdminPanel' ? 'bg-[#654935] text-white' : 'text-[#654935] hover:bg-[#ede3d6]'}`}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:block">Panel Admin</span>
                </Link>
              )}
              {isAdmin && (
                <Link to={createPageUrl('GestionClientes')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${currentPageName === 'GestionClientes' ? 'bg-[#654935] text-white' : 'text-[#654935] hover:bg-[#ede3d6]'}`}>
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:block">Clientes</span>
                </Link>
              )}
              <Link to={createPageUrl('MisPresupuestos')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${currentPageName === 'MisPresupuestos' ? 'bg-[#654935] text-white' : 'text-[#654935] hover:bg-[#ede3d6]'}`}>
                <FileText className="w-4 h-4" />
                <span className="hidden sm:block">Mis solicitudes</span>
              </Link>
              <Link to={createPageUrl('NuevoPresupuesto')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${currentPageName === 'NuevoPresupuesto' ? 'bg-[#654935] text-white' : 'text-[#654935] hover:bg-[#ede3d6]'}`}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:block">Nuevo</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-[#8c7a6b]">
                <User className="w-4 h-4" />
                <span className="hidden md:block max-w-[120px] truncate">{user.full_name}</span>
              </div>
              <button onClick={() => base44.auth.logout()}
                className="p-2 rounded-xl text-[#8c7a6b] hover:text-[#654935] hover:bg-[#ede3d6] transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>
      )}

      {children}

      {/* Footer Consistente */}
      <footer className="bg-white border-t border-[#d6c7b2] py-8 px-4 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Arenas Obrador" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
            <div>
              <div className="font-bold text-[#654935]">Arenas Obrador</div>
              <div className="text-xs text-[#8c7a6b]">Catering de Autor & Eventos</div>
            </div>
          </div>
          
          <div className="text-sm text-[#8c7a6b] text-center md:text-left">
            © {new Date().getFullYear()} Arenas Obrador. Todos los derechos reservados.
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
    </div>
  );
}

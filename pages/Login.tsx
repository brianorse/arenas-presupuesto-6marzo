import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl, LOGO_URL } from '@/utils';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock login logic
      if (email === 'chaima@arenas.com' && password === 'admin') {
        // Admin login
        await base44.auth.login('chaima@arenas.com', 'admin');
        window.location.href = createPageUrl('AdminPanel');
      } else if (email && password) {
        // User login
        await base44.auth.login(email, 'user');
        window.location.href = createPageUrl('MisPresupuestos');
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (err) {
      setError('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image & Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1a0f0a] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full w-full">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Arenas Obrador" className="w-12 h-12 object-contain bg-white/10 rounded-full p-1 border border-[#a87c50]" referrerPolicy="no-referrer" />
            <span className="font-bold text-xl tracking-wide">Arenas Obrador</span>
          </div>
          
          <div className="max-w-md">
            <h1 className="text-5xl font-bold font-serif mb-6 leading-tight">
              Crea momentos inolvidables
            </h1>
            <p className="text-lg text-white/80 font-light leading-relaxed">
              Accede a tu espacio personal para gestionar tus eventos, personalizar menús y descargar tus presupuestos al instante.
            </p>
          </div>

          <div className="text-xs text-white/40 uppercase tracking-widest">
            © 2024 Arenas Obrador Catering
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#faf9f6]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#3d2b1f] mb-2">Bienvenido de nuevo</h2>
            <p className="text-[#8c7a6b]">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#654935] ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7a6b]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#e8ddd0] bg-white focus:border-[#654935] focus:ring-4 focus:ring-[#654935]/10 outline-none transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#654935] ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7a6b]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#e8ddd0] bg-white focus:border-[#654935] focus:ring-4 focus:ring-[#654935]/10 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#654935] hover:bg-[#4a3627] text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Iniciar Sesión <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-[#8c7a6b]">
            ¿No tienes cuenta?{' '}
            <a href={createPageUrl('NuevoPresupuesto')} className="font-bold text-[#654935] hover:underline">
              Crear un presupuesto sin registro
            </a>
          </div>
          
          <div className="mt-8 pt-8 border-t border-[#e8ddd0] text-center">
             <p className="text-xs text-[#8c7a6b] mb-2">Credenciales de prueba:</p>
             <div className="flex justify-center gap-4 text-xs font-mono bg-white p-3 rounded-lg border border-[#e8ddd0] inline-block">
                <div><span className="font-bold text-[#654935]">Admin:</span> chaima@arenas.com / admin</div>
                <div><span className="font-bold text-[#654935]">User:</span> user@demo.com / user</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

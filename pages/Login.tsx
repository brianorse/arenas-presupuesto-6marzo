import React, { useState, useEffect } from 'react';
import { auth } from '@/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';

const Logo = () => (
  <div className="flex flex-col items-center gap-1">
    <div className="relative">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#3d2b1f]">
        <path d="M6 13.5C6 13.5 6 10 12 10C18 10 18 13.5 18 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 10V7M12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 14C4 14 4 16 12 16C20 16 20 14 20 14" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 17H19V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V17Z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    </div>
    <span className="text-4xl font-serif font-bold text-[#3d2b1f] tracking-tight">Eventing</span>
  </div>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('Catering2026!'); // Default for demo/master
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    let loginEmail = email.trim().toLowerCase();
    if (loginEmail === 'admin') loginEmail = 'app@cateringapp.com';
    
    try {
      await signInWithEmailAndPassword(auth, loginEmail, password);
      const isMaster = (loginEmail === 'app@cateringapp.com' || loginEmail === 'brianortegaxiv@gmail.com');
      window.location.href = createPageUrl(isMaster ? 'AdminPanel' : 'MisPresupuestos');
    } catch (err: any) {
      console.error("Login Error:", err);
      setError('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#d9c5a0] relative overflow-hidden font-sans">
      {/* Background Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10c2 0 3 1 3 3s-1 3-3 3-3-1-3-3 1-3 3-3zm40 40c2 0 3 1 3 3s-1 3-3 3-3-1-3-3 1-3 3-3zm30-30c2 0 3 1 3 3s-1 3-3 3-3-1-3-3 1-3 3-3zM20 80c2 0 3 1 3 3s-1 3-3 3-3-1-3-3 1-3 3-3z' fill='%233d2b1f' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Logo Section */}
      <div className="pt-16 pb-12 relative z-10">
        <Logo />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[400px] bg-[#3d2b1f] rounded-t-[40px] flex-1 flex flex-col items-center p-8 relative z-10 shadow-2xl">
        <h1 className="text-white text-4xl font-bold mb-2">¡Hola!</h1>
        <p className="text-white/60 text-sm mb-10">Empecemos por tu nombre y mail</p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#3d2b1f] border border-[#654935] rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#a89b78] transition-colors"
              placeholder="Nombre"
            />
          </div>

          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#3d2b1f] border border-[#654935] rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#a89b78] transition-colors"
              placeholder="Mail"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#a89b78] hover:bg-[#968a6a] text-white font-bold py-4 rounded-full transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ENVIAR'}
          </button>
        </form>

        <div className="w-full flex items-center gap-4 my-8">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-white/40 text-xs">o con</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        <div className="w-full space-y-3">
          <button className="w-full bg-white rounded-full py-3 flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-bold text-[#3d2b1f]">Google</span>
          </button>

          <button className="w-full bg-white rounded-full py-3 flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.96.95-2.04 1.44-3.23 1.44-1.16 0-2.14-.44-3.23-1.44-1.07-1.01-1.61-2.22-1.61-3.64 0-1.42.54-2.63 1.61-3.64 1.09-1 2.07-1.44 3.23-1.44 1.19 0 2.27.49 3.23 1.44 1.07 1.01 1.61 2.22 1.61 3.64 0 1.42-.54 2.63-1.61 3.64zM13.82 3.5c0 1.1-.89 2-2 2s-2-.9-2-2 .89-2 2-2 2 .9 2 2z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
              <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"/>
            </svg>
            <span className="font-bold text-[#3d2b1f]">Apple</span>
          </button>
        </div>

        <div className="mt-auto pt-8 text-center">
          <p className="text-white/30 text-[10px] leading-relaxed max-w-[250px]">
            Al continuar, aceptas automáticamente nuestras Condiciones, Política de privacidad y Política de cookies.
          </p>
        </div>
      </div>
    </div>
  );
}

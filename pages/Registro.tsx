import React, { useState } from 'react';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { createPageUrl, LOGO_URL } from '@/utils';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function Registro() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, { displayName: name });

      // Create user document in Firestore
      const isHardcodedAdmin = email === 'app@cateringapp.com' || email === 'BrianOrtegaXIV@gmail.com';
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email || email,
        displayName: name,
        role: isHardcodedAdmin ? 'admin' : 'user',
        createdAt: serverTimestamp()
      });

      // Notify admin
      try {
        await addDoc(collection(db, 'mail'), {
          to: ['app@cateringapp.com', 'BrianOrtegaXIV@gmail.com'],
          message: {
            subject: `🚀 Nuevo usuario registrado: ${name}`,
            text: `Se ha registrado un nuevo usuario en Eventing.\n\nNombre: ${name}\nEmail: ${email}\nFecha: ${new Date().toLocaleString('es-ES')}`,
            html: `
              <div style="font-family: sans-serif; color: #3d2b1f; max-width: 600px; margin: 0 auto; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden;">
                <div style="background-color: #654935; padding: 20px; text-align: center;">
                  <h2 style="color: #ffffff; margin: 0;">Nuevo Registro de Usuario</h2>
                </div>
                <div style="padding: 24px; background-color: #ffffff;">
                  <p>Se ha registrado un nuevo usuario en la plataforma:</p>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0; color: #8c7a6b;">Nombre:</td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0; font-weight: bold;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0; color: #8c7a6b;">Email:</td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0; font-weight: bold;">${email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0; color: #8c7a6b;">Fecha:</td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0;">${new Date().toLocaleString('es-ES')}</td>
                    </tr>
                  </table>
                  <div style="margin-top: 24px; text-align: center;">
                    <a href="https://ais-dev-4b7cyejxnzwa2wxjo2ntyd-8963002671.europe-west3.run.app/AdminPanel" style="background-color: #654935; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Ver en Panel de Control</a>
                  </div>
                </div>
              </div>
            `
          },
          createdAt: serverTimestamp()
        });
      } catch (notifyErr) {
        console.error("Error sending admin notification:", notifyErr);
      }

      // Notify user (Confirmation email)
      try {
        await addDoc(collection(db, 'mail'), {
          to: email,
          message: {
            subject: 'Bienvenido a Eventing - Registro Confirmado',
            text: `Hola ${name}, gracias por registrarte en Eventing. Ya puedes empezar a crear tus presupuestos personalizados.`,
            html: `
              <div style="font-family: sans-serif; color: #3d2b1f; max-width: 600px; margin: 0 auto; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden;">
                <div style="background-color: #654935; padding: 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0;">¡Bienvenido a Eventing!</h1>
                </div>
                <div style="padding: 32px; background-color: #ffffff;">
                  <p style="font-size: 16px; line-height: 1.6;">Hola <b>${name}</b>,</p>
                  <p style="font-size: 16px; line-height: 1.6;">Gracias por registrarte en nuestra plataforma. Estamos encantados de tenerte con nosotros.</p>
                  <p style="font-size: 16px; line-height: 1.6;">Desde ahora, puedes acceder a tu panel personal para:</p>
                  <ul style="font-size: 16px; line-height: 1.6;">
                    <li>Crear presupuestos personalizados para tus eventos.</li>
                    <li>Gestionar tus presupuestos de catering.</li>
                    <li>Descargar tus presupuestos en PDF al instante.</li>
                  </ul>
                  <p style="font-size: 16px; line-height: 1.6;">Si tienes alguna duda, estamos a tu disposición respondiendo a este correo.</p>
                  <br/>
                  <p style="font-size: 16px; line-height: 1.6; margin: 0;">Atentamente,</p>
                  <p style="font-size: 16px; line-height: 1.6; font-weight: bold; color: #654935; margin: 0;">El equipo de Eventing</p>
                </div>
                <div style="background-color: #faf9f6; padding: 16px; text-align: center; font-size: 12px; color: #8c7a6b;">
                  © 2026 Eventing
                </div>
              </div>
            `
          },
          createdAt: serverTimestamp()
        });
      } catch (userNotifyErr) {
        console.error("Error sending user confirmation:", userNotifyErr);
      }

      window.location.href = createPageUrl('MisPresupuestos');
    } catch (err: any) {
      console.error("Registration Error:", err);
      // Log more details if it's a Firestore error
      if (err.code === 'permission-denied') {
        console.error("Firestore Permission Denied. Path:", err.path);
      }
      
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres');
      } else if (err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions')) {
        setError('Error de permisos en la base de datos. Por favor, contacta con soporte.');
      } else {
        setError(`Error (${err.code || 'desconocido'}): ${err.message || 'Error al registrarse. Por favor, inténtalo de nuevo.'}`);
      }
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
            <img src={LOGO_URL} alt="Eventing" className="w-12 h-12 object-contain bg-white/10 rounded-full p-1 border border-[#a87c50]" referrerPolicy="no-referrer" />
            <span className="font-bold text-xl tracking-wide">Eventing</span>
          </div>
          
          <div className="max-w-md">
            <h1 className="text-5xl font-bold font-serif mb-6 leading-tight">
              Únete a nuestra comunidad
            </h1>
            <p className="text-lg text-white/80 font-light leading-relaxed">
              Crea tu cuenta para empezar a diseñar tus eventos personalizados y gestionar tus presupuestos de forma sencilla.
            </p>
          </div>

          <div className="text-xs text-white/40 uppercase tracking-widest">
            © 2026 Eventing
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#faf9f6]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#3d2b1f] mb-2">Crea tu cuenta</h2>
            <p className="text-[#8c7a6b]">Regístrate para empezar a planificar</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#654935] ml-1">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7a6b]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#e8ddd0] bg-white focus:border-[#654935] focus:ring-4 focus:ring-[#654935]/10 outline-none transition-all"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>

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
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
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
                  Registrarse <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-[#8c7a6b]">
            ¿Ya tienes cuenta?{' '}
            <a href={createPageUrl('Login')} className="font-bold text-[#654935] hover:underline">
              Inicia sesión aquí
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

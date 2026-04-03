import React, { useState } from 'react';
import { useAuth, auth, db } from '@/firebase';
import { updateProfile, updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { User, Mail, Lock, Trash2, Camera, Save, AlertTriangle, Loader2, Download } from 'lucide-react';
import { createPageUrl, generateAppReport } from '@/utils';

export default function Perfil() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Update Firebase Auth Profile
      await updateProfile(auth.currentUser!, {
        displayName,
        photoURL
      });

      // Update Firestore User Doc
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL
      });

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      // Refresh page to show changes (or update local state if needed, but AuthProvider should handle it)
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Re-authenticate user first (required for sensitive operations)
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);
      
      await updatePassword(auth.currentUser!, newPassword);
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'La contraseña actual es incorrecta' });
      } else {
        setMessage({ type: 'error', text: 'Error al cambiar la contraseña. Es posible que necesites cerrar sesión y volver a entrar.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);

      // 1. Delete all solicitudes (budgets) associated with this user
      const q = query(collection(db, 'solicitudes'), where('cliente_uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // 2. Delete from Firestore user document
      await deleteDoc(doc(db, 'users', user.uid));
      
      // 3. Delete from Auth
      await deleteUser(auth.currentUser!);
      
      localStorage.removeItem('mock_admin_session');
      window.location.href = createPageUrl('Home');
    } catch (error: any) {
      console.error("Delete account error:", error);
      if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Contraseña incorrecta para eliminar la cuenta' });
      } else if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Por seguridad, debes cerrar sesión y volver a entrar para eliminar tu cuenta.' });
      } else {
        setMessage({ type: 'error', text: `Error al eliminar la cuenta: ${error.message || 'Reintenta la operación.'}` });
      }
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ede3d6] pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-[#654935] rounded-2xl text-white shadow-lg">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#3d2b1f]">Mi Perfil</h1>
            <p className="text-[#8c7a6b]">Gestiona tu información personal y seguridad</p>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.type === 'success' ? <Save className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#d6c7b2] flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-[#ede3d6] border-4 border-white shadow-md">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#654935] bg-[#f5f0eb]">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 p-2 bg-[#654935] text-white rounded-full shadow-lg border-2 border-white">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#3d2b1f]">{user.displayName || 'Usuario'}</h2>
              <p className="text-sm text-[#8c7a6b] mb-4">{user.email}</p>
              <div className="px-3 py-1 bg-[#ede3d6] text-[#654935] rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                {user.role || 'Cliente'}
              </div>
              
              <button 
                onClick={generateAppReport}
                className="w-full py-3 px-4 bg-[#654935] text-white rounded-xl font-bold text-sm hover:bg-[#4a3627] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar Informe App
              </button>
            </div>

            <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
              <h3 className="text-red-800 font-bold mb-2 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Zona de Peligro
              </h3>
              <p className="text-xs text-red-600 mb-4">
                Al eliminar tu cuenta, se borrarán todos tus presupuestos y datos de forma permanente.
              </p>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 px-4 bg-white text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                Eliminar mi cuenta
              </button>
            </div>
          </div>

          {/* Main Forms */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile Info Form */}
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-[#d6c7b2]">
              <h3 className="text-xl font-bold text-[#3d2b1f] mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#654935]" /> Datos Personales
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#654935]">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7a6b]" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#e8ddd0] focus:border-[#654935] focus:ring-2 focus:ring-[#654935]/10 outline-none transition-all"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#654935]">URL Foto de Perfil</label>
                    <div className="relative">
                      <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7a6b]" />
                      <input
                        type="text"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#e8ddd0] focus:border-[#654935] focus:ring-2 focus:ring-[#654935]/10 outline-none transition-all"
                        placeholder="https://ejemplo.com/foto.jpg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#654935]">Email (No editable)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7a6b]" />
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#e8ddd0] bg-[#faf9f6] text-[#8c7a6b] cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[#654935] text-white rounded-xl font-bold hover:bg-[#4a3627] transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Guardar Cambios
                </button>
              </form>
            </section>

            {/* Password Form */}
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-[#d6c7b2]">
              <h3 className="text-xl font-bold text-[#3d2b1f] mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#654935]" /> Seguridad
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#654935]">Contraseña Actual</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7a6b]" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#e8ddd0] focus:border-[#654935] focus:ring-2 focus:ring-[#654935]/10 outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#654935]">Nueva Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7a6b]" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#e8ddd0] focus:border-[#654935] focus:ring-2 focus:ring-[#654935]/10 outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#654935]">Confirmar Nueva Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7a6b]" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#e8ddd0] focus:border-[#654935] focus:ring-2 focus:ring-[#654935]/10 outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-white text-[#654935] border-2 border-[#654935] rounded-xl font-bold hover:bg-[#654935] hover:text-white transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                  Actualizar Contraseña
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#3d2b1f] text-center mb-2">¿Estás totalmente seguro?</h3>
            <p className="text-[#8c7a6b] text-center mb-8">
              Esta acción no se puede deshacer. Para confirmar, introduce tu contraseña actual.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#654935]">Contraseña Actual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e8ddd0] focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loading || !currentPassword}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sí, eliminar mi cuenta definitivamente'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-4 bg-[#ede3d6] text-[#654935] rounded-2xl font-bold hover:bg-[#d6c7b2] transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

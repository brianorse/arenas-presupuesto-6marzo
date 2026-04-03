import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Users, Calendar, Clock, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { db } from '@/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

export default function Step1Datos({ client, setClient, onNext }) {
  const [bloqueos, setBloqueos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    // Listen to bloqueos
    const qBloqueos = query(collection(db, 'bloqueos'));
    const unsubBloqueos = onSnapshot(qBloqueos, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data().fecha);
      setBloqueos(data);
    });

    // Listen to eventos
    const qEventos = query(collection(db, 'eventos'));
    const unsubEventos = onSnapshot(qEventos, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data().fecha);
      setEventos(data);
      setLoadingData(false);
    });

    return () => {
      unsubBloqueos();
      unsubEventos();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient(prev => ({ ...prev, [name]: value }));
  };

  const isFechaBloqueada = client.fecha_evento && (bloqueos.includes(client.fecha_evento) || eventos.includes(client.fecha_evento));
  const isValid = client.cliente_nombre && client.cliente_email && client.pax > 0 && client.fecha_evento && !isFechaBloqueada;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#654935] mb-2">¡Empecemos!</h2>
        <p className="text-[#8c7a6b]">Cuéntanos un poco sobre ti y tu evento.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e8ddd0] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#654935] flex items-center gap-2">
              <User className="w-4 h-4" /> Nombre Completo
            </label>
            <input
              type="text"
              name="cliente_nombre"
              value={client.cliente_nombre}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#d6c7b2] focus:border-[#654935] focus:ring-2 focus:ring-[#654935]/20 outline-none transition-all bg-[#faf7f4]"
              placeholder="Ej. María García"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#654935] flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              name="cliente_email"
              value={client.cliente_email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#d6c7b2] focus:border-[#654935] focus:ring-2 focus:ring-[#654935]/20 outline-none transition-all bg-[#faf7f4]"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#654935] flex items-center gap-2">
              <Phone className="w-4 h-4" /> Teléfono
            </label>
            <input
              type="tel"
              name="cliente_telefono"
              value={client.cliente_telefono}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#d6c7b2] focus:border-[#654935] focus:ring-2 focus:ring-[#654935]/20 outline-none transition-all bg-[#faf7f4]"
              placeholder="+34 600 000 000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#654935] flex items-center gap-2">
              <Users className="w-4 h-4" /> Invitados (aprox.)
            </label>
            <input
              type="number"
              name="pax"
              value={client.pax}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-[#d6c7b2] focus:border-[#654935] focus:ring-2 focus:ring-[#654935]/20 outline-none transition-all bg-[#faf7f4]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#654935] flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Fecha del Evento
            </label>
            <div className="relative">
              <input
                type="date"
                name="fecha_evento"
                value={client.fecha_evento}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all bg-[#faf7f4] ${
                  isFechaBloqueada 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-[#d6c7b2] focus:border-[#654935] focus:ring-[#654935]/20'
                }`}
              />
              {loadingData && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#8c7a6b]" />
                </div>
              )}
            </div>
            {isFechaBloqueada && (
              <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold mt-1 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Lo sentimos, esta fecha ya está completa o reservada.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#654935] flex items-center gap-2">
              <Clock className="w-4 h-4" /> Hora Aproximada
            </label>
            <input
              type="time"
              name="hora_evento"
              value={client.hora_evento}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#d6c7b2] focus:border-[#654935] focus:ring-2 focus:ring-[#654935]/20 outline-none transition-all bg-[#faf7f4]"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-[#654935] flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Lugar del Evento
            </label>
            <input
              type="text"
              name="lugar"
              value={client.lugar}
              onChange={handleChange}
              placeholder="Ej. Finca El Campillo, Madrid"
              className="w-full px-4 py-3 rounded-xl border border-[#d6c7b2] focus:border-[#654935] focus:ring-2 focus:ring-[#654935]/20 outline-none transition-all bg-[#faf7f4]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            isValid 
              ? 'bg-[#654935] hover:bg-[#4a3627]' 
              : 'bg-[#d6c7b2] cursor-not-allowed opacity-70'
          }`}
        >
          Continuar al Evento →
        </button>
      </div>
    </div>
  );
}

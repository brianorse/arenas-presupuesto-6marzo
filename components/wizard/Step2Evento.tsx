import React from 'react';
import { EVENT_TYPES } from '../catalogo/CATALOG_DATA';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Step2Evento({ client, setClient, onNext, onBack }) {
  const handleSelectType = (id) => {
    setClient(prev => ({ ...prev, tipo_evento: id }));
  };

  const isValid = client.tipo_evento;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-[#654935] mb-2">Detalles del Evento</h2>
        <p className="text-[#8c7a6b]">¿Qué estás celebrando? Ayúdanos a personalizar tu experiencia.</p>
      </div>
      
      {/* Tipo de Evento */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-[#654935] uppercase tracking-wide ml-1">Tipo de Evento</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {EVENT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => handleSelectType(type.id)}
              className={`group relative p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                client.tipo_evento === type.id 
                  ? 'border-[#654935] bg-[#fffbf5] shadow-md transform scale-[1.02]' 
                  : 'border-[#e8ddd0] bg-white hover:border-[#d6c7b2] hover:bg-[#faf7f4]'
              }`}
            >
              <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-200">{type.icon}</div>
              <div className={`font-bold text-lg ${client.tipo_evento === type.id ? 'text-[#654935]' : 'text-[#8c7a6b]'}`}>
                {type.label}
              </div>
              {client.tipo_evento === type.id && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-[#654935] rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[#654935] font-bold hover:bg-[#e8ddd0]/50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            isValid 
              ? 'bg-[#654935] hover:bg-[#4a3627]' 
              : 'bg-[#d6c7b2] cursor-not-allowed opacity-70'
          }`}
        >
          Ver Menú <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

import React from 'react';

export const ETIQUETA_LABELS = { vip: 'VIP', recurrente: 'Recurrente', potencial: 'Potencial', inactivo: 'Inactivo' };
export const ETIQUETA_COLORS = { vip: 'bg-purple-100 text-purple-800', recurrente: 'bg-blue-100 text-blue-800', potencial: 'bg-yellow-100 text-yellow-800', inactivo: 'bg-gray-100 text-gray-800' };

export default function ClienteModal({ cliente, onClose, onSave }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Cliente Modal</h2>
        <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cerrar</button>
      </div>
    </div>
  );
}

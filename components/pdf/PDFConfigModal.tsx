import React from 'react';

export default function PDFConfigModal({ presupuesto, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">PDF Config</h2>
        <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cerrar</button>
      </div>
    </div>
  );
}

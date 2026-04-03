import React from 'react';

export default function EstadoBadge({ estado }) {
  const getStyles = () => {
    switch (estado) {
      case 'borrador':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'enviado':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'aprobado':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rechazado':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStyles()}`}>
      {estado}
    </span>
  );
}

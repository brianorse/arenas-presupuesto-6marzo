import React from 'react';

export default function EstadoBadge({ estado }) {
  return (
    <span className="px-2 py-1 bg-gray-200 rounded text-sm">{estado}</span>
  );
}

import React from 'react';
import { 
  Settings, 
  Users, 
  ShieldCheck, 
  Globe, 
  Palette, 
  Link as LinkIcon, 
  Bell, 
  CreditCard,
  ChevronRight,
  Building2,
  Lock,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';

const SETTINGS_SECTIONS = [
  {
    title: 'Empresa',
    items: [
      { icon: Building2, label: 'Datos de empresa', description: 'Nombre, CIF, dirección y contacto fiscal' },
      { icon: Palette, label: 'Branding', description: 'Logo, colores corporativos y tipografía' },
      { icon: Globe, label: 'Configuración del portal cliente', description: 'Personaliza la experiencia de tus clientes' },
    ]
  },
  {
    title: 'Equipo y Seguridad',
    items: [
      { icon: Users, label: 'Usuarios', description: 'Gestiona quién tiene acceso a la plataforma' },
      { icon: ShieldCheck, label: 'Permisos', description: 'Define roles y niveles de acceso' },
      { icon: Lock, label: 'Seguridad', description: 'Contraseñas, 2FA y sesiones activas' },
    ]
  },
  {
    title: 'Integraciones y Notificaciones',
    items: [
      { icon: LinkIcon, label: 'Integraciones', description: 'Conecta con WhatsApp, Google Calendar, etc.' },
      { icon: Bell, label: 'Notificaciones', description: 'Configura alertas por email y push' },
      { icon: Smartphone, label: 'App Móvil', description: 'Configuración de dispositivos vinculados' },
    ]
  }
];

export default function Ajustes() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#654935] tracking-tight">Ajustes</h1>
        <p className="text-[#8c7a6b] font-medium">Configura y personaliza tu plataforma Eventing</p>
      </div>

      <div className="space-y-10">
        {SETTINGS_SECTIONS.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-[10px] font-black text-[#8c7a6b] uppercase tracking-[0.2em] mb-6 px-2">{section.title}</h2>
            <div className="bg-white rounded-3xl shadow-sm border border-[#d6c7b2] overflow-hidden">
              <div className="divide-y divide-[#f0f0f0]">
                {section.items.map((item, itemIdx) => (
                  <button 
                    key={itemIdx}
                    className="w-full flex items-center gap-4 p-5 hover:bg-[#faf7f4] transition-all group text-left"
                  >
                    <div className="w-12 h-12 bg-[#faf7f4] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6 text-[#654935]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#654935]">{item.label}</p>
                      <p className="text-xs text-[#8c7a6b]">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#d6c7b2] group-hover:text-[#654935] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-[#654935] rounded-3xl text-white flex items-center justify-between shadow-xl shadow-[#654935]/20">
        <div>
          <p className="text-sm font-bold opacity-80 mb-1">Plan Actual</p>
          <h3 className="text-xl font-black">Catering Pro Plus</h3>
        </div>
        <button className="bg-white text-[#654935] px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-all active:scale-95">
          Gestionar Plan
        </button>
      </div>
    </div>
  );
}

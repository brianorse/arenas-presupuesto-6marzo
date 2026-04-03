import React from 'react';
import { 
  Wallet, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  DollarSign, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const FINANCE_STATS = [
  { icon: TrendingUp, label: 'Ingresos Mes', value: '45.200€', change: '+12.5%', isPositive: true },
  { icon: ArrowDownRight, label: 'Gastos Mes', value: '18.450€', change: '-5.2%', isPositive: true },
  { icon: Wallet, label: 'Margen Bruto', value: '26.750€', change: '+8.1%', isPositive: true },
  { icon: PieChart, label: 'Rentabilidad', value: '59%', change: '+2.3%', isPositive: true },
];

const RECENT_TRANSACTIONS = [
  { id: 1, name: 'Boda García-López', category: 'Ingreso', amount: '12.500€', status: 'Pagado', date: '20 Mar' },
  { id: 2, name: 'Proveedor Carnes S.A.', category: 'Gasto', amount: '2.450€', status: 'Pendiente', date: '18 Mar' },
  { id: 3, name: 'Evento Corporativo Tech', category: 'Ingreso', amount: '8.200€', status: 'Parcial', date: '15 Mar' },
];

export default function Finanzas() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#654935] tracking-tight">Finanzas y Rentabilidad</h1>
          <p className="text-[#8c7a6b] font-medium">Control económico, presupuestos y facturación</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to={createPageUrl('MisPresupuestos')}
            className="flex items-center justify-center gap-2 bg-[#faf7f4] text-[#654935] border border-[#d6c7b2] px-6 py-3 rounded-2xl font-bold hover:bg-[#ede3d6] transition-all active:scale-95"
          >
            <FileText className="w-5 h-5" />
            <span>Mis Presupuestos</span>
          </Link>
          <Link 
            to={createPageUrl('NuevoPresupuesto')}
            className="flex items-center justify-center gap-2 bg-[#654935] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-[#654935]/20 hover:scale-105 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Presupuesto</span>
          </Link>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {FINANCE_STATS.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-[#d6c7b2] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-[#faf7f4] rounded-xl flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-[#654935]" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${stat.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-sm font-bold text-[#8c7a6b] mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-[#654935]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Transacciones */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#d6c7b2]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-[#654935]">Movimientos Recientes</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7a6b]" />
                  <input 
                    type="text" 
                    placeholder="Buscar movimiento..." 
                    className="pl-10 pr-4 py-2 bg-[#faf7f4] border border-[#d6c7b2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#654935]/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              {RECENT_TRANSACTIONS.map((tx) => (
                <button 
                  key={tx.id}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[#faf7f4] transition-all group text-left border border-transparent hover:border-[#d6c7b2]"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                    tx.category === 'Ingreso' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {tx.category === 'Ingreso' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#654935]">{tx.name}</p>
                    <div className="flex items-center gap-3 text-[10px] text-[#8c7a6b] font-bold uppercase tracking-widest mt-1">
                      <span>{tx.category}</span>
                      <span className="w-1 h-1 bg-[#d6c7b2] rounded-full" />
                      <span>{tx.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${tx.category === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.category === 'Ingreso' ? '+' : '-'}{tx.amount}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                      tx.status === 'Pagado' ? 'bg-green-100 text-green-700' :
                      tx.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#d6c7b2] group-hover:text-[#654935] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar de Resumen */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#d6c7b2]">
            <h2 className="text-xl font-black text-[#654935] mb-6">Próximos Pagos</h2>
            <div className="space-y-4">
              {[
                { label: 'Factura Alquiler Nave', amount: '1.200€', date: '25 Mar' },
                { label: 'Seguros Sociales', amount: '3.450€', date: '30 Mar' },
                { label: 'Leasing Furgoneta', amount: '450€', date: '02 Abr' },
              ].map((payment, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-[#faf7f4] rounded-2xl border border-[#d6c7b2]/30">
                  <div>
                    <p className="text-xs font-bold text-[#654935]">{payment.label}</p>
                    <p className="text-[10px] text-[#8c7a6b]">{payment.date}</p>
                  </div>
                  <p className="text-sm font-black text-red-600">{payment.amount}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-[#654935] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#654935]/20 hover:scale-105 transition-all active:scale-95">
              Gestionar Pagos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

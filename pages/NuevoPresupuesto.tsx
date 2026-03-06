import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { calcularTotales } from '../components/presupuesto/calcularTotales';
import Step1Datos from '../components/wizard/Step1Datos';
import Step2Evento from '../components/wizard/Step2Evento';
import Step3Menu from '../components/wizard/Step3Menu';
import Step4Resumen from '../components/wizard/Step4Resumen';
import { createPageUrl, LOGO_URL, generateBudgetCode } from '@/utils';
import { generateBudgetPDF } from '@/utils/pdfGenerator';
import { Download } from 'lucide-react';

const STEPS = ['Tus datos', 'Tipo evento', 'Elige menú', 'Resumen'];

export default function NuevoPresupuesto() {
  const [step, setStep] = useState(0);
  const [client, setClient] = useState({
    cliente_nombre: '', cliente_email: '', cliente_telefono: '',
    fecha_evento: '', hora_evento: '', lugar: '', pax: 30,
    tipo_evento: '', tipo_experiencia: '', notas: ''
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedBudget, setSavedBudget] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      if (me) {
        setClient(prev => ({
          ...prev,
          cliente_nombre: me.full_name || '',
          cliente_email: me.email || ''
        }));
      }

      // Check for ID to edit
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) {
        const data = await base44.entities.Presupuesto.filter({ id });
        if (data && data.length > 0) {
          const budget = data[0];
          setClient({
            cliente_nombre: budget.cliente_nombre || '',
            cliente_email: budget.cliente_email || '',
            cliente_telefono: budget.cliente_telefono || '',
            fecha_evento: budget.fecha_evento || '',
            hora_evento: budget.hora_evento || '',
            lugar: budget.lugar || '',
            pax: budget.pax || 30,
            tipo_evento: budget.tipo_evento || '',
            tipo_experiencia: budget.tipo_experiencia || '',
            notas: budget.notas || ''
          });
          setSelectedItems(budget.items_seleccionados || []);
          setStep(2); // Go to menu selection
        }
      }
    };
    init();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const totales = calcularTotales(selectedItems, client.pax, client.tipo_experiencia);
    const titulo = `${client.tipo_evento ? client.tipo_evento.charAt(0).toUpperCase() + client.tipo_evento.slice(1) : 'Evento'} - ${client.cliente_nombre} (${client.pax} pax)`;

    const budgetData = {
      titulo,
      estado: 'borrador',
      ...client,
      items_seleccionados: selectedItems,
      total_comida: totales.food,
      total_bebidas: totales.drinks,
      total_estaciones: totales.stations,
      total_personal: totales.staff,
      total_logistica: totales.logistics,
      total: totales.total,
      total_por_pax: totales.perPax
    };

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
      await base44.entities.Presupuesto.update(id, budgetData);
      setSavedBudget({ ...budgetData, id });
    } else {
      const codigo = generateBudgetCode();
      const newBudget = { ...budgetData, codigo };
      const created = await base44.entities.Presupuesto.create(newBudget);
      setSavedBudget(created);
    }

    setSaving(false);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-[#ede3d6] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 text-center max-w-md shadow-xl border border-[#d6c7b2]">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[#654935] mb-3">¡Presupuesto guardado!</h2>
          <p className="text-[#8c7a6b] mb-4">Tu presupuesto ha sido guardado correctamente.</p>
          
          <div className="bg-[#faf7f4] border border-[#e8ddd0] rounded-xl p-4 mb-6">
            <div className="text-xs text-[#8c7a6b] uppercase font-bold mb-1">Código de Referencia</div>
            <div className="text-3xl font-mono font-bold text-[#654935] tracking-wider">{savedBudget?.codigo || '---'}</div>
            <div className="text-xs text-[#8c7a6b] mt-1">Comparte este código con Chaima</div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => generateBudgetPDF(savedBudget)}
              className="w-full py-3.5 bg-[#654935] hover:bg-[#4a3627] text-white font-bold rounded-2xl transition-colors text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" /> Descargar PDF
            </button>
            <a href={createPageUrl('MisPresupuestos')}
              className="block w-full py-3.5 border-2 border-[#654935] text-[#654935] font-bold rounded-2xl hover:bg-[#ede3d6] transition-colors text-center">
              Ver mis presupuestos
            </a>
            <button onClick={() => { setSaved(false); setSavedBudget(null); setStep(0); setClient({ cliente_nombre: '', cliente_email: '', cliente_telefono: '', fecha_evento: '', hora_evento: '', lugar: '', pax: 30, tipo_evento: '', tipo_experiencia: '', notas: '' }); setSelectedItems([]); }}
              className="w-full py-3.5 text-[#8c7a6b] font-semibold hover:text-[#654935] transition-colors text-sm">
              Crear otro presupuesto
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ede3d6]">
      {/* Header */}
      <div className="bg-white border-b border-[#d6c7b2] px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Arenas Obrador" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
            <div>
              <div className="font-bold text-[#654935]">Arenas Obrador</div>
              <div className="text-xs text-[#8c7a6b]">Gestor de Presupuestos</div>
            </div>
          </div>
          <a href={createPageUrl('MisPresupuestos')} className="text-sm text-[#654935] hover:underline font-semibold">
            Mis presupuestos →
          </a>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-[#d6c7b2] px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-[#654935]' : 'text-[#c0b0a0]'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < step ? 'bg-[#654935] border-[#654935] text-white' : i === step ? 'border-[#654935] text-[#654935]' : 'border-[#d6c7b2] text-[#c0b0a0]'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-6 sm:w-12 mx-2 ${i < step ? 'bg-[#654935]' : 'bg-[#d6c7b2]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {step === 0 && <Step1Datos client={client} setClient={setClient} onNext={() => setStep(1)} />}
        {step === 1 && <Step2Evento client={client} setClient={setClient} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <Step3Menu client={client} selectedItems={selectedItems} setSelectedItems={setSelectedItems} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step4Resumen client={client} selectedItems={selectedItems} onBack={() => setStep(2)} onSave={handleSave} saving={saving} />}
      </div>
    </div>
  );
}

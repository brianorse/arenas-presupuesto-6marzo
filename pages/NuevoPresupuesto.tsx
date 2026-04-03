import React, { useState, useEffect } from 'react';
import { db, useAuth } from '@/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { calcularTotales } from '../components/presupuesto/calcularTotales';
import Step1Datos from '../components/wizard/Step1Datos';
import Step2Evento from '../components/wizard/Step2Evento';
import Step3Menu from '../components/wizard/Step3Menu';
import Step4Resumen from '../components/wizard/Step4Resumen';
import { createPageUrl, LOGO_URL, generateBudgetCode } from '@/utils';
import { generateBudgetPDF } from '@/utils/pdfGenerator';
import { Download, Loader2 } from 'lucide-react';

const STEPS = ['Tus datos', 'Tipo evento', 'Elige menú', 'Resumen'];

export default function NuevoPresupuesto() {
  const { user, loading: authLoading } = useAuth();
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
    if (!authLoading && !user) {
      window.location.href = createPageUrl('Login');
      return;
    }

    const init = async () => {
      if (user) {
        setClient(prev => ({
          ...prev,
          cliente_nombre: user.displayName || '',
          cliente_email: user.email || ''
        }));
      }

      // Check for ID to edit
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) {
        const docRef = doc(db, 'solicitudes', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const budget = docSnap.data();
          // Security check: only owner or admin can edit
          if (budget.cliente_uid !== user?.uid && user?.role !== 'admin') {
            window.location.href = createPageUrl('MisPresupuestos');
            return;
          }

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
  }, [user, authLoading]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const totales = calcularTotales(selectedItems, client.pax, client.tipo_experiencia);
    const titulo = `${client.tipo_evento ? client.tipo_evento.charAt(0).toUpperCase() + client.tipo_evento.slice(1) : 'Evento'} - ${client.cliente_nombre} (${client.pax} pax)`;

    const budgetData = {
      titulo,
      estado: 'borrador',
      ...client,
      cliente_uid: user.uid,
      items_seleccionados: selectedItems,
      total_comida: totales.food,
      total_bebidas: totales.drinks,
      total_estaciones: totales.stations,
      total_personal: totales.staff,
      total_logistica: totales.logistics,
      total: totales.total,
      total_por_pax: totales.perPax,
      updated_at: serverTimestamp()
    };

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    try {
      if (id) {
        await updateDoc(doc(db, 'solicitudes', id), budgetData);
        setSavedBudget({ ...budgetData, id });
      } else {
        const codigo = generateBudgetCode();
        const newBudget = { 
          ...budgetData, 
          codigo,
          created_date: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'solicitudes'), newBudget);
        setSavedBudget({ ...newBudget, id: docRef.id });

        // Notify admin of new budget request
        try {
          await addDoc(collection(db, 'mail'), {
            to: ['app@cateringapp.com', 'BrianOrtegaXIV@gmail.com'],
            message: {
              subject: `📝 Nuevo presupuesto: ${client.cliente_nombre}`,
              text: `Nuevo presupuesto recibido.\n\nCliente: ${client.cliente_nombre}\nEvento: ${client.tipo_evento}\nPersonas: ${client.pax}\nTotal: ${totales.total.toFixed(2)}€\n\nVer detalles en el panel de administración.`,
              html: `
                <div style="font-family: sans-serif; color: #3d2b1f; max-width: 600px; margin: 0 auto; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden;">
                  <div style="background-color: #654935; padding: 20px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">Nuevo Presupuesto</h2>
                  </div>
                  <div style="padding: 24px; background-color: #ffffff;">
                    <p>Has recibido un nuevo presupuesto:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0; color: #8c7a6b;">Cliente:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0; font-weight: bold;">${client.cliente_nombre}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0; color: #8c7a6b;">Email:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0;">${client.cliente_email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0; color: #8c7a6b;">Evento:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0;">${client.tipo_evento}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0; color: #8c7a6b;">Personas:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0;">${client.pax} pax</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0; color: #8c7a6b;">Total estimado:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f0; font-weight: bold; color: #654935;">${totales.total.toFixed(2)}€</td>
                      </tr>
                    </table>
                    <div style="margin-top: 24px; text-align: center;">
                      <a href="https://ais-dev-4b7cyejxnzwa2wxjo2ntyd-8963002671.europe-west3.run.app/DetallePresupuesto?id=${docRef.id}" style="background-color: #654935; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Ver Detalles del Presupuesto</a>
                    </div>
                  </div>
                </div>
              `
            },
            createdAt: serverTimestamp()
          });
        } catch (mailErr) {
          console.error("Error sending admin notification for budget:", mailErr);
        }
      }
      setSaved(true);
    } catch (error) {
      console.error("Error saving budget:", error);
      alert("Error al guardar el presupuesto.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#faf9f6]">
        <Loader2 className="w-10 h-10 animate-spin text-[#654935]" />
      </div>
    );
  }

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
            <img src={LOGO_URL} alt="CateringApp" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
            <div>
              <div className="font-bold text-[#654935]">CateringApp</div>
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

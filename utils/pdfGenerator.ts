import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CATEGORY_LABELS } from '../components/catalogo/CATALOG_DATA';
import { LOGO_URL } from './index';

// Helper to load image
const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      } else {
        reject('Canvas context not available');
      }
    };
    img.onerror = reject;
  });
};

export const generateBudgetPDF = async (presupuesto: any) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  
  const colors = {
    primary: '#654935', // Brown
    secondary: '#8c7a6b', // Light Brown
    accent: '#d4af37', // Gold/Yellowish
    bg: '#f9f5f0', // Beige Background
    text: '#3d2b1f', // Dark Brown Text
    white: '#ffffff'
  };

  // --- Page 1: Cover ---
  // Background Color (No Image)
  doc.setFillColor(colors.primary);
  doc.rect(0, 0, width, height, 'F');

  // Overlay (Optional, but keeping consistent style)
  doc.setFillColor(0, 0, 0);
  doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
  doc.rect(0, 0, width, height, 'F');
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Border
  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(1);
  doc.rect(10, 10, width - 20, height - 20);

  // Logo
  try {
    const logoData = await loadImage(LOGO_URL);
    const logoWidth = 50; // Adjust size
    const logoHeight = 50; // Adjust size
    doc.addImage(logoData, 'PNG', (width - logoWidth) / 2, height / 2 - 35, logoWidth, logoHeight);
  } catch (e) {
    // Fallback to text if image fails
    doc.setFont('times', 'italic');
    doc.setTextColor(212, 175, 55); // Gold
    doc.setFontSize(60);
    doc.text('Arenas Obrador', width / 2, height / 2 - 10, { align: 'center' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('DONDE LA EXCELENCIA CULINARIA SE CONVIERTE EN CELEBRACIÓN', width / 2, height / 2 + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text(presupuesto.cliente_nombre || 'Cliente', width / 2, height / 2 + 40, { align: 'center' });
  doc.text(new Date().toLocaleDateString('es-ES'), width / 2, height / 2 + 50, { align: 'center' });
  if (presupuesto.codigo) {
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(212, 175, 55);
    doc.text(`REF: ${presupuesto.codigo}`, width / 2, height / 2 + 60, { align: 'center' });
  }

  // --- Page 2: Ficha del Evento & Contenido ---
  doc.addPage();
  doc.setFillColor(colors.bg);
  doc.rect(0, 0, width, height, 'F');

  // Left Column: Ficha
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(colors.text);
  doc.text('FICHA DEL EVENTO', 20, 40);
  doc.setDrawColor(colors.accent);
  doc.setLineWidth(1);
  doc.line(20, 45, 60, 45);

  const fichaY = 70;
  const fichaGap = 25;
  
  const addFichaItem = (label: string, value: string, y: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary);
    doc.text(label, 20, y);
    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(colors.text);
    doc.text(value, 20, y + 7);
  };

  addFichaItem('CLIENTE', presupuesto.cliente_nombre || '-', fichaY);
  addFichaItem('FECHA SELECCIONADA', presupuesto.fecha_evento || '-', fichaY + fichaGap);
  addFichaItem('INVITADOS ESTIMADOS', `${presupuesto.pax || 0} pax`, fichaY + fichaGap * 2);
  addFichaItem('TIPO DE EVENTO', (presupuesto.tipo_evento || 'Evento').toUpperCase(), fichaY + fichaGap * 3);
  addFichaItem('LOCALIZACIÓN', presupuesto.lugar || 'Por definir', fichaY + fichaGap * 4);

  // Right Column: Contenido
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(colors.text);
  doc.text('CONTENIDO', 150, 40);
  doc.setDrawColor(colors.secondary);
  doc.setLineWidth(0.5);
  doc.line(150, 45, 280, 45);

  const contentY = 70;
  const contentGap = 20;

  const addContentItem = (num: string, text: string, y: number) => {
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colors.accent);
    doc.text(num, 150, y);
    doc.setTextColor(colors.text);
    doc.text(text, 165, y);
    doc.setDrawColor(colors.secondary);
    doc.setLineWidth(0.1);
    doc.line(150, y + 5, 280, y + 5);
  };

  addContentItem('01', 'Así trabajamos', contentY);
  addContentItem('02', 'Tu Selección Gastronómica', contentY + contentGap);
  addContentItem('03', 'Presupuesto Estimado', contentY + contentGap * 2);
  addContentItem('04', 'Siguientes Pasos', contentY + contentGap * 3);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(colors.secondary);
  doc.text(`Propuesta creativa para ${presupuesto.cliente_nombre} | Arenas Obrador`, 20, height - 10);
  doc.text('1', width - 20, height - 10);

  // --- Page 3: Así Funciona ---
  doc.addPage();
  doc.setFillColor(colors.bg);
  doc.rect(0, 0, width, height, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(colors.accent);
  doc.text('01', 20, 40);
  doc.setTextColor(colors.text);
  doc.text('ASÍ FUNCIONA', 45, 40);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(colors.secondary);
  doc.text('No es un catálogo genérico: es tu propuesta con lo que has seleccionado.', 45, 50);

  const stepY = 90;
  const stepWidth = 70;
  const stepGap = 20;

  const addStep = (num: string, title: string, desc: string, x: number) => {
    // Circle
    doc.setFillColor(colors.accent); // Goldish
    doc.circle(x + 15, stepY, 15, 'F');
    doc.setTextColor(colors.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(num, x + 15, stepY + 6, { align: 'center' });

    // Text
    doc.setTextColor(colors.text);
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text(title, x, stepY + 30);
    
    doc.setTextColor(colors.secondary);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitDesc = doc.splitTextToSize(desc, stepWidth);
    doc.text(splitDesc, x, stepY + 40);
  };

  addStep('1', 'Tu Selección Inicial', 'Has creado un borrador basado en tus gustos. Esto nos sirve de guía para conocer tu estilo.', 30);
  addStep('2', 'Ajuste Personalizado', 'Revisaremos juntos esta propuesta. Adaptaremos platos, logística y tiempos a la realidad de tu evento.', 110);
  addStep('3', 'Reserva & Degustación', 'Una vez encaje el presupuesto, bloqueamos la fecha y preparamos la prueba de menú.', 190);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(colors.secondary);
  doc.text(`Propuesta creativa para ${presupuesto.cliente_nombre} | Arenas Obrador`, 20, height - 10);
  doc.text('2', width - 20, height - 10);

  // --- Page 4: Tu Selección ---
  doc.addPage();
  doc.setFillColor(colors.bg);
  doc.rect(0, 0, width, height, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(colors.accent);
  doc.text('02', 20, 40);
  doc.setTextColor(colors.text);
  doc.text('TU SELECCIÓN', 45, 40);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(colors.secondary);
  doc.text('Una propuesta gastronómica diseñada a tu medida.', 45, 50);

  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(colors.text);
  doc.text('APERITIVOS Y PLATOS', 20, 70);
  doc.setDrawColor(colors.accent);
  doc.line(20, 75, 100, 75);

  let itemY = 90;
  const col1X = 20;
  const col2X = 150;
  let currentX = col1X;

  presupuesto.items_seleccionados.forEach((item: any, index: number) => {
    if (index > 0 && index % 8 === 0) {
        doc.addPage();
        doc.setFillColor(colors.bg);
        doc.rect(0, 0, width, height, 'F');
        itemY = 40;
    }

    // Determine column
    currentX = (index % 8 < 4) ? col1X : col2X;
    if (index % 4 === 0 && index % 8 !== 0) itemY = 90; // Reset Y for second column
    if (index % 8 === 0 && index !== 0) itemY = 40; // Reset Y for new page

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colors.text);
    doc.text(item.name, currentX, itemY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.secondary);
    const unit = item.pricingModel === 'per_person' ? 'ud/pers' : 'ud';
    doc.text(`${item.quantity} ${unit} | ${item.price.toFixed(2)}€`, currentX, itemY + 6);

    itemY += 20;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(colors.secondary);
  doc.text(`Propuesta creativa para ${presupuesto.cliente_nombre} | Arenas Obrador`, 20, height - 10);
  doc.text('3', width - 20, height - 10);

  // --- Page 5: Presupuesto ---
  doc.addPage();
  doc.setFillColor(colors.bg);
  doc.rect(0, 0, width, height, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(colors.accent);
  doc.text('03', 20, 40);
  doc.setTextColor(colors.text);
  doc.text('PRESUPUESTO', 45, 40);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(colors.secondary);
  doc.text('Estimación detallada basada en tu configuración actual.', 45, 50);

  // Summary Box
  doc.setFillColor(colors.white);
  doc.roundedRect(20, 65, 80, 80, 2, 2, 'F');
  
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(colors.text);
  doc.text('RESUMEN', 30, 80);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(colors.secondary);
  
  doc.text('Comensales', 30, 95);
  doc.text(`${presupuesto.pax}`, 90, 95, { align: 'right' });
  
  doc.text('Base Imponible', 30, 105);
  doc.text(`${presupuesto.total.toFixed(2)}€`, 90, 105, { align: 'right' });
  
  doc.text('IVA (10%)', 30, 115);
  doc.text(`${(presupuesto.total * 0.10).toFixed(2)}€`, 90, 115, { align: 'right' });

  doc.setDrawColor(colors.secondary);
  doc.line(30, 120, 90, 120);

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colors.primary);
  doc.text('TOTAL ESTIMADO', 30, 130);
  doc.setFontSize(16);
  doc.text(`${(presupuesto.total * 1.10).toFixed(2)}€`, 90, 130, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.secondary);
  const perPax = (presupuesto.total * 1.10) / (presupuesto.pax || 1);
  doc.text(`Aprox. ${perPax.toFixed(2)}€ / persona (con IVA)`, 90, 140, { align: 'right' });

  // Detailed Table
  const tableColumn = ["CONCEPTO", "CANTIDAD", "TOTAL"];
  const tableRows: any[] = [];
  
  presupuesto.items_seleccionados.forEach((item: any) => {
    const unit = item.pricingModel === 'per_person' ? 'ud/pax' : 'ud';
    const totalItem = item.price * item.quantity * (item.pricingModel === 'per_person' ? presupuesto.pax : 1);
    tableRows.push([
      item.name,
      `${item.quantity} ${unit}`,
      `${totalItem.toFixed(0)}€`
    ]);
  });

  (autoTable as any)(doc, {
    startY: 65,
    margin: { left: 110 },
    head: [tableColumn],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: [249, 245, 240],
      textColor: [140, 122, 107],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: [61, 43, 31],
      cellPadding: 3,
    },
    columnStyles: {
      2: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // Conditions
  const conditionsY = 160;
  doc.setDrawColor(colors.accent);
  doc.rect(20, conditionsY, 150, 25);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.accent);
  doc.text('CONDICIONES DEL SERVICIO:', 25, conditionsY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.secondary);
  doc.text('• Precios estimados válidos por 15 días. Sujetos a confirmación de logística y personal.', 25, conditionsY + 15);
  doc.text('• Se requiere un depósito del 30% para reserva de fecha. Cancelaciones según contrato.', 25, conditionsY + 20);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(colors.secondary);
  doc.text(`Propuesta creativa para ${presupuesto.cliente_nombre} | Arenas Obrador`, 20, height - 10);
  doc.text('4', width - 20, height - 10);

  // --- Page 6: Próximos Pasos ---
  doc.addPage();
  doc.setFillColor(colors.bg);
  doc.rect(0, 0, width, height, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(colors.accent);
  doc.text('04', 20, 40);
  doc.setTextColor(colors.text);
  doc.text('PRÓXIMOS PASOS', 45, 40);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(colors.secondary);
  doc.text('¿Cómo convertimos esto en realidad?', 45, 50);

  // Logistics
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(colors.text);
  doc.text('NECESIDADES LOGÍSTICAS', 20, 80);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(colors.secondary);
  const logisticsText = [
    '- Horarios de montaje y desmontaje.',
    '- Acceso a tomas de corriente y agua potable.',
    '- Espacio habilitado para cocina satélite (si aplica).',
    '- Dietas especiales y alergias (listado final 7 días antes).'
  ];
  let logY = 95;
  logisticsText.forEach(line => {
    doc.text(line, 20, logY);
    logY += 10;
  });

  // Contact Box
  doc.setDrawColor(colors.accent);
  doc.setLineWidth(1.5);
  doc.rect(150, 80, 120, 80);
  
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(colors.text);
  doc.text('¿RESERVAMOS?', 160, 100);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(colors.text);
  doc.text('Si la propuesta encaja, el siguiente paso es bloquear la fecha.', 160, 115);
  doc.text('Contacta con nosotros para formalizar la reserva.', 160, 125);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(190, 50, 50); // Reddish for contact
  doc.text('697 967 853', 160, 145);
  doc.text('info@arenasobrador.com', 160, 155);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(colors.secondary);
  doc.text(`Propuesta creativa para ${presupuesto.cliente_nombre} | Arenas Obrador`, 20, height - 10);
  doc.text('5', width - 20, height - 10);

  // --- Page 7: Back Cover ---
  doc.addPage();
  doc.setFillColor(20, 20, 20); // Dark Gray/Black
  doc.rect(0, 0, width, height, 'F');
  
  doc.setFont('times', 'italic');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(40);
  doc.text('Gracias por la confianza', width / 2, height / 2, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('www.arenasobrador.com', width / 2, height / 2 + 20, { align: 'center' });

  // Save
  doc.save(`Presupuesto_Arenas_${presupuesto.cliente_nombre || 'Cliente'}.pdf`);
};

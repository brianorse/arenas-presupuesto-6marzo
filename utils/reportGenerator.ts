import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAppReport = () => {
  try {
    console.log("Iniciando generación de informe PDF...");
    
    if (typeof jsPDF === 'undefined') {
      throw new Error("jsPDF no está cargado correctamente.");
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(101, 73, 53); // #654935
    doc.text('Informe de Funcionalidades: CateringApp', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(140, 122, 107); // #8c7a6b
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(214, 199, 178); // #d6c7b2
    doc.line(20, 35, pageWidth - 20, 35);
    
    // Introduction
    doc.setFontSize(16);
    doc.setTextColor(101, 73, 53);
    doc.text('1. Introducción', 20, 50);
    
    doc.setFontSize(11);
    doc.setTextColor(61, 43, 31); // #3d2b1f
    const introText = 'CateringApp es una plataforma integral diseñada para la gestión de eventos y presupuestos de catering y repostería. Permite a los administradores y clientes colaborar en la planificación de eventos desde la solicitud inicial hasta la organización detallada de la sala.';
    const splitIntro = doc.splitTextToSize(introText, pageWidth - 40);
    doc.text(splitIntro, 20, 60);
    
    // Core Functionalities
    doc.setFontSize(16);
    doc.setTextColor(101, 73, 53);
    doc.text('2. Funcionalidades Principales', 20, 85);
    
    const features = [
      ['Gestión de Presupuestos', 'Creación detallada de presupuestos con desglose de servicios, IVA y estados (Borrador, Enviado, Aprobado, Rechazado).'],
      ['Planificador de Sala', 'Herramienta visual interactiva para diseñar el layout del evento, colocar mesas (rectangulares/redondas), asignar sillas y gestionar listas de invitados por mesa.'],
      ['Panel de Administración', 'Dashboard completo con estadísticas de ingresos, gestión de usuarios, y control total sobre las solicitudes de presupuesto.'],
      ['Calendario de Eventos', 'Visualización de fechas ocupadas, posibilidad de bloquear días específicos y añadir eventos manuales fuera del flujo de presupuestos.'],
      ['Gestión de Clientes', 'Base de datos centralizada de clientes con historial de interacciones y presupuestos asociados.'],
      ['Sistema de Notificaciones', 'Integración con servicios de correo para notificar cambios de estado y confirmaciones de eventos.'],
      ['Perfiles de Usuario', 'Área personalizada para clientes donde pueden ver sus presupuestos, descargar PDFs y gestionar su información.']
    ];
    
    if (typeof autoTable !== 'function') {
      console.warn("autoTable no es una función, intentando método alternativo...");
      if ((doc as any).autoTable) {
        (doc as any).autoTable({
          startY: 95,
          head: [['Funcionalidad', 'Descripción']],
          body: features,
          headStyles: { fillColor: [101, 73, 53], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [250, 247, 244] },
          margin: { left: 20, right: 20 },
          theme: 'striped'
        });
      } else {
        throw new Error("No se pudo encontrar la función autoTable.");
      }
    } else {
      autoTable(doc, {
        startY: 95,
        head: [['Funcionalidad', 'Descripción']],
        body: features,
        headStyles: { fillColor: [101, 73, 53], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [250, 247, 244] },
        margin: { left: 20, right: 20 },
        theme: 'striped'
      });
    }
    
    // Technical Stack
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    doc.setFontSize(16);
    doc.setTextColor(101, 73, 53);
    doc.text('3. Detalles Técnicos', 20, finalY + 20);
    
    doc.setFontSize(11);
    doc.setTextColor(61, 43, 31);
    const techText = 'La aplicación está construida utilizando tecnologías modernas para garantizar rendimiento y escalabilidad:';
    doc.text(techText, 20, finalY + 30);
    
    const techList = [
      '- Frontend: React 19 con Vite para una experiencia de usuario rápida.',
      '- Estilos: Tailwind CSS para un diseño responsivo y elegante.',
      '- Base de Datos y Auth: Firebase (Firestore y Authentication) para tiempo real.',
      '- Gráficos: Konva.js para el planificador de salas interactivo.',
      '- Documentación: jsPDF para la generación de informes y presupuestos en PDF.'
    ];
    
    techList.forEach((item, index) => {
      doc.text(item, 25, finalY + 40 + (index * 7));
    });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(140, 122, 107);
    doc.text('CateringApp - Informe Técnico Confidencial', pageWidth / 2, 285, { align: 'center' });
    
    // Save the PDF
    console.log("Guardando PDF...");
    doc.save('Informe_Funcionalidades_CateringApp.pdf');
    console.log("PDF guardado correctamente.");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error al generar el PDF: " + (error instanceof Error ? error.message : String(error)));
  }
};

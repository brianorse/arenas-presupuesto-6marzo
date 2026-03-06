import React from 'react';
import { createPageUrl, LOGO_URL } from '@/utils';

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-[#ede3d6] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#d6c7b2]">
        <div className="flex items-center gap-4 mb-8">
          <img src={LOGO_URL} alt="Arenas Obrador" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
          <h1 className="text-3xl font-bold text-[#654935] font-serif">Política de Privacidad</h1>
        </div>

        <div className="prose prose-stone max-w-none text-[#3d2b1f] space-y-6">
          <section>
            <h2 className="text-xl font-bold text-[#654935] mb-2">1. Información General</h2>
            <p>
              Arenas Obrador se compromete a proteger la privacidad de sus clientes y usuarios. Esta política describe cómo recopilamos, utilizamos y protegemos su información personal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#654935] mb-2">2. Recopilación de Datos</h2>
            <p>
              Recopilamos información necesaria para la gestión de presupuestos y la organización de eventos, incluyendo nombres, correos electrónicos, teléfonos y detalles específicos del evento solicitado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#654935] mb-2">3. Uso de la Información</h2>
            <p>
              La información recopilada se utiliza exclusivamente para:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Elaborar presupuestos personalizados.</li>
              <li>Comunicarnos con usted respecto a sus solicitudes.</li>
              <li>Mejorar nuestros servicios de catering y eventos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#654935] mb-2">4. Protección de Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos contra el acceso no autorizado, la pérdida o la alteración.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#654935] mb-2">5. Sus Derechos</h2>
            <p>
              Usted tiene derecho a acceder, rectificar o eliminar sus datos personales en cualquier momento. Para ello, puede ponerse en contacto con nosotros a través de los canales oficiales.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#ede3d6] text-center">
          <a 
            href={createPageUrl('Home')}
            className="text-[#654935] font-bold hover:underline"
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

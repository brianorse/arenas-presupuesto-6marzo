import React, { useState, useEffect } from 'react';
import { createPageUrl, LOGO_URL } from '@/utils';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const [bgImage, setBgImage] = useState("https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=2070&auto=format&fit=crop");

  useEffect(() => {
    const customBg = localStorage.getItem('custom_background');
    if (customBg) {
      setBgImage(customBg);
    }
  }, []);

  const handleLogin = () => {
    // Redirect to the new Login page
    window.location.href = createPageUrl('Login');
  };

  const handleQuieroEvento = () => {
    setShowPopup(true);
  };

  return (
    <div className="min-h-screen bg-[#1a0f0a] text-white relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-40 transition-all duration-1000"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a] via-[#1a0f0a]/60 to-transparent z-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="mb-8 animate-in fade-in zoom-in duration-1000">
          <img src={LOGO_URL} alt="Arenas Obrador" className="w-80 h-80 object-contain mx-auto mb-6 drop-shadow-2xl" referrerPolicy="no-referrer" />
          <h1 className="text-5xl md:text-7xl font-bold font-serif mb-4 tracking-tight">
            Arenas Obrador
          </h1>
          <p className="text-xl md:text-2xl text-[#d6c7b2] font-light max-w-2xl mx-auto">
            Catering de Autor & Eventos Exclusivos
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-xl mt-8 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Button
            onClick={handleQuieroEvento}
            className="flex-1 h-auto py-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 font-bold text-lg text-white/80 hover:text-white"
          >
            Quiero un evento
          </Button>

          <Button
            onClick={handleLogin}
            className="flex-1 h-auto relative py-6 rounded-2xl bg-[#654935] hover:bg-[#7a5c45] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 transform border border-[#8c6b5d] font-bold text-lg text-white"
          >
            ¡Quiero un EVENTAZO!
          </Button>
        </div>

        <div className="mt-16 text-sm text-white/30 font-light">
          © 2024 Arenas Obrador Catering. Todos los derechos reservados.
        </div>
      </div>

      {/* Custom Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white text-[#3d2b1f] rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300 border-4 border-[#654935]">
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-[#8c7a6b] hover:text-[#654935] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center space-y-4">
              <div className="text-5xl mb-2">✋</div>
              <h3 className="text-2xl font-bold text-[#654935]">¡Alto ahí!</h3>
              
              <div className="space-y-4 text-lg">
                <p>
                  En <span className="font-bold">Arenas Obrador</span> NO hacemos 'eventos'...
                </p>
                <p className="font-medium text-[#654935]">
                  Aquí creamos EXPERIENCIAS INOLVIDABLES, MOMENTAZOS y RECUERDOS ÉPICOS. 🚀
                </p>
                <p className="text-sm text-[#8c7a6b]">
                  Si buscas algo aburrido, te has equivocado de lugar.
                </p>
              </div>

              <Button
                onClick={() => setShowPopup(false)}
                className="mt-6 w-full h-auto py-3 rounded-xl bg-[#654935] text-white font-bold hover:bg-[#4a3627] transition-colors shadow-lg"
              >
                ¡Vale, quiero magia! ✨
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

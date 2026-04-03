import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Mail, 
  MessageCircle, 
  Instagram, 
  Search, 
  Filter, 
  Plus,
  Clock,
  User,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Tipos y Estructuras ---

type ConnectionStatus = 'not_connected' | 'pending_qr' | 'waiting_scan' | 'connecting' | 'connected' | 'error' | 'disconnected';

interface WhatsAppConnection {
  id?: string;
  user_id: string;
  workspace_id: string;
  channel: 'whatsapp';
  provider: 'wazzap';
  provider_name: 'Wazzap';
  is_official: false;
  status: ConnectionStatus;
  phone_number?: string;
  external_account_id?: string;
  external_session_id?: string;
  qr_code_value?: string;
  qr_expires_at?: string;
  last_sync_at?: string;
  risk_level: 'high';
  accepted_terms_version: string;
  accepted_terms_at?: string;
  accepted_terms_ip?: string;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: string;
  workspace_id: string;
  channel: 'whatsapp' | 'email' | 'instagram';
  provider: 'wazzap' | 'internal';
  connection_id?: string;
  contact_name: string;
  contact_phone?: string;
  lead_id?: string;
  client_id?: string;
  event_id?: string;
  last_message_at: string;
  last_message_text: string;
  unread_count: number;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  channel: 'whatsapp';
  provider: 'wazzap';
  external_message_id?: string;
  sender_name: string;
  sender_phone?: string;
  body: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'system';
  attachment_url?: string;
  sent_at?: string;
  received_at?: string;
  delivery_status: 'sent' | 'delivered' | 'read' | 'failed';
  raw_payload?: string;
  created_at: string;
}

// --- Mock Data ---

const MOCK_CONVERSATIONS: Conversation[] = [
  { 
    id: '1', 
    workspace_id: 'ws_1', 
    channel: 'whatsapp', 
    provider: 'wazzap', 
    contact_name: 'Boda García-López', 
    contact_phone: '+34600112233', 
    last_message_at: '10:30', 
    last_message_text: '¿Podemos añadir 5 invitados más?', 
    unread_count: 2, 
    status: 'active',
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-22T10:30:00Z'
  },
  { 
    id: '2', 
    workspace_id: 'ws_1', 
    channel: 'email', 
    provider: 'internal', 
    contact_name: 'Evento Corporativo Tech', 
    last_message_at: 'Ayer', 
    last_message_text: 'El presupuesto ha sido aprobado.', 
    unread_count: 0, 
    status: 'active',
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-21T15:00:00Z'
  },
  { 
    id: '3', 
    workspace_id: 'ws_1', 
    channel: 'instagram', 
    provider: 'internal', 
    contact_name: 'Cena de Gala Rotary', 
    last_message_at: 'Lun', 
    last_message_text: 'Enviado el plano de la sala.', 
    unread_count: 0, 
    status: 'active',
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-18T12:00:00Z'
  },
  { 
    id: '4', 
    workspace_id: 'ws_1', 
    channel: 'whatsapp', 
    provider: 'wazzap', 
    contact_name: 'Comunión Lucía', 
    contact_phone: '+34655443322', 
    last_message_at: 'Lun', 
    last_message_text: '¿Tienen opciones veganas?', 
    unread_count: 1, 
    status: 'active',
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-18T09:00:00Z'
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    conversation_id: '1',
    direction: 'inbound',
    channel: 'whatsapp',
    provider: 'wazzap',
    sender_name: 'Boda García-López',
    body: 'Hola, buenos días. Tenemos una duda sobre el menú.',
    message_type: 'text',
    received_at: '2024-03-22T10:00:00Z',
    delivery_status: 'read',
    created_at: '2024-03-22T10:00:00Z'
  },
  {
    id: 'm2',
    conversation_id: '1',
    direction: 'outbound',
    channel: 'whatsapp',
    provider: 'wazzap',
    sender_name: 'CateringApp Support',
    body: '¡Hola! Claro, decidme. ¿En qué os puedo ayudar?',
    message_type: 'text',
    sent_at: '2024-03-22T10:05:00Z',
    delivery_status: 'read',
    created_at: '2024-03-22T10:05:00Z'
  },
  {
    id: 'm3',
    conversation_id: '1',
    direction: 'inbound',
    channel: 'whatsapp',
    provider: 'wazzap',
    sender_name: 'Boda García-López',
    body: '¿Podemos añadir 5 invitados más al menú de adultos?',
    message_type: 'text',
    received_at: '2024-03-22T10:30:00Z',
    delivery_status: 'delivered',
    created_at: '2024-03-22T10:30:00Z'
  }
];

export default function Comunicaciones() {
  const [activeChannel, setActiveChannel] = useState<'all' | 'whatsapp' | 'email' | 'instagram'>('all');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [simulatedNumber, setSimulatedNumber] = useState('');

  const handleConnectClick = () => {
    setShowDisclaimer(true);
  };

  const handleAcceptDisclaimer = async () => {
    if (!acceptedTerms) return;
    
    try {
      setIsConnecting(true);
      // 1. Get or Create Instance
      const instResponse = await fetch('/api/whatsapp/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_123' })
      });
      
      if (!instResponse.ok) throw new Error('Failed to get instance');
      const instance = await instResponse.json();

      // 2. Connect (Generate QR)
      const connectResponse = await fetch(`/api/whatsapp/instances/${instance.id}/connect`, {
        method: 'POST'
      });
      
      if (!connectResponse.ok) throw new Error('Failed to connect');
      const sessionData = await connectResponse.json();
      
      const newConnection: WhatsAppConnection = {
        id: sessionData.id,
        user_id: 'user_123',
        workspace_id: 'ws_1',
        channel: 'whatsapp',
        provider: 'wazzap',
        provider_name: 'Wazzap',
        is_official: false,
        status: sessionData.status,
        qr_code_value: sessionData.qrCode,
        qr_expires_at: sessionData.qrExpiresAt,
        risk_level: 'high',
        accepted_terms_version: '1.0.0',
        accepted_terms_at: new Date().toISOString(),
        accepted_terms_ip: '127.0.0.1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setConnection(newConnection);
      setShowDisclaimer(false);
    } catch (error) {
      console.error('Error creating connection:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Polling for session status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (connection && connection.id && connection.status !== 'connected' && connection.status !== 'disconnected') {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/whatsapp/instances/${connection.id}`);
          if (response.ok) {
            const sessionData = await response.json();
            if (sessionData.status !== connection.status) {
              setConnection(prev => prev ? { 
                ...prev, 
                status: sessionData.status,
                phone_number: sessionData.phoneNumber || prev.phone_number,
                updated_at: new Date().toISOString()
              } : null);
            }
          }
        } catch (error) {
          console.error('Error polling session status:', error);
        }
      }, 3000);
    }
    
    return () => clearInterval(interval);
  }, [connection]);

  const handleRegenerateQR = async () => {
    if (!connection?.id) return;
    try {
      setIsConnecting(true);
      const response = await fetch(`/api/whatsapp/instances/${connection.id}/connect`, {
        method: 'POST'
      });
      if (response.ok) {
        const sessionData = await response.json();
        setConnection(prev => prev ? {
          ...prev,
          status: sessionData.status,
          qr_code_value: sessionData.qrCode,
          qr_expires_at: sessionData.qrExpiresAt,
          updated_at: new Date().toISOString()
        } : null);
      }
    } catch (error) {
      console.error('Error regenerating QR:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection?.id) return;
    try {
      const response = await fetch(`/api/whatsapp/instances/${connection.id}/logout`, {
        method: 'POST'
      });
      if (response.ok) {
        setConnection(null);
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleSimulateScan = async () => {
    if (!connection?.id || !simulatedNumber) return;
    try {
      setIsConnecting(true);
      const response = await fetch(`/api/whatsapp/instances/${connection.id}/simulate-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: simulatedNumber })
      });
      if (response.ok) {
        const sessionData = await response.json();
        setConnection(prev => prev ? {
          ...prev,
          status: sessionData.status,
          phone_number: sessionData.phoneNumber,
          updated_at: new Date().toISOString()
        } : null);
      }
    } catch (error) {
      console.error('Error simulating scan:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const filteredConversations = MOCK_CONVERSATIONS.filter(conv => {
    if (activeChannel === 'all') return true;
    return conv.channel === activeChannel;
  });

  const selectedConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedConversationId);
  const conversationMessages = MOCK_MESSAGES.filter(m => m.conversation_id === selectedConversationId);

  const ConnectionStateBadge = ({ status }: { status: ConnectionStatus }) => {
    const configs = {
      not_connected: { label: 'No conectado', color: 'bg-gray-100 text-gray-600', icon: XCircle },
      pending_qr: { label: 'Generando QR', color: 'bg-amber-100 text-amber-600', icon: Clock },
      waiting_scan: { label: 'Esperando escaneo', color: 'bg-blue-100 text-blue-600', icon: RefreshCw },
      connecting: { label: 'Conectando...', color: 'bg-purple-100 text-purple-600', icon: RefreshCw },
      connected: { label: 'Conectado', color: 'bg-green-100 text-green-600', icon: CheckCircle2 },
      error: { label: 'Error de conexión', color: 'bg-red-100 text-red-600', icon: AlertTriangle },
      disconnected: { label: 'Desconectado', color: 'bg-gray-100 text-gray-600', icon: RefreshCw },
    };
    const config = configs[status];
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${config.color}`}>
        <Icon className={`w-3 h-3 ${status === 'waiting_scan' || status === 'connecting' ? 'animate-spin' : ''}`} />
        <span>{config.label}</span>
      </div>
    );
  };

  const WhatsAppSetup = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-[#d6c7b2] h-[700px] flex flex-col items-center justify-center p-12 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-green-600" />
        </div>
        <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full border-2 border-white">
          No oficial
        </div>
      </div>
      <h2 className="text-2xl font-black text-[#654935] mb-2">Conecta tu WhatsApp</h2>
      <p className="text-[#8c7a6b] max-w-sm mb-8 font-medium">
        Gestiona tus conversaciones desde CateringApp con conexión mediante Wazzap.
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 max-w-md text-left">
        <div className="flex gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-800 mb-1">Advertencia de seguridad</p>
            <p className="text-[10px] text-amber-700 leading-relaxed">
              Esta integración utiliza un método de conexión no oficial. El uso de este servicio conlleva riesgos de bloqueo o suspensión por parte de WhatsApp/Meta.
            </p>
          </div>
        </div>
      </div>
      <button 
        onClick={handleConnectClick}
        className="flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-green-600/20 hover:scale-105 transition-all active:scale-95"
      >
        <Plus className="w-5 h-5" />
        <span>Generar QR</span>
      </button>
    </div>
  );

  const WhatsAppQR = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-[#d6c7b2] h-[700px] flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-8">
        <ConnectionStateBadge status={connection?.status || 'not_connected'} />
      </div>
      
      <div className="relative mb-8 p-4 bg-white border-4 border-[#654935] rounded-[40px] shadow-2xl">
        <AnimatePresence mode="wait">
          {connection?.status === 'waiting_scan' || connection?.status === 'pending_qr' ? (
            <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
              <img 
                src={connection?.qr_code_value} 
                alt="WhatsApp QR Code" 
                className={`w-64 h-64 rounded-2xl ${connection?.status === 'pending_qr' ? 'blur-sm opacity-50' : ''}`}
                referrerPolicy="no-referrer"
              />
              {connection?.status === 'pending_qr' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-10 h-10 text-[#654935] animate-spin" />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-64 h-64 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
              </div>
              <p className="text-sm font-bold text-[#654935]">Conectando...</p>
              <p className="text-[10px] text-[#8c7a6b]">Verificando vinculación con WhatsApp</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <h2 className="text-2xl font-black text-[#654935] mb-2">
        {connection?.status === 'waiting_scan' ? 'Escanea este código' : 'Iniciando conexión'}
      </h2>
      <p className="text-[#8c7a6b] max-w-sm mb-8 font-medium">
        {connection?.status === 'waiting_scan' 
          ? 'Abre WhatsApp en tu teléfono, ve a Dispositivos vinculados y escanea el código.' 
          : 'Estamos preparando tu sesión segura con Wazzap.'}
      </p>

      <div className="flex gap-3 w-full max-w-xs mb-8">
        <button 
          onClick={() => setConnection(null)}
          className="flex-1 py-4 bg-[#faf7f4] text-[#8c7a6b] font-bold rounded-2xl border border-[#d6c7b2] hover:bg-[#ede3d6] transition-all"
        >
          Cancelar
        </button>
        <button 
          onClick={handleRegenerateQR}
          disabled={isConnecting}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#654935] text-white font-bold rounded-2xl shadow-lg shadow-[#654935]/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
          <span>Regenerar</span>
        </button>
      </div>

      {/* Simulador de Escaneo (Solo para Demo) */}
      <div className="w-full max-w-xs p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-2">Simulador de Escaneo (Demo)</p>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Tu número real (ej: +34...)"
            value={simulatedNumber}
            onChange={(e) => setSimulatedNumber(e.target.value)}
            className="flex-1 bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button 
            onClick={handleSimulateScan}
            disabled={!simulatedNumber || isConnecting}
            className="bg-amber-600 text-white px-3 py-2 rounded-xl text-[10px] font-bold hover:bg-amber-700 transition-all disabled:opacity-50"
          >
            Simular
          </button>
        </div>
        <p className="text-[8px] text-amber-600 mt-2 leading-tight">
          Escribe un número arriba y pulsa "Simular" para ver cómo la app se conectaría si escaneas un QR real.
        </p>
      </div>
    </div>
  );

  const WhatsAppConnected = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-[#d6c7b2] h-[700px] flex flex-col items-center justify-center p-12 text-center">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <div className="flex flex-col items-center gap-2 mb-8">
        <ConnectionStateBadge status="connected" />
        <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full">
          Conexión no oficial
        </div>
      </div>
      <h2 className="text-3xl font-black text-[#654935] mb-2">{connection?.phone_number}</h2>
      <p className="text-[#8c7a6b] max-w-sm mb-8 font-medium">
        Conectado el {new Date(connection?.updated_at || '').toLocaleString()}
      </p>
      
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button 
          onClick={() => setSelectedConversationId(MOCK_CONVERSATIONS[0].id)}
          className="w-full py-4 bg-[#654935] text-white font-bold rounded-2xl shadow-lg shadow-[#654935]/20 hover:scale-105 transition-all active:scale-95"
        >
          Abrir conversaciones
        </button>
        <button 
          onClick={handleDisconnect}
          className="w-full py-4 bg-white text-red-600 font-bold rounded-2xl border border-red-100 hover:bg-red-50 transition-all"
        >
          Desconectar cuenta
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-[#654935] tracking-tight">Comunicaciones</h1>
            {connection?.status === 'connected' && (
              <div className="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-200">
                WhatsApp Activo
              </div>
            )}
            <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-200">
              Beta
            </div>
          </div>
          <p className="text-[#8c7a6b] font-medium">Centro de mensajes unificado con tus clientes</p>
        </div>
        <div className="flex gap-2">
          {connection?.status === 'connected' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d6c7b2] rounded-2xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-[#654935]">Wazzap: Conectado</span>
            </div>
          )}
          <button className="flex items-center justify-center gap-2 bg-[#654935] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-[#654935]/20 hover:scale-105 transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            <span>Nuevo Mensaje</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#d6c7b2] flex flex-col h-[700px]">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7a6b]" />
              <input 
                type="text" 
                placeholder="Buscar conversación..." 
                className="w-full pl-10 pr-4 py-2 bg-[#faf7f4] border border-[#d6c7b2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#654935]/20"
              />
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
              <button onClick={() => setActiveChannel('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeChannel === 'all' ? 'bg-[#654935] text-white' : 'bg-[#faf7f4] text-[#8c7a6b] border border-[#d6c7b2]'}`}>Todos</button>
              <button onClick={() => setActiveChannel('whatsapp')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeChannel === 'whatsapp' ? 'bg-green-600 text-white' : 'bg-[#faf7f4] text-[#8c7a6b] border border-[#d6c7b2]'}`}><MessageCircle className="w-3 h-3" />WhatsApp</button>
              <button onClick={() => setActiveChannel('email')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeChannel === 'email' ? 'bg-blue-600 text-white' : 'bg-[#faf7f4] text-[#8c7a6b] border border-[#d6c7b2]'}`}><Mail className="w-3 h-3" />Email</button>
              <button onClick={() => setActiveChannel('instagram')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeChannel === 'instagram' ? 'bg-pink-600 text-white' : 'bg-[#faf7f4] text-[#8c7a6b] border border-[#d6c7b2]'}`}><Instagram className="w-3 h-3" />Instagram</button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
              {filteredConversations.map((chat) => (
                <button 
                  key={chat.id}
                  onClick={() => setSelectedConversationId(chat.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-[#faf7f4] group ${selectedConversationId === chat.id ? 'bg-[#faf7f4] border border-[#d6c7b2]' : 'border border-transparent'} ${chat.unread_count > 0 ? 'bg-[#faf7f4]/50' : ''}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[#ede3d6] flex items-center justify-center text-[#654935] font-bold">{chat.contact_name[0]}</div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${chat.channel === 'whatsapp' ? 'bg-green-600' : chat.channel === 'email' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                      {chat.channel === 'whatsapp' ? <MessageCircle className="w-3 h-3 text-white" /> : chat.channel === 'email' ? <Mail className="w-3 h-3 text-white" /> : <Instagram className="w-3 h-3 text-white" />}
                    </div>
                    {chat.unread_count > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{chat.unread_count}</div>}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="font-bold text-[#654935] truncate">{chat.contact_name}</p>
                      <span className="text-[10px] text-[#8c7a6b]">{chat.last_message_at}</span>
                    </div>
                    <p className="text-xs text-[#8c7a6b] truncate">{chat.last_message_text}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {activeChannel === 'whatsapp' && !connection && <WhatsAppSetup />}
          {activeChannel === 'whatsapp' && connection && connection.status !== 'connected' && <WhatsAppQR />}
          {activeChannel === 'whatsapp' && connection?.status === 'connected' && <WhatsAppConnected />}
          {activeChannel !== 'whatsapp' && (
            <div className="bg-white rounded-3xl shadow-sm border border-[#d6c7b2] h-[700px] flex flex-col overflow-hidden">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-[#f0f0f0] flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#ede3d6] flex items-center justify-center text-[#654935] font-bold">{selectedConversation.contact_name[0]}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#654935]">{selectedConversation.contact_name}</h3>
                          {selectedConversation.channel === 'whatsapp' && <div className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest rounded border border-green-100">Wazzap</div>}
                        </div>
                        <p className="text-[10px] text-green-500 font-bold">En línea</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-[#faf7f4] rounded-xl text-[#8c7a6b] transition-colors"><Phone className="w-5 h-5" /></button>
                      <button className="p-2 hover:bg-[#faf7f4] rounded-xl text-[#8c7a6b] transition-colors"><Video className="w-5 h-5" /></button>
                      <button className="p-2 hover:bg-[#faf7f4] rounded-xl text-[#8c7a6b] transition-colors"><MoreVertical className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#faf7f4]/30 no-scrollbar">
                    {conversationMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${msg.direction === 'outbound' ? 'bg-[#654935] text-white rounded-tr-none' : 'bg-white text-[#654935] border border-[#d6c7b2]/50 rounded-tl-none'}`}>
                          <p className="text-sm leading-relaxed">{msg.body}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${msg.direction === 'outbound' ? 'text-white/60' : 'text-[#8c7a6b]'}`}>
                            <span className="text-[8px] font-bold">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {msg.direction === 'outbound' && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-white border-t border-[#f0f0f0]">
                    <div className="flex items-center gap-3 bg-[#faf7f4] border border-[#d6c7b2] rounded-2xl p-2">
                      <button className="p-2 hover:bg-[#ede3d6] rounded-xl text-[#8c7a6b] transition-colors"><Paperclip className="w-5 h-5" /></button>
                      <input type="text" placeholder="Escribe un mensaje..." className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[#654935]" />
                      <button className="p-3 bg-[#654935] text-white rounded-xl shadow-lg shadow-[#654935]/20 hover:scale-105 transition-all active:scale-95"><Send className="w-4 h-4" /></button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                  <div className="w-20 h-20 bg-[#faf7f4] rounded-full flex items-center justify-center mb-6"><MessageSquare className="w-10 h-10 text-[#654935]" /></div>
                  <h2 className="text-xl font-bold text-[#654935] mb-2">Selecciona una conversación</h2>
                  <p className="text-[#8c7a6b] max-w-xs">Gestiona todos tus canales de comunicación desde un solo lugar.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDisclaimer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDisclaimer(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center"><ShieldAlert className="w-8 h-8 text-amber-600" /></div>
                  <div>
                    <h3 className="text-2xl font-black text-[#654935]">Conexión no oficial de WhatsApp</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full">Wazzap</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[8px] font-black uppercase tracking-widest rounded-full">Riesgo Alto</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <p className="text-sm text-[#8c7a6b] leading-relaxed font-medium">Esta integración utiliza <span className="font-bold text-[#654935]">Wazzap</span> como método de conexión no oficial y no está afiliado, aprobado ni soportado por WhatsApp o Meta.</p>
                  <p className="text-sm text-[#8c7a6b] leading-relaxed font-medium">Su uso puede provocar cierres de sesión, desconexiones, bloqueos temporales o <span className="font-bold text-red-600">suspensión permanente</span> de la cuenta conectada.</p>
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-xs text-red-700 leading-relaxed font-bold">Al continuar, aceptas expresamente estos riesgos y entiendes que CateringApp no se hace responsable de incidencias, pérdida de acceso, pérdida de mensajes o restricciones derivadas de esta conexión.</p>
                  </div>
                </div>
                <label className="flex items-start gap-3 p-4 bg-[#faf7f4] rounded-2xl border border-[#d6c7b2] cursor-pointer group mb-8">
                  <div className="relative flex items-center mt-0.5">
                    <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-[#d6c7b2] bg-white transition-all checked:bg-[#654935] checked:border-[#654935]" />
                    <CheckCircle2 className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none" />
                  </div>
                  <span className="text-xs font-bold text-[#654935] leading-tight">He leído y acepto los riesgos de usar una conexión no oficial de WhatsApp mediante Wazzap.</span>
                </label>
                <div className="flex gap-3">
                  <button onClick={() => setShowDisclaimer(false)} className="flex-1 py-4 bg-[#faf7f4] text-[#8c7a6b] font-bold rounded-2xl border border-[#d6c7b2] hover:bg-[#ede3d6] transition-all">Cancelar</button>
                  <button onClick={handleAcceptDisclaimer} disabled={!acceptedTerms} className="flex-1 py-4 bg-[#654935] text-white font-bold rounded-2xl shadow-lg shadow-[#654935]/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100">Aceptar y continuar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

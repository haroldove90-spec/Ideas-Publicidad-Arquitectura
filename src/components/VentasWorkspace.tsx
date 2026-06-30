import React, { useState, useEffect } from 'react';
import { ServiceItem, Quotation, QuotationItem, QuotationStatus } from '../types';
import { 
  Users, UserPlus, FileText, CheckCircle, Plus, Minus, Trash2, Send, 
  MessageSquare, FileDown, Layers, FileCheck, Calendar, Phone, Mail, 
  MapPin, Landmark, HeartHandshake, Bell, ChevronRight, CheckCircle2, 
  Clock, Award, Camera, Upload, Trash, ArrowUpRight, Search, FileSignature
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  rfc: string;
  address: string;
  email: string;
  phone: string;
  keyContacts: Array<{ name: string; position: string; phone: string; email: string }>;
  purchaseHistory: Array<{ date: string; quoteFolio: string; amount: number; status: string }>;
  pendingBalance: number;
}

interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'cita' | 'llamada' | 'seguimiento';
  status: 'pendiente' | 'realizada' | 'cancelada';
}

interface Interaction {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  type: 'WhatsApp' | 'Llamada' | 'Correo' | 'Reunión';
  summary: string;
  sentReminder?: boolean;
}

interface SalesOrder {
  id: string;
  folio: string;
  clientName: string;
  clientPhone: string;
  date: string;
  quoteId: string;
  items: Array<{ serviceId: string; name: string; quantity: number; price: number; imageUrl?: string }>;
  total: number;
  downpayment: number; // Anticipo
  balance: number; // Saldo pendiente
  deliveryDate: string; // Fecha de entrega
  projectManager: string; // Responsable del proyecto
  status: 'en_diseño' | 'en_producción' | 'listo_entrega' | 'entregado';
}

interface VentasWorkspaceProps {
  services: ServiceItem[];
  quotations: Quotation[];
  onCreateQuotation: (quote: Quotation) => void;
  onUpdateQuotationStatus: (id: string, status: QuotationStatus) => void;
}

// Preset visual gallery for catalog items
const PRESET_IMAGES = [
  { id: 'img-render', label: 'Render 3D Fotorrealista', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80' },
  { id: 'img-maqueta', label: 'Maqueta Física de Detalle', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80' },
  { id: 'img-stand', label: 'Stand Modular Corporativo', url: 'https://images.unsplash.com/photo-1565034946487-077786996e27?auto=format&fit=crop&w=300&q=80' },
  { id: 'img-lona', label: 'Impresión Lona Gran Formato', url: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=300&q=80' },
  { id: 'img-vinil', label: 'Rotulación Vinilo Adhesivo', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=300&q=80' },
  { id: 'img-branding', label: 'Identidad Gráfica y Logos', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=300&q=80' }
];

export default function VentasWorkspace({
  services,
  quotations,
  onCreateQuotation,
  onUpdateQuotationStatus
}: VentasWorkspaceProps) {
  const [activeModule, setActiveModule] = useState<'clientes' | 'cotizaciones' | 'pedidos' | 'agenda' | 'interacciones'>('clientes');

  // --- CLIENTS STATE ---
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('ventas_clients');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'cl-1',
        name: 'Inmobiliaria Delta S.A.',
        rfc: 'IDS920315TL3',
        address: 'Av. de la Reforma 405, Lomas, CDMX',
        email: 'contacto@deltabienesraices.com',
        phone: '5512345678',
        keyContacts: [
          { name: 'Lic. Armando Casas', position: 'Gerente de Proyectos', phone: '5512345679', email: 'armando.casas@deltabienesraices.com' }
        ],
        purchaseHistory: [
          { date: '2026-06-01', quoteFolio: 'IDEAS-COT-0101', amount: 41000, status: 'aceptada' }
        ],
        pendingBalance: 15000
      },
      {
        id: 'cl-2',
        name: 'Restaurante El Portal',
        rfc: 'RPO151020MX1',
        address: 'Calle Juárez 48, Centro Histórico, CDMX',
        email: 'gerencia@elportalmexico.com',
        phone: '5598765432',
        keyContacts: [
          { name: 'Sofía Martínez', position: 'Socia Fundadora', phone: '5598765430', email: 'sofia@elportalmexico.com' }
        ],
        purchaseHistory: [
          { date: '2026-06-02', quoteFolio: 'IDEAS-COT-0102', amount: 4600, status: 'pendiente' }
        ],
        pendingBalance: 2000
      }
    ];
  });

  // --- SALES ORDERS STATE (PEDIDOS) ---
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    const saved = localStorage.getItem('ventas_sales_orders');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'so-1',
        folio: 'PED-2026-001',
        clientName: 'Inmobiliaria Delta S.A.',
        clientPhone: '5512345678',
        date: '2026-06-05',
        quoteId: 'q-101',
        items: [
          { serviceId: 'arq-1', name: 'Render 3D Fotorrealista Premium', quantity: 4, price: 3500, imageUrl: PRESET_IMAGES[0].url },
          { serviceId: 'arq-2', name: 'Diseño y Firma de Planos Executivos', quantity: 150, price: 180, imageUrl: PRESET_IMAGES[1].url }
        ],
        total: 41000,
        downpayment: 26000,
        balance: 15000,
        deliveryDate: '2026-07-10',
        projectManager: 'Ing. Esteban Cortázar',
        status: 'en_producción'
      }
    ];
  });

  // --- APPOINTMENTS STATE (AGENDA DE VENTAS) ---
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('ventas_appointments');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'ap-1',
        clientId: 'cl-1',
        clientName: 'Inmobiliaria Delta S.A.',
        title: 'Presentación de propuesta de fachadas',
        description: 'Reunión presencial para mostrar primeros Renders 3D e incorporar cambios.',
        date: '2026-07-02',
        time: '11:00',
        type: 'cita',
        status: 'pendiente'
      },
      {
        id: 'ap-2',
        clientId: 'cl-2',
        clientName: 'Restaurante El Portal',
        title: 'Llamada de confirmación de vinilos',
        description: 'Llamar a Sofía para verificar si el diseño de los logotipos fue autorizado.',
        date: '2026-07-01',
        time: '16:30',
        type: 'llamada',
        status: 'pendiente'
      }
    ];
  });

  // --- INTERACTIONS HISTORY STATE ---
  const [interactions, setInteractions] = useState<Interaction[]>(() => {
    const saved = localStorage.getItem('ventas_interactions');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'it-1',
        clientId: 'cl-1',
        clientName: 'Inmobiliaria Delta S.A.',
        date: '2026-06-25',
        type: 'WhatsApp',
        summary: 'Se envió cotización formal por WhatsApp. Armando casas contestó que lo revisaría en junta.',
        sentReminder: true
      },
      {
        id: 'it-2',
        clientId: 'cl-2',
        clientName: 'Restaurante El Portal',
        date: '2026-06-28',
        type: 'Reunión',
        summary: 'Visita presencial al restaurante para tomar medidas del muro principal para vinil.',
        sentReminder: false
      }
    ];
  });

  // Persistent synchronizations
  useEffect(() => {
    localStorage.setItem('ventas_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('ventas_sales_orders', JSON.stringify(salesOrders));
  }, [salesOrders]);

  useEffect(() => {
    localStorage.setItem('ventas_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('ventas_interactions', JSON.stringify(interactions));
  }, [interactions]);


  // --- DYNAMIC MODULE RENDER LOGIC ---

  // 1. CLIENT MODULE SUB-STATES
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchClientQuery, setSearchClientQuery] = useState('');
  
  // Create client form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientRfc, setNewClientRfc] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  
  // Key contacts list for new client
  const [contactName, setContactName] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [tempContacts, setTempContacts] = useState<Array<{ name: string; position: string; phone: string; email: string }>>([]);

  const handleAddTempContact = () => {
    if (!contactName.trim()) return;
    setTempContacts([...tempContacts, {
      name: contactName,
      position: contactPosition || 'Contacto Principal',
      phone: contactPhone,
      email: contactEmail
    }]);
    setContactName('');
    setContactPosition('');
    setContactPhone('');
    setContactEmail('');
  };

  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newClient: Client = {
      id: `cl-${Date.now()}`,
      name: newClientName,
      rfc: newClientRfc.toUpperCase() || 'XAXX010101000',
      address: newClientAddress || 'Ciudad de México',
      email: newClientEmail,
      phone: newClientPhone,
      keyContacts: tempContacts,
      purchaseHistory: [],
      pendingBalance: 0
    };

    setClients([newClient, ...clients]);
    setNewClientName('');
    setNewClientRfc('');
    setNewClientAddress('');
    setNewClientEmail('');
    setNewClientPhone('');
    setTempContacts([]);
    alert(`Cliente "${newClientName}" registrado correctamente.`);
  };


  // 2. COTIZACIONES MODULE SUB-STATES
  const [quoteClient, setQuoteClient] = useState<Client | null>(null);
  const [quoteClientName, setQuoteClientName] = useState('');
  const [quoteClientPhone, setQuoteClientPhone] = useState('');
  const [quoteClientEmail, setQuoteClientEmail] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteItems, setQuoteItems] = useState<Array<{
    serviceId: string;
    name: string;
    description: string;
    quantity: number;
    price: number;
    imageUrl: string;
  }>>([]);

  // Temp item creation state
  const [selectedCatalogService, setSelectedCatalogService] = useState<ServiceItem | null>(null);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemQty, setCustomItemQty] = useState(1);
  const [customItemPrice, setCustomItemPrice] = useState(0);
  const [selectedImgUrl, setSelectedImgUrl] = useState(PRESET_IMAGES[0].url);
  const [uploadBase64, setUploadBase64] = useState<string | null>(null);

  // PDF Preview popup modal
  const [pdfPreviewQuote, setPdfPreviewQuote] = useState<Quotation | null>(null);

  const handleSelectCatalogService = (service: ServiceItem) => {
    setSelectedCatalogService(service);
    setCustomItemName(service.name);
    setCustomItemDesc(service.description);
    setCustomItemPrice(service.price);
    
    // Attempt automatic visual category mapping
    if (service.id.includes('arq')) {
      if (service.name.toLowerCase().includes('render')) {
        setSelectedImgUrl(PRESET_IMAGES[0].url);
      } else if (service.name.toLowerCase().includes('maqueta')) {
        setSelectedImgUrl(PRESET_IMAGES[1].url);
      } else {
        setSelectedImgUrl(PRESET_IMAGES[3].url);
      }
    } else {
      if (service.name.toLowerCase().includes('stand')) {
        setSelectedImgUrl(PRESET_IMAGES[2].url);
      } else if (service.name.toLowerCase().includes('lona')) {
        setSelectedImgUrl(PRESET_IMAGES[3].url);
      } else if (service.name.toLowerCase().includes('vinil')) {
        setSelectedImgUrl(PRESET_IMAGES[4].url);
      } else {
        setSelectedImgUrl(PRESET_IMAGES[5].url);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadBase64(reader.result as string);
        setSelectedImgUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddQuoteItem = () => {
    if (!customItemName.trim()) return;
    setQuoteItems([...quoteItems, {
      serviceId: selectedCatalogService?.id || `custom-${Date.now()}`,
      name: customItemName,
      description: customItemDesc,
      quantity: customItemQty,
      price: customItemPrice,
      imageUrl: selectedImgUrl
    }]);

    // reset fields
    setSelectedCatalogService(null);
    setCustomItemName('');
    setCustomItemDesc('');
    setCustomItemQty(1);
    setCustomItemPrice(0);
    setUploadBase64(null);
  };

  const handleRemoveQuoteItem = (index: number) => {
    setQuoteItems(quoteItems.filter((_, idx) => idx !== index));
  };

  const handleCreateQuotationSubmit = () => {
    if (!quoteClientName.trim()) {
      alert('Ingresa el nombre del cliente por favor.');
      return;
    }
    if (quoteItems.length === 0) {
      alert('Agrega al menos un servicio cotizado.');
      return;
    }

    const subtotal = quoteItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const folioStr = `IDEAS-COT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newQuotation: Quotation = {
      id: `q-${Date.now()}`,
      folio: folioStr,
      clientName: quoteClientName,
      clientPhone: quoteClientPhone,
      clientEmail: quoteClientEmail,
      date: new Date().toISOString().split('T')[0],
      items: quoteItems.map(item => ({
        serviceId: item.serviceId,
        name: `${item.name} (${item.description})`,
        quantity: item.quantity,
        price: item.price
      })),
      total: subtotal,
      status: 'pendiente',
      notes: quoteNotes
    };

    // Trigger parent onCreate
    onCreateQuotation(newQuotation);

    // If client is already in CRM, append history
    if (quoteClient) {
      setClients(clients.map(c => c.id === quoteClient.id ? {
        ...c,
        purchaseHistory: [...c.purchaseHistory, { date: newQuotation.date, quoteFolio: newQuotation.folio, amount: newQuotation.total, status: 'pendiente' }]
      } : c));
    }

    // Set preview modal
    setPdfPreviewQuote(newQuotation);

    // Reset Quote Creator state
    setQuoteClient(null);
    setQuoteClientName('');
    setQuoteClientPhone('');
    setQuoteClientEmail('');
    setQuoteNotes('');
    setQuoteItems([]);
  };

  // 3. PEDIDOS MODULE SUB-STATES
  const [convertingQuote, setConvertingQuote] = useState<Quotation | null>(null);
  const [orderDeliveryDate, setOrderDeliveryDate] = useState('');
  const [orderPM, setOrderPM] = useState('Ing. Esteban Cortázar');
  const [orderDownpayment, setOrderDownpayment] = useState(0);

  const handleConvertQuoteToOrder = (quote: Quotation) => {
    setConvertingQuote(quote);
    // Suggest delivery date 2 weeks from now
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    setOrderDeliveryDate(twoWeeks.toISOString().split('T')[0]);
    // Anticipo suggest: 50%
    setOrderDownpayment(Math.round(quote.total * 0.5));
  };

  const handleConfirmOrderConversion = () => {
    if (!convertingQuote) return;

    // 1. Update quote status to 'aceptada'
    onUpdateQuotationStatus(convertingQuote.id, 'aceptada');

    // 2. Generate sales order (pedido)
    const orderFolio = `PED-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const balance = Math.max(0, convertingQuote.total - orderDownpayment);

    const newSalesOrder: SalesOrder = {
      id: `so-${Date.now()}`,
      folio: orderFolio,
      clientName: convertingQuote.clientName,
      clientPhone: convertingQuote.clientPhone,
      date: new Date().toISOString().split('T')[0],
      quoteId: convertingQuote.id,
      items: convertingQuote.items.map(item => ({
        serviceId: item.serviceId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: PRESET_IMAGES[0].url // map to first preset image by default
      })),
      total: convertingQuote.total,
      downpayment: orderDownpayment,
      balance: balance,
      deliveryDate: orderDeliveryDate,
      projectManager: orderPM,
      status: 'en_diseño'
    };

    setSalesOrders([newSalesOrder, ...salesOrders]);

    // Update clients outstanding balance and history status
    setClients(prevClients => prevClients.map(c => {
      if (c.name.toLowerCase() === convertingQuote.clientName.toLowerCase()) {
        const updatedHistory = c.purchaseHistory.map(hist => hist.quoteFolio === convertingQuote.folio ? { ...hist, status: 'aceptada' } : hist);
        return {
          ...c,
          purchaseHistory: updatedHistory,
          pendingBalance: c.pendingBalance + balance
        };
      }
      return c;
    }));

    // Register an interaction for this win!
    const newIt: Interaction = {
      id: `it-${Date.now()}`,
      clientId: 'cl-general',
      clientName: convertingQuote.clientName,
      date: new Date().toISOString().split('T')[0],
      type: 'WhatsApp',
      summary: `¡Cotización ${convertingQuote.folio} autorizada por el cliente! Convertida en Pedido con anticipo de $${orderDownpayment.toLocaleString('es-MX')} registrado.`,
      sentReminder: false
    };
    setInteractions([newIt, ...interactions]);

    setConvertingQuote(null);
    alert(`¡Pedido ${orderFolio} creado con éxito! Sincronizado para talleres.`);
  };


  // 4. AGENDA MODULE SUB-STATES
  const [apTitle, setApTitle] = useState('');
  const [apDesc, setApDesc] = useState('');
  const [apDate, setApDate] = useState('');
  const [apTime, setApTime] = useState('');
  const [apType, setApType] = useState<'cita' | 'llamada' | 'seguimiento'>('cita');
  const [apClientName, setApClientName] = useState('');

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apTitle.trim() || !apClientName.trim() || !apDate) return;

    const newAp: Appointment = {
      id: `ap-${Date.now()}`,
      clientId: 'cl-custom',
      clientName: apClientName,
      title: apTitle,
      description: apDesc,
      date: apDate,
      time: apTime || '12:00',
      type: apType,
      status: 'pendiente'
    };

    setAppointments([newAp, ...appointments]);
    setApTitle('');
    setApDesc('');
    setApDate('');
    setApTime('');
    setApClientName('');
    alert('Compromiso agendado con éxito.');
  };


  // 5. INTERACT SUB-STATES
  const [interactClientName, setInteractClientName] = useState('');
  const [interactType, setInteractType] = useState<'WhatsApp' | 'Llamada' | 'Correo' | 'Reunión'>('WhatsApp');
  const [interactSummary, setInteractSummary] = useState('');

  const handleAddInteractionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactClientName.trim() || !interactSummary.trim()) return;

    const newIt: Interaction = {
      id: `it-${Date.now()}`,
      clientId: 'cl-custom',
      clientName: interactClientName,
      date: new Date().toISOString().split('T')[0],
      type: interactType,
      summary: interactSummary,
      sentReminder: false
    };

    setInteractions([newIt, ...interactions]);
    setInteractClientName('');
    setInteractSummary('');
    alert('Historial de conversación registrado.');
  };

  const handleSendWhatsAppReminder = (it: Interaction) => {
    const textMsg = `Estimado cliente de ${it.clientName}, de IDEAS Publicidad y Arquitectura le enviamos un recordatorio comercial de seguimiento respecto a su solicitud: "${it.summary.substring(0, 80)}...". Quedamos atentos para servirle.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(textMsg)}`, '_blank');
    
    setInteractions(interactions.map(x => x.id === it.id ? { ...x, sentReminder: true } : x));
  };


  return (
    <div className="space-y-6">
      
      {/* 1. Header Metrics specific to the Sales Role */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block">Mis Prospectos</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{clients.length}</span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">Clientes Activos CRM</span>
          </div>
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-250/40 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase block">Cotizaciones</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {quotations.filter(q => q.status === 'pendiente').length} pend.
            </span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">Por cerrar en cartera</span>
          </div>
          <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-200/50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-purple-600 tracking-wider uppercase block">Pedidos Firmados</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {salesOrders.filter(o => o.status !== 'entregado').length} activos
            </span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">En proceso de taller</span>
          </div>
          <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-200/50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-teal-600 tracking-wider uppercase block">Agenda Comercial</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {appointments.filter(a => a.status === 'pendiente').length} citas
            </span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">Llamadas o compromisos</span>
          </div>
          <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. Workspace Navigation Menu */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex-wrap gap-1">
        <button
          onClick={() => setActiveModule('clientes')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
            activeModule === 'clientes' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          Clientes
        </button>

        <button
          onClick={() => setActiveModule('cotizaciones')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
            activeModule === 'cotizaciones' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          Cotizador Rápido
        </button>

        <button
          onClick={() => setActiveModule('pedidos')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
            activeModule === 'pedidos' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          Pedidos Activos
        </button>

        <button
          onClick={() => setActiveModule('agenda')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
            activeModule === 'agenda' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          Agenda Comercial
        </button>

        <button
          onClick={() => setActiveModule('interacciones')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
            activeModule === 'interacciones' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          Interacciones (Log)
        </button>
      </div>


      {/* 3. Render Active Sales Module View */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
        
        {/* === A. CLIENTS CRM MODULE === */}
        {activeModule === 'clientes' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left Form: Add New Client */}
              <div className="lg:w-2/5 bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <UserPlus className="w-4 h-4 text-blue-500" />
                  Alta de Cliente CRM
                </h3>

                <form onSubmit={handleCreateClientSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">RAZÓN SOCIAL / NOMBRE COMPLETO</label>
                    <input
                      type="text"
                      required
                      placeholder="Inmobiliaria Delta S.A."
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">RFC FISCAL</label>
                      <input
                        type="text"
                        placeholder="IDS920315TL3"
                        value={newClientRfc}
                        onChange={(e) => setNewClientRfc(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500 uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">TELÉFONO</label>
                      <input
                        type="tel"
                        placeholder="5512345678"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">DIRECCIÓN FISCAL Y ENTREGA</label>
                    <input
                      type="text"
                      placeholder="Av. Paseo de la Reforma 400, CDMX"
                      value={newClientAddress}
                      onChange={(e) => setNewClientAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">CORREO ADMINISTRATIVO</label>
                    <input
                      type="email"
                      placeholder="admon@deltabienesraices.com"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Key Contacts Inside Firm Section */}
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wide">Contactos Clave dentro de la Empresa</span>
                    
                    <div className="bg-white border border-slate-150 rounded-lg p-2.5 space-y-2 text-[11px]">
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          placeholder="Nombre contacto"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="border border-slate-200 rounded p-1 text-[10px]"
                        />
                        <input
                          type="text"
                          placeholder="Cargo/Puesto (Ej. Compras)"
                          value={contactPosition}
                          onChange={(e) => setContactPosition(e.target.value)}
                          className="border border-slate-200 rounded p-1 text-[10px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="tel"
                          placeholder="Tel directo"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="border border-slate-200 rounded p-1 text-[10px]"
                        />
                        <input
                          type="email"
                          placeholder="Mail contacto"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="border border-slate-200 rounded p-1 text-[10px]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTempContact}
                        className="w-full bg-blue-100 hover:bg-blue-150 text-blue-800 font-bold text-[10px] py-1 rounded"
                      >
                        + Agregar Contacto Clave
                      </button>

                      {tempContacts.length > 0 && (
                        <div className="mt-2 space-y-1 border-t pt-1.5">
                          {tempContacts.map((tc, idx) => (
                            <div key={idx} className="flex justify-between text-[10px] bg-slate-50 p-1 rounded font-mono">
                              <span><strong>{tc.name}</strong> ({tc.position})</span>
                              <span className="text-slate-400">{tc.phone}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition"
                  >
                    Registrar Cliente CRM ✓
                  </button>
                </form>
              </div>

              {/* Right: Client List with quick search */}
              <div className="lg:w-3/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Directorio de Prospectos y Clientes</h3>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={searchClientQuery}
                      onChange={(e) => setSearchClientQuery(e.target.value)}
                      className="pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {clients
                    .filter(c => c.name.toLowerCase().includes(searchClientQuery.toLowerCase()))
                    .map(c => (
                      <div key={c.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition flex justify-between items-start">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              {c.name}
                              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono uppercase">{c.rfc}</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" /> {c.address}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-600">
                            <div>
                              <strong className="text-[9px] text-slate-400 block uppercase font-mono">Mail / Tel</strong>
                              <span>{c.email}</span> <br />
                              <span>{c.phone}</span>
                            </div>
                            <div>
                              <strong className="text-[9px] text-slate-400 block uppercase font-mono">Contactos Clave</strong>
                              {c.keyContacts.map((kc, idx) => (
                                <div key={idx} className="font-medium text-[9px]">
                                  • {kc.name} ({kc.position})
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Purchase and Debt History summary */}
                          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-4 text-[11px]">
                            <span className="text-[10px] text-slate-500">
                              Historial: <strong>{c.purchaseHistory.length} cotizaciones</strong>
                            </span>
                            <span className={`text-[10px] font-bold ${c.pendingBalance > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`}>
                              Deuda pendiente: <strong>${c.pendingBalance.toLocaleString('es-MX')} MXN</strong>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedClient(c);
                            // Pre-fill creator with client details
                            setQuoteClient(c);
                            setQuoteClientName(c.name);
                            setQuoteClientPhone(c.phone);
                            setQuoteClientEmail(c.email);
                            setActiveModule('cotizaciones');
                          }}
                          className="bg-slate-900 hover:bg-slate-950 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 transition"
                        >
                          <span>Cotizar</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* === B. COTIZACIONES (FAST CREATOR MODULE) === */}
        {activeModule === 'cotizaciones' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left Form: Quote configuration */}
              <div className="lg:w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
                <div className="border-b pb-2 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileSignature className="w-4 h-4 text-amber-500" />
                    Creador Rápido de Cotizaciones
                  </h3>
                  {quoteClient && (
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                      Cliente CRM Vinculado
                    </span>
                  )}
                </div>

                {/* Cliente details */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">CLIENTE / RAZÓN SOCIAL</label>
                    <input
                      type="text"
                      required
                      placeholder="Inmobiliaria Delta S.A."
                      value={quoteClientName}
                      onChange={(e) => setQuoteClientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">TELÉFONO DE CONTACTO</label>
                      <input
                        type="tel"
                        placeholder="5512345678"
                        value={quoteClientPhone}
                        onChange={(e) => setQuoteClientPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">CORREO ELECTRÓNICO</label>
                      <input
                        type="email"
                        placeholder="compras@delta.com"
                        value={quoteClientEmail}
                        onChange={(e) => setQuoteClientEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Paso 2: Agregar Concepto */}
                <div className="border-t border-slate-200 pt-3 space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wide">Paso 2: Configurar Insumo o Servicio</span>

                  {/* Selector de Catalogo Predefinido */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 block mb-1">IMPORTAR DESDE EL CATÁLOGO (OPCIONAL)</label>
                    <select
                      onChange={(e) => {
                        const s = services.find(x => x.id === e.target.value);
                        if (s) handleSelectCatalogService(s);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">-- Seleccionar del catálogo --</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (${s.price.toLocaleString('es-MX')} / {s.unit})</option>
                      ))}
                    </select>
                  </div>

                  {/* Nombre y Descripcion detallada */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 block mb-1">PRODUCTO / SERVICIO</label>
                      <input
                        type="text"
                        placeholder="Render Fotorrealista"
                        value={customItemName}
                        onChange={(e) => setCustomItemName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 block mb-1">DESCRIPCIÓN / DETALLE</label>
                      <input
                        type="text"
                        placeholder="Vistas diurna y nocturna fachada norte"
                        value={customItemDesc}
                        onChange={(e) => setCustomItemDesc(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 block mb-1">CANTIDAD</label>
                      <input
                        type="number"
                        min="1"
                        value={customItemQty}
                        onChange={(e) => setCustomItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 block mb-1">PRECIO UNITARIO</label>
                      <input
                        type="number"
                        min="0"
                        value={customItemPrice}
                        onChange={(e) => setCustomItemPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 block mb-1">SUBTOTAL</label>
                      <div className="w-full bg-slate-100 rounded-lg p-2 text-xs font-mono font-bold text-slate-700">
                        ${(customItemQty * customItemPrice).toLocaleString('es-MX')}
                      </div>
                    </div>
                  </div>

                  {/* Image product selection requested */}
                  <div className="bg-white border border-slate-250 p-3 rounded-lg space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wide flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-indigo-500" />
                      Asociar Imagen Ilustrativa del Producto
                    </span>

                    {/* Previews Selection */}
                    <div className="grid grid-cols-6 gap-1.5">
                      {PRESET_IMAGES.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => {
                            setSelectedImgUrl(img.url);
                            setUploadBase64(null);
                          }}
                          className={`relative aspect-square rounded-md overflow-hidden border ${
                            selectedImgUrl === img.url ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200'
                          }`}
                          title={img.label}
                        >
                          <img src={img.url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    {/* Drag and drop or upload */}
                    <div className="pt-2 flex items-center justify-between gap-4">
                      <span className="text-[9px] text-slate-450 italic">O carga una foto personalizada desde tu celular:</span>
                      <label className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md py-1 px-2.5 text-[10px] font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3 text-slate-500" />
                        <span>Elegir archivo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Active preview item */}
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-150">
                      <div className="w-10 h-10 rounded overflow-hidden shrink-0 border bg-white">
                        <img src={selectedImgUrl} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[10px]">
                        <span className="font-bold text-slate-700 block">Imagen Vinculada</span>
                        <span className="text-slate-400 font-mono text-[9px] truncate max-w-xs block">{selectedImgUrl.substring(0, 45)}...</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddQuoteItem}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-lg transition"
                  >
                    + Agregar Concepto a Cotización
                  </button>
                </div>
              </div>

              {/* Right: Items detail and Submit */}
              <div className="lg:w-1/2 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between border-b pb-2">
                  <span>Detalle de Cotización a Generar</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                    {quoteItems.length} Conceptos
                  </span>
                </h3>

                {quoteItems.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center italic text-slate-450 text-xs">
                    No has agregado ningún concepto para cotizar todavía. Utiliza el formulario de la izquierda.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {quoteItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                          <div className="w-11 h-11 rounded overflow-hidden shrink-0 border bg-white">
                            <img src={item.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 text-xs">
                            <h4 className="font-extrabold text-slate-900 truncate">{item.name}</h4>
                            <p className="text-slate-500 text-[10px] truncate">{item.description}</p>
                            <span className="text-[10px] font-mono font-bold text-slate-600">
                              {item.quantity} x ${item.price.toLocaleString('es-MX')}
                            </span>
                          </div>
                          <div className="text-right font-mono text-xs font-black text-slate-900 px-2">
                            ${(item.price * item.quantity).toLocaleString('es-MX')}
                          </div>
                          <button
                            onClick={() => handleRemoveQuoteItem(index)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Notes and financial summary */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">NOTAS / CONDICIONES COMERCIALES (OPCIONAL)</label>
                        <textarea
                          rows={2}
                          value={quoteNotes}
                          onChange={(e) => setQuoteNotes(e.target.value)}
                          placeholder="Ej. Tiempo de ejecución estimado 4 días hábiles..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      {/* Math Summary breakdown */}
                      <div className="border-t border-slate-200 pt-3 space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>Subtotal:</span>
                          <span>${quoteItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>IVA Trasladado (16.00%):</span>
                          <span>${(quoteItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-slate-950 font-black border-t border-slate-200 pt-1.5 text-sm bg-amber-500/10 p-1.5 rounded">
                          <span>Total de Obra:</span>
                          <span>${(quoteItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCreateQuotationSubmit}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Generar Cotización y Ver PDF</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* === C. PEDIDOS (SALES ORDERS WORKSPACE) === */}
        {activeModule === 'pedidos' && (
          <div className="space-y-6">
            
            {/* Convert accepted pending quotes section */}
            <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-4">
              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Cierre de Trato: Conversión rápida de Cotizaciones a "Pedido"
              </h4>
              <p className="text-[11px] text-indigo-700 mb-3">
                Selecciona cualquier cotización aprobada o pendiente para registrar anticipo, asignar fecha de entrega y pasarlo a talleres de producción.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quotations
                  .filter(q => q.status === 'pendiente' || q.status === 'aceptada')
                  .map(q => {
                    const isBilledInOrders = salesOrders.some(so => so.quoteId === q.id);
                    if (isBilledInOrders) return null;

                    return (
                      <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-mono text-indigo-600 font-bold">{q.folio}</span>
                          <h5 className="text-xs font-bold text-slate-900 mt-0.5">{q.clientName}</h5>
                          <span className="text-[10px] text-slate-450 font-mono">${(q.total * 1.16).toLocaleString('es-MX')} MXN (Con IVA)</span>
                        </div>
                        <button
                          onClick={() => handleConvertQuoteToOrder(q)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-1 px-2.5 rounded-md shadow-sm transition"
                        >
                          Convertir a Pedido ✓
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Main Orders Directory */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Control de Pedidos Operativos Activos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {salesOrders.map(order => (
                  <div key={order.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">{order.folio}</span>
                        <h4 className="font-extrabold text-slate-900 text-xs mt-1">{order.clientName}</h4>
                      </div>

                      <select
                        value={order.status}
                        onChange={(e) => {
                          const nextStatus = e.target.value as any;
                          setSalesOrders(salesOrders.map(o => o.id === order.id ? { ...o, status: nextStatus } : o));
                        }}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                          order.status === 'entregado' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          order.status === 'listo_entrega' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                          order.status === 'en_producción' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        <option value="en_diseño">En Diseño</option>
                        <option value="en_producción">En Producción</option>
                        <option value="listo_entrega">Listo para Entrega</option>
                        <option value="entregado">Entregado</option>
                      </select>
                    </div>

                    {/* Order concept items list */}
                    <div className="bg-white border border-slate-150 rounded-xl p-2.5 space-y-1.5 text-[11px]">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-700">
                          <span className="truncate pr-4">• {it.quantity}x {it.name}</span>
                          <span className="font-mono text-[10px]">${(it.price * it.quantity).toLocaleString('es-MX')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Financial details summary: Anticipo + Saldo */}
                    <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-100/60 rounded-xl border border-slate-150">
                      <div>
                        <span className="text-[9px] text-slate-450 font-mono block uppercase">Total Pedido</span>
                        <span className="text-[11px] font-bold text-slate-900 font-mono">${order.total.toLocaleString('es-MX')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-450 font-mono block uppercase">Anticipo</span>
                        <span className="text-[11px] font-bold text-emerald-700 font-mono">${order.downpayment.toLocaleString('es-MX')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-450 font-mono block uppercase">Saldo Pendiente</span>
                        <span className="text-[11px] font-bold text-rose-700 font-mono">${order.balance.toLocaleString('es-MX')}</span>
                      </div>
                    </div>

                    {/* PM and Delivery schedule */}
                    <div className="flex justify-between items-center pt-1 text-[10px] text-slate-500 font-medium">
                      <span>Responsable: <strong className="text-slate-850 font-bold">{order.projectManager}</strong></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        Entrega: <strong className="text-indigo-600 font-bold">{order.deliveryDate}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* === D. AGENDA DE VENTAS (CALENDAR COMPONENT) === */}
        {activeModule === 'agenda' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left Form: Add appointment */}
              <div className="lg:w-2/5 bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  Agendar Cita o Compromiso
                </h3>

                <form onSubmit={handleAddAppointment} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">CLIENTE / PROSPECTO</label>
                    <input
                      type="text"
                      required
                      placeholder="Inmobiliaria Delta S.A."
                      value={apClientName}
                      onChange={(e) => setApClientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">TÍTULO DEL COMPROMISO</label>
                    <input
                      type="text"
                      required
                      placeholder="Presentar Renders de fachada"
                      value={apTitle}
                      onChange={(e) => setApTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">TIPO DE COMPROMISO</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setApType('cita')}
                        className={`py-1.5 text-center text-xs font-bold rounded-lg border ${
                          apType === 'cita' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Presencial
                      </button>
                      <button
                        type="button"
                        onClick={() => setApType('llamada')}
                        className={`py-1.5 text-center text-xs font-bold rounded-lg border ${
                          apType === 'llamada' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Llamada
                      </button>
                      <button
                        type="button"
                        onClick={() => setApType('seguimiento')}
                        className={`py-1.5 text-center text-xs font-bold rounded-lg border ${
                          apType === 'seguimiento' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Seguimiento
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">FECHA</label>
                      <input
                        type="date"
                        required
                        value={apDate}
                        onChange={(e) => setApDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">HORA</label>
                      <input
                        type="time"
                        value={apTime}
                        onChange={(e) => setApTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">OBJETIVO / DESCRIPCIÓN</label>
                    <textarea
                      rows={2}
                      placeholder="Llevar laptop y carpeta física..."
                      value={apDesc}
                      onChange={(e) => setApDesc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition"
                  >
                    Agendar Compromiso ✓
                  </button>
                </form>
              </div>

              {/* Right List: visual calendar list of appointments */}
              <div className="lg:w-3/5 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Cronograma de Seguimiento de Citas</h3>

                <div className="grid grid-cols-1 gap-3">
                  {appointments.map(ap => (
                    <div key={ap.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex justify-between items-center hover:bg-slate-50 transition">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            ap.type === 'cita' ? 'bg-teal-100 text-teal-800' :
                            ap.type === 'llamada' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ap.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{ap.date} a las {ap.time}</span>
                        </div>
                        
                        <h4 className="font-extrabold text-slate-900 text-xs">{ap.title}</h4>
                        <p className="text-[10px] text-slate-500">Cliente: <strong className="text-slate-800 font-bold">{ap.clientName}</strong></p>
                        <p className="text-[10px] text-slate-400 italic">{ap.description}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {ap.status === 'pendiente' ? (
                          <button
                            onClick={() => {
                              setAppointments(appointments.map(a => a.id === ap.id ? { ...a, status: 'realizada' } : a));
                              alert('Compromiso completado.');
                            }}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 font-bold text-[10px] px-2.5 py-1 rounded-md transition"
                          >
                            Marcar Completada
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-bold">Realizada ✓</span>
                        )}
                        
                        <button
                          onClick={() => setAppointments(appointments.filter(a => a.id !== ap.id))}
                          className="text-[9px] text-slate-400 hover:text-red-500 font-mono"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* === E. INTERACCIONES & REQUISITOS (CONVERSATIONS LOG) === */}
        {activeModule === 'interacciones' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left Form: Add log */}
              <div className="lg:w-2/5 bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  Registrar Historial de Conversación
                </h3>

                <form onSubmit={handleAddInteractionSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">CLIENTE / EMPRESA</label>
                    <input
                      type="text"
                      required
                      placeholder="Inmobiliaria Delta S.A."
                      value={interactClientName}
                      onChange={(e) => setInteractClientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">CANAL UTILIZADO</label>
                    <select
                      value={interactType}
                      onChange={(e) => setInteractType(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden"
                    >
                      <option value="WhatsApp">WhatsApp Messenger</option>
                      <option value="Llamada">Llamada Telefónica</option>
                      <option value="Correo">Correo Electrónico</option>
                      <option value="Reunión">Reunión Presencial</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">SÍNTESIS / CONVERSACIÓN / DETALLE DEL ACUERDO</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="El cliente solicita cambiar los colores de la lona de azul a naranja..."
                      value={interactSummary}
                      onChange={(e) => setInteractSummary(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2 px-4 rounded-lg transition"
                  >
                    Registrar en Bitácora ✓
                  </button>
                </form>
              </div>

              {/* Right: History log with WhatsApp automatic follow-up reminders */}
              <div className="lg:w-3/5 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Bitácora de Conversaciones e Interacciones</span>
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-bold font-mono">IDEAS CRM</span>
                </h3>

                <div className="grid grid-cols-1 gap-3.5">
                  {interactions.map(it => (
                    <div key={it.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-950">{it.clientName}</h4>
                          <span className="text-[9px] text-slate-400 font-mono">Fecha: {it.date}</span>
                        </div>

                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                          it.type === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' :
                          it.type === 'Llamada' ? 'bg-blue-100 text-blue-800' :
                          it.type === 'Correo' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {it.type}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-150">
                        "{it.summary}"
                      </p>

                      <div className="flex justify-between items-center pt-1.5">
                        <span className="text-[10px] text-slate-450">Canal comercial de seguimiento</span>
                        
                        <button
                          onClick={() => handleSendWhatsAppReminder(it)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                            it.sentReminder 
                              ? 'bg-slate-200 text-slate-600' 
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          <span>{it.sentReminder ? 'Reenviar Recordatorio WA' : 'Enviar Recordatorio WhatsApp'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>


      {/* Simulated printable branded quote PDF overlay */}
      {pdfPreviewQuote && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest">Documento Impreso Generado</h3>
                <span className="text-[9px] text-slate-400 uppercase font-mono">IDEAS PDF Engine v1.0</span>
              </div>
              <button
                onClick={() => setPdfPreviewQuote(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-500 w-7 h-7 rounded-full flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Document body with logo */}
            <div className="border border-slate-300 rounded-xl p-5 bg-white shadow-inner font-sans text-slate-800 text-[11px] text-left">
              
              <div className="flex justify-between items-start border-b-2 border-slate-950 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-slate-950 text-white font-black px-2 py-0.5 rounded italic font-mono tracking-wider">I</span>
                    <strong className="text-xs font-black uppercase tracking-wider text-slate-950">IDEAS PUBLICIDAD ARQ</strong>
                  </div>
                  <p className="text-slate-450 text-[9px]">Paseo de la Reforma 400, CDMX | ideas.publicidad.arq@gmail.com</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">COTIZACIÓN</span>
                  <span className="font-mono font-bold text-slate-950 block">{pdfPreviewQuote.folio}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Fecha: {pdfPreviewQuote.date}</span>
                </div>
              </div>

              <div className="my-3 p-2.5 bg-slate-50 rounded border border-slate-150">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">RECEPTOR</span>
                <span className="font-bold text-slate-900 block">{pdfPreviewQuote.clientName}</span>
                {pdfPreviewQuote.clientPhone && <span className="text-slate-600 block">Teléfono: {pdfPreviewQuote.clientPhone}</span>}
                {pdfPreviewQuote.clientEmail && <span className="text-slate-600 block">Email: {pdfPreviewQuote.clientEmail}</span>}
              </div>

              <table className="w-full text-left my-3 leading-normal">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-500 text-[9px] uppercase font-bold">
                    <th className="pb-1">Concepto</th>
                    <th className="pb-1 text-center">Cant</th>
                    <th className="pb-1 text-right">P. Unitario</th>
                    <th className="pb-1 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pdfPreviewQuote.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-bold text-slate-900">{it.name}</td>
                      <td className="py-1.5 text-center font-mono">{it.quantity}</td>
                      <td className="py-1.5 text-right font-mono">${it.price.toLocaleString('es-MX')}</td>
                      <td className="py-1.5 text-right font-mono font-bold">${(it.price * it.quantity).toLocaleString('es-MX')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-end border-t border-slate-200 pt-3">
                <div className="w-1/2 text-slate-500 italic text-[9px]">
                  {pdfPreviewQuote.notes && (
                    <>
                      <strong className="text-[9px] text-slate-400 uppercase font-bold block">Condiciones comerciales:</strong>
                      <span>{pdfPreviewQuote.notes}</span>
                    </>
                  )}
                </div>
                <div className="w-1/2 font-mono space-y-1 text-right text-[11px]">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>${pdfPreviewQuote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>IVA (16%):</span>
                    <span>${(pdfPreviewQuote.total * 0.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-950 text-xs bg-slate-50 p-1 rounded border border-slate-150">
                    <span>Total de Obra:</span>
                    <span>${(pdfPreviewQuote.total * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Sharing triggers */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-450 uppercase block text-center font-bold">Enviar Cotización Branded</span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const msg = `Hola, te comparto la cotización ${pdfPreviewQuote.folio} de IDEAS - Publicidad y Arquitectura por un total de MXN $${(pdfPreviewQuote.total * 1.16).toLocaleString('es-MX', {minimumFractionDigits: 2})}. ¡Quedamos a tus órdenes!`;
                    window.open(`https://wa.me/${pdfPreviewQuote.clientPhone || ''}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>vía WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    const mailtoUrl = `mailto:${pdfPreviewQuote.clientEmail || ''}?subject=Cotización%20${pdfPreviewQuote.folio}&body=Adjunto%20cotización%20por%20$${(pdfPreviewQuote.total * 1.16).toLocaleString('es-MX')}.`;
                    window.open(mailtoUrl, '_blank');
                  }}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1"
                >
                  <Mail className="w-4 h-4" />
                  <span>vía Correo</span>
                </button>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full border border-slate-300 text-slate-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100"
              >
                <FileDown className="w-4 h-4" />
                <span>Imprimir / Descargar PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}


      {/* Convert to order prompt modal */}
      {convertingQuote && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-100 text-left animate-in zoom-in-95">
            <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5 border-b pb-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Asignar Pedido Comercial
            </h3>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs text-slate-700">
              <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono">Cotización seleccionada</span>
              <strong>{convertingQuote.clientName}</strong> ({convertingQuote.folio}) <br />
              Total de Obra: <strong className="font-mono text-indigo-600">${(convertingQuote.total * 1.16).toLocaleString('es-MX')} MXN</strong>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">REGISTRAR ANTICIPO RECIBIDO ($)</label>
                <input
                  type="number"
                  min="0"
                  max={convertingQuote.total * 1.16}
                  value={orderDownpayment}
                  onChange={(e) => setOrderDownpayment(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[9px] text-slate-400 block mt-1">
                  Saldo que queda pendiente de cobro: <strong>${Math.max(0, convertingQuote.total - orderDownpayment).toLocaleString('es-MX')} MXN</strong>
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">RESPONSABLE ASIGNADO EN TALLER</label>
                <select
                  value={orderPM}
                  onChange={(e) => setOrderPM(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                >
                  <option value="Ing. Esteban Cortázar">Ing. Esteban Cortázar (Obra Civil)</option>
                  <option value="Sofía Cruz Reyes">Sofía Cruz Reyes (Diseño Creativo)</option>
                  <option value="Carlos Ruiz Ordaz">Carlos Ruiz Ordaz (Maquetas y Talleres)</option>
                  <option value="Mateo Torres Ramos">Mateo Torres Ramos (Instalaciones)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">FECHA PROGRAMADA DE ENTREGA</label>
                <input
                  type="date"
                  required
                  value={orderDeliveryDate}
                  onChange={(e) => setOrderDeliveryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConvertingQuote(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1.5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmOrderConversion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md transition"
              >
                Aceptar y Generar Pedido ✓
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

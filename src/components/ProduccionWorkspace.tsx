import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench, CheckCircle, Calendar, ShieldCheck, Printer, Play, 
  QrCode, RefreshCw, Plus, Clock, Clipboard, Search, CheckCircle2, 
  AlertCircle, ArrowRight, User, Trash2, ShieldAlert, BadgeAlert, 
  MapPin, HelpCircle, FileDown, Layers, CheckSquare, Upload, Sparkles, X, Eye, Camera
} from 'lucide-react';
import { ServiceItem, Quotation, Delivery } from '../types';

interface ProductionJob {
  id: string;
  folio: string;
  projectName: string;
  clientName: string;
  clientPhone?: string;
  stage: 'produccion' | 'calidad' | 'entrega' | 'facturado';
  startDate: string;
  dueDate: string;
  itemsDescription: string;
  operatorName: string;
  materials: string;
  dimensions: string;
  notes?: string;
  qaChecklist: {
    estructuraAprobada: boolean;
    impresionLimpia: boolean;
    acabadosVerificados: boolean;
    empaqueListo: boolean;
  };
}

interface OperationEvent {
  id: string;
  title: string;
  projectName: string;
  clientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: 'entrega' | 'instalacion';
  status: 'pendiente' | 'completada';
  priority: 'alta' | 'media' | 'baja';
  operator: string;
  address: string;
}

interface ProduccionWorkspaceProps {
  services: ServiceItem[];
  quotations: Quotation[];
  deliveries: Delivery[];
  onToggleDeliveryStatus: (id: string) => void;
  activeTab: 'flujo' | 'agenda' | 'taller';
  setActiveTab: (tab: 'flujo' | 'agenda' | 'taller') => void;
}

export default function ProduccionWorkspace({ 
  services, 
  quotations, 
  deliveries,
  onToggleDeliveryStatus,
  activeTab,
  setActiveTab
}: ProduccionWorkspaceProps) {
  // --- LOCAL STATES ---
  
  // 1. Production jobs (proyectos en taller)
  const [jobs, setJobs] = useState<ProductionJob[]>(() => {
    const saved = localStorage.getItem('ideas_production_jobs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'job-1',
        folio: 'IDEAS-COT-0103',
        projectName: 'Stand BMW Expo Santa Fe',
        clientName: 'BMW México S.A. de C.V.',
        clientPhone: '5588229911',
        stage: 'produccion',
        startDate: '2026-06-25',
        dueDate: '2026-07-05',
        itemsDescription: 'Estructura modular de aluminio, mamparas de MDF pintadas en mate y lona brillante 13oz tensada.',
        operatorName: 'Ricardo Gómez',
        materials: 'Aluminio reforzado, MDF 6mm, Pintura Mate, Lona 13oz, Tiras LED',
        dimensions: '6.00 x 6.00 x 3.50 metros',
        notes: 'Urgente entregar para montaje nocturno el día 4 de julio.',
        qaChecklist: {
          estructuraAprobada: true,
          impresionLimpia: false,
          acabadosVerificados: false,
          empaqueListo: false
        }
      },
      {
        id: 'job-2',
        folio: 'IDEAS-COT-0101',
        projectName: 'Renders Fachada Lomas',
        clientName: 'Inmobiliaria Delta S.A.',
        clientPhone: '5512345678',
        stage: 'calidad',
        startDate: '2026-06-26',
        dueDate: '2026-06-30',
        itemsDescription: '4 Renders fotorrealistas con iluminación diurna y nocturna.',
        operatorName: 'Sofía Cruz Reyes',
        materials: 'Renderizado digital, texturas alta res.',
        dimensions: '3840 x 2160 px (4K)',
        notes: 'Cliente solicitó renders adicionales de paisajismo exterior.',
        qaChecklist: {
          estructuraAprobada: true,
          impresionLimpia: true,
          acabadosVerificados: true,
          empaqueListo: false
        }
      },
      {
        id: 'job-3',
        folio: 'IDEAS-COT-0102',
        projectName: 'Vinilos el Portal',
        clientName: 'Restaurante El Portal',
        clientPhone: '5598765432',
        stage: 'entrega',
        startDate: '2026-06-28',
        dueDate: '2026-07-02',
        itemsDescription: 'Rotulación completa en vinilo esmerilado mate con logotipo calado.',
        operatorName: 'Carlos Ruiz Ordaz',
        materials: 'Vinil autoadherible mate, esmerilado.',
        dimensions: '4.50 x 2.20 metros',
        notes: 'Instalación en sitio requiere andamios y escaleras altas.',
        qaChecklist: {
          estructuraAprobada: true,
          impresionLimpia: true,
          acabadosVerificados: true,
          empaqueListo: true
        }
      }
    ];
  });

  // 2. Agenda de Operaciones (Entregas e Instalaciones)
  const [events, setEvents] = useState<OperationEvent[]>(() => {
    const saved = localStorage.getItem('ideas_production_events');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'ev-1',
        title: 'Instalación Vinilos El Portal',
        projectName: 'Vinilos el Portal',
        clientName: 'Restaurante El Portal',
        date: '2026-06-30',
        time: '10:00',
        type: 'instalacion',
        status: 'pendiente',
        priority: 'media',
        operator: 'Carlos Ruiz Ordaz',
        address: 'Av. Insurgentes Sur 1899, Guadalupe Inn, CDMX'
      },
      {
        id: 'ev-2',
        title: 'Montaje de Estructura Stand BMW',
        projectName: 'Stand BMW Expo Santa Fe',
        clientName: 'BMW México S.A. de C.V.',
        date: '2026-07-04',
        time: '22:00',
        type: 'instalacion',
        status: 'pendiente',
        priority: 'alta',
        operator: 'Ricardo Gómez',
        address: 'Expo Santa Fe, Av. Santa Fe 270, Lomas de Santa Fe, CDMX'
      },
      {
        id: 'ev-3',
        title: 'Entrega de Muestras Lona Mate',
        projectName: 'Renders Fachada Lomas',
        clientName: 'Inmobiliaria Delta S.A.',
        date: '2026-06-29',
        time: '16:30',
        type: 'entrega',
        status: 'completada',
        priority: 'baja',
        operator: 'Sofía Cruz',
        address: 'Paseo de la Reforma 405, CDMX'
      }
    ];
  });

  // Calendar Picker State
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-06-30');

  // Scanner Simulator State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ProductionJob | null>(null);
  const [scanMessage, setScanMessage] = useState('');

  // Work Order Printer Overlay State
  const [selectedJobForPrint, setSelectedJobForPrint] = useState<ProductionJob | null>(null);

  // Create Job Form modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJobProjectName, setNewJobProjectName] = useState('');
  const [newJobClientName, setNewJobClientName] = useState('');
  const [newJobOperator, setNewJobOperator] = useState('Carlos Ruiz Ordaz');
  const [newJobMaterials, setNewJobMaterials] = useState('');
  const [newJobDimensions, setNewJobDimensions] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobFolio, setNewJobFolio] = useState('');

  // Create Event Form modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventProject, setNewEventProject] = useState('');
  const [newEventClient, setNewEventClient] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-06-30');
  const [newEventTime, setNewEventTime] = useState('09:00');
  const [newEventType, setNewEventType] = useState<'entrega' | 'instalacion'>('entrega');
  const [newEventPriority, setNewEventPriority] = useState<'alta' | 'media' | 'baja'>('media');
  const [newEventOperator, setNewEventOperator] = useState('');
  const [newEventAddress, setNewEventAddress] = useState('');

  // Persist State
  useEffect(() => {
    localStorage.setItem('ideas_production_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('ideas_production_events', JSON.stringify(events));
  }, [events]);

  // Audio simulation beep ref for QR scanner
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- ACTIONS ---

  const handleAdvanceStage = (id: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === id) {
        let nextStage: 'produccion' | 'calidad' | 'entrega' | 'facturado' = 'produccion';
        if (job.stage === 'produccion') nextStage = 'calidad';
        else if (job.stage === 'calidad') nextStage = 'entrega';
        else if (job.stage === 'entrega') nextStage = 'facturado';
        else nextStage = 'facturado'; // stay on facturado
        
        return { ...job, stage: nextStage };
      }
      return job;
    }));
  };

  const handleRegressionStage = (id: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === id) {
        let prevStage: 'produccion' | 'calidad' | 'entrega' | 'facturado' = 'produccion';
        if (job.stage === 'facturado') prevStage = 'entrega';
        else if (job.stage === 'entrega') prevStage = 'calidad';
        else if (job.stage === 'calidad') prevStage = 'produccion';
        
        return { ...job, stage: prevStage };
      }
      return job;
    }));
  };

  const handleToggleQa = (jobId: string, item: 'estructuraAprobada' | 'impresionLimpia' | 'acabadosVerificados' | 'empaqueListo') => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          qaChecklist: {
            ...job.qaChecklist,
            [item]: !job.qaChecklist[item]
          }
        };
      }
      return job;
    }));
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobProjectName.trim() || !newJobClientName.trim()) return;

    const newJ: ProductionJob = {
      id: `job-${Date.now()}`,
      folio: newJobFolio || `IDEAS-COT-${Math.floor(1000 + Math.random() * 9000)}`,
      projectName: newJobProjectName,
      clientName: newJobClientName,
      stage: 'produccion',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0], // 7 days from now
      itemsDescription: newJobDesc || 'Producción general de publicidad/letrero',
      operatorName: newJobOperator,
      materials: newJobMaterials || 'Materiales estándar (Vinil, Lona, Alambre)',
      dimensions: newJobDimensions || 'Medida estándar en campo',
      qaChecklist: {
        estructuraAprobada: false,
        impresionLimpia: false,
        acabadosVerificados: false,
        empaqueListo: false
      }
    };

    setJobs([newJ, ...jobs]);
    setShowCreateModal(false);

    // Reset
    setNewJobProjectName('');
    setNewJobClientName('');
    setNewJobMaterials('');
    setNewJobDimensions('');
    setNewJobDesc('');
    setNewJobFolio('');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEv: OperationEvent = {
      id: `ev-${Date.now()}`,
      title: newEventTitle,
      projectName: newEventProject || 'Proyecto General',
      clientName: newEventClient || 'Público General',
      date: newEventDate,
      time: newEventTime,
      type: newEventType,
      status: 'pendiente',
      priority: newEventPriority,
      operator: newEventOperator || 'Operador Asignado',
      address: newEventAddress || 'Instalación en Taller IDEAS'
    };

    setEvents([newEv, ...events]);
    setShowEventModal(false);

    // Reset
    setNewEventTitle('');
    setNewEventProject('');
    setNewEventClient('');
    setNewEventAddress('');
    setNewEventOperator('');
  };

  const handleToggleEventStatus = (id: string) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: ev.status === 'pendiente' ? 'completada' : 'pendiente' } : ev));
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido del taller?')) {
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  const handleImportQuotation = (quote: Quotation) => {
    if (jobs.some(j => j.folio === quote.folio)) {
      alert(`El folio ${quote.folio} ya está en flujo de producción.`);
      return;
    }

    const itemNames = quote.items.map(i => `${i.name} (x${i.quantity})`).join(', ');

    const importedJob: ProductionJob = {
      id: `job-${Date.now()}`,
      folio: quote.folio,
      projectName: `Orden ${quote.clientName}`,
      clientName: quote.clientName,
      clientPhone: quote.clientPhone,
      stage: 'produccion',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      itemsDescription: itemNames || 'Estructura e impresión publicitaria',
      operatorName: 'Carlos Ruiz Ordaz',
      materials: 'Por definir (Ver cotización)',
      dimensions: 'Medidas especificadas en diseño',
      notes: quote.notes || '',
      qaChecklist: {
        estructuraAprobada: false,
        impresionLimpia: false,
        acabadosVerificados: false,
        empaqueListo: false
      }
    };

    setJobs([importedJob, ...jobs]);
    alert(`Pedido con Folio "${quote.folio}" importado con éxito a la mesa de Producción.`);
  };

  // Simulated QR scan action
  const handleSimulateScan = (job: ProductionJob) => {
    setIsScanning(true);
    setScanResult(null);
    setScanMessage('Encendiendo cámara del taller... Leyendo Código QR...');
    
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(job);
      setScanMessage('¡CÓDIGO QR LEÍDO CON ÉXITO! Sincronizando datos de producción.');
      
      // Simulated browser beep (using a synthesized Web Audio Beep!)
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // Beep frequency
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12); // Short beep
      } catch (err) {
        console.log('No audio context initialized yet', err);
      }
    }, 1500);
  };

  // Calendar Days generator (Month of June/July 2026)
  const CAL_DAYS = [
    { num: 28, str: '2026-06-28', isCurrentMonth: true },
    { num: 29, str: '2026-06-29', isCurrentMonth: true },
    { num: 30, str: '2026-06-30', isCurrentMonth: true, isToday: true }, // Today
    { num: 1, str: '2026-07-01', isCurrentMonth: false },
    { num: 2, str: '2026-07-02', isCurrentMonth: false },
    { num: 3, str: '2026-07-03', isCurrentMonth: false },
    { num: 4, str: '2026-07-04', isCurrentMonth: false },
    { num: 5, str: '2026-07-05', isCurrentMonth: false },
    { num: 6, str: '2026-07-06', isCurrentMonth: false },
    { num: 7, str: '2026-07-07', isCurrentMonth: false }
  ];

  // Helper stats
  const pendingJobsCount = jobs.filter(j => j.stage !== 'facturado').length;
  const qaPendingCount = jobs.filter(j => j.stage === 'calidad').length;
  const deliveryPendingCount = jobs.filter(j => j.stage === 'entrega').length;

  return (
    <div className="space-y-6">
      
      {/* 1. Primary Operational Production KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-200/50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-purple-600 tracking-wider uppercase block">Pedidos en Taller</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {jobs.filter(j => j.stage === 'produccion').length}
            </span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">Manufactura activa y corte</span>
          </div>
          <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-200/50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-amber-700 tracking-wider uppercase block">En Control de Calidad</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {qaPendingCount}
            </span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">Pruebas, firmas e inspección</span>
          </div>
          <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700">
            <Clipboard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block">Pendientes de Entrega</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {deliveryPendingCount}
            </span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">Logística y envíos listos</span>
          </div>
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-200/50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase block">Facturados / Archivados</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {jobs.filter(j => j.stage === 'facturado').length}
            </span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">Sincronizados en carpeta fiscal</span>
          </div>
          <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. PERSISTENT WORKSPACE NAVIGATION - Desktop side (right) and Tablet/Mobile (bottom/inside) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT CANVAS AREA (9 COLS) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: FLUJO DE PRODUCCIÓN (KANBAN & LIST) */}
          {activeTab === 'flujo' && (
            <div className="space-y-6 animate-in fade-in duration-250">
              
              {/* Header Action Row */}
              <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600 animate-pulse" />
                    Tablero de Manufactura de Pedidos
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mueve el progreso de los letreros, stands y anuncios luminosos en tiempo real.</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-1.8 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Pedido</span>
                  </button>
                </div>
              </div>

              {/* Kanban Interactive Columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* COLUMN 1: PRODUCCION */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2 border-slate-250">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block animate-pulse" />
                      1. Producción
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {jobs.filter(j => j.stage === 'produccion').length}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {jobs.filter(j => j.stage === 'produccion').length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-[11px] bg-white border border-dashed rounded-xl">
                        Taller despejado.
                      </div>
                    ) : (
                      jobs.filter(j => j.stage === 'produccion').map(job => (
                        <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-purple-400 transition-all space-y-2.5 relative group">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[9px] font-mono font-bold text-slate-400 block">{job.folio}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleSimulateScan(job)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-50"
                                  title="Escanear QR"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setSelectedJobForPrint(job)}
                                  className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-50"
                                  title="Imprimir Orden"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <strong className="text-slate-900 text-xs block font-extrabold mt-0.5">{job.projectName}</strong>
                            <span className="text-[10px] text-slate-500 block">Cliente: {job.clientName}</span>
                          </div>

                          <div className="text-[10px] bg-slate-50 p-2 rounded-lg text-slate-600 line-clamp-2 leading-relaxed">
                            {job.itemsDescription}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t pt-2 mt-1">
                            <span className="flex items-center gap-1 font-medium">
                              <User className="w-3.5 h-3.5 text-slate-400" /> {job.operatorName.split(' ')[0]}
                            </span>
                            <span className="text-rose-600 font-mono font-bold text-[9px] bg-rose-50 px-1.5 py-0.5 rounded">
                              Vence: {job.dueDate.slice(5)}
                            </span>
                          </div>

                          {/* Move stage action */}
                          <button
                            onClick={() => handleAdvanceStage(job.id)}
                            className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] py-1.5 rounded-lg border border-purple-200 transition flex items-center justify-center gap-1 mt-1"
                          >
                            <span>A Calidad</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* COLUMN 2: CALIDAD */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2 border-slate-250">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
                      2. Calidad
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {jobs.filter(j => j.stage === 'calidad').length}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {jobs.filter(j => j.stage === 'calidad').length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-[11px] bg-white border border-dashed rounded-xl">
                        Sin letreros en QA.
                      </div>
                    ) : (
                      jobs.filter(j => j.stage === 'calidad').map(job => (
                        <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-amber-400 transition-all space-y-2.5 relative">
                          <div>
                            <span className="text-[9px] font-mono font-bold text-slate-400 block">{job.folio}</span>
                            <strong className="text-slate-900 text-xs block font-extrabold mt-0.5">{job.projectName}</strong>
                            <span className="text-[10px] text-slate-500 block">Operador: {job.operatorName}</span>
                          </div>

                          {/* QA Checklist Toggles */}
                          <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100 space-y-1.5 text-[10px] text-left">
                            <span className="text-[8px] font-bold text-amber-800 uppercase tracking-widest block font-mono">Puntos de Inspección:</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={job.qaChecklist.estructuraAprobada} 
                                onChange={() => handleToggleQa(job.id, 'estructuraAprobada')}
                                className="rounded text-amber-600 focus:ring-0 w-3.5 h-3.5"
                              />
                              <span className={job.qaChecklist.estructuraAprobada ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-bold'}>Estructura Correcta</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={job.qaChecklist.impresionLimpia} 
                                onChange={() => handleToggleQa(job.id, 'impresionLimpia')}
                                className="rounded text-amber-600 focus:ring-0 w-3.5 h-3.5"
                              />
                              <span className={job.qaChecklist.impresionLimpia ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-bold'}>Impresión Limpia</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={job.qaChecklist.acabadosVerificados} 
                                onChange={() => handleToggleQa(job.id, 'acabadosVerificados')}
                                className="rounded text-amber-600 focus:ring-0 w-3.5 h-3.5"
                              />
                              <span className={job.qaChecklist.acabadosVerificados ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-bold'}>Acabados Sin Rayaduras</span>
                            </label>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleRegressionStage(job.id)}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] py-1.5 rounded-lg border transition"
                            >
                              Regresar
                            </button>
                            <button
                              onClick={() => handleAdvanceStage(job.id)}
                              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] py-1.5 rounded-lg shadow-xs transition flex items-center justify-center gap-1"
                            >
                              <span>Aprobar</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* COLUMN 3: ENTREGA */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2 border-slate-250">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block animate-bounce" />
                      3. En Entrega
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {jobs.filter(j => j.stage === 'entrega').length}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {jobs.filter(j => j.stage === 'entrega').length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-[11px] bg-white border border-dashed rounded-xl">
                        Ninguno listo.
                      </div>
                    ) : (
                      jobs.filter(j => j.stage === 'entrega').map(job => (
                        <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-blue-400 transition-all space-y-2.5 relative">
                          <div>
                            <span className="text-[9px] font-mono font-bold text-slate-400 block">{job.folio}</span>
                            <strong className="text-slate-900 text-xs block font-extrabold mt-0.5">{job.projectName}</strong>
                            <span className="text-[10px] text-slate-500 block">Cliente: {job.clientName}</span>
                          </div>

                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-2 text-[10px] text-emerald-800">
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Aprobado por Calidad</span>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleRegressionStage(job.id)}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] py-1.5 rounded-lg border transition"
                            >
                              Regresar
                            </button>
                            <button
                              onClick={() => handleAdvanceStage(job.id)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] py-1.5 rounded-lg shadow-xs transition flex items-center justify-center gap-1"
                            >
                              <span>Entregado</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* COLUMN 4: FACTURADO / TERMINADO */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2 border-slate-250">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                      4. Facturado
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {jobs.filter(j => j.stage === 'facturado').length}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {jobs.filter(j => j.stage === 'facturado').length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-[11px] bg-white border border-dashed rounded-xl">
                        Historial vacío.
                      </div>
                    ) : (
                      jobs.filter(j => j.stage === 'facturado').map(job => (
                        <div key={job.id} className="bg-white/80 border border-slate-150 rounded-xl p-3 shadow-xs space-y-2 relative opacity-90 hover:opacity-100 transition">
                          <div>
                            <span className="text-[9px] font-mono text-slate-400 block">{job.folio}</span>
                            <strong className="text-slate-800 text-xs block font-bold truncate">{job.projectName}</strong>
                            <span className="text-[9px] text-slate-400 block">Completado por taller</span>
                          </div>

                          <div className="text-[10px] bg-emerald-50/50 p-1.5 rounded border border-emerald-100 text-emerald-800 flex items-center gap-1 font-mono font-bold justify-center uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Proceso Concluido</span>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => handleRegressionStage(job.id)}
                              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[9px] py-1 rounded transition"
                            >
                              Reabrir
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1 rounded border border-rose-100 transition shrink-0"
                              title="Eliminar registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Import Orders direkt from Ventas Accepted Quotations */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 text-left">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-purple-600 animate-spin-slow" />
                  Importar Pedidos Autorizados de Ventas
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Los presupuestos aceptados por los clientes en Ventas Comercial se listan aquí de manera automática para ser liberados a talleres físicos.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-1">
                  {quotations.filter(q => q.status === 'aceptada' && !jobs.some(j => j.folio === q.folio)).length === 0 ? (
                    <div className="col-span-full text-center py-6 bg-slate-50 border border-dashed rounded-xl text-slate-400 text-xs">
                      No hay nuevas cotizaciones autorizadas listas para producción en este instante.
                    </div>
                  ) : (
                    quotations.filter(q => q.status === 'aceptada' && !jobs.some(j => j.folio === q.folio)).map(quote => (
                      <div key={quote.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center gap-4 hover:bg-slate-100 transition">
                        <div>
                          <span className="font-mono text-[9px] text-slate-400 font-bold block">{quote.folio}</span>
                          <strong className="text-slate-800 text-xs block truncate max-w-[200px]">{quote.clientName}</strong>
                          <span className="text-[10px] text-slate-500 block truncate font-medium">Monto: ${quote.total.toLocaleString()} MXN</span>
                        </div>
                        <button
                          onClick={() => handleImportQuotation(quote)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg shadow-xs transition shrink-0"
                        >
                          Iniciar Producción
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AGENDA DE OPERACIONES (FIELD DELIVERIES AND INSTALLATIONS) */}
          {activeTab === 'agenda' && (
            <div className="space-y-6 animate-in fade-in duration-250">
              
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Agenda de Operaciones e Instalaciones
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Calendario de coordinación de cuadrillas y entregas logísticas en campo.</p>
                </div>
                
                <button
                  onClick={() => {
                    setNewEventDate(selectedCalendarDate);
                    setShowEventModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.8 rounded-xl flex items-center gap-1.5 transition shadow-xs w-full md:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Programar Entrega/Instalación</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* CALENDAR MONTH/WEEK SELECTOR (4 Cols) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs text-left">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest font-mono">Junio - Julio 2026</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">GMT-6 CDMX</span>
                  </div>

                  {/* Month Calendar Grid Simulator */}
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
                      <span key={d} className="text-[10px] font-bold text-slate-400 py-1">{d}</span>
                    ))}
                    
                    {CAL_DAYS.map((day, idx) => {
                      const isSelected = day.str === selectedCalendarDate;
                      const hasEvents = events.some(ev => ev.date === day.str);
                      const isCompleted = events.some(ev => ev.date === day.str && ev.status === 'completada');

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedCalendarDate(day.str)}
                          className={`aspect-square rounded-xl p-1.5 flex flex-col justify-between items-center relative transition-all border ${
                            isSelected 
                              ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs' 
                              : day.isToday
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-extrabold'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="text-xs font-black font-mono">{day.num}</span>
                          
                          {/* Event indicator microdots */}
                          {hasEvents && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500 animate-ping'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-500 leading-normal border border-slate-150 space-y-1">
                    <span className="font-bold text-slate-800 block">Instrucciones de Agenda:</span>
                    <p>• Haz clic en una fecha con punto azul para consultar las salidas logísticas agendadas.</p>
                    <p>• Puedes arrastrar, agregar o marcar eventos completados al regresar de las obras.</p>
                  </div>
                </div>

                {/* EVENTS LIST FOR SELECTED DATE (7 Cols) */}
                <div className="lg:col-span-7 space-y-3.5 text-left">
                  
                  <div className="border-b pb-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Operaciones agendadas: {selectedCalendarDate === '2026-06-30' ? 'Hoy (30 Jun)' : selectedCalendarDate}
                    </h4>
                  </div>

                  {events.filter(ev => ev.date === selectedCalendarDate).length === 0 ? (
                    <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-xs text-slate-400">
                      <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-medium">No hay entregas ni instalaciones programadas para este día.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.filter(ev => ev.date === selectedCalendarDate).map(ev => (
                        <div 
                          key={ev.id} 
                          className={`bg-white border rounded-xl p-4 shadow-xs transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 ${
                            ev.status === 'completada' ? 'border-slate-200 opacity-75' : 'border-blue-100 bg-gradient-to-b from-blue-50/10 to-white'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                ev.type === 'instalacion' 
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {ev.type === 'instalacion' ? 'Instalación en campo' : 'Entrega de material'}
                              </span>

                              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                ev.priority === 'alta' 
                                  ? 'bg-rose-100 text-rose-800' 
                                  : ev.priority === 'media'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-600'
                              }`}>
                                Prioridad: {ev.priority}
                              </span>

                              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 ml-auto">
                                <Clock className="w-3 h-3 text-slate-300" /> {ev.time} hrs
                              </span>
                            </div>

                            <strong className="text-slate-900 text-xs block font-extrabold truncate">{ev.title}</strong>
                            <p className="text-[10px] text-slate-500 font-medium">Cliente: {ev.clientName} | Proyecto: {ev.projectName}</p>
                            
                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span className="truncate">{ev.address}</span>
                            </p>
                          </div>

                          <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto items-end">
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded block">
                              Operario: {ev.operator}
                            </span>
                            
                            <button
                              onClick={() => handleToggleEventStatus(ev.id)}
                              className={`w-full sm:w-auto text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg border transition ${
                                ev.status === 'completada' 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                  : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-xs'
                              }`}
                            >
                              {ev.status === 'completada' ? '✓ Completado' : 'Pendiente / Salida'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STATS AREA */}
                  <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 space-y-3 shadow-md">
                    <h5 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      Consola Logística de Entregas
                    </h5>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="block text-white font-extrabold font-mono text-sm">
                          {events.filter(e => e.status === 'pendiente').length}
                        </span>
                        <span className="text-[8px] text-slate-450 uppercase block mt-0.5">Pendientes</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="block text-emerald-400 font-extrabold font-mono text-sm">
                          {events.filter(e => e.status === 'completada').length}
                        </span>
                        <span className="text-[8px] text-slate-450 uppercase block mt-0.5">Terminadas</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="block text-indigo-400 font-extrabold font-mono text-sm">
                          {events.filter(e => e.type === 'instalacion').length}
                        </span>
                        <span className="text-[8px] text-slate-450 uppercase block mt-0.5">Instalaciones</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: HERRAMIENTAS DE TALLER & QR CODES */}
          {activeTab === 'taller' && (
            <div className="space-y-6 animate-in fade-in duration-250">
              
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  Herramientas Técnicas de Operario
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Generación de documentación interna de herrería y simulación de escaneo rápido de códigos QR adhesivos.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* PART A: QR SCANNER SIMULATOR */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs text-left">
                  <div className="border-b pb-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <QrCode className="w-4.5 h-4.5 text-indigo-500" />
                      Lector QR del Taller (Cámara Móvil / Tablet)
                    </h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Permite a los herreros e impresores escanear el QR pegado al bastidor para descargar planos.</p>
                  </div>

                  {/* CAMERA VIEWPORT SIMULATOR */}
                  <div className="relative aspect-video bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-center items-center p-4">
                    {isScanning ? (
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 z-10 space-y-3">
                        {/* Flashing Laser line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-lg shadow-red-500 animate-pulse top-1/2 -translate-y-1/2" />
                        
                        <Camera className="w-8 h-8 text-white animate-pulse" />
                        <span className="text-[11px] font-mono text-slate-300 font-bold tracking-widest uppercase animate-bounce-short">
                          {scanMessage}
                        </span>
                        <div className="w-24 h-24 border-2 border-indigo-500 border-dashed rounded-lg animate-pulse" />
                      </div>
                    ) : scanResult ? (
                      <div className="absolute inset-0 bg-slate-900 p-4 overflow-y-auto flex flex-col justify-between text-left space-y-3 z-10 text-white">
                        <div className="flex justify-between items-start border-b border-slate-850 pb-2">
                          <div>
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded font-bold">FOLIO ENCONTRADO</span>
                            <h5 className="font-extrabold text-sm mt-1">{scanResult.projectName}</h5>
                          </div>
                          <button
                            onClick={() => setScanResult(null)}
                            className="text-slate-400 hover:text-white font-bold text-xs bg-slate-800 px-2 py-1 rounded"
                          >
                            ✕ Cerrar
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div>
                            <span className="text-slate-500 block">CLIENTE:</span>
                            <span className="text-slate-250 font-bold">{scanResult.clientName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">OPERARIO:</span>
                            <span className="text-slate-250 font-bold">{scanResult.operatorName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">DIMENSIONES:</span>
                            <span className="text-slate-250 font-bold">{scanResult.dimensions}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">ETAPA ACTUAL:</span>
                            <span className="text-amber-400 font-bold uppercase">{scanResult.stage}</span>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-[10px] leading-relaxed text-slate-350">
                          <strong>Materiales autorizados:</strong> {scanResult.materials}
                        </div>

                        {/* Interactive drawing file link from Design Integration */}
                        <div className="bg-indigo-950/40 border border-indigo-500/20 p-2.5 rounded-lg flex items-center justify-between gap-2">
                          <div className="truncate">
                            <span className="text-[8px] font-mono text-indigo-400 block font-bold">PLANO TÉCNICO VINCULADO</span>
                            <span className="text-[10px] text-slate-300 font-bold truncate block">Modelo_Produccion_Aprobado.ai</span>
                          </div>
                          <button
                            onClick={() => alert('Descarga de archivo de diseño exitosa en el taller.')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9px] py-1 px-2 rounded-lg transition flex items-center gap-1 shrink-0"
                          >
                            <FileDown className="w-3 h-3" />
                            <span>Descargar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 space-y-2">
                        <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
                        <span className="text-xs text-slate-400 font-medium block">Cámara lista. Selecciona un código para escanear.</span>
                      </div>
                    )}
                  </div>

                  {/* SELECT WORK QR CODE LIST TO SCAN */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">Selecciona un QR del banco de trabajo:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {jobs.map(job => (
                        <button
                          key={job.id}
                          onClick={() => handleSimulateScan(job)}
                          className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 p-2.5 rounded-xl text-left text-xs font-bold text-slate-800 transition flex items-center gap-2"
                        >
                          <QrCode className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                          <div className="truncate">
                            <span className="text-[9px] font-mono text-slate-400 block">{job.folio}</span>
                            <span className="truncate block font-bold">{job.projectName}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* PART B: DIGITAL WORK ORDER GENERATOR */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs text-left">
                  <div className="border-b pb-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clipboard className="w-4.5 h-4.5 text-indigo-500" />
                      Generador de Órdenes de Trabajo Físicas
                    </h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Genera instantáneamente la ficha técnica de herrería y rotulación con código de barras.</p>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal">
                    Selecciona cualquier orden activa en taller para abrir e imprimir la Ficha Física del Operario. Esta contiene la lista de verificación, dimensiones autorizadas y el código QR único.
                  </p>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {jobs.map(job => (
                      <div key={job.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center hover:bg-slate-100 transition gap-3">
                        <div>
                          <span className="text-[9px] font-mono text-slate-450 block font-bold">{job.folio}</span>
                          <strong className="text-slate-800 text-xs block font-extrabold truncate max-w-[180px]">{job.projectName}</strong>
                          <span className="text-[10px] text-slate-500 block truncate">Operador: {job.operatorName}</span>
                        </div>
                        <button
                          onClick={() => setSelectedJobForPrint(job)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] py-1.8 px-3 rounded-lg border border-indigo-200 transition shrink-0 flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Generar</span>
                        </button>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* RIGHT DESKTOP SIDEBAR NAVIGATION PANEL (3 COLS) */}
        {/* On mobile, this transforms into a beautiful persistent floating or centered rail as requested */}
        <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs text-left">
          
          <div className="hidden lg:block border-b pb-3">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest font-mono">Panel de Navegación</h4>
            <span className="text-[10px] text-slate-450 block mt-0.5">Control de Taller de Producción</span>
          </div>

          {/* Core Sidebar Toggles */}
          <div className="flex flex-col gap-2">
            
            <button
              onClick={() => setActiveTab('flujo')}
              className={`w-full py-2.5 px-3.5 text-xs font-black rounded-xl flex items-center gap-2.5 transition-all ${
                activeTab === 'flujo' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/10' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Layers className="w-4.5 h-4.5 shrink-0" />
              <span>1. Flujo de Producción</span>
            </button>

            <button
              onClick={() => setActiveTab('agenda')}
              className={`w-full py-2.5 px-3.5 text-xs font-black rounded-xl flex items-center gap-2.5 transition-all ${
                activeTab === 'agenda' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Calendar className="w-4.5 h-4.5 shrink-0" />
              <span>2. Agenda de Operaciones</span>
            </button>

            <button
              onClick={() => setActiveTab('taller')}
              className={`w-full py-2.5 px-3.5 text-xs font-black rounded-xl flex items-center gap-2.5 transition-all ${
                activeTab === 'taller' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Wrench className="w-4.5 h-4.5 shrink-0" />
              <span>3. Extra: Herramientas Taller</span>
            </button>

          </div>

          <div className="border-t pt-3.5 space-y-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">Operadores en Turno:</span>
            <div className="space-y-1.5 text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse" />
                <span>Carlos Ruiz (Herrería)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                <span>Ricardo Gómez (Pintura/LEDs)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                <span>Sofía Cruz (Diseño Técnico)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl text-[10px] text-slate-450 border border-slate-200 space-y-1 leading-normal">
            <span className="font-extrabold text-slate-700 block uppercase">Logística en Campo</span>
            <p>Sincronizado de manera continua con el GPS de entregas del SAT.</p>
          </div>

        </aside>

      </div>

      {/* --- WORK ORDER (ORDEN DE TRABAJO FÍSICA) printable overlay sheet modal --- */}
      {selectedJobForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-250 p-6 w-full max-w-2xl shadow-2xl space-y-6 my-8 text-left animate-in zoom-in-95 duration-200 relative">
            
            {/* Close button */}
            <button 
              onClick={() => setSelectedJobForPrint(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg p-1.5 transition"
              title="Cerrar Ficha"
            >
              <X className="w-4 h-4" />
            </button>

            {/* PRINT BODY ELEMENT */}
            <div id="print-area" className="space-y-6 p-4 border border-slate-150 rounded-xl bg-slate-50/50">
              
              {/* Printable Header */}
              <div className="flex justify-between items-start border-b pb-4 border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-black text-slate-900 italic text-sm">
                      I
                    </span>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm tracking-tight">IDEAS PUBLICIDAD Y ARQUITECTURA</h3>
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-mono">Ficha de Fabricación Técnica - Orden de Trabajo</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">{selectedJobForPrint.folio}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Impreso: 2026-06-30</span>
                </div>
              </div>

              {/* Specification Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[9px] text-slate-450 block font-mono font-bold uppercase">Nombre del Proyecto</span>
                  <strong className="text-slate-850 font-bold block">{selectedJobForPrint.projectName}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-450 block font-mono font-bold uppercase">Cliente Autorizado</span>
                  <strong className="text-slate-850 block font-bold">{selectedJobForPrint.clientName}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-450 block font-mono font-bold uppercase">Fecha de Compromiso</span>
                  <strong className="text-rose-700 font-bold font-mono block">{selectedJobForPrint.dueDate}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-450 block font-mono font-bold uppercase">Operario Asignado</span>
                  <strong className="text-slate-850 block font-bold">{selectedJobForPrint.operatorName}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-450 block font-mono font-bold uppercase">Dimensiones de Plano</span>
                  <strong className="text-slate-850 block font-bold">{selectedJobForPrint.dimensions}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-450 block font-mono font-bold uppercase">Fecha de Ingreso</span>
                  <strong className="text-slate-850 font-mono block">{selectedJobForPrint.startDate}</strong>
                </div>
              </div>

              {/* Instruction block */}
              <div className="space-y-1 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Especificaciones de Manufactura</span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {selectedJobForPrint.itemsDescription}
                </p>
              </div>

              {/* Material checklist details */}
              <div className="space-y-2 text-xs">
                <span className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Materiales Solicitados en Almacén</span>
                <div className="bg-white p-3 rounded-xl border border-slate-150 text-slate-700">
                  {selectedJobForPrint.materials}
                </div>
              </div>

              {/* PRINT CHECKLIST & QR FOOTER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 items-end">
                
                {/* Physical Signature Line */}
                <div className="space-y-6 text-center">
                  <div className="border-b border-slate-350 mx-auto w-40 h-8" />
                  <span className="text-[9px] text-slate-450 uppercase font-mono tracking-wider font-bold">Firma de Entrega de Operario</span>
                </div>

                {/* QR Code and scanner info for field */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-150 justify-end">
                  <div className="text-right text-[10px]">
                    <strong className="text-slate-800 block">Escanear Ficha QR</strong>
                    <span className="text-slate-450 leading-normal block">Para planos actualizados, bitácoras y fotos de avance de herrería.</span>
                  </div>
                  {/* Beautiful vector simulated QR code box */}
                  <div className="w-14 h-14 bg-slate-900 p-1 rounded flex items-center justify-center shrink-0">
                    <QrCode className="w-12 h-12 text-white" />
                  </div>
                </div>

              </div>

            </div>

            {/* Simulated Print Actions */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedJobForPrint(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition"
              >
                Cerrar Ficha
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Impresión simulada para la Orden: ${selectedJobForPrint.folio}. Se ha enviado el PDF de producción a la impresora del taller.`);
                  setSelectedJobForPrint(null);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Orden de Herrería (Física)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- CREATE NEW JOB FORM MODAL DIALOG --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-250 p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-purple-600" />
                Ingresar Pedido a Talleres
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3.5 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">NOMBRE DEL PROYECTO</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Anuncio Luminoso Farmacia"
                  value={newJobProjectName}
                  onChange={(e) => setNewJobProjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">CLIENTE / COBRANZA</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Farmacias Similares"
                  value={newJobClientName}
                  onChange={(e) => setNewJobClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">CÓDIGO DE FOLIO</label>
                  <input
                    type="text"
                    placeholder="IDEAS-COT-0125"
                    value={newJobFolio}
                    onChange={(e) => setNewJobFolio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono uppercase focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">OPERARIO ASIGNADO</label>
                  <select
                    value={newJobOperator}
                    onChange={(e) => setNewJobOperator(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden"
                  >
                    <option value="Carlos Ruiz Ordaz">Carlos Ruiz Ordaz</option>
                    <option value="Ricardo Gómez">Ricardo Gómez</option>
                    <option value="Sofía Cruz Reyes">Sofía Cruz Reyes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">DIMENSIONES</label>
                  <input
                    type="text"
                    placeholder="Ej. 4.00 x 1.20 metros"
                    value={newJobDimensions}
                    onChange={(e) => setNewJobDimensions(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">MATERIALES BASE</label>
                  <input
                    type="text"
                    placeholder="Ej. MDF, Leds, Acrílico"
                    value={newJobMaterials}
                    onChange={(e) => setNewJobMaterials(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">DETALLE Y REQUERIMIENTO TÉCNICO</label>
                <textarea
                  placeholder="Detalles sobre el corte, doblez, montaje, color de pintura, etc..."
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition"
                >
                  Liberar a Talleres ✓
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- CREATE NEW LOGISTICS EVENT FORM MODAL --- */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-250 p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                Agendar Entrega / Instalación en Campo
              </h3>
              <button 
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">TÍTULO DEL COMPROMISO</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Instalación Letrero Luminoso Principal"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">PROYECTO</label>
                  <input
                    type="text"
                    placeholder="Ej. Stand BMW"
                    value={newEventProject}
                    onChange={(e) => setNewEventProject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">CLIENTE</label>
                  <input
                    type="text"
                    placeholder="Ej. BMW México"
                    value={newEventClient}
                    onChange={(e) => setNewEventClient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">FECHA DE SALIDA</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">HORA</label>
                  <input
                    type="time"
                    required
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">TIPO DE SALIDA</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden"
                  >
                    <option value="entrega">Entrega Material</option>
                    <option value="instalacion">Instalación Sitio</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">PRIORIDAD</label>
                  <select
                    value={newEventPriority}
                    onChange={(e) => setNewEventPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">ENCARGADO OBRAS</label>
                  <input
                    type="text"
                    placeholder="Ej. Carlos Ruiz"
                    value={newEventOperator}
                    onChange={(e) => setNewEventOperator(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">DIRECCIÓN DE ENTREGA O MONTAJE</label>
                <input
                  type="text"
                  required
                  placeholder="Calle, Número, Colonia, Municipio..."
                  value={newEventAddress}
                  onChange={(e) => setNewEventAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition"
                >
                  Agendar Salida ✓
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

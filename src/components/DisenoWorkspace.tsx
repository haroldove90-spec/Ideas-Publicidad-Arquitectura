import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Download, Image as ImageIcon, FileArchive, Plus, Trash2, 
  ArrowRight, Clock, Sparkles, User, Folder, CheckCircle, ChevronRight, AlertCircle, 
  ExternalLink, Layers, ArrowLeftRight, HardDrive, RefreshCw
} from 'lucide-react';
import { ServiceItem, Quotation } from '../types';

interface ProjectFile {
  id: string;
  name: string;
  size: string;
  type: string; // 'ai' | 'cdr' | 'pdf' | 'psd' | 'dwg' | 'other'
  date: string;
  url: string; // base64 or mock URL
}

interface ReferenceImage {
  id: string;
  name: string;
  date: string;
  url: string;
}

interface DesignProject {
  id: string;
  folio: string;
  projectName: string;
  clientName: string;
  contactPhone?: string;
  stage: 'cotizacion' | 'diseno' | 'autorizacion';
  date: string;
  itemsDescription: string;
  referenceImages: ReferenceImage[];
  heavyFiles: ProjectFile[];
  notes?: string;
}

interface DisenoWorkspaceProps {
  services: ServiceItem[];
  quotations: Quotation[];
}

// Predefined preset reference images
const PRESET_REFERENCES = [
  { id: 'ref-1', name: 'Fachada Corporativa Moderna', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80' },
  { id: 'ref-2', name: 'Detalle de Acabados MDF y Madera', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80' },
  { id: 'ref-3', name: 'Stand Iluminado Modular', url: 'https://images.unsplash.com/photo-1565034946487-077786996e27?auto=format&fit=crop&w=600&q=80' }
];

export default function DisenoWorkspace({ services, quotations }: DisenoWorkspaceProps) {
  // --- STATE ---
  const [projects, setProjects] = useState<DesignProject[]>(() => {
    const saved = localStorage.getItem('diseno_projects');
    if (saved) return JSON.parse(saved);
    
    // Initial rich mock data
    return [
      {
        id: 'dp-1',
        folio: 'IDEAS-COT-0101',
        projectName: 'Renders Fachada Lomas',
        clientName: 'Inmobiliaria Delta S.A.',
        contactPhone: '5512345678',
        stage: 'diseno',
        date: '2026-06-25',
        itemsDescription: '4 Renders 3D fotorrealistas de Fachada Norte y Acceso Peatonal',
        referenceImages: [
          { id: 'img-1', name: 'Inspiración minimalista gris.jpg', date: '2026-06-25', url: PRESET_REFERENCES[0].url }
        ],
        heavyFiles: [
          { id: 'file-1', name: 'Modelo_Fachada_TorreDelta_v3.ai', size: '42.5 MB', type: 'ai', date: '2026-06-28', url: '#' },
          { id: 'file-2', name: 'Presentacion_Propuesta_Acabados.pdf', size: '12.8 MB', type: 'pdf', date: '2026-06-29', url: '#' }
        ],
        notes: 'Cliente solicitó iluminación cálida en la versión nocturna de los accesos principales.'
      },
      {
        id: 'dp-2',
        folio: 'IDEAS-COT-0103',
        projectName: 'Stand BMW Expo Santa Fe',
        clientName: 'BMW México S.A. de C.V.',
        contactPhone: '5588229911',
        stage: 'autorizacion',
        date: '2026-06-20',
        itemsDescription: 'Estructura e Impresión de Lonas y Acabados de Stand 6x6 metros',
        referenceImages: [
          { id: 'img-2', name: 'Diseño estructural stand modular.jpg', date: '2026-06-21', url: PRESET_REFERENCES[2].url },
          { id: 'img-3', name: 'Referencia materiales brillo.jpg', date: '2026-06-22', url: PRESET_REFERENCES[1].url }
        ],
        heavyFiles: [
          { id: 'file-3', name: 'BMW_Stand_Lonas_Impresion.cdr', size: '128.4 MB', type: 'cdr', date: '2026-06-26', url: '#' },
          { id: 'file-4', name: 'Renders_3D_Stand_BMW_Aprobados.pdf', size: '34.2 MB', type: 'pdf', date: '2026-06-27', url: '#' }
        ],
        notes: 'Se modificó el color de la lona del fondo por solicitud del director de marca.'
      },
      {
        id: 'dp-3',
        folio: 'IDEAS-COT-0102',
        projectName: 'Vinilos el Portal',
        clientName: 'Restaurante El Portal',
        contactPhone: '5598765432',
        stage: 'cotizacion',
        date: '2026-06-29',
        itemsDescription: 'Rotulación de Vinilo Autoadherible Mate para Muro Principal y Ventanales',
        referenceImages: [],
        heavyFiles: [],
        notes: 'Esperando fotografías reales del muro para fotomontaje.'
      }
    ];
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>('dp-1');
  const [filterStage, setFilterStage] = useState<'todos' | 'cotizacion' | 'diseno' | 'autorizacion'>('todos');
  
  // Create project form sub-states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newFolio, setNewFolio] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('diseno_projects', JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // --- HANDLERS ---
  const handleUpdateStage = (projectId: string, nextStage: 'cotizacion' | 'diseno' | 'autorizacion') => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, stage: nextStage } : p));
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newClientName.trim()) return;

    const newProj: DesignProject = {
      id: `dp-${Date.now()}`,
      folio: newFolio || `IDEAS-COT-${Math.floor(1000 + Math.random() * 9000)}`,
      projectName: newProjectName,
      clientName: newClientName,
      stage: 'cotizacion',
      date: new Date().toISOString().split('T')[0],
      itemsDescription: newDesc || 'Proyecto de diseño general',
      referenceImages: [],
      heavyFiles: [],
      notes: newNotes
    };

    setProjects([newProj, ...projects]);
    setSelectedProjectId(newProj.id);
    setShowCreateModal(false);

    // Reset Form fields
    setNewProjectName('');
    setNewClientName('');
    setNewFolio('');
    setNewDesc('');
    setNewNotes('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImg: ReferenceImage = {
          id: `ref-${Date.now()}`,
          name: file.name,
          date: new Date().toISOString().split('T')[0],
          url: reader.result as string
        };
        setProjects(prev => prev.map(p => p.id === projectId ? {
          ...p,
          referenceImages: [...p.referenceImages, newImg]
        } : p));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeavyFileUpload = (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'other';
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile: ProjectFile = {
          id: `file-${Date.now()}`,
          name: file.name,
          size: `${sizeMB} MB`,
          type: extension,
          date: new Date().toISOString().split('T')[0],
          url: reader.result as string // Persistent Base64 file link!
        };
        setProjects(prev => prev.map(p => p.id === projectId ? {
          ...p,
          heavyFiles: [...p.heavyFiles, newFile]
        } : p));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteFile = (projectId: string, fileId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      heavyFiles: p.heavyFiles.filter(f => f.id !== fileId)
    } : p));
  };

  const handleDeleteImage = (projectId: string, imgId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      referenceImages: p.referenceImages.filter(img => img.id !== imgId)
    } : p));
  };

  const handleImportQuotation = (quote: Quotation) => {
    // Check if project already exists for this quote folio
    if (projects.some(p => p.folio === quote.folio)) {
      alert(`El folio ${quote.folio} ya tiene un proyecto de diseño creado.`);
      return;
    }

    const itemsDesc = quote.items.map(i => `${i.name} (x${i.quantity})`).join(', ');

    const importedProj: DesignProject = {
      id: `dp-${Date.now()}`,
      folio: quote.folio,
      projectName: `Diseño para ${quote.clientName}`,
      clientName: quote.clientName,
      contactPhone: quote.clientPhone,
      stage: 'cotizacion',
      date: quote.date,
      itemsDescription: itemsDesc || 'Artículos cotizados sin descripción',
      referenceImages: [],
      heavyFiles: [],
      notes: quote.notes || ''
    };

    setProjects([importedProj, ...projects]);
    setSelectedProjectId(importedProj.id);
    alert(`Proyecto "${importedProj.projectName}" importado correctamente de la cotización.`);
  };

  // Filter projects list
  const filteredProjects = projects.filter(p => {
    if (filterStage === 'todos') return true;
    return p.stage === filterStage;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header Metrics specific to the Design Role */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block">Mis Diseños Activos</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {projects.filter(p => p.stage === 'diseno').length}
            </span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">Proyectos en preparación gráfica</span>
          </div>
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-200/50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-purple-600 tracking-wider uppercase block">Pendientes de Autorización</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {projects.filter(p => p.stage === 'autorizacion').length}
            </span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">Esperando firma o visto bueno</span>
          </div>
          <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-200/50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-teal-600 tracking-wider uppercase block">Almacenamiento Local</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {projects.reduce((sum, p) => sum + p.heavyFiles.length, 0)} archivos
            </span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">Técnicos (AI, Corel, PDF)</span>
          </div>
          <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. Main Work Area layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Project Pipeline and Selection (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-4 shadow-xs">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-blue-500" />
                Flujo de Proyectos
              </h3>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2 py-1 rounded flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Crear</span>
              </button>
            </div>

            {/* Quick Stages Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg text-[10px]">
              <button 
                onClick={() => setFilterStage('todos')}
                className={`py-1.5 px-1 font-bold rounded-md transition ${filterStage === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilterStage('cotizacion')}
                className={`py-1.5 px-1 font-bold rounded-md transition ${filterStage === 'cotizacion' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Cotiz.
              </button>
              <button 
                onClick={() => setFilterStage('diseno')}
                className={`py-1.5 px-1 font-bold rounded-md transition ${filterStage === 'diseno' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Diseño
              </button>
              <button 
                onClick={() => setFilterStage('autorizacion')}
                className={`py-1.5 px-1 font-bold rounded-md transition ${filterStage === 'autorizacion' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Aut.
              </button>
            </div>

            {/* Projects List with beautiful visual timeline indicators */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-[11px] text-slate-400 font-medium">No se encontraron proyectos en esta etapa.</p>
                </div>
              ) : (
                filteredProjects.map(proj => {
                  const isSelected = proj.id === selectedProjectId;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                        isSelected 
                          ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500/20' 
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div>
                          <span className="text-[9px] font-mono text-slate-450 block">{proj.folio}</span>
                          <span className="font-extrabold text-slate-900 text-xs block truncate max-w-[180px]">{proj.projectName}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{proj.clientName}</span>
                        </div>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          proj.stage === 'cotizacion' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : proj.stage === 'diseno'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {proj.stage === 'cotizacion' ? 'Cotización' : proj.stage === 'diseno' ? 'En Diseño' : 'Autorización'}
                        </span>
                      </div>

                      {/* Dynamic Micro Progress Steps */}
                      <div className="flex items-center gap-1 w-full mt-1">
                        <div className={`h-1.5 rounded-full flex-1 ${proj.stage === 'cotizacion' || proj.stage === 'diseno' || proj.stage === 'autorizacion' ? 'bg-amber-400' : 'bg-slate-200'}`} />
                        <ChevronRight className="w-2 h-2 text-slate-300" />
                        <div className={`h-1.5 rounded-full flex-1 ${proj.stage === 'diseno' || proj.stage === 'autorizacion' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                        <ChevronRight className="w-2 h-2 text-slate-300" />
                        <div className={`h-1.5 rounded-full flex-1 ${proj.stage === 'autorizacion' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-100 pt-1.5 mt-0.5">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-indigo-400" /> {proj.referenceImages.length} fotos
                        </span>
                        <span className="flex items-center gap-1">
                          <FileArchive className="w-3 h-3 text-teal-500" /> {proj.heavyFiles.length} arch.
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Import Projects directly from pending Quotations */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
              Importar de Cotizaciones
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              Vincula instantáneamente una cotización del sistema para iniciar su diseño.
            </p>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {quotations.filter(q => q.status === 'pendiente').map(quote => (
                <div key={quote.id} className="bg-white border border-slate-150 rounded-lg p-2 flex justify-between items-center text-[11px] gap-2">
                  <div className="truncate">
                    <span className="font-mono text-[9px] text-slate-400 block">{quote.folio}</span>
                    <strong className="text-slate-800 text-[10px] truncate block">{quote.clientName}</strong>
                  </div>
                  <button
                    onClick={() => handleImportQuotation(quote)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[9px] py-1 px-1.5 rounded border border-indigo-200 transition shrink-0"
                  >
                    Importar
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Selected Project Deep Workspace (8 Cols) */}
        <div className="lg:col-span-8">
          {activeProject ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs space-y-6">
              
              {/* Workspace Header Area */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm font-bold">{activeProject.folio}</span>
                    <span className="text-[10px] text-slate-400">Iniciado el {activeProject.date}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">{activeProject.projectName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Cliente: <strong>{activeProject.clientName}</strong>
                  </p>
                </div>

                {/* Stage Progress Switcher buttons */}
                <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto overflow-x-auto">
                  <button
                    onClick={() => handleUpdateStage(activeProject.id, 'cotizacion')}
                    className={`flex-1 md:flex-none py-1.5 px-3.5 text-[10px] font-extrabold rounded-lg transition whitespace-nowrap ${
                      activeProject.stage === 'cotizacion' 
                        ? 'bg-amber-400 text-slate-950 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Cotización
                  </button>
                  <ChevronRight className="w-3 h-3 text-slate-350 shrink-0 mx-0.5 hidden md:block" />
                  <button
                    onClick={() => handleUpdateStage(activeProject.id, 'diseno')}
                    className={`flex-1 md:flex-none py-1.5 px-3.5 text-[10px] font-extrabold rounded-lg transition whitespace-nowrap ${
                      activeProject.stage === 'diseno' 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    En Diseño
                  </button>
                  <ChevronRight className="w-3 h-3 text-slate-350 shrink-0 mx-0.5 hidden md:block" />
                  <button
                    onClick={() => handleUpdateStage(activeProject.id, 'autorizacion')}
                    className={`flex-1 md:flex-none py-1.5 px-3.5 text-[10px] font-extrabold rounded-lg transition whitespace-nowrap ${
                      activeProject.stage === 'autorizacion' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Autorización
                  </button>
                </div>
              </div>

              {/* Items & Requirements summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">Requerimientos Técnicos</span>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">
                    {activeProject.itemsDescription}
                  </p>
                </div>
                {activeProject.notes && (
                  <div className="space-y-1.5 flex-1 sm:border-l sm:pl-4 sm:border-slate-200">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">Notas del Proyectista</span>
                    <p className="text-xs text-slate-600 italic">
                      "{activeProject.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION A: Reference & Progress Images (Funciones Extra) */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center border-b pb-1.5 border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                    Fotografías de Referencia / Avances del Proyecto
                  </h3>
                  <label className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg py-1 px-2.5 text-[10px] font-bold text-slate-700 cursor-pointer flex items-center gap-1 transition">
                    <Upload className="w-3 h-3 text-slate-500" />
                    <span>Cargar Imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, activeProject.id)}
                      className="hidden"
                    />
                  </label>
                </div>

                {activeProject.referenceImages.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <ImageIcon className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                    <p className="text-[11px] text-slate-450 font-medium">Sin fotografías cargadas.</p>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Sube imágenes reales de fachadas, bocetos o vistas previas.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeProject.referenceImages.map(img => (
                      <div key={img.id} className="group relative aspect-video bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-indigo-500 transition-all">
                        <img src={img.url} alt={img.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-white">
                          <p className="text-[9px] font-bold truncate">{img.name}</p>
                          <span className="text-[8px] text-slate-300 mt-0.5">Subido: {img.date}</span>
                          <button
                            onClick={() => handleDeleteImage(activeProject.id, img.id)}
                            className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            title="Eliminar Imagen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION B: Heavy Work Files (Funciones Extra) */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center border-b pb-1.5 border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileArchive className="w-4 h-4 text-teal-500" />
                    Almacenamiento de Archivos Pesados de Trabajo (AI, Corel, PDF)
                  </h3>
                  <label className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg py-1 px-2.5 text-[10px] font-bold text-slate-700 cursor-pointer flex items-center gap-1 transition">
                    <Upload className="w-3 h-3 text-slate-500" />
                    <span>Cargar Archivo Técnico</span>
                    <input
                      type="file"
                      accept=".ai,.cdr,.pdf,.psd,.dwg,.jpg,.png,.zip"
                      onChange={(e) => handleHeavyFileUpload(e, activeProject.id)}
                      className="hidden"
                    />
                  </label>
                </div>

                {activeProject.heavyFiles.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <FileArchive className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                    <p className="text-[11px] text-slate-450 font-medium">Sin archivos cargados.</p>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Sube archivos pesados (.ai, .cdr, .pdf) para resguardo.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {activeProject.heavyFiles.map(file => {
                      const ext = file.type.toUpperCase();
                      const isAi = ext === 'AI';
                      const isCdr = ext === 'CDR';
                      const isPdf = ext === 'PDF';
                      const extColor = isAi 
                        ? 'bg-amber-100 text-amber-800 border-amber-300' 
                        : isCdr 
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isPdf 
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300';

                      return (
                        <div key={file.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex justify-between items-center hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3 truncate">
                            <span className={`w-10 h-10 rounded-lg border font-mono text-xs font-black flex items-center justify-center shrink-0 ${extColor}`}>
                              {ext}
                            </span>
                            <div className="truncate text-left">
                              <span className="text-xs font-bold text-slate-800 truncate block" title={file.name}>
                                {file.name}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                <span>{file.size}</span>
                                <span>•</span>
                                <span>{file.date}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {/* Download Action */}
                            <a
                              href={file.url !== '#' ? file.url : undefined}
                              download={file.name}
                              onClick={(e) => {
                                if (file.url === '#') {
                                  e.preventDefault();
                                  alert(`Descarga simulada: El archivo "${file.name}" se descargarará en producción.`);
                                }
                              }}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold p-1.5 rounded-lg border border-slate-300 transition"
                              title="Descargar Archivo Técnico"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            
                            {/* Delete Action */}
                            <button
                              onClick={() => handleDeleteFile(activeProject.id, file.id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold p-1.5 rounded-lg border border-rose-200 transition"
                              title="Eliminar Archivo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* TRANSICIÓN VISUAL A PRODUCCIÓN CHECKBOX INSTRUCTION */}
              <div className="bg-blue-50/40 border border-blue-200 p-4.5 rounded-xl space-y-2">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-blue-900 uppercase">Transición Visual hacia Producción</h4>
                    <p className="text-[11px] text-blue-800/80 leading-normal mt-1">
                      Una vez que muevas el proyecto a la etapa de <strong>"Autorización"</strong> y el cliente dé el visto bueno, el personal técnico de talleres podrá consultar los planos descargables resguardados aquí para iniciar la producción física en las prensas y herrerías de IDEAS.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
              <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
              <p className="text-slate-500 font-bold text-sm">Selecciona un proyecto de diseño para comenzar a trabajar.</p>
            </div>
          )}
        </div>

      </div>

      {/* --- CREATE NEW PROJECT MODAL DIALOG --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-250 p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                Registrar Proyecto de Diseño
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">NOMBRE DEL PROYECTO</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Fachada Delta Renders"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">RAZÓN SOCIAL / CLIENTE</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Inmobiliaria Delta S.A."
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">FOLIO COTIZACIÓN (OPCIONAL)</label>
                  <input
                    type="text"
                    placeholder="IDEAS-COT-0120"
                    value={newFolio}
                    onChange={(e) => setNewFolio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono uppercase focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">FECHA DE INICIO</label>
                  <input
                    type="text"
                    disabled
                    value={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">DESCRIPCIÓN DE REQUERIMIENTOS</label>
                <textarea
                  placeholder="Especifica los acabados, dimensiones, cantidades o renders solicitados..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">NOTAS INICIALES</label>
                <textarea
                  placeholder="Detalles adicionales relevantes para el diseño..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={1}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition"
                >
                  Registrar ✓
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { PurchaseOrder } from '../types';
import { 
  Plus, Camera, Upload, Eye, CheckCircle2, AlertOctagon, 
  Trash2, Layers, DollarSign, UserCheck, Shield, Sparkles 
} from 'lucide-react';

interface PurchaseOrdersManagerProps {
  orders: PurchaseOrder[];
  onAddOrder: (order: PurchaseOrder) => void;
  onUpdateOrderStatus: (id: string, status: 'pendiente' | 'aprobada' | 'rechazada') => void;
  role: 'Administrador' | 'Personal de Apoyo';
}

export default function PurchaseOrdersManager({
  orders,
  onAddOrder,
  onUpdateOrderStatus,
  role
}: PurchaseOrdersManagerProps) {
  const [activeSegment, setActiveSegment] = useState<'registro' | 'tablero'>(
    role === 'Personal de Apoyo' ? 'registro' : 'tablero'
  );

  // Form states
  const [formType, setFormType] = useState<'orden_compra' | 'contra_recibo'>('orden_compra');
  const [providerOrClient, setProviderOrClient] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);

  // Camera simulation state
  const [showCameraViewer, setShowCameraViewer] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Selected Order for Modal Photo detailed preview
  const [selectedPhotoOrder, setSelectedPhotoOrder] = useState<PurchaseOrder | null>(null);

  // Start real webcam if available, otherwise mock it nicely
  const handleStartCamera = async () => {
    setShowCameraViewer(true);
    setIsWebcamActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Media devices camera access denied or unavailable, using high-fidelity camera simulation instead.', err);
      setIsWebcamActive(false); // fall back to mock simulator
    }
  };

  const handleCaptureSnapshot = () => {
    if (isWebcamActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoData(dataUrl);
        // Stop stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
      setShowCameraViewer(false);
    } else {
      // Simulate snapshot immediately with simulated receipts
      captureMockReceipt();
    }
  };

  const captureMockReceipt = () => {
    // Generate a high fidelity base64 canvas representing a physical printed invoice from IDEAS
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw background crumpled receipt style
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 400, 500);
      
      // Draw border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 380, 480);
      
      // Receipt branding
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('RECIBO FISCAL PROVEEDOR', 40, 50);

      ctx.fillStyle = '#475569';
      ctx.font = '12px sans-serif';
      ctx.fillText('Nro Control: 0921-A92B', 40, 80);
      ctx.fillText('Fecha: 2026-06-03 20:06', 40, 100);
      
      // Lines
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(30, 120);
      ctx.lineTo(370, 120);
      ctx.stroke();

      // Mock item details
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('CONCEPTO: SUMINISTROS IMPRESIÓN', 40, 150);
      ctx.font = '12px sans-serif';
      ctx.fillText('Importadora S.A. de C.V.', 40, 170);
      ctx.fillText('Lonas Mate 13oz x10 rollos', 40, 190);
      ctx.fillText('Tinta UV Base x3 litros', 40, 210);

      // Barcode simulation
      ctx.fillStyle = '#000000';
      for (let i = 40; i < 350; i += 8) {
        ctx.fillRect(i, 300, Math.random() > 0.4 ? 4 : 2, 40);
      }
      ctx.fillText('IDEAS SECURE CONTROL AGENT', 110, 360);

      // Total stamp stamp
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`TOTAL: $${amount || '2,400.00'} MXN`, 40, 260);

      // Success stamp
      ctx.save();
      ctx.translate(280, 420);
      ctx.rotate(-0.2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(-50, -20, 100, 40);
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('RECIBIDO', -35, 6);
      ctx.restore();
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhotoData(dataUrl);
      setShowCameraViewer(false);
      alert('📷 Foto del recibo físico simulada exitosamente con firma digital.');
    }
  };

  const handleStopCameraFree = () => {
    if (isWebcamActive && videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setShowCameraViewer(false);
  };

  // Upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerOrClient || !amount || !description) {
      alert('Por favor, ingresa los campos requeridos');
      return;
    }

    const orderAmount = parseFloat(amount);
    if (isNaN(orderAmount)) return;

    const newOrder: PurchaseOrder = {
      id: `po-${Date.now()}`,
      folio: `${formType === 'orden_compra' ? 'OC' : 'CR'}-2026-${Math.floor(100 + Math.random() * 899)}`,
      type: formType,
      providerOrClient,
      date: new Date().toISOString().split('T')[0],
      description,
      amount: orderAmount,
      registeredBy: role === 'Personal de Apoyo' ? 'Ana Martínez (Apoyo)' : 'Administrador Ideas',
      status: 'pendiente',
      photoUrl: photoData || undefined
    };

    onAddOrder(newOrder);

    // Reset Form
    setProviderOrClient('');
    setDescription('');
    setAmount('');
    setPhotoData(null);

    alert(`¡${formType === 'orden_compra' ? 'Orden de Compra' : 'Contra-recibo'} registrada para validación!`);
    
    // Switch segmented views
    if (role === 'Administrador') {
      setActiveSegment('tablero');
    }
  };

  const getFilteredOrders = () => {
    if (role === 'Personal de Apoyo') {
      // In support mode, only show purchases registered by "Apoyo" to avoid exposing all corporate metrics
      return orders.filter(o => o.registeredBy.includes('Apoyo') || o.id.startsWith('po-'));
    }
    return orders;
  };

  return (
    <div className="flex flex-col min-h-screen pb-12 bg-slate-50">
      
      {/* Tab Segment Segmented Control under responsive style */}
      <div className="flex border-b border-slate-200 bg-white sticky top-14 z-30">
        <button
          onClick={() => setActiveSegment('registro')}
          className={`flex-1 text-center py-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeSegment === 'registro'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Registrar OC / Contra-recibo</span>
        </button>

        {role === 'Administrador' && (
          <button
            onClick={() => setActiveSegment('tablero')}
            className={`flex-1 text-center py-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeSegment === 'tablero'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Validar Tablero Admins ({orders.length})</span>
          </button>
        )}
      </div>

      {activeSegment === 'registro' ? (
        /* Form for Registering Orders or Contra-recibos */
        <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Formulario de Suministro y Recepción
            </span>
            <span className="text-[10px] font-bold text-slate-500 font-mono">
              Capturando como: ({role})
            </span>
          </div>

          <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3.5 shadow-xs">
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                id="doc-type-oc"
                type="button"
                onClick={() => setFormType('orden_compra')}
                className={`py-1.5 text-center text-xs font-bold rounded-md transition-all ${
                  formType === 'orden_compra'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Orden de Compra (OC)
              </button>
              <button
                id="doc-type-cr"
                type="button"
                onClick={() => setFormType('contra_recibo')}
                className={`py-1.5 text-center text-xs font-bold rounded-md transition-all ${
                  formType === 'contra_recibo'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Contra-recibo (CR)
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                {formType === 'orden_compra' ? 'Cliente o Destinatario de Entrega *' : 'Proveedor Remisor *'}
              </label>
              <input
                id="po-provider"
                required
                type="text"
                value={providerOrClient}
                onChange={(e) => setProviderOrClient(e.target.value)}
                placeholder={formType === 'orden_compra' ? 'Ej. Inmobiliaria Delta S.A.' : 'Ej. Distribuidor de Aluminios'}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-600 focus:outline-none bg-white font-medium"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Importe Económico Total *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs">$</span>
                  <input
                    id="po-amount"
                    required
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg pl-6 pr-2.5 py-2.5 focus:border-indigo-600 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Descripción de Materiales / Servicios entregados *
              </label>
              <textarea
                id="po-desc"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Entrega de lona impresa de 10x4m para cartelera, colocación en bastidor..."
                rows={3}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-600 focus:outline-none bg-white resize-none"
              />
            </div>

            {/* Captura fotográfica con Camera/File helper */}
            <div className="border-t border-slate-150 pt-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                Fotografía de Factura Física / Recibo de Entrega
              </label>
              
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="bg-slate-900 text-white text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                >
                  <Camera className="w-4 h-4" />
                  <span>Abrir Cámara</span>
                </button>

                <label className="flex-1 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer hover:bg-slate-50">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Subir Imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {photoData && (
                <div className="mt-3 relative inline-block p-1 bg-slate-100 rounded-lg border border-slate-300">
                  <img
                    src={photoData}
                    alt="Factura capturada"
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoData(null)}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600"
                    title="Remover Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 right-1 text-[8px] bg-black bg-opacity-75 text-white font-mono px-1 rounded">
                    Listo
                  </span>
                </div>
              )}
            </div>

            <button
              id="po-form-submit"
              type="submit"
              className="w-full mt-2.5 bg-slate-900 border border-slate-950 hover:bg-slate-850 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95"
            >
              Registrar para Validación IDEAS
            </button>
          </form>

          {/* Camera Viewfinder simulations overlay */}
          {showCameraViewer && (
            <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between p-4">
              <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3">
                <span className="text-xs font-mono">ENLAZANDO CÁMARA DISPOSITIVO</span>
                <button
                  type="button"
                  onClick={handleStopCameraFree}
                  className="bg-slate-800 text-slate-300 p-1.5 rounded-full"
                >
                  Cerrar
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-slate-950 rounded-xl my-4 border border-slate-800">
                {isWebcamActive ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400 flex flex-col items-center gap-3">
                    <Sparkles className="w-10 h-10 text-amber-400 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-white">Modo: Cámara Móvil Simulada habilitada</p>
                      <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-normal">
                        Para pruebas en sandbox o navegadores sin webcam física, crearemos un recibo digital interactivo representativo con un toque.
                      </p>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex flex-col items-center gap-3 pb-4">
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="w-16 h-16 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-600" />
                </button>
                <p className="text-[10px] text-slate-500 font-mono tracking-wider font-bold">
                  {isWebcamActive ? 'CAPTURA WEBCAM REAL' : 'SIMULAR CAPTURA DE FACTURA FÍSICA'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Administrator validation board view */
        <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex gap-2">
            <Shield className="w-5 h-5 text-purple-700 self-start shrink-0 mt-0.5" />
            <p className="text-[11px] text-purple-800 leading-normal">
              <strong>Tablero de Validación IDEAS:</strong> Como administrador, vigila los recibos ingresados por el personal de apoyo, valida contra-recibos reales y visualiza los adjuntos fotográficos.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {getFilteredOrders().length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No hay órdenes registradas aún.
              </div>
            ) : (
              getFilteredOrders().map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400">{ord.date}</span>
                      <h3 className="text-xs font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${ord.type === 'orden_compra' ? 'bg-indigo-600' : 'bg-pink-600'}`} />
                        <span>{ord.folio} - {ord.type === 'orden_compra' ? 'Orden Compra' : 'Contra-recibo'}</span>
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-700 mt-1">Beneficiario: {ord.providerOrClient}</p>
                    </div>

                    <span className={`text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full ${
                      ord.status === 'aprobada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'rechazada'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800 font-bold'
                    }`}>
                      {ord.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg font-medium leading-normal italic">
                    "{ord.description}"
                    <div className="text-[9px] text-slate-400 font-bold not-italic font-mono uppercase tracking-wider mt-1.5 border-t border-slate-200 pt-1">
                      Registrado por: {ord.registeredBy}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="text-left">
                      <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block">Monto Consolidado</span>
                      <span className="text-xs font-bold text-slate-950 font-mono">${ord.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ord.photoUrl && (
                        <button
                          onClick={() => setSelectedPhotoOrder(ord)}
                          className="bg-slate-100 text-slate-700 font-bold py-1.5 px-2.5 rounded-lg text-[10px] flex items-center gap-1 active:bg-slate-200"
                        >
                          <Camera className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ver Recibo Foto</span>
                        </button>
                      )}

                      {ord.status === 'pendiente' && role === 'Administrador' && (
                        <>
                          <button
                            onClick={() => {
                              onUpdateOrderStatus(ord.id, 'aprobada');
                              alert('Documento Aprobado y Registrado en Métricas.');
                            }}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-250 font-bold py-1.5 px-2 rounded-lg text-[10px]"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => {
                              onUpdateOrderStatus(ord.id, 'rechazada');
                              alert('Documento Rechazado.');
                            }}
                            className="bg-rose-50 text-rose-800 border border-rose-200 font-bold py-1.5 px-2 rounded-lg text-[10px]"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Pop up detailed view of physical invoice receipt capture */}
      {selectedPhotoOrder && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 flex flex-col gap-3 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Foto Adjunta de Soporte</h4>
                <p className="text-[9px] text-slate-400 font-mono">Folio: {selectedPhotoOrder.folio}</p>
              </div>
              <button
                onClick={() => setSelectedPhotoOrder(null)}
                className="bg-slate-100 p-1 rounded-full text-slate-500"
              >
                Cerrar
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center max-h-96">
              {/* If it starts with images/... we draw a highly readable fallback canvas receipt in detail */}
              {selectedPhotoOrder.photoUrl && (
                <img
                  src={selectedPhotoOrder.photoUrl}
                  alt="Captura"
                  className="w-full h-auto object-contain max-h-80"
                  onError={(e) => {
                    // Fail gracefully and use mock generator canvas
                    const imgEl = e.currentTarget;
                    imgEl.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f5f9'/><text x='50' y='50' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='8' fill='%2364748b'>Factura Física Digitalizada</text></svg>";
                  }}
                />
              )}
            </div>

            <div className="text-[11px] text-slate-500 text-center uppercase tracking-wider font-bold">
              Registrado por {selectedPhotoOrder.registeredBy} | Importe ${selectedPhotoOrder.amount.toLocaleString('es-MX')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

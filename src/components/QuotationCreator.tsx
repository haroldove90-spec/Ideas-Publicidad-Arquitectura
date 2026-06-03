/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ServiceItem, Quotation, QuotationItem, QuotationStatus } from '../types';
import { 
  FileText, Plus, Minus, Trash2, Send, CheckCircle, 
  ListPlus, ArrowRight, User, Phone, Mail, Share2, 
  MessageSquare, FileDown, Layers, FileCheck, CircleDot, X 
} from 'lucide-react';

interface QuotationCreatorProps {
  services: ServiceItem[];
  quotations: Quotation[];
  onCreateQuotation: (quote: Quotation) => void;
  onUpdateQuotationStatus: (id: string, status: QuotationStatus) => void;
  onConvertToInvoice: (quote: Quotation, rfc: string) => void;
  role: 'Administrador' | 'Personal de Apoyo';
}

export default function QuotationCreator({
  services,
  quotations,
  onCreateQuotation,
  onUpdateQuotationStatus,
  onConvertToInvoice,
  role
}: QuotationCreatorProps) {
  const [activeSubTab, setActiveSubTab] = useState<'crear' | 'historial'>('crear');
  
  // Selection state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ [serviceId: string]: number }>({});
  
  // Selected Quote for Details & PDF Mock Preview
  const [previewQuote, setPreviewQuote] = useState<Quotation | null>(null);
  const [showRfcModal, setShowRfcModal] = useState(false);
  const [targetRfc, setTargetRfc] = useState('XAXX010101000'); // Default general public RFC
  const [selectedQuoteForInvoice, setSelectedQuoteForInvoice] = useState<Quotation | null>(null);

  // Quick Client templates for the 3-click quotation flow
  const QUICK_CLIENTS = [
    { name: 'Inmobiliaria Delta S.A.', phone: '5512345678', email: 'contacto@deltabienesraices.com' },
    { name: 'Restaurante El Portal', phone: '5598765432', email: 'gerencia@elportalmexico.com' },
    { name: 'Parque Industrial Sur', phone: '5533445566', email: 'compras@industrialsur.mx' }
  ];

  const handleSelectQuickClient = (client: typeof QUICK_CLIENTS[0]) => {
    setClientName(client.name);
    setClientPhone(client.phone);
    setClientEmail(client.email);
  };

  const handleUpdateQty = (serviceId: string, delta: number) => {
    setSelectedItems(prev => {
      const current = prev[serviceId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: next };
    });
  };

  const getQuotationTotal = () => {
    return Object.keys(selectedItems).reduce((sum, id) => {
      const service = services.find(s => s.id === id);
      const qty = selectedItems[id] || 0;
      return sum + (service ? service.price * qty : 0);
    }, 0);
  };

  const handleCreateQuotation = () => {
    if (!clientName) {
      alert('Por favor, ingresa el nombre del cliente');
      return;
    }
    const total = getQuotationTotal();
    if (total <= 0) {
      alert('Por favor, agrega al menos un servicio');
      return;
    }

    const items: QuotationItem[] = Object.keys(selectedItems).map((id) => {
      const service = services.find(s => s.id === id)!;
      const qty = selectedItems[id] || 0;
      return {
        serviceId: id,
        name: service.name,
        quantity: qty,
        price: service.price
      };
    });

    const newQuote: Quotation = {
      id: `q-${Date.now()}`,
      folio: `IDEAS-COT-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName,
      clientPhone,
      clientEmail,
      date: new Date().toISOString().split('T')[0],
      items,
      total,
      status: 'pendiente',
      notes
    };

    onCreateQuotation(newQuote);
    // Reset inputs
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setNotes('');
    setSelectedItems({});
    
    // Switch to history or preview directly
    setPreviewQuote(newQuote);
    setActiveSubTab('historial');
  };

  const handleTriggerInvoiceFlow = (quote: Quotation) => {
    setSelectedQuoteForInvoice(quote);
    setShowRfcModal(true);
  };

  const handleConfirmInvoice = () => {
    if (selectedQuoteForInvoice && targetRfc) {
      onConvertToInvoice(selectedQuoteForInvoice, targetRfc);
      setShowRfcModal(false);
      setSelectedQuoteForInvoice(null);
      alert(`¡Factura timbrada exitosamente para ${selectedQuoteForInvoice.clientName}!`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-12 bg-slate-50">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 bg-white sticky top-14 z-30">
        <button
          id="tab-create-quote"
          onClick={() => setActiveSubTab('crear')}
          className={`flex-1 text-center py-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'crear'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cotización</span>
        </button>
        <button
          id="tab-history-quote"
          onClick={() => setActiveSubTab('historial')}
          className={`flex-1 text-center py-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'historial'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Historial ({quotations.length})</span>
        </button>
      </div>

      {activeSubTab === 'crear' ? (
        <div className="p-4 flex flex-col gap-5 animate-in fade-in duration-200">
          
          {/* Quick client select section - Clic 1 helper */}
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
              Paso 1: Datos del Cliente (Autorelleno con un clic)
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {QUICK_CLIENTS.map((qc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickClient(qc)}
                  className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 shrink-0 flex flex-col items-start hover:border-slate-400 text-left"
                >
                  <span className="text-[11px] font-bold text-slate-800">{qc.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-400 font-mono">{qc.phone}</span>
                </button>
              ))}
            </div>

            {/* Main manual fields */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 mt-2.5 flex flex-col gap-3 shadow-xs">
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="quote-client-name"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nombre Completo del Cliente"
                  className="w-full text-xs font-bold border-none bg-slate-50 rounded-lg pl-9 pr-3 py-2.5 focus:bg-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="quote-client-phone"
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Teléfono"
                    className="w-full text-xs font-bold border-none bg-slate-50 rounded-lg pl-9 pr-3 py-2.5 focus:bg-slate-100 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="quote-client-email"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Correo Electrónico"
                    className="w-full text-xs font-bold border-none bg-slate-50 rounded-lg pl-9 pr-3 py-2.5 focus:bg-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick-select Catalog layout - Clic 2 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Paso 2: Servicios e Insumos (Catálogo Rápido)
              </span>
              <span className="text-[10px] font-bold text-slate-800 bg-slate-200 py-0.5 px-2 rounded-full font-mono">
                {Object.keys(selectedItems).length} seleccionados
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {services.map((item) => {
                const qtySelected = selectedItems[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-xl p-3 flex items-center justify-between transition-all ${
                      qtySelected > 0 ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-1">
                        <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded-full font-bold ${
                          item.type === 'arquitectura' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.unit}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">{item.name}</h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5 font-bold">
                        ${item.price.toFixed(2)} mxn
                      </p>
                    </div>

                    {/* Touch friendly stepper buttons - Big & responsive */}
                    <div className="flex items-center gap-2.5 shrink-0 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                      {qtySelected > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 w-8 h-8 rounded-md flex items-center justify-center font-bold active:scale-90 transition-transform"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-bold font-mono text-slate-900 w-6 text-center">
                            {qtySelected}
                          </span>
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center font-bold active:scale-90 transition-transform ${
                          qtySelected > 0
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes and total summary */}
          {getQuotationTotal() > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Conceptos / Notas del Trabajo (Opcional)
                </label>
                <textarea
                  id="quote-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Tiempo de ejecución estimado 4 días habiles..."
                  rows={2}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-950 focus:outline-none bg-slate-50"
                />
              </div>

              <div className="border-t border-slate-150 mt-3 pt-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Total Cotizado</span>
                  <span className="text-lg font-bold font-mono text-slate-950">
                    ${getQuotationTotal().toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                  </span>
                </div>

                {/* Clic 3: Generar */}
                <button
                  id="generate-quote-submit"
                  type="button"
                  onClick={handleCreateQuotation}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Obtener Cotización</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* History & PDF export tab */
        <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-200">
          <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Histórico de Cotizaciones Registradas
          </span>

          <div className="flex flex-col gap-3">
            {quotations.map((quote) => (
              <div
                key={quote.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{quote.date}</span>
                    <h3 className="text-xs font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                      {quote.folio}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-600 mt-1">Cliente: {quote.clientName}</p>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      quote.status === 'facturada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : quote.status === 'aceptada'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {quote.status}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-2 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                    <span>Monto Total:</span>
                    <span className="font-mono">${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic block">{quote.items.length} conceptos: {quote.items.map(i => `${i.quantity}x ${i.name.split(' ')[0]}`).join(', ')}</p>
                </div>

                {/* Grid of actions optimized for simple cell clicks */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                  <button
                    id={`preview-quote-btn-${quote.id}`}
                    onClick={() => setPreviewQuote(quote)}
                    className="flex-1 border border-slate-200 text-slate-700 font-bold py-2 px-1 rounded-lg text-[10px] flex items-center justify-center gap-1 bg-slate-50 active:bg-slate-100"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>PDF / WhatsApp</span>
                  </button>

                  {quote.status === 'pendiente' && role === 'Administrador' && (
                    <button
                      onClick={() => {
                        onUpdateQuotationStatus(quote.id, 'aceptada');
                        alert('Cotización marcada como Aceptada. Lista para facturar.');
                      }}
                      className="flex-1 bg-amber-50 text-amber-800 border border-amber-200 font-bold py-2 px-1 rounded-lg text-[10px] flex items-center justify-center gap-1 active:bg-amber-100"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Aceptar</span>
                    </button>
                  )}

                  {quote.status === 'aceptada' && role === 'Administrador' && (
                    <button
                      onClick={() => handleTriggerInvoiceFlow(quote)}
                      className="flex-1 bg-indigo-600 text-white font-bold py-2 px-1 rounded-lg text-[10px] flex items-center justify-center gap-1 shadow-sm active:bg-indigo-700"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Facturar</span>
                    </button>
                  )}

                  {quote.status === 'facturada' && (
                    <div className="col-span-2 text-center py-2 text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1 bg-emerald-50 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Factura Timbrada</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Export & Preview Screen Modal overlay */}
      {previewQuote && (
        <div id="pdf-preview-modal" className="fixed inset-0 bg-slate-950/70 z-50 overflow-y-auto flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 flex flex-col gap-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            {/* Header Actions */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Exportar y Compartir Cotización</h3>
                <span className="text-[10px] text-slate-400">Generador de Documento Limpio</span>
              </div>
              <button
                onClick={() => setPreviewQuote(null)}
                className="bg-slate-100 text-slate-500 hover:bg-slate-200 w-7 h-7 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Clean Printed Quotation PDF */}
            <div id="simulated-pdf-body" className="border border-slate-300 rounded-xl p-5 bg-white shadow-inner select-none font-sans text-slate-800">
              {/* PDF Header with Ideas Brand */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="bg-slate-900 text-white font-extrabold px-2.5 py-1 text-sm rounded shadow-xs tracking-widest font-mono">IDEAS</span>
                    <span className="text-[9px] font-mono tracking-widest text-slate-500 font-bold">PUBLICIDAD & ARQ</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Calle Reforma 2200, Col. Centro, CDMX</span>
                  <span className="text-[9px] text-slate-400">ideaspublicidadyarq@outlook.com | Tel: 55-IDEAS-00</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">COTIZACIÓN</span>
                  <p className="text-xs font-extrabold font-mono text-slate-950">{previewQuote.folio}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Fecha: {previewQuote.date}</p>
                </div>
              </div>

              {/* PDF Client Info */}
              <div className="my-4 p-3 bg-slate-50 rounded-lg flex flex-col gap-1 text-[11px]">
                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold">CLIENTE</span>
                <p className="font-extrabold text-slate-900">{previewQuote.clientName}</p>
                {previewQuote.clientPhone && <p className="text-slate-600">Tel: {previewQuote.clientPhone}</p>}
                {previewQuote.clientEmail && <p className="text-slate-600">Email: {previewQuote.clientEmail}</p>}
              </div>

              {/* Pricing Grid */}
              <div className="my-4">
                <table className="w-full text-left text-[11px] leading-normal">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold font-mono text-slate-500 text-[9px] uppercase">
                      <th className="pb-1.5 font-bold">Concepto / Servicio</th>
                      <th className="pb-1.5 text-center font-bold">Cant.</th>
                      <th className="pb-1.5 text-right font-bold">P. Unitario</th>
                      <th className="pb-1.5 text-right font-bold">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewQuote.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-2 pr-3">
                          <p className="font-bold text-slate-900">{item.name}</p>
                        </td>
                        <td className="py-2 text-center font-bold font-mono">{item.quantity}</td>
                        <td className="py-2 text-right font-mono">${item.price.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes & Summary */}
              <div className="flex justify-between items-end gap-3 border-t border-slate-200 pt-3">
                <div className="w-1/2">
                  {previewQuote.notes && (
                    <>
                      <span className="text-[8px] font-mono tracking-wider font-extrabold text-slate-400 uppercase decoration-slate-200">Notas Adicionales:</span>
                      <p className="text-[10px] text-slate-500 mt-1 italic tracking-normal shrink whitespace-pre-wrap">{previewQuote.notes}</p>
                    </>
                  )}
                </div>
                <div className="w-1/2 flex flex-col items-end gap-1">
                  <div className="flex justify-between w-full text-[11px] font-medium text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">${(previewQuote.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-full text-[11px] font-medium text-slate-600">
                    <span>IVA (16%):</span>
                    <span className="font-mono">${(previewQuote.total * 0.16).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-full border-t border-slate-300 pt-1.5 text-xs font-bold text-slate-950 bg-slate-50 p-1.5 rounded">
                    <span>Total MXN:</span>
                    <span className="font-mono">${(previewQuote.total * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp & Email sending triggers */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase text-center mt-1">
                Enviar cotización directa al cliente
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const message = `Hola ${previewQuote.clientName}, te adjunto la cotización ${previewQuote.folio} de IDEAS - Publicidad y Arquitectura por un total de MXN $${(previewQuote.total * 1.16).toLocaleString('es-MX', {minimumFractionDigits: 2})}. ¡Quedamos a tus órdenes!`;
                    // Simulated redirect
                    window.open(`https://wa.me/${previewQuote.clientPhone || ''}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>vía WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const subject = `Cotización ${previewQuote.folio} - IDEAS`;
                    const body = `Estimado cliente, adjuntamos la cotización solicitada.\nDetalle: ${previewQuote.items.length} conceptos consultables.\nTotal: MXN $${(previewQuote.total * 1.16).toLocaleString('es-MX', {minimumFractionDigits: 2})}.`;
                    window.open(`mailto:${previewQuote.clientEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                  }}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                >
                  <Mail className="w-4 h-4" />
                  <span>vía Correo</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-full border border-slate-300 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 bg-slate-50"
              >
                <FileDown className="w-4 h-4" />
                <span>Imprimir / Descargar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RFC Modal for conversion to invoice */}
      {showRfcModal && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-sm font-extrabold text-slate-900 border-b pb-2">Información del Receptor para SFácil</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Nombre / Razón Social</label>
                <input
                  type="text"
                  disabled
                  value={selectedQuoteForInvoice?.clientName || ''}
                  className="w-full text-xs font-bold border border-slate-200 bg-slate-50 text-slate-500 rounded-lg p-2.5"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">RFC Facturación</label>
                <input
                  type="text"
                  value={targetRfc}
                  onChange={(e) => setTargetRfc(e.target.value.toUpperCase())}
                  placeholder="RFC del receptor"
                  className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg p-2.5 focus:border-indigo-600 focus:outline-none"
                />
                <span className="text-[9px] text-slate-400 block mt-1">Usa XAXX010101000 para Público General si no cuenta con RFC.</span>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRfcModal(false);
                  setSelectedQuoteForInvoice(null);
                }}
                className="px-3 py-2 border border-slate-300 text-slate-500 text-xs font-bold rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmInvoice}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow"
              >
                Timbrar Factura Nativa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

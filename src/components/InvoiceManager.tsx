/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Invoice, Quotation } from '../types';
import { 
  FileCheck, Shield, Sparkles, Copy, ExternalLink, 
  RefreshCw, CheckCircle, Smartphone, AlertCircle 
} from 'lucide-react';

interface InvoiceManagerProps {
  invoices: Invoice[];
  quotations: Quotation[];
  onTriggerManualInvoice: (invoice: Invoice) => void;
  role: 'Administrador' | 'Personal de Apoyo';
}

export default function InvoiceManager({ invoices, quotations, onTriggerManualInvoice, role }: InvoiceManagerProps) {
  const [billingTab, setBillingTab] = useState<'express' | 'sfacil'>('express');
  
  // Express Billing state
  const [selectedQuotationId, setSelectedQuotationId] = useState('');
  const [clientRfc, setClientRfc] = useState('');
  const [clientName, setClientName] = useState('');
  const [subTotalInput, setSubTotalInput] = useState('');
  const [isTimbrando, setIsTimbrando] = useState(false);

  // SFácil Assistant fields
  const [cfdiUsage, setCfdiUsage] = useState('G03 - Gastos en general');
  const [paymentMethod, setPaymentMethod] = useState('PUE - Pago en una sola exhibición');
  const [paymentForm, setPaymentForm] = useState('03 - Transferencia electrónica de fondos');
  const [satProductCode, setSatProductCode] = useState('82101503 - Servicios de publicidad difundida');

  const handleSelectQuotation = (id: string) => {
    setSelectedQuotationId(id);
    const quote = quotations.find(q => q.id === id);
    if (quote) {
      setClientName(quote.clientName);
      setSubTotalInput(quote.total.toString());
      // Try to auto fill typical RFC if matching mock clients
      if (quote.clientName.includes('Delta')) {
        setClientRfc('MDE011115DL9');
      } else if (quote.clientName.includes('Portal')) {
        setClientRfc('EPO950612PR2');
      } else if (quote.clientName.includes('Bancomer')) {
        setClientRfc('CBA920315XX2');
      } else {
        setClientRfc('XAXX010101000');
      }
    }
  };

  const handleExpressInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientRfc || !subTotalInput) {
      alert('Por favor, completa todos los campos esenciales para facturar.');
      return;
    }

    setIsTimbrando(true);

    setTimeout(() => {
      const subtotal = parseFloat(subTotalInput);
      const iva = subtotal * 0.16;
      const total = subtotal + iva;

      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        folio: `FACL-${Math.floor(10000 + Math.random() * 90000)}`,
        quotationId: selectedQuotationId || undefined,
        clientName,
        clientRfc,
        date: new Date().toISOString().split('T')[0],
        subtotal,
        iva,
        total,
        status: 'timbrada',
        xmlUrl: `XML-FACS-${Math.floor(10000 + Math.random() * 90000)}.xml`
      };

      onTriggerManualInvoice(newInvoice);
      setIsTimbrando(false);
      
      // Reset
      setSelectedQuotationId('');
      setClientRfc('');
      setClientName('');
      setSubTotalInput('');
      
      alert(`🎉 ¡Factura ${newInvoice.folio} Timbrada con Éxito ante el SAT! Su receptor recibirá el XML y PDF.`);
    }, 1500);
  };

  const handleCopySatFields = (name: string, value: string) => {
    navigator.clipboard.writeText(value);
    alert(`Copiado al portapapeles: ${name}`);
  };

  if (role === 'Personal de Apoyo') {
    return (
      <div className="p-6 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Shield className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-800">Módulo Bloqueado</h3>
        <p className="text-xs text-slate-500 max-w-xs leading-normal">
          Por políticas de organización, el personal de apoyo tiene restringido el timbrado y visibilidad de facturas o cotizaciones corporativas.
        </p>
        <span className="text-[10px] bg-sky-100 text-sky-800 font-mono font-bold px-2.5 py-1 rounded-full mt-2">
          Contacte al Administrador IDEAS
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-200">
      
      {/* Sub tabs style */}
      <div className="grid grid-cols-2 bg-slate-100 rounded-lg p-1 border border-slate-200">
        <button
          onClick={() => setBillingTab('express')}
          className={`text-center py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
            billingTab === 'express'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Opción A: Timbrado Express</span>
        </button>
        <button
          onClick={() => setBillingTab('sfacil')}
          className={`text-center py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
            billingTab === 'sfacil'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-600" />
          <span>Opción B: Asistente SFácil</span>
        </button>
      </div>

      {billingTab === 'express' ? (
        /* Native Express Simplified SAT Billing */
        <div className="flex flex-col gap-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 self-start shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-800 leading-normal">
              <strong>Timbrado Simplificado IDEAS:</strong> Creamos este panel nativo para capturar solo los datos clave del cliente y generar la factura directamente conectada al PAC.
            </p>
          </div>

          <form onSubmit={handleExpressInvoiceSubmit} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Importar Cotización Aceptada (Opcional)
              </label>
              <select
                id="invoice-select-quotation"
                value={selectedQuotationId}
                onChange={(e) => handleSelectQuotation(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 focus:border-indigo-600 focus:outline-none bg-white"
              >
                <option value="">-- Seleccionar cotización para autofill --</option>
                {quotations
                  .filter(q => q.status === 'aceptada')
                  .map(q => (
                    <option key={q.id} value={q.id}>
                      {q.folio} - {q.clientName} (${q.total.toLocaleString('es-MX')})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Razón Social del Cliente *
              </label>
              <input
                id="invoice-client-name"
                required
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Inmobiliaria Delta S.A. de C.V."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-600 focus:outline-none bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  RFC del Receptor *
                </label>
                <input
                  id="invoice-client-rfc"
                  required
                  type="text"
                  maxLength={13}
                  value={clientRfc}
                  onChange={(e) => setClientRfc(e.target.value.toUpperCase())}
                  placeholder="XAXX010101000"
                  className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 focus:border-indigo-600 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Importe Subtotal *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs">$</span>
                  <input
                    id="invoice-subtotal-price"
                    required
                    type="number"
                    step="0.01"
                    value={subTotalInput}
                    onChange={(e) => setSubTotalInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-xs border border-slate-300 rounded-lg pl-6 pr-2 py-2.5 focus:border-indigo-600 focus:outline-none bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-150 pt-2.5 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[9px] text-slate-400 font-mono block">IVA (16% Incluido)</span>
                <span className="text-xs font-bold text-slate-500">
                  Total Estimado: ${subTotalInput ? (parseFloat(subTotalInput) * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'} mxn
                </span>
              </div>

              <button
                id="invoice-timbrar-submit"
                type="submit"
                disabled={isTimbrando}
                className="bg-indigo-600 font-bold hover:bg-indigo-700 text-white text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow active:scale-95 transition-all disabled:opacity-50"
              >
                {isTimbrando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Timbrando SAT...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Timbrar Factura</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Recently Invoiced List */}
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
              Últimas Facturas Emitidas
            </span>
            <div className="flex flex-col gap-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-900">{inv.folio}</span>
                      <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100 rounded-full py-0.2 px-1.5 font-bold uppercase">
                        SAT OK
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">Cliente: {inv.clientName}</p>
                    <p className="text-[9px] text-slate-400 font-mono">RFC: {inv.clientRfc} | Fecha: {inv.date}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-bold font-mono text-slate-900">${inv.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    <button
                      onClick={() => alert(`Visualizando archivo descargable para CFDIs SAT: \nUUID Fiscal: df9d4-c98a-4db5-b873-19965-ide${inv.id}`)}
                      className="text-[9px] font-bold text-indigo-600 uppercase hover:underline flex items-center gap-0.5"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span>XML/PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Web Helper to assist with complex old school SFácil screens */
        <div className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-amber-700 self-start shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-normal">
              <strong>Asistente SFácil:</strong> ¿La web de SFácil es incómoda? Aquí tienes los campos esenciales listos. Da un toque en "Copiar" y pégalos rápido sin tener que teclearlos en el portal web.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide border-b pb-1.5">
              Valores SAT Requeridos para Factura IDEAS
            </h4>

            {/* SAT Product field copies */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Código Producto/Servicio SAT</span>
                  <span className="text-xs font-semibold text-slate-800">{satProductCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopySatFields('Código SAT', satProductCode)}
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 p-1.5 rounded"
                  title="Copiar Campo"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Uso de CFDI</span>
                  <span className="text-xs font-semibold text-slate-800">{cfdiUsage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopySatFields('Uso CFDI', cfdiUsage)}
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 p-1.5 rounded"
                  title="Copiar Campo"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Forma de Pago</span>
                  <span className="text-xs font-semibold text-slate-800">{paymentForm}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopySatFields('Forma Pago', paymentForm)}
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 p-1.5 rounded"
                  title="Copiar Campo"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Método de Pago</span>
                  <span className="text-xs font-semibold text-slate-800">{paymentMethod}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopySatFields('Método Pago', paymentMethod)}
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 p-1.5 rounded"
                  title="Copiar Campo"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Abriendo SFácil en pestaña secundaria con el portal optimizado de captura...\n(Simulación de redirección con portapapeles listo!)');
                window.open('https://www.sfacil.com', '_blank');
              }}
              className="mt-2 w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-850"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Portal SFácil Original</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

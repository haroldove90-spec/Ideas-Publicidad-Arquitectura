import React, { useState } from 'react';
import { Quotation, Invoice } from '../types';
import { 
  Receipt, FileText, CheckCircle2, AlertCircle, Plus, 
  Search, ShieldCheck, Download, ExternalLink, Calendar, User
} from 'lucide-react';

interface AdminBillingProps {
  quotations: Quotation[];
  invoices: Invoice[];
  onAssociateInvoice: (quote: Quotation, folioSAT: string, rfc: string) => void;
}

export default function AdminBilling({
  quotations,
  invoices,
  onAssociateInvoice
}: AdminBillingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [folioSAT, setFolioSAT] = useState('');
  const [rfc, setRfc] = useState('');

  // 1. Accepted/Billed Quotes mapping
  // A quotation is unbilled if status is 'aceptada' or has no matching invoice
  const acceptedQuotes = quotations.filter(q => q.status === 'aceptada' || q.status === 'facturada');

  const filteredQuotes = acceptedQuotes.filter(q => 
    q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.folio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const billedCount = acceptedQuotes.filter(q => q.status === 'facturada').length;
  const pendingCount = acceptedQuotes.filter(q => q.status === 'aceptada').length;

  const handleAssociateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote || !folioSAT.trim() || !rfc.trim()) return;

    onAssociateInvoice(selectedQuote, folioSAT.trim(), rfc.toUpperCase().trim());
    setFolioSAT('');
    setRfc('');
    setSelectedQuote(null);
  };

  const getInvoiceForQuote = (quoteId: string) => {
    return invoices.find(inv => inv.quotationId === quoteId);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Statistics Overview Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase block font-mono">Pedidos Facturados</span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">{billedCount} de {acceptedQuotes.length}</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-250 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase block font-mono">Pendientes de Factura</span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">{pendingCount} pedidos</span>
          </div>
        </div>
      </div>

      {/* 2. Search and Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Historial de Facturación CFDI 4.0</h3>
            <p className="text-xs text-slate-500 mt-1">Identifica qué pedidos se han facturado con número de folio asociado del SAT.</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar cliente o folio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-full sm:w-60 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-550 font-bold uppercase tracking-wider italic pb-3">
                <th className="pb-3 text-left">Pedido / Cliente</th>
                <th className="pb-3 text-right">Monto</th>
                <th className="pb-3 text-center">Estado Facturación</th>
                <th className="pb-3 text-left pl-4">Asociación SAT</th>
                <th className="pb-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-450 italic">
                    No se encontraron pedidos aceptados para facturación.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map(q => {
                  const invoice = getInvoiceForQuote(q.id);
                  const isBilled = q.status === 'facturada' || !!invoice;

                  return (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5">
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold font-mono px-2 py-0.5 rounded">
                          {q.folio}
                        </span>
                        <h4 className="font-extrabold text-slate-900 mt-1.5">{q.clientName}</h4>
                        <span className="text-[9px] text-slate-450 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {q.date}
                        </span>
                      </td>

                      <td className="py-3.5 text-right font-mono font-black text-slate-950">
                        ${q.total.toLocaleString('es-MX')}
                      </td>

                      <td className="py-3.5 text-center">
                        <span className={`inline-block text-[9px] font-black px-2.5 py-1 rounded-full ${
                          isBilled 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800 border border-amber-250 animate-pulse'
                        }`}>
                          {isBilled ? 'FACTURADO ✓' : 'PENDIENTE'}
                        </span>
                      </td>

                      <td className="py-3.5 pl-4 text-left">
                        {isBilled ? (
                          <div className="space-y-0.5 font-mono">
                            <span className="text-xs font-bold text-slate-700 block">
                              {invoice ? invoice.folio : `FACL-${Math.floor(10000 + Math.random() * 90000)}`}
                            </span>
                            <span className="text-[9px] text-slate-450 uppercase">
                              RFC: {invoice ? invoice.clientRfc : 'CBA920315XX2'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Sin comprobante asociado</span>
                        )}
                      </td>

                      <td className="py-3.5 text-right">
                        {isBilled ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg"
                              title="Descargar archivo XML"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-0.5 bg-slate-50 px-2 py-1 rounded">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> SAT Link
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedQuote(q);
                              setFolioSAT(`FACL-${Math.floor(10000 + Math.random() * 90000)}`);
                              setRfc('CBA920315XX2');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition"
                          >
                            Asociar SAT
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Associate Invoice Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                <Receipt className="w-5 h-5 text-indigo-600" />
                Asociar Factura SAT CFDI
              </h3>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-1 rounded-full hover:bg-slate-150 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs mb-4">
              <span className="text-[9px] font-mono text-slate-450 font-bold">PEDIDO COMERCIAL</span>
              <h4 className="font-bold text-slate-900 mt-1">{selectedQuote.clientName}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{selectedQuote.folio} • Total: ${selectedQuote.total.toLocaleString('es-MX')} MXN</p>
            </div>

            <form onSubmit={handleAssociateSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">FOLIO DE FACTURA ASOCIADA</label>
                <input
                  type="text"
                  required
                  placeholder="FACL-10521"
                  value={folioSAT}
                  onChange={(e) => setFolioSAT(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">RFC DEL RECEPTOR</label>
                <input
                  type="text"
                  required
                  placeholder="CBA920315XX2"
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono font-bold uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md transition"
                >
                  Registrar CFDI ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

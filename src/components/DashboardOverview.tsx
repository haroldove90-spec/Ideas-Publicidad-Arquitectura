/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Quotation, Invoice, Delivery, PurchaseOrder, ServiceItem } from '../types';
import { 
  DollarSign, TrendingUp, Calendar, ShoppingCart, 
  ShieldAlert, BadgeAlert, ClipboardList, CheckSquare, Sparkles 
} from 'lucide-react';

interface DashboardOverviewProps {
  services: ServiceItem[];
  quotations: Quotation[];
  invoices: Invoice[];
  deliveries: Delivery[];
  orders: PurchaseOrder[];
  role: 'Administrador' | 'Personal de Apoyo';
  onNavigateToTab: (tabId: string) => void;
}

export default function DashboardOverview({
  services,
  quotations,
  invoices,
  deliveries,
  orders,
  role,
  onNavigateToTab
}: DashboardOverviewProps) {
  
  // Calculate corporate metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPendingInvoicesPotentialFromQuotes = quotations
    .filter(q => q.status === 'aceptada')
    .reduce((sum, q) => sum + q.total, 0);

  const activeDeliveriesCount = deliveries.filter(d => d.status === 'pendiente').length;
  const pendingOrdersApprovalCount = orders.filter(o => o.status === 'pendiente').length;

  if (role === 'Personal de Apoyo') {
    return (
      <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-200">
        
        {/* Banner with support instructions */}
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex flex-col gap-2 shadow-xs">
          <div className="flex items-center gap-1.5">
            <ClipboardList className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-extrabold text-slate-800">Portal de Operación Staff</h3>
          </div>
          <p className="text-xs text-slate-600 leading-normal">
            ¡Hola! Has iniciado sesión con el rol de <strong>Personal de Apoyo (Restringido)</strong> para el negocio <strong>Ideas - Publicidad y Arquitectura</strong>.
          </p>
          <p className="text-[11px] text-slate-500">
            Tu labor es primordial: registra y valida las Órdenes de Compra y Contra-recibos firmados físicamente por los proveedores en obra o taller.
          </p>
        </div>

        {/* Action cards for Support role */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigateToTab('calendar')}
            className="bg-white border border-slate-200 rounded-xl p-4 text-left flex flex-col gap-1.5 focus:border-sky-500 shadow-xs"
          >
            <Calendar className="w-6 h-6 text-sky-600" />
            <span className="text-xs font-bold text-slate-800">Ver Entregas</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {activeDeliveriesCount} pendientes hoy
            </span>
          </button>

          <button
            onClick={() => onNavigateToTab('orders')}
            className="bg-white border border-slate-200 rounded-xl p-4 text-left flex flex-col gap-1.5 focus:border-sky-500 shadow-xs"
          >
            <CheckSquare className="w-6 h-6 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Registrar Documentos</span>
            <span className="text-[10px] text-slate-400 font-mono">
              Sube foto de factura física
            </span>
          </button>
        </div>

        {/* Restricted Security Notice to prevent leaks */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">RESTRICCIÓN ACTIVA</span>
            <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
              Por seguridad, la gerencia de IDEAS ha deshabilitado los tableros económicos de utilidades, ganancias, timbrado CFDI y listado de cotizaciones generales para tu cuenta de staff.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin view
  return (
    <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-200">
      
      {/* Brand header */}
      <div className="flex items-center justify-between mt-1">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 leading-tight">Consola Administrativa</h2>
          <p className="text-[11px] text-slate-500 font-medium">Ideas - Publicidad y Arquitectura</p>
        </div>
        <span className="bg-amber-100 text-amber-800 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-extrabold flex items-center gap-1 shadow-xs border border-amber-250">
          <Sparkles className="w-3 h-3" />
          <span>Acceso Total</span>
        </span>
      </div>

      {/* Bento Grid layout containing exact corporate statistics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1: Invoiced total */}
        <div className="bg-slate-950 text-white rounded-2xl p-4 flex flex-col justify-between shadow-md border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-mono uppercase tracking-widest font-bold">TOTAL FACTURADO</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-base font-extrabold font-mono tracking-tight text-emerald-400">
              ${totalInvoiced.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[9px] font-mono text-slate-500 block mt-1">Timbrado Nativo SAT</span>
          </div>
        </div>

        {/* Metric 2: Potential Quote Pipeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-mono uppercase tracking-widest font-bold">POR FACTURAR</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <span className="text-base font-extrabold font-mono tracking-tight text-slate-950">
              ${totalPendingInvoicesPotentialFromQuotes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[9px] font-mono text-slate-400 block mt-1">De cotizaciones aceptadas</span>
          </div>
        </div>

        {/* Metric 3: Active calendar tasks */}
        <button
          onClick={() => onNavigateToTab('calendar')}
          className="bg-white border border-slate-200 rounded-2xl p-4 text-left flex flex-col justify-between shadow-xs hover:border-slate-350 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-mono uppercase tracking-widest font-bold">FECHAS DE ENTREGA</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-base font-extrabold font-mono tracking-tight text-slate-900">
              {activeDeliveriesCount} Pendientes
            </span>
            <span className="text-[9px] font-mono text-slate-400 block mt-1">Mañana/Pasado mañana</span>
          </div>
        </button>

        {/* Metric 4: Supporting validations */}
        <button
          onClick={() => onNavigateToTab('orders')}
          className="bg-white border border-slate-200 rounded-2xl p-4 text-left flex flex-col justify-between shadow-xs hover:border-slate-350 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-mono uppercase tracking-widest font-bold">REVISION STAFF</span>
            <ShoppingCart className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3">
            <span className="text-base font-extrabold font-mono tracking-tight text-slate-900">
              {pendingOrdersApprovalCount} por Validar
            </span>
            <span className="text-[9px] font-mono text-slate-400 block mt-1">OC & Contra-recibos</span>
          </div>
        </button>
      </div>

      {/* Critical warnings alert panel */}
      {deliveries.some(d => d.status === 'pendiente' && d.date === '2026-06-04') && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-3 flex gap-2 items-center">
          <BadgeAlert className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-left">
            <span className="text-[9px] font-bold text-red-900 uppercase font-mono tracking-wider block">⚠️ ALERTA EXTREMA: TIEMPO SAGRADO</span>
            <p className="text-[11px] text-red-800 leading-normal">
              La entrega de renders de preventa "Torre Delta" vence en las próximas 24 horas. ¡Favor de vigilar su ejecución con Ricardo!
            </p>
          </div>
        </div>
      )}

      {/* Quick shortcuts panel */}
      <div className="border border-slate-200 rounded-xl p-3.5 bg-white shadow-xs">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2.5">Accesos Rápidos</h3>
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
          <button
            onClick={() => onNavigateToTab('quotes')}
            className="bg-slate-50 text-slate-800 border border-slate-150 py-2.5 rounded-lg active:bg-slate-100"
          >
            Nueva Cotización
          </button>
          <button
            onClick={() => onNavigateToTab('invoice')}
            className="bg-slate-50 text-slate-800 border border-slate-150 py-2.5 rounded-lg active:bg-slate-100"
          >
            Timbrar SAT
          </button>
          <button
            onClick={() => onNavigateToTab('catalog')}
            className="bg-slate-50 text-slate-800 border border-slate-150 py-2.5 rounded-lg active:bg-slate-100"
          >
            Ver Catálogo
          </button>
        </div>
      </div>
    </div>
  );
}

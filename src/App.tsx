/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ServiceItem, Quotation, Invoice, Delivery, PurchaseOrder } from './types';
import { 
  INITIAL_SERVICES, 
  INITIAL_QUOTATIONS, 
  INITIAL_INVOICES, 
  INITIAL_DELIVERIES, 
  INITIAL_PURCHASE_ORDERS 
} from './mockData';

// Component imports
import RoleSelector from './components/RoleSelector';
import DashboardOverview from './components/DashboardOverview';
import CatalogManager from './components/CatalogManager';
import QuotationCreator from './components/QuotationCreator';
import InvoiceManager from './components/InvoiceManager';
import CalendarDeliveries from './components/CalendarDeliveries';
import PurchaseOrdersManager from './components/PurchaseOrdersManager';

// Icon imports
import { 
  LayoutDashboard, BookOpen, FileSpreadsheet, 
  Receipt, CalendarRange, ShoppingBag, Wifi, Battery, Smartphone 
} from 'lucide-react';

export default function App() {
  // Role toggler state
  const [role, setRole] = useState<'Administrador' | 'Personal de Apoyo'>('Administrador');
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Persistence States synced with localStorage
  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('ideas_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('ideas_quotations');
    return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('ideas_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem('ideas_deliveries');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });

  const [orders, setOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('ideas_purchase_orders');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  // Save states modifications to localstorage automatically
  useEffect(() => {
    localStorage.setItem('ideas_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('ideas_quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('ideas_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('ideas_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('ideas_purchase_orders', JSON.stringify(orders));
  }, [orders]);

  // Handlers for state updates
  const handleAddService = (newService: ServiceItem) => {
    setServices((prev) => [newService, ...prev]);
  };

  const handleUpdateServicePrice = (id: string, newPrice: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price: newPrice } : s))
    );
  };

  const handleCreateQuotation = (newQuote: Quotation) => {
    setQuotations((prev) => [newQuote, ...prev]);
  };

  const handleUpdateQuotationStatus = (id: string, status: 'pendiente' | 'aceptada' | 'facturada') => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
  };

  const handleConvertToInvoice = (quote: Quotation, rfc: string) => {
    // 1. Mark quote as 'facturada'
    handleUpdateQuotationStatus(quote.id, 'facturada');

    // 2. Insert invoice
    const subtotal = quote.total;
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      folio: `FACL-${Math.floor(10000 + Math.random() * 90000)}`,
      quotationId: quote.id,
      clientName: quote.clientName,
      clientRfc: rfc,
      date: new Date().toISOString().split('T')[0],
      subtotal,
      iva,
      total,
      status: 'timbrada',
      xmlUrl: `XML-FACL-${quote.id}.xml`
    };

    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const handleAddManualInvoice = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    if (newInvoice.quotationId) {
      handleUpdateQuotationStatus(newInvoice.quotationId, 'facturada');
    }
  };

  const handleToggleDeliveryStatus = (id: string) => {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: d.status === 'pendiente' ? 'entregado' : 'pendiente' }
          : d
      )
    );
  };

  const handleAddPurchaseOrder = (newOrder: PurchaseOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (id: string, status: 'pendiente' | 'aprobada' | 'rechazada') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  // Navigations links
  const NAV_LINKS = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'catalog', label: 'Catálogo', icon: BookOpen },
    { id: 'quotes', label: 'Cotizar', icon: FileSpreadsheet },
    { id: 'invoice', label: 'Factura CFDI', icon: Receipt },
    { id: 'calendar', label: 'Entregas', icon: CalendarRange },
    { id: 'orders', label: 'Compras', icon: ShoppingBag }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            services={services}
            quotations={quotations}
            invoices={invoices}
            deliveries={deliveries}
            orders={orders}
            role={role}
            onNavigateToTab={(tabId) => setActiveTab(tabId)}
          />
        );
      case 'catalog':
        return (
          <CatalogManager
            services={services}
            onAddService={handleAddService}
            onUpdateServicePrice={handleUpdateServicePrice}
            role={role}
          />
        );
      case 'quotes':
        return (
          <QuotationCreator
            services={services}
            quotations={quotations}
            onCreateQuotation={handleCreateQuotation}
            onUpdateQuotationStatus={handleUpdateQuotationStatus}
            onConvertToInvoice={handleConvertToInvoice}
            role={role}
          />
        );
      case 'invoice':
        return (
          <InvoiceManager
            invoices={invoices}
            quotations={quotations}
            onTriggerManualInvoice={handleAddManualInvoice}
            role={role}
          />
        );
      case 'calendar':
        return (
          <CalendarDeliveries
            deliveries={deliveries}
            onToggleDeliveryStatus={handleToggleDeliveryStatus}
          />
        );
      case 'orders':
        return (
          <PurchaseOrdersManager
            orders={orders}
            onAddOrder={handleAddPurchaseOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            role={role}
          />
        );
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Consola Ideas';
      case 'catalog': return 'Catálogo de Servicios';
      case 'quotes': return 'Cotizador Móvil';
      case 'invoice': return 'Facturas SFácil';
      case 'calendar': return 'Agenda de Entregas';
      case 'orders': return 'OC y Contra-recibos';
      default: return 'Ideas';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col select-none">
      
      {/* 1. Global Header Navigation (Dynamic) */}
      <header className="bg-slate-900 text-white h-16 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-lg z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center font-black text-slate-900 italic transform hover:scale-105 transition-transform shrink-0">
            I
          </div>
          <span className="text-sm md:text-xl font-bold tracking-tight uppercase flex items-center whitespace-nowrap">
            Ideas 
            <span className="font-light text-slate-400 font-serif lowercase italic ml-2 hidden sm:inline">
              - publicidad y arquitectura
            </span>
          </span>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex items-center bg-slate-800 rounded-full px-3 py-1 border border-slate-700">
            <span className="text-[9px] md:text-[10px] text-slate-400 mr-2 uppercase">ROL:</span>
            <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${
              role === 'Administrador' ? 'text-amber-400' : 'text-sky-400'
            }`}>
              {role}
            </span>
          </div>
          {/* Quick Role Toggle in header itself for convenient testing! */}
          <button
            onClick={() => setRole(role === 'Administrador' ? 'Personal de Apoyo' : 'Administrador')}
            className="text-[9px] md:text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded-lg border border-slate-750 transition"
            title="Cambiar de Rol de Simulación"
          >
            🔄 Rol de Simulación
          </button>
          <div className="w-9 h-9 rounded-full bg-amber-500 border-2 border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-900 text-xs shadow-md shrink-0">
            JD
          </div>
        </div>
      </header>

      {/* 2. Main Layout Shell */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Side Navigation (Desktop/Large Screen) */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0 select-none">
          <div className="p-3 bg-slate-50 border-b border-slate-200/60">
            <RoleSelector currentRole={role} onChangeRole={(newRole) => setRole(newRole)} />
          </div>
          
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest px-3 mb-2">
              Navegación Sistema
            </p>
            {NAV_LINKS.map((link) => {
              const IsActive = activeTab === link.id;
              const isRestrictedForSupport = (link.id === 'quotes' || link.id === 'invoice') && role === 'Personal de Apoyo';

              return (
                <button
                  key={link.id}
                  disabled={isRestrictedForSupport}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left text-xs font-semibold transition-all group ${
                    isRestrictedForSupport
                      ? 'opacity-25 cursor-not-allowed'
                      : IsActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={isRestrictedForSupport ? 'Bloqueado para Staff' : link.label}
                >
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-3 shrink-0 ${
                      isRestrictedForSupport
                        ? 'bg-slate-200'
                        : IsActive
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-slate-300 group-hover:bg-slate-400'
                    }`}></span>
                    <span>{link.label}</span>
                  </div>
                  {isRestrictedForSupport && (
                    <span className="text-[9px] text-slate-400 font-normal px-1.5 py-0.5 bg-slate-100 rounded">
                      🔒 Bloq
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Alerts (Design Spec) */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200/60 shadow-xs">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Alertas Próximas</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              </p>
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-semibold">• Instalación Stand BMW</p>
                <p className="text-[10px] text-amber-805">Mañana 10:00 AM - Centro Banamex</p>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. Main Content Workspace */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 bg-slate-100">
          
          {/* Mobile Role Switcher (Hidden on large panels) */}
          <div className="block lg:hidden mb-4 bg-white p-3 rounded-xl border border-slate-250 shadow-xs">
            <RoleSelector currentRole={role} onChangeRole={(newRole) => setRole(newRole)} />
          </div>

          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6">
            
            {/* Page Header Area with Active Title & Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-250 gap-2 shrink-0">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Ideas Publicidad Arquitectura</span>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">{getHeaderTitle()}</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold leading-none px-3 py-1.5 rounded-full ${
                  role === 'Administrador' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-sky-100 text-sky-800 border border-sky-200'
                }`}>
                  {role === 'Administrador' ? '✨ Acceso Directivo' : '🔒 Portal Operativo'}
                </span>
                <span id="system-time" className="text-[10px] font-mono text-slate-400">
                  2026-06-03 14:30
                </span>
              </div>
            </div>

            {/* Main Workspace Body Router container */}
            {activeTab === 'dashboard' ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
                
                {/* Column A: Dashboard Statistics */}
                <div className="xl:col-span-7 flex flex-col gap-6">
                  <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-2 md:p-4">
                    {renderActiveComponent()}
                  </div>
                </div>

                {/* Column B: Real-time logs and modules (Facturación + Logistics) */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                  
                  {/* Live Facturación Quick View Module */}
                  <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 min-h-[300px] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-extrabold text-slate-900 text-sm flex items-center tracking-tight">
                          <span className="w-2.5 h-4 bg-emerald-500 rounded-full mr-2"></span>
                          Facturación SFácil (En Vivo)
                        </h3>
                        {role === 'Administrador' ? (
                          <button 
                            onClick={() => setActiveTab('invoice')}
                            className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded transition-colors"
                          >
                            Ir a Enlace +
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[9px] font-semibold italic">Solo lectura</span>
                        )}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">
                              <th className="pb-2">Folio SAT</th>
                              <th className="pb-2">Cliente</th>
                              <th className="pb-2 text-right">Monto</th>
                              <th className="pb-2 text-center">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-slate-700">
                            {invoices.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-4 text-center text-slate-400 italic">
                                  Sin facturas timbradas en la sesión.
                                </td>
                              </tr>
                            ) : (
                              invoices.slice(0, 5).map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-2.5 font-mono text-[11px] font-semibold text-slate-600">
                                    {inv.folio}
                                  </td>
                                  <td className="py-2.5 font-medium text-slate-900 truncate max-w-[120px]">
                                    {inv.clientName}
                                  </td>
                                  <td className="py-2.5 text-right font-bold font-mono text-slate-900">
                                    ${inv.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-2.5 text-center">
                                    <span className="inline-block text-[8px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                                      {inv.status.toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Emitido: <strong>{invoices.length} facturas</strong></span>
                      <span className="font-bold text-slate-950">
                        Total: ${invoices.reduce((sum, current) => sum + current.total, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                    </div>
                  </div>

                  {/* Live Logistics Control Module */}
                  <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 min-h-[260px] flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center tracking-tight">
                        <span className="w-2.5 h-4 bg-amber-500 rounded-full mr-2"></span>
                        Gabinete Logístico y Contra-recibos
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Left inner logistics status widget */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200 flex flex-col justify-center items-center text-center">
                          <div className="w-8 h-8 bg-amber-100 rounded-full mb-2 flex items-center justify-center text-amber-600 font-bold text-xs">
                            ✓
                          </div>
                          <p className="text-xs font-bold text-slate-800">Orden de Compra Activa</p>
                          <p className="text-[10px] text-slate-500 mt-1 truncate max-w-full">
                            {orders.length > 0 ? (
                              <span>{orders[0].folio} - {orders[0].providerOrClient}</span>
                            ) : (
                              <span>No hay cotizaciones de compras activas</span>
                            )}
                          </p>
                          <button 
                            onClick={() => setActiveTab('orders')}
                            className="text-xs text-amber-700 hover:text-amber-800 font-bold mt-2 hover:underline"
                          >
                            Ir a Órdenes
                          </button>
                        </div>

                        {/* Right interactive counter with latest summary statistics */}
                        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group">
                          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 w-16 h-16 bg-slate-800/40 rounded-full transition-transform group-hover:scale-110"></div>
                          
                          <div className="flex justify-between items-start z-10">
                            <span className="text-[9px] font-bold text-slate-350 tracking-wider">CONTRA-RECIBOS #</span>
                            <span className="text-[8px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded bg-amber-500 font-semibold uppercase italic">
                              Live
                            </span>
                          </div>

                          <div className="mt-4 z-10">
                            <p className="text-[10px] text-slate-400 font-medium">Fondo Contra-recibos :</p>
                            <p className="text-lg font-mono font-bold text-amber-400 leading-tight">
                              ${orders.filter(o => o.type === 'contra_recibo').reduce((sum, o) => sum + o.amount, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1">
                              Total {orders.filter(o => o.type === 'contra_recibo').length} recibidos en total
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Real-time sync footer status bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>CONEXIÓN SAT: <strong className="text-emerald-500 animate-pulse">ACTIVA ●</strong></span>
                      <span>UUID: IDEAS-MX-2026-603</span>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="w-full bg-white rounded-2xl shadow-xs border border-slate-200 p-4 md:p-6 overflow-x-auto">
                {renderActiveComponent()}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* 4. Sticky Bottom Tab Navigation (Mobile Only for high touch compliance) */}
      <nav className="sticky bottom-0 bg-white border-t border-slate-200 p-2 pb-5.5 shadow-lg flex lg:hidden justify-between items-center z-40 shrink-0 select-none">
        {NAV_LINKS.map((link) => {
          const IsActive = activeTab === link.id;
          const IconComponent = link.icon;
          const isRestrictedForSupport = (link.id === 'quotes' || link.id === 'invoice') && role === 'Personal de Apoyo';

          return (
            <button
              key={link.id}
              disabled={isRestrictedForSupport}
              onClick={() => setActiveTab(link.id)}
              className={`flex flex-col items-center flex-1 py-1 px-1 rounded-lg transition-all ${
                isRestrictedForSupport 
                  ? 'opacity-20 cursor-not-allowed text-slate-300' 
                  : IsActive 
                  ? 'text-slate-900 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-650'
              }`}
              title={isRestrictedForSupport ? 'Bloqueado para Staff' : link.label}
            >
              <IconComponent className={`w-5 h-5 ${IsActive ? 'stroke-[2.5px] text-slate-900 scale-105' : 'stroke-[1.8px]'} transition-transform`} />
              <span className="text-[9px] mt-1 font-bold tracking-tight truncate max-w-full">
                {link.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 5. Desktop Footer status info bar (Saves space on mobile screens) */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3 px-6 hidden lg:flex justify-between items-center text-[11px] text-slate-400 select-none shrink-0 z-15">
        <div>
          <span>Código postal base SAT: <strong>01000</strong> | Configuración: <strong>Ideas Publicidad y Arquitectura S.A. de C.V.</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>Sincronización de Persistencia: <strong className="text-emerald-400 font-bold animate-pulse">● LocalStorage OK</strong></span>
          <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">v2.2 Polish Responsive</span>
        </div>
      </footer>

    </div>
  );
}

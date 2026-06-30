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
import CatalogManager from './components/CatalogManager';
import QuotationCreator from './components/QuotationCreator';
import InvoiceManager from './components/InvoiceManager';
import CalendarDeliveries from './components/CalendarDeliveries';
import PurchaseOrdersManager from './components/PurchaseOrdersManager';

// Custom Admin Console components
import AdminDashboard from './components/AdminDashboard';
import AdminReports from './components/AdminReports';
import AdminFinance from './components/AdminFinance';
import AdminUsers from './components/AdminUsers';
import AdminBilling from './components/AdminBilling';
import VentasWorkspace from './components/VentasWorkspace';
import DisenoWorkspace from './components/DisenoWorkspace';
import ProduccionWorkspace from './components/ProduccionWorkspace';
import AlmacenWorkspace from './components/AlmacenWorkspace';

// Icon imports
import { 
  LayoutDashboard, BookOpen, FileSpreadsheet, 
  Receipt, CalendarRange, ShoppingBag, Landmark, Users, 
  BarChart3, Settings, LogOut, ShieldCheck, Heart, Sparkles, Paintbrush, Hammer, Warehouse, ShieldAlert, BadgeAlert, AlertCircle, ChevronRight, TrendingUp,
  Layers, Calendar, Wrench, Package, Database, ShoppingCart
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: 'Administrador' | 'Diseño' | 'Producción' | 'Almacén';
  permissions: {
    fullMetrics: boolean;
    editCatalog: boolean;
    createQuotes: boolean;
    accessFinance: boolean;
    accessUsers: boolean;
    logInvoices: boolean;
    viewDeliveries: boolean;
  };
}

export default function App() {
  // 1. Role Selection Route state
  // Starts on 'home' to present the clean roles interface requested by the user.
  const [activeRole, setActiveRole] = useState<'home' | 'Admin' | 'Diseño' | 'Produccion' | 'Almacen' | 'Ventas'>('home');
  
  // 2. Navigation State for Admin Workspace
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Navigation State for Production Workspace
  const [productionTab, setProductionTab] = useState<'flujo' | 'agenda' | 'taller'>('flujo');

  // Navigation State for Almacen Workspace
  const [almacenTab, setAlmacenTab] = useState<'inventario' | 'compras' | 'agenda' | 'respaldo'>('inventario');

  // 3. Core States synced with localStorage
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

  // 4. New Custom States for the Admin Console checklist (financial, inventory, debtors, users)
  const [transactions, setTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem('ideas_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 't-1', description: 'Pago Inicial Stand BMW', category: 'Publicidad', amount: 24500, date: '2026-06-15', type: 'ingreso' },
      { id: 't-2', description: 'Anticipo Renders Delta S.A.', category: 'Arquitectura', amount: 15000, date: '2026-06-20', type: 'ingreso' },
      { id: 't-3', description: 'Impresión de Lonas Gran Formato', category: 'Materiales', amount: 3200, date: '2026-06-21', type: 'egreso' },
      { id: 't-4', description: 'Comisión Renderista Colaborador', category: 'Diseño Ext', amount: 4500, date: '2026-06-25', type: 'egreso' },
      { id: 't-5', description: 'Compra de MDF para Maqueta Delta', category: 'Materiales', amount: 2100, date: '2026-06-28', type: 'egreso' }
    ];
  });

  const [fixedCosts, setFixedCosts] = useState<any[]>(() => {
    const saved = localStorage.getItem('ideas_fixed_costs');
    return saved ? JSON.parse(saved) : [
      { id: 'fc-1', name: 'Renta de Taller y Oficina Principal', amount: 12000, status: 'pagado' },
      { id: 'fc-2', name: 'Nómina Administrativa y Creativa', amount: 24000, status: 'pendiente' },
      { id: 'fc-3', name: 'Licencias de Software (Creative Cloud/3ds Max)', amount: 4500, status: 'pagado' },
      { id: 'fc-4', name: 'Servicios Básicos (Luz, Internet de Alta Velocidad)', amount: 2200, status: 'pendiente' }
    ];
  });

  const [materials, setMaterials] = useState<any[]>(() => {
    const saved = localStorage.getItem('ideas_materials');
    return saved ? JSON.parse(saved) : [
      { id: 'm-1', name: 'Lona Front 13oz Brillante (Rollo 50m)', quantity: '1 rollo', cost: 3500, purchased: false },
      { id: 'm-2', name: 'Tiras de Luces LED Cob 12v Blancas (x5)', quantity: '5 rollos', cost: 1250, purchased: true },
      { id: 'm-3', name: 'Planchas de MDF 6mm de Alta Densidad (x10)', quantity: '10 placas', cost: 1800, purchased: false },
      { id: 'm-4', name: 'Pintura Acrílica Vinílica Mate Negra (Galón)', quantity: '1 galón', cost: 950, purchased: true }
    ];
  });

  const [debtors, setDebtors] = useState<any[]>(() => {
    const saved = localStorage.getItem('ideas_debtors');
    return saved ? JSON.parse(saved) : [
      { id: 'd-1', client: 'Inmobiliaria Delta S.A.', project: 'Renders Torre Delta', total: 41000, pending: 15000 },
      { id: 'd-2', client: 'Restaurante El Portal', project: 'Fachada Principal Vinil', total: 4600, pending: 2000 },
      { id: 'd-3', client: 'Gicsa Desarrollos', project: 'Maqueta Centro Comercial', total: 15000, pending: 0 }
    ];
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('ideas_employees');
    return saved ? JSON.parse(saved) : [
      { id: 'e-1', name: 'Juan Pérez Díaz', username: 'juan.perez', role: 'Administrador', permissions: { fullMetrics: true, editCatalog: true, createQuotes: true, accessFinance: true, accessUsers: true, logInvoices: true, viewDeliveries: true } },
      { id: 'e-2', name: 'Sofía Cruz Reyes', username: 'sofia.cruz', role: 'Diseño', permissions: { fullMetrics: false, editCatalog: true, createQuotes: true, accessFinance: false, accessUsers: false, logInvoices: false, viewDeliveries: true } },
      { id: 'e-3', name: 'Carlos Ruiz Ordaz', username: 'carlos.ruiz', role: 'Producción', permissions: { fullMetrics: false, editCatalog: false, createQuotes: false, accessFinance: false, accessUsers: false, logInvoices: false, viewDeliveries: true } },
      { id: 'e-4', name: 'Mateo Torres Ramos', username: 'mateo.torres', role: 'Almacén', permissions: { fullMetrics: false, editCatalog: false, createQuotes: false, accessFinance: false, accessUsers: false, logInvoices: false, viewDeliveries: true } }
    ];
  });

  // Save states to localStorage
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

  useEffect(() => {
    localStorage.setItem('ideas_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ideas_fixed_costs', JSON.stringify(fixedCosts));
  }, [fixedCosts]);

  useEffect(() => {
    localStorage.setItem('ideas_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('ideas_debtors', JSON.stringify(debtors));
  }, [debtors]);

  useEffect(() => {
    localStorage.setItem('ideas_employees', JSON.stringify(employees));
  }, [employees]);

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
    handleUpdateQuotationStatus(quote.id, 'facturada');

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

    // Also register this as financial Income!
    setTransactions(prev => [
      {
        id: `t-${Date.now()}`,
        description: `Ingreso Facturado: ${quote.clientName}`,
        category: 'Ingresos Facturación',
        amount: quote.total,
        date: new Date().toISOString().split('T')[0],
        type: 'ingreso'
      },
      ...prev
    ]);
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

  // Transaction handlers
  const handleAddTransaction = (t: { description: string; category: string; amount: number; date: string; type: 'ingreso' | 'egreso' }) => {
    setTransactions(prev => [{ id: `t-${Date.now()}`, ...t }, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Material purchase toggle
  const handleToggleMaterial = (id: string) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, purchased: !m.purchased } : m));
  };

  // Debtor pay handler
  const handlePayDebt = (id: string, amountToPay: number) => {
    setDebtors(prev => prev.map(d => {
      if (d.id === id) {
        const nextPending = Math.max(0, d.pending - amountToPay);
        
        // Also log this payment as real-time financial Income
        setTransactions(prevTrans => [
          {
            id: `t-${Date.now()}`,
            description: `Abono de Deuda: ${d.client} (${d.project})`,
            category: 'Abonos Clientes',
            amount: amountToPay,
            date: new Date().toISOString().split('T')[0],
            type: 'ingreso'
          },
          ...prevTrans
        ]);

        return { ...d, pending: nextPending };
      }
      return d;
    }));
  };

  // Employee CRUD handlers
  const handleAddEmployee = (emp: Employee) => {
    setEmployees(prev => [...prev, emp]);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp));
  };

  // Associate CFDI invoice number handler (Facturación module checklist)
  const handleAssociateInvoice = (quote: Quotation, folioSAT: string, rfc: string) => {
    // Mark as billed in quotes
    handleUpdateQuotationStatus(quote.id, 'facturada');

    // Create the associated Invoice
    const subtotal = quote.total;
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const newInvoice: Invoice = {
      id: `inv-asoc-${Date.now()}`,
      folio: folioSAT,
      quotationId: quote.id,
      clientName: quote.clientName,
      clientRfc: rfc,
      date: new Date().toISOString().split('T')[0],
      subtotal,
      iva,
      total,
      status: 'timbrada',
      xmlUrl: `XML-${folioSAT}.xml`
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Add to financial Income log
    setTransactions(prevTrans => [
      {
        id: `t-asoc-${Date.now()}`,
        description: `Ingreso CFDI SAT: ${quote.clientName} (${folioSAT})`,
        category: 'Ingresos Facturación',
        amount: quote.total,
        date: new Date().toISOString().split('T')[0],
        type: 'ingreso'
      },
      ...prevTrans
    ]);
  };

  // Fixed Cost handlers
  const handleToggleFixedCostStatus = (id: string) => {
    setFixedCosts(prev => prev.map(fc => {
      if (fc.id === id) {
        const nextStatus = fc.status === 'pendiente' ? 'pagado' : 'pendiente';
        
        // If transitioning to paid, log as general Expense transaction automatically!
        if (nextStatus === 'pagado') {
          setTransactions(prevTrans => [
            {
              id: `t-fc-${Date.now()}`,
              description: `Pago Costo Fijo: ${fc.name}`,
              category: 'Gastos Fijos',
              amount: fc.amount,
              date: new Date().toISOString().split('T')[0],
              type: 'egreso'
            },
            ...prevTrans
          ]);
        } else {
          // If returning to pending, remove the expense log
          setTransactions(prevTrans => prevTrans.filter(t => t.description !== `Pago Costo Fijo: ${fc.name}`));
        }

        return { ...fc, status: nextStatus };
      }
      return fc;
    }));
  };

  const handleUpdateFixedCostAmount = (id: string, newAmount: number) => {
    setFixedCosts(prev => prev.map(fc => fc.id === id ? { ...fc, amount: newAmount } : fc));
  };


  // Navigations links for Administrador Role Console
  const ADMIN_NAV_LINKS = [
    { id: 'dashboard', label: 'Inicio Admin', icon: LayoutDashboard },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'finances', label: 'Finanzas', icon: Landmark },
    { id: 'billing', label: 'Facturación SAT', icon: ShieldCheck },
    { id: 'users', label: 'Usuarios / Personal', icon: Users },
    { id: 'catalog', label: 'Servicios', icon: BookOpen },
    { id: 'quotes', label: 'Cotizador', icon: FileSpreadsheet },
    { id: 'invoice', label: 'Facturas CFDI', icon: Receipt },
    { id: 'calendar', label: 'Agenda Entregas', icon: CalendarRange },
    { id: 'orders', label: 'Compras', icon: ShoppingBag }
  ];

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Consola de Control Directivo';
      case 'reports': return 'Reportes Corporativos e Indicadores';
      case 'finances': return 'Consola de Control Financiero';
      case 'billing': return 'Facturación SAT Match';
      case 'users': return 'Gestión de Usuarios y Personal';
      case 'catalog': return 'Catálogo de Servicios';
      case 'quotes': return 'Cotizador de Obras y Publicidad';
      case 'invoice': return 'Facturas SFácil';
      case 'calendar': return 'Agenda de Entregas';
      case 'orders': return 'OC y Contra-recibos';
      default: return 'Consola Directiva';
    }
  };

  // Switcher to decide what view to show based on routing path (home / Admin / Diseño / Producción / Almacén)
  if (activeRole === 'home') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-6 select-none relative overflow-hidden font-sans">
        
        {/* Absolute design background grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="w-full max-w-4xl text-center space-y-12 z-10">
          
          {/* Logo & Headline */}
          <div className="space-y-4 animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-slate-950 text-3xl italic mx-auto shadow-2xl transform hover:rotate-3 transition duration-300">
              I
            </div>
            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">
                Ideas <span className="text-amber-400 font-extralight tracking-normal">Publicidad Arquitectura</span>
              </h1>
              <p className="text-sm md:text-base text-slate-400 tracking-wide max-w-md mx-auto">
                Consola de Control de Procesos y Operación del Negocio
              </p>
            </div>
          </div>

          {/* Core Roles Grid layout requested by the user */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto animate-in slide-in-from-bottom-6 duration-700 delay-100">
            
            {/* 1. Admin Role */}
            <button
              onClick={() => {
                setActiveRole('Admin');
                setActiveTab('dashboard');
              }}
              className="bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-amber-500 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3.5 transition-all hover:scale-103 hover:shadow-xl group"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center transition group-hover:scale-105">
                <ShieldCheck className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">Administrador</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-1">Acceso Total</span>
              </div>
            </button>

            {/* 2. Ventas Role */}
            <button
              onClick={() => {
                setActiveRole('Ventas');
              }}
              className="bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-emerald-500 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3.5 transition-all hover:scale-103 hover:shadow-xl group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center transition group-hover:scale-105">
                <TrendingUp className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">Ventas CRM</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-1">Cotizaciones & Tratos</span>
              </div>
            </button>

            {/* 3. Diseño Role */}
            <button
              onClick={() => {
                setActiveRole('Diseño');
              }}
              className="bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-blue-500 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3.5 transition-all hover:scale-103 hover:shadow-xl group"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center transition group-hover:scale-105">
                <Paintbrush className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">Diseño</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-1">Creatividad & Renders</span>
              </div>
            </button>

            {/* 4. Producción Role */}
            <button
              onClick={() => {
                setActiveRole('Produccion');
              }}
              className="bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-purple-500 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3.5 transition-all hover:scale-103 hover:shadow-xl group"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center transition group-hover:scale-105">
                <Hammer className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">Producción</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-1">Talleres & Obras</span>
              </div>
            </button>

            {/* 5. Almacén Role */}
            <button
              onClick={() => {
                setActiveRole('Almacen');
              }}
              className="bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-teal-500 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3.5 transition-all hover:scale-103 hover:shadow-xl group col-span-2 sm:col-span-1"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center transition group-hover:scale-105">
                <Warehouse className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">Almacén</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-1">Logística & Stock</span>
              </div>
            </button>

          </div>

          {/* Aesthetic Subtext */}
          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1.5 pt-8">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Consola de Identidad Segura para Empleados Activos</span>
          </div>

        </div>
      </div>
    );
  }

  // RENDER WORKSPACE FOR SALES ROLE
  if (activeRole === 'Ventas') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col select-none">
        
        {/* Global Header Navigation for Ventas */}
        <header className="bg-slate-950 text-white h-16 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-lg z-30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-black text-slate-900 italic transform hover:scale-105 transition-transform shrink-0">
              I
            </div>
            <span className="text-sm md:text-xl font-black tracking-tight uppercase flex items-center whitespace-nowrap">
              Ideas 
              <span className="font-light text-slate-400 font-serif lowercase italic ml-2 hidden sm:inline">
                - publicidad y arquitectura
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="bg-emerald-500/10 text-emerald-400 rounded-full px-3 py-1 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Rol: Ventas CRM
            </div>
            <button
              onClick={() => setActiveRole('home')}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span>Cambiar Rol</span>
            </button>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
            
            {/* Page Header Area with Active Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-250 gap-2 shrink-0">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Ideas Publicidad Arquitectura</span>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">Control de Prospección y Ventas (CRM)</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold leading-none px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✓ Acceso de Ventas Comercial
                </span>
                <span id="system-time" className="text-[10px] font-mono text-slate-400">
                  {new Date().toISOString().split('T')[0]} Active
                </span>
              </div>
            </div>

            {/* Ventas Workspace component */}
            <div className="w-full">
              <VentasWorkspace
                services={services}
                quotations={quotations}
                onCreateQuotation={handleCreateQuotation}
                onUpdateQuotationStatus={handleUpdateQuotationStatus}
              />
            </div>

          </div>
        </main>

        {/* Desktop Footer status info bar */}
        <footer className="bg-slate-950 border-t border-slate-850 py-3 px-6 hidden lg:flex justify-between items-center text-[11px] text-slate-400 select-none shrink-0">
          <div>
            <span>Ideas Publicidad y Arquitectura | Módulo de Prospección de Clientes</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Sincronización CRM: <strong className="text-emerald-400 font-bold animate-pulse">● LocalStorage Sync OK</strong></span>
            <span className="text-[10px] bg-slate-900 text-slate-400 font-mono px-2 py-0.5 rounded">v1.0 Ventas</span>
          </div>
        </footer>

      </div>
    );
  }

  // RENDER WORKSPACE FOR DESIGN ROLE
  if (activeRole === 'Diseño') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col select-none">
        
        {/* Global Header Navigation for Diseño */}
        <header className="bg-slate-950 text-white h-16 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-lg z-30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-black text-slate-900 italic transform hover:scale-105 transition-transform shrink-0">
              I
            </div>
            <span className="text-sm md:text-xl font-black tracking-tight uppercase flex items-center whitespace-nowrap">
              Ideas 
              <span className="font-light text-slate-400 font-serif lowercase italic ml-2 hidden sm:inline">
                - publicidad y arquitectura
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="bg-blue-500/10 text-blue-400 rounded-full px-3 py-1 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
              Rol: Diseño Gráfico
            </div>
            <button
              onClick={() => setActiveRole('home')}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span>Cambiar Rol</span>
            </button>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
            
            {/* Page Header Area with Active Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-250 gap-2 shrink-0">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Ideas Publicidad Arquitectura</span>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">Gestión de Proyectos - Fase Diseño</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold leading-none px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  ✓ Acceso Diseñador Creativo
                </span>
                <span id="system-time" className="text-[10px] font-mono text-slate-400">
                  {new Date().toISOString().split('T')[0]} Active
                </span>
              </div>
            </div>

            {/* Diseño Workspace component */}
            <div className="w-full">
              <DisenoWorkspace
                services={services}
                quotations={quotations}
              />
            </div>

          </div>
        </main>

        {/* Desktop Footer status info bar */}
        <footer className="bg-slate-950 border-t border-slate-850 py-3 px-6 hidden lg:flex justify-between items-center text-[11px] text-slate-400 select-none shrink-0">
          <div>
            <span>Ideas Publicidad y Arquitectura | Módulo de Preparación Gráfica y Archivos</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Sincronización Diseño: <strong className="text-emerald-400 font-bold animate-pulse">● LocalStorage Sync OK</strong></span>
            <span className="text-[10px] bg-slate-900 text-slate-400 font-mono px-2 py-0.5 rounded">v1.0 Diseño</span>
          </div>
        </footer>

      </div>
    );
  }

  // RENDER WORKSPACE FOR PRODUCTION ROLE
  if (activeRole === 'Produccion') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col select-none">
        
        {/* Global Header Navigation for Producción */}
        <header className="bg-slate-950 text-white h-16 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-lg z-30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-black text-slate-900 italic transform hover:scale-105 transition-transform shrink-0">
              I
            </div>
            <span className="text-sm md:text-xl font-black tracking-tight uppercase flex items-center whitespace-nowrap">
              Ideas 
              <span className="font-light text-slate-400 font-serif lowercase italic ml-2 hidden sm:inline">
                - publicidad y arquitectura
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="bg-purple-500/10 text-purple-400 rounded-full px-3 py-1 border border-purple-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
              Rol: Producción
            </div>
            <button
              onClick={() => setActiveRole('home')}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span>Cambiar Rol</span>
            </button>
          </div>
        </header>

        {/* Main Content Workspace with sidebar on the right on desktop */}
        <main className="flex-1 flex overflow-hidden">
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 bg-slate-100">
            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6">
              
              {/* Page Header Area with Active Title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-250 gap-2 shrink-0">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Ideas Publicidad Arquitectura</span>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    {productionTab === 'flujo' ? 'Flujo de Producción y Manufactura' : productionTab === 'agenda' ? 'Agenda de Operaciones en Campo' : 'Herramientas de Taller y Códigos QR'}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold leading-none px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    ✓ Acceso Taller Mecánico / Impresión
                  </span>
                  <span id="system-time" className="text-[10px] font-mono text-slate-400">
                    {new Date().toISOString().split('T')[0]} Active
                  </span>
                </div>
              </div>

              {/* Producción Workspace component */}
              <div className="w-full">
                <ProduccionWorkspace
                  services={services}
                  quotations={quotations}
                  deliveries={deliveries}
                  onToggleDeliveryStatus={handleToggleDeliveryStatus}
                  activeTab={productionTab}
                  setActiveTab={setProductionTab}
                />
              </div>

            </div>
          </div>

          {/* Right Side Navigation (Desktop/Large Screen) */}
          <aside className="w-64 bg-slate-950 text-slate-100 hidden lg:flex flex-col shrink-0 select-none border-l border-slate-800 justify-between">
            <div className="flex-1 flex flex-col">
              <div className="p-4 bg-slate-900/40 border-b border-slate-800 flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500/10 rounded text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">Menú de Producción</span>
                  <span className="text-[9px] text-slate-400 font-mono font-bold">Taller de Herrería y Lonas</span>
                </div>
              </div>

              <nav className="p-3 space-y-1">
                {[
                  { id: 'flujo', label: 'Flujo de Producción', icon: Layers },
                  { id: 'agenda', label: 'Agenda de Operaciones', icon: Calendar },
                  { id: 'taller', label: 'Herramientas y QR', icon: Wrench }
                ].map((link) => {
                  const IsActive = productionTab === link.id;
                  const IconComponent = link.icon;

                  return (
                    <button
                      key={link.id}
                      onClick={() => setProductionTab(link.id as any)}
                      className={`w-full p-2.5 rounded-lg flex items-center text-left text-xs font-semibold transition-all group ${
                        IsActive
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 mr-3 shrink-0 ${IsActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'}`} />
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-slate-800 space-y-3">
              <button
                onClick={() => setActiveRole('home')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs py-2 px-3 rounded-lg border border-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4 text-amber-400" />
                <span>Cambiar de Rol</span>
              </button>
            </div>
          </aside>

        </main>

        {/* Sticky Bottom Tab Navigation (Mobile Only) */}
        <nav className="sticky bottom-0 bg-slate-950 border-t border-slate-800 p-2 pb-5.5 shadow-lg flex lg:hidden justify-between items-center z-40 shrink-0 select-none">
          {[
            { id: 'flujo', label: 'Flujo', icon: Layers },
            { id: 'agenda', label: 'Agenda', icon: Calendar },
            { id: 'taller', label: 'Herramientas', icon: Wrench },
            { id: 'home', label: 'Cambiar Rol', icon: LogOut }
          ].map((link) => {
            const IsActive = productionTab === link.id || (link.id === 'home' && activeRole === 'home');
            const IconComponent = link.icon;

            return (
              <button
                key={link.id}
                onClick={() => {
                  if (link.id === 'home') {
                    setActiveRole('home');
                  } else {
                    setProductionTab(link.id as any);
                  }
                }}
                className={`flex flex-col items-center flex-1 py-1 px-1 rounded-lg transition-all ${
                  IsActive 
                    ? 'text-purple-400 font-extrabold animate-pulse' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${IsActive ? 'stroke-[2.5px] text-purple-400 scale-105' : 'stroke-[1.8px]'} transition-transform`} />
                <span className="text-[9px] mt-1 font-bold tracking-tight truncate max-w-full">
                  {link.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Footer status info bar */}
        <footer className="bg-slate-950 border-t border-slate-850 py-3 px-6 hidden lg:flex justify-between items-center text-[11px] text-slate-400 select-none shrink-0 z-15">
          <div>
            <span>Ideas Publicidad y Arquitectura | Módulo de Producción y Logística</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Sincronización Taller: <strong className="text-emerald-400 font-bold animate-pulse">● LocalStorage Sync OK</strong></span>
            <span className="text-[10px] bg-slate-900 text-slate-400 font-mono px-2 py-0.5 rounded">v1.0 Producción</span>
          </div>
        </footer>

      </div>
    );
  }

  // RENDER WORKSPACE FOR ALMACEN ROLE
  if (activeRole === 'Almacen') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col select-none">
        
        {/* Global Header Navigation for Almacén */}
        <header className="bg-slate-950 text-white h-16 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-lg z-30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-black text-slate-900 italic transform hover:scale-105 transition-transform shrink-0">
              I
            </div>
            <span className="text-sm md:text-xl font-black tracking-tight uppercase flex items-center whitespace-nowrap">
              Ideas 
              <span className="font-light text-slate-400 font-serif lowercase italic ml-2 hidden sm:inline">
                - publicidad y arquitectura
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="bg-teal-500/10 text-teal-400 rounded-full px-3 py-1 border border-teal-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" />
              Rol: Almacén
            </div>
            <button
              onClick={() => setActiveRole('home')}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span>Cambiar Rol</span>
            </button>
          </div>
        </header>

        {/* Main Content Workspace with sidebar on the right on desktop */}
        <main className="flex-1 flex overflow-hidden">
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 bg-slate-100">
            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6">
              
              {/* Page Header Area with Active Title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-2 shrink-0">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Ideas Publicidad Arquitectura</span>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    {almacenTab === 'inventario' ? 'Control de Inventario de Existencias' : almacenTab === 'compras' ? 'Registro de Compras y Suministros' : almacenTab === 'agenda' ? 'Agenda de Recepción de Insumos' : 'Consola de Respaldo Cloud de Seguridad'}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold leading-none px-3 py-1.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    ✓ Control de Stock Asegurado
                  </span>
                  <span id="system-time" className="text-[10px] font-mono text-slate-400">
                    {new Date().toISOString().split('T')[0]} Active
                  </span>
                </div>
              </div>

              {/* Almacén Workspace component */}
              <div className="w-full">
                <AlmacenWorkspace
                  services={services}
                  quotations={quotations}
                  activeTab={almacenTab}
                  setActiveTab={setAlmacenTab}
                />
              </div>

            </div>
          </div>

          {/* Right Side Navigation (Desktop/Large Screen) */}
          <aside className="w-64 bg-slate-950 text-slate-100 hidden lg:flex flex-col shrink-0 select-none border-l border-slate-800 justify-between">
            <div className="flex-1 flex flex-col">
              <div className="p-4 bg-slate-900/40 border-b border-slate-800 flex items-center gap-2">
                <div className="w-6 h-6 bg-teal-500/10 rounded text-teal-400 flex items-center justify-center">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">Menú de Almacén</span>
                  <span className="text-[9px] text-slate-400 font-mono font-bold">Insumos y Logística</span>
                </div>
              </div>

              <nav className="p-3 space-y-1">
                {[
                  { id: 'inventario', label: 'Inventario de Existencias', icon: Package },
                  { id: 'compras', label: 'Compras y Proveedores', icon: ShoppingCart },
                  { id: 'agenda', label: 'Agenda de Almacén', icon: Calendar },
                  { id: 'respaldo', label: 'Respaldo Cloud de Seguridad', icon: Database }
                ].map((link) => {
                  const IsActive = almacenTab === link.id;
                  const IconComponent = link.icon;

                  return (
                    <button
                      key={link.id}
                      onClick={() => setAlmacenTab(link.id as any)}
                      className={`w-full p-2.5 rounded-lg flex items-center text-left text-xs font-semibold transition-all group ${
                        IsActive
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 mr-3 shrink-0 ${IsActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'}`} />
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-slate-800 space-y-3">
              <button
                onClick={() => setActiveRole('home')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs py-2 px-3 rounded-lg border border-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4 text-amber-400" />
                <span>Cambiar de Rol</span>
              </button>
            </div>
          </aside>

        </main>

        {/* Sticky Bottom Tab Navigation (Mobile/Tablet Only) */}
        <nav className="sticky bottom-0 bg-slate-950 border-t border-slate-800 p-2 pb-5.5 shadow-lg flex lg:hidden justify-between items-center z-40 shrink-0 select-none">
          {[
            { id: 'inventario', label: 'Inventario', icon: Package },
            { id: 'compras', label: 'Compras', icon: ShoppingCart },
            { id: 'agenda', label: 'Agenda', icon: Calendar },
            { id: 'respaldo', label: 'Respaldo', icon: Database },
            { id: 'home', label: 'Cambiar Rol', icon: LogOut }
          ].map((link) => {
            const IsActive = almacenTab === link.id || (link.id === 'home' && activeRole === 'home');
            const IconComponent = link.icon;

            return (
              <button
                key={link.id}
                onClick={() => {
                  if (link.id === 'home') {
                    setActiveRole('home');
                  } else {
                    setAlmacenTab(link.id as any);
                  }
                }}
                className={`flex flex-col items-center flex-1 py-1 px-1 rounded-lg transition-all ${
                  IsActive 
                    ? 'text-teal-400 font-extrabold animate-pulse' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${IsActive ? 'stroke-[2.5px] text-teal-400 scale-105' : 'stroke-[1.8px]'} transition-transform`} />
                <span className="text-[9px] mt-1 font-bold tracking-tight truncate max-w-full">
                  {link.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Footer status info bar */}
        <footer className="bg-slate-950 border-t border-slate-850 py-3 px-6 hidden lg:flex justify-between items-center text-[11px] text-slate-400 select-none shrink-0 z-15">
          <div>
            <span>Ideas Publicidad y Arquitectura | Módulo de Almacén y Control de Suministros</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Sincronización Cloud: <strong className="text-emerald-400 font-bold animate-pulse">● Nube en Tiempo Real OK</strong></span>
            <span className="text-[10px] bg-slate-900 text-slate-400 font-mono px-2 py-0.5 rounded">v1.2 Almacén</span>
          </div>
        </footer>

      </div>
    );
  }

  // Under construction (en construcción) views for roles
  if (activeRole !== 'Admin' && activeRole !== 'Ventas' && activeRole !== 'Diseño' && activeRole !== 'Produccion' && activeRole !== 'Almacen' && activeRole !== 'home') {
    const roleColors: any = {};
    const c = roleColors[activeRole] || { border: 'border-slate-500/30', text: 'text-slate-400', bg: 'bg-slate-500/10' };

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-6 select-none font-sans relative">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="w-full max-w-md text-center bg-slate-850 border border-slate-750 p-8 rounded-3xl space-y-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-slate-950 text-2xl italic mx-auto shadow-md">
            I
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Ideas Publicidad Arquitectura</span>
            <h2 className="text-lg font-black text-white">Rol: {activeRole === 'Produccion' ? 'Producción' : activeRole === 'Almacen' ? 'Almacén' : activeRole}</h2>
          </div>

          <div className={`p-4 rounded-2xl border ${c.border} ${c.bg} space-y-1.5`}>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">● MÓDULO EN CONSTRUCCIÓN</span>
            <p className="text-xs text-slate-350 leading-relaxed">
              El panel de operación detallado para este rol se encuentra bajo construcción para esta sesión. Comunícate con el Administrador para ajustar privilegios.
            </p>
          </div>

          <button
            onClick={() => setActiveRole('home')}
            className="w-full bg-slate-700 hover:bg-slate-650 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Volver a Selección de Roles
          </button>
        </div>
      </div>
    );
  }

  // RENDER COMPLETE ADMIN CONSOLE WORKSPACE
  const renderAdminComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboard
            quotations={quotations}
            invoices={invoices}
            deliveries={deliveries}
            orders={orders}
            onNavigateToTab={(tabId) => setActiveTab(tabId)}
            materials={materials}
            onToggleMaterial={handleToggleMaterial}
            debtors={debtors}
            onPayDebt={handlePayDebt}
          />
        );
      case 'reports':
        return (
          <AdminReports
            quotations={quotations}
            invoices={invoices}
            transactions={transactions}
          />
        );
      case 'finances':
        return (
          <AdminFinance
            quotations={quotations}
            invoices={invoices}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            fixedCosts={fixedCosts}
            onToggleFixedCostStatus={handleToggleFixedCostStatus}
            onUpdateFixedCostAmount={handleUpdateFixedCostAmount}
          />
        );
      case 'billing':
        return (
          <AdminBilling
            quotations={quotations}
            invoices={invoices}
            onAssociateInvoice={handleAssociateInvoice}
          />
        );
      case 'users':
        return (
          <AdminUsers
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onUpdateEmployee={handleUpdateEmployee}
          />
        );
      case 'catalog':
        return (
          <CatalogManager
            services={services}
            onAddService={handleAddService}
            onUpdateServicePrice={handleUpdateServicePrice}
            role="Administrador"
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
            role="Administrador"
          />
        );
      case 'invoice':
        return (
          <InvoiceManager
            invoices={invoices}
            quotations={quotations}
            onTriggerManualInvoice={handleAddManualInvoice}
            role="Administrador"
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
            role="Administrador"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col select-none">
      
      {/* 1. Global Header Navigation */}
      <header className="bg-slate-950 text-white h-16 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-lg z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-black text-slate-900 italic transform hover:scale-105 transition-transform shrink-0">
            I
          </div>
          <span className="text-sm md:text-xl font-black tracking-tight uppercase flex items-center whitespace-nowrap">
            Ideas 
            <span className="font-light text-slate-400 font-serif lowercase italic ml-2 hidden sm:inline">
              - publicidad y arquitectura
            </span>
          </span>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="bg-amber-500/10 text-amber-400 rounded-full px-3 py-1 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
            Directivo Admin
          </div>
          <button
            onClick={() => setActiveRole('home')}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
            title="Regresar a Selección de Roles"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400" />
            <span>Cambiar Rol</span>
          </button>
        </div>
      </header>

      {/* 2. Main Layout Shell */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* 3. Main Content Workspace */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 bg-slate-100">
          
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6">
            
            {/* Page Header Area with Active Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-250 gap-2 shrink-0">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Ideas Publicidad Arquitectura</span>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">{getHeaderTitle()}</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold leading-none px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  ✨ Acceso Directivo Activo
                </span>
                <span id="system-time" className="text-[10px] font-mono text-slate-400">
                  2026-06-30 07:46
                </span>
              </div>
            </div>

            {/* Main Workspace Router container */}
            <div className="w-full">
              {renderAdminComponent()}
            </div>

          </div>

        </div>

        {/* Right Side Navigation (Desktop/Large Screen) */}
        <aside className="w-64 bg-slate-950 text-slate-100 hidden lg:flex flex-col shrink-0 select-none border-l border-slate-800">
          <div className="p-4 bg-slate-900/40 border-b border-slate-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500/10 rounded text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black block">Juan Pérez Díaz</span>
              <span className="text-[9px] text-slate-500 font-mono block">Administrador Total</span>
            </div>
          </div>
          
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
              Navegación Admin
            </p>
            {ADMIN_NAV_LINKS.map((link) => {
              const IsActive = activeTab === link.id;
              const IconComponent = link.icon;

              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full p-2.5 rounded-lg flex items-center text-left text-xs font-semibold transition-all group ${
                    IsActive
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                  title={link.label}
                >
                  <IconComponent className={`w-4 h-4 mr-3 shrink-0 ${IsActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

      </main>

      {/* 4. Sticky Bottom Tab Navigation (Mobile Only) */}
      <nav className="sticky bottom-0 bg-slate-950 border-t border-slate-800 p-2 pb-5.5 shadow-lg flex lg:hidden justify-between items-center z-40 shrink-0 select-none">
        {ADMIN_NAV_LINKS.slice(0, 5).map((link) => {
          const IsActive = activeTab === link.id;
          const IconComponent = link.icon;

          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`flex flex-col items-center flex-1 py-1 px-1 rounded-lg transition-all ${
                IsActive 
                  ? 'text-amber-400 font-extrabold' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={link.label}
            >
              <IconComponent className={`w-5 h-5 ${IsActive ? 'stroke-[2.5px] text-amber-400 scale-105' : 'stroke-[1.8px]'} transition-transform`} />
              <span className="text-[9px] mt-1 font-bold tracking-tight truncate max-w-full">
                {link.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 5. Desktop Footer status info bar */}
      <footer className="bg-slate-950 border-t border-slate-850 py-3 px-6 hidden lg:flex justify-between items-center text-[11px] text-slate-400 select-none shrink-0 z-15">
        <div>
          <span>Código postal base SAT: <strong>01000</strong> | Ideas Publicidad y Arquitectura</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Sincronización: <strong className="text-emerald-400 font-bold animate-pulse">● LocalStorage Sync OK</strong></span>
          <span className="text-[10px] bg-slate-900 text-slate-400 font-mono px-2 py-0.5 rounded">v3.0 Directiva</span>
        </div>
      </footer>

    </div>
  );
}

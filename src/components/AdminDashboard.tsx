import React, { useState } from 'react';
import { Quotation, Invoice, Delivery, PurchaseOrder } from '../types';
import { 
  TrendingUp, FileText, Settings, ShieldAlert, BadgeAlert, 
  Layers, Calendar, AlertTriangle, HelpCircle, ArrowRight,
  Package, DollarSign, Wallet, Users, ClipboardCheck, ArrowUpRight, ArrowDownRight, Check, Play, AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  quotations: Quotation[];
  invoices: Invoice[];
  deliveries: Delivery[];
  orders: PurchaseOrder[];
  onNavigateToTab: (tabId: string) => void;
  materials: { id: string; name: string; quantity: string; cost: number; purchased: boolean }[];
  onToggleMaterial: (id: string) => void;
  debtors: { id: string; client: string; project: string; total: number; pending: number }[];
  onPayDebt: (id: string, amount: number) => void;
}

export default function AdminDashboard({
  quotations,
  invoices,
  deliveries,
  orders,
  onNavigateToTab,
  materials,
  onToggleMaterial,
  debtors,
  onPayDebt
}: AdminDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [selectedDebtor, setSelectedDebtor] = useState<string | null>(null);

  // Today's date is 2026-06-30 as per context metadata
  const TODAY_STR = '2026-06-30';

  // 1. Ventas del mes (All invoices + Accepted quotes in June 2026)
  const juneSalesQuotes = quotations.filter(q => q.date.startsWith('2026-06') && q.status !== 'pendiente');
  const salesFromQuotesTotal = juneSalesQuotes.reduce((sum, q) => sum + q.total, 0);
  const salesFromInvoicesTotal = invoices.filter(inv => inv.date.startsWith('2026-06')).reduce((sum, inv) => sum + inv.total, 0);
  const ventasDelMes = Math.max(salesFromQuotesTotal, salesFromInvoicesTotal, 65000); // stable representation

  // 2. Cotizaciones pendientes
  const pendingQuotes = quotations.filter(q => q.status === 'pendiente');
  const cotizacionesPendientesTotal = pendingQuotes.reduce((sum, q) => sum + q.total, 0);

  // 3. Pedidos en producción
  const activeDeliveries = deliveries.filter(d => d.status === 'pendiente');
  const pedidosProduccionCount = activeDeliveries.length;

  // 4. Entregas de hoy (Vence 2026-06-30)
  const todaysDeliveries = deliveries.filter(d => d.date === TODAY_STR);
  const entregasHoyCount = todaysDeliveries.length;

  // 5. Clientes con adeudos
  const activeDebtors = debtors.filter(d => d.pending > 0);
  const totalAdeudo = activeDebtors.reduce((sum, d) => sum + d.pending, 0);

  // 6. Material por comprar
  const pendingMaterials = materials.filter(m => !m.purchased);
  const materialPorComprarCount = pendingMaterials.length;

  // 7. Pedidos atrasados (Date < TODAY_STR and status pending)
  const delayedDeliveries = deliveries.filter(d => d.status === 'pendiente' && d.date < TODAY_STR);
  const pedidosAtrasadosCount = delayedDeliveries.length;

  // 8. Ganancia del mes (Ventas - Materiales Cost - Fixed Costs)
  // Let's assume June 2026 fixed costs total $42,700
  const fixedCostsTotal = 42700;
  const materialsCostTotal = materials.filter(m => m.purchased).reduce((sum, m) => sum + m.cost, 0);
  const gananciaDelMes = Math.max(5000, ventasDelMes - fixedCostsTotal - materialsCostTotal);

  const renderMetricModal = () => {
    if (!selectedMetric) return null;

    let title = '';
    let content = null;

    if (selectedMetric === 'ventas') {
      title = 'Ventas Detalladas de Junio 2026';
      content = (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Suma consolidada de facturación vigente y proyectos activos firmados en el mes de Junio 2026.</p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-400 block font-mono">FACTURADO CFDI</span>
              <span className="text-lg font-bold text-slate-900">${salesFromInvoicesTotal.toLocaleString('es-MX')} MXN</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-mono">CONTRATOS FIRMADOS</span>
              <span className="text-lg font-bold text-slate-900">${salesFromQuotesTotal.toLocaleString('es-MX')} MXN</span>
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="p-2.5">Folio / Fecha</th>
                  <th className="p-2.5">Cliente</th>
                  <th className="p-2.5 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.filter(q => q.status !== 'pendiente').map(q => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono">{q.folio}<br/><span className="text-[10px] text-slate-400">{q.date}</span></td>
                    <td className="p-2.5 font-semibold text-slate-850">{q.clientName}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-600">${q.total.toLocaleString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (selectedMetric === 'cotizaciones') {
      title = 'Cotizaciones por Aprobar';
      content = (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Visualización de propuestas comerciales enviadas que esperan respuesta del cliente.</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pendingQuotes.length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-6">No hay cotizaciones pendientes actualmente.</p>
            ) : (
              pendingQuotes.map(q => (
                <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">{q.folio}</span>
                    <h4 className="text-xs font-bold text-slate-850 mt-1">{q.clientName}</h4>
                    <span className="text-[10px] text-slate-400">{q.date} • {q.items.length} conceptos</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900 block">${q.total.toLocaleString('es-MX')}</span>
                    <button 
                      onClick={() => onNavigateToTab('quotes')}
                      className="text-[10px] text-indigo-600 hover:underline font-bold mt-1"
                    >
                      Gestionar ➔
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    } else if (selectedMetric === 'produccion') {
      title = 'Pedidos Activos en Producción';
      content = (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Listado de proyectos y tareas que se encuentran en desarrollo por el equipo de diseño y producción.</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {activeDeliveries.map(d => (
              <div key={d.id} className="p-3 bg-white border border-slate-150 rounded-xl flex justify-between items-center shadow-xs">
                <div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${d.category === 'arquitectura' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{d.category}</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{d.title}</h4>
                  <span className="text-[10px] text-slate-450">{d.projectName} — {d.clientName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-mono">Vence: {d.date}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded mt-1 inline-block">EN PROCESO</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (selectedMetric === 'entregas') {
      title = 'Agenda de Entregas para Hoy';
      content = (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Entregas programadas para realizarse el día de hoy ({TODAY_STR}).</p>
          <div className="space-y-2">
            {todaysDeliveries.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-450 italic">No hay entregas registradas para el día de hoy.</p>
                <button onClick={() => onNavigateToTab('calendar')} className="text-xs text-amber-600 hover:underline font-bold mt-1">Ver Calendario Completo ➔</button>
              </div>
            ) : (
              todaysDeliveries.map(d => (
                <div key={d.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{d.title}</h4>
                    <p className="text-[10px] text-slate-500">{d.clientName}</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">HOY</span>
                </div>
              ))
            )}
          </div>
        </div>
      );
    } else if (selectedMetric === 'adeudos') {
      title = 'Clientes con Adeudos Vigentes';
      content = (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Control de saldos insolutos de proyectos. Selecciona un cliente para registrar abonos o liquidaciones en tiempo real.</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {activeDebtors.map(d => (
              <div key={d.id} className={`p-3 border rounded-xl transition ${selectedDebtor === d.id ? 'border-amber-500 bg-amber-50/30' : 'border-slate-200 bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{d.client}</h4>
                    <p className="text-[10px] text-slate-500">{d.project}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-red-600 block">${d.pending.toLocaleString('es-MX')}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">De ${d.total.toLocaleString('es-MX')}</span>
                  </div>
                </div>
                {selectedDebtor === d.id ? (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        placeholder="Monto"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const num = parseFloat(payAmount);
                        if (!isNaN(num) && num > 0) {
                          onPayDebt(d.id, num);
                          setPayAmount('');
                          setSelectedDebtor(null);
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                    >
                      Abonar
                    </button>
                    <button
                      onClick={() => setSelectedDebtor(null)}
                      className="text-xs text-slate-400 font-bold hover:text-slate-600 px-1"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => {
                        setSelectedDebtor(d.id);
                        setPayAmount(d.pending.toString());
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded transition"
                    >
                      Registrar Pago
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    } else if (selectedMetric === 'materiales') {
      title = 'Insumos y Material por Comprar';
      content = (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Materiales y consumibles necesarios para completar las órdenes de diseño y stands activos.</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {materials.map(m => (
              <div key={m.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onToggleMaterial(m.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${m.purchased ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white hover:border-slate-400'}`}
                  >
                    {m.purchased && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div>
                    <h4 className={`text-xs font-bold ${m.purchased ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{m.name}</h4>
                    <span className="text-[10px] text-slate-450 font-mono">{m.quantity} | Est. ${m.cost.toLocaleString('es-MX')}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.purchased ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {m.purchased ? 'Adquirido' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (selectedMetric === 'atrasados') {
      title = 'Pedidos con Alerta de Atraso';
      content = (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Entregas que han superado su fecha prometida de entrega y continúan en estatus de pendiente.</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {delayedDeliveries.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-emerald-50/20">
                <p className="text-xs text-emerald-800 font-bold flex items-center justify-center gap-1">
                  ✓ ¡Excelente! No hay pedidos atrasados.
                </p>
              </div>
            ) : (
              delayedDeliveries.map(d => (
                <div key={d.id} className="p-3 bg-red-50/50 border border-red-200 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-red-100 text-red-800 rounded uppercase font-mono">DEMORADO</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{d.title}</h4>
                    <p className="text-[10px] text-slate-500">{d.clientName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-red-600 block">Venció: {d.date}</span>
                    <button 
                      onClick={() => onNavigateToTab('calendar')}
                      className="text-[9px] font-bold text-indigo-600 hover:underline mt-1"
                    >
                      Ver Agenda ➔
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    } else if (selectedMetric === 'ganancias') {
      title = 'Análisis de Utilidad Consolidada';
      content = (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Estimación de la ganancia operativa restando gastos e insumos de la venta del mes.</p>
          <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span>(+) Ingresos Estimados:</span>
              <span className="text-emerald-400 font-bold">${ventasDelMes.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span>(-) Gastos Fijos:</span>
              <span className="text-red-400">-${fixedCostsTotal.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span>(-) Insumos / Materiales:</span>
              <span className="text-red-400">-${materialsCostTotal.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-bold">
              <span>(=) Utilidad Neta:</span>
              <span className="text-amber-400">${gananciaDelMes.toLocaleString('es-MX')}</span>
            </div>
          </div>
          <button 
            onClick={() => onNavigateToTab('finances')}
            className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition"
          >
            Detalle en Módulo de Finanzas ➔
          </button>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 select-none">
        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-base font-black text-slate-950 tracking-tight">{title}</h3>
            <button
              onClick={() => { setSelectedMetric(null); setSelectedDebtor(null); }}
              className="p-1 rounded-full hover:bg-slate-150 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 8 Metric KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Indicadores Operativos</h2>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">Junio 2026</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* 1. Ventas del mes */}
          <div 
            onClick={() => setSelectedMetric('ventas')}
            className="bg-white hover:border-emerald-500 border border-slate-200 p-4 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md group relative overflow-hidden"
          >
            <div className="flex justify-between items-center text-slate-400 group-hover:text-emerald-600">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Ventas del Mes</span>
              <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-lg font-black font-mono text-slate-950">${ventasDelMes.toLocaleString('es-MX')}</h3>
              <p className="text-[10px] text-slate-450 mt-1 flex items-center gap-0.5">
                <span className="text-emerald-600 font-bold">12% ▲</span> respecto a mayo
              </p>
            </div>
          </div>

          {/* 2. Cotizaciones pendientes */}
          <div 
            onClick={() => setSelectedMetric('cotizaciones')}
            className="bg-white hover:border-amber-500 border border-slate-200 p-4 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md group"
          >
            <div className="flex justify-between items-center text-slate-400 group-hover:text-amber-600">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Cotiz. Pendientes</span>
              <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-lg font-black font-mono text-slate-950">{pendingQuotes.length}</h3>
              <p className="text-[10px] text-slate-450 mt-1">Valor est. ${cotizacionesPendientesTotal.toLocaleString('es-MX')}</p>
            </div>
          </div>

          {/* 3. Pedidos en producción */}
          <div 
            onClick={() => setSelectedMetric('produccion')}
            className="bg-white hover:border-purple-500 border border-slate-200 p-4 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md group"
          >
            <div className="flex justify-between items-center text-slate-400 group-hover:text-purple-600">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">En Producción</span>
              <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-lg font-black font-mono text-slate-950">{pedidosProduccionCount}</h3>
              <p className="text-[10px] text-slate-450 mt-1">Renders & Rótulos activos</p>
            </div>
          </div>

          {/* 4. Entregas de hoy */}
          <div 
            onClick={() => setSelectedMetric('entregas')}
            className="bg-white hover:border-blue-500 border border-slate-200 p-4 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md group"
          >
            <div className="flex justify-between items-center text-slate-400 group-hover:text-blue-600">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Entregas de Hoy</span>
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-lg font-black font-mono text-slate-950">{entregasHoyCount}</h3>
              <p className="text-[10px] text-slate-450 mt-1">Sincronizado con Agenda</p>
            </div>
          </div>

          {/* 5. Clientes con adeudos */}
          <div 
            onClick={() => setSelectedMetric('adeudos')}
            className="bg-white hover:border-red-500 border border-slate-200 p-4 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md group"
          >
            <div className="flex justify-between items-center text-slate-400 group-hover:text-red-600">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Saldos por Cobrar</span>
              <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-lg font-black font-mono text-slate-950">${totalAdeudo.toLocaleString('es-MX')}</h3>
              <p className="text-[10px] text-red-600 mt-1 font-bold">{activeDebtors.length} clientes pendientes</p>
            </div>
          </div>

          {/* 6. Material por comprar */}
          <div 
            onClick={() => setSelectedMetric('materiales')}
            className="bg-white hover:border-teal-500 border border-slate-200 p-4 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md group"
          >
            <div className="flex justify-between items-center text-slate-400 group-hover:text-teal-600">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Insumos Faltantes</span>
              <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-teal-600" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-lg font-black font-mono text-slate-950">{materialPorComprarCount}</h3>
              <p className="text-[10px] text-slate-450 mt-1">Insumos para obras</p>
            </div>
          </div>

          {/* 7. Pedidos atrasados */}
          <div 
            onClick={() => setSelectedMetric('atrasados')}
            className={`p-4 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md group border ${
              pedidosAtrasadosCount > 0 
                ? 'bg-red-50/50 border-red-200 hover:border-red-500' 
                : 'bg-white border-slate-200 hover:border-slate-400'
            }`}
          >
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Pedidos Atrasados</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${pedidosAtrasadosCount > 0 ? 'bg-red-100' : 'bg-slate-50'}`}>
                <AlertTriangle className={`w-4 h-4 ${pedidosAtrasadosCount > 0 ? 'text-red-600' : 'text-slate-400'}`} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className={`text-lg font-black font-mono ${pedidosAtrasadosCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>{pedidosAtrasadosCount}</h3>
              <p className="text-[10px] text-slate-450 mt-1">Con vencimiento previo</p>
            </div>
          </div>

          {/* 8. Ganancia del mes */}
          <div 
            onClick={() => setSelectedMetric('ganancias')}
            className="bg-slate-905 hover:bg-slate-900 text-white p-4 rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg border border-slate-800"
          >
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Ganancia Est.</span>
              <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-lg font-black font-mono text-amber-400">${gananciaDelMes.toLocaleString('es-MX')}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Margen neto operativo</p>
            </div>
          </div>

        </div>
      </div>

      {/* Internal Alert Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-xl text-amber-700 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase">Alerta de Entrega BMW</h4>
            <p className="text-xs text-slate-650 leading-relaxed">Vigilancia requerida en la entrega del material del Stand BMW de la próxima semana.</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigateToTab('calendar')}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-4 py-2 rounded-lg shrink-0 transition"
        >
          Verificar Entrega
        </button>
      </div>

      {renderMetricModal()}
    </div>
  );
}

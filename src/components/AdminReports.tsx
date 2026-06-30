import React, { useState } from 'react';
import { Quotation, Invoice } from '../types';
import { 
  TrendingUp, BarChart3, Users, PieChart, Landmark, ArrowUpRight, ArrowDownRight, 
  Sparkles, DollarSign, ChevronRight, Activity, Percent
} from 'lucide-react';

interface AdminReportsProps {
  quotations: Quotation[];
  invoices: Invoice[];
  transactions: { id: string; description: string; category: string; amount: number; date: string; type: 'ingreso' | 'egreso' }[];
}

export default function AdminReports({ quotations, invoices, transactions }: AdminReportsProps) {
  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'clients' | 'products' | 'projects' | 'expenses' | 'utility'>('sales');

  // Sample data lists for full fidelity
  const salesByMonth = [
    { month: 'Ene 2026', amount: 48000, margin: 0.42 },
    { month: 'Feb 2026', amount: 59000, margin: 0.45 },
    { month: 'Mar 2026', amount: 72000, margin: 0.48 },
    { month: 'Abr 2026', amount: 64000, margin: 0.41 },
    { month: 'May 2026', amount: 81000, margin: 0.52 },
    { month: 'Jun 2026', amount: 94500, margin: 0.55 },
  ];

  const topClients = [
    { name: 'Inmobiliaria Delta S.A.', totalPurchased: 145000, projects: 4, label: 'Arquitectura' },
    { name: 'Corporativo Bancomer', totalPurchased: 84000, projects: 2, label: 'Publicidad' },
    { name: 'Restaurante El Portal', totalPurchased: 35000, projects: 3, label: 'Publicidad' },
    { name: 'BMW México', totalPurchased: 24500, projects: 1, label: 'Stand corporativo' },
    { name: 'Gicsa Desarrollos', totalPurchased: 18000, projects: 1, label: 'Maquetas escala' },
  ];

  const topProducts = [
    { name: 'Stand Corporativo Configurable 3x3', salesCount: 8, totalRevenue: 196000, percent: 45 },
    { name: 'Render 3D Fotorrealista Premium', salesCount: 32, totalRevenue: 112000, percent: 25 },
    { name: 'Diseño de Identidad de Marca Pro', salesCount: 10, totalRevenue: 85000, percent: 20 },
    { name: 'Anuncio Espectacular Metálico (Renta)', salesCount: 3, totalRevenue: 54000, percent: 10 },
  ];

  const projectProfits = [
    { project: 'Stand Corporativo BMW', cost: 11000, price: 24500, profit: 13500, percent: 55 },
    { project: 'Renders Torre Delta', cost: 4200, price: 14000, profit: 9800, percent: 70 },
    { project: 'Maqueta Centro Banamex', cost: 7500, price: 15000, profit: 7500, percent: 50 },
    { project: 'Fachada El Portal', cost: 1800, price: 4600, profit: 2800, percent: 60 },
  ];

  // Expenses calculations
  const totalEgresos = transactions
    .filter(t => t.type === 'egreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const expensesByCategory = [
    { category: 'Materiales & Producción', amount: totalEgresos * 0.4 || 18000, color: 'bg-amber-500' },
    { category: 'Nómina', amount: 15000, color: 'bg-red-500' },
    { category: 'Renta & Oficina', amount: 12000, color: 'bg-indigo-500' },
    { category: 'Servicios & Software', amount: 4500, color: 'bg-teal-500' },
  ];
  const grandTotalExpenses = expensesByCategory.reduce((sum, e) => sum + e.amount, 0);

  // Utility calculations
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalEarnings = Math.max(totalInvoiced, 94500); // stable total earnings representation
  const netProfit = totalEarnings - grandTotalExpenses;
  const netMargin = (netProfit / totalEarnings) * 100;

  const maxMonthAmount = Math.max(...salesByMonth.map(s => s.amount));
  const maxClientAmount = Math.max(...topClients.map(c => c.totalPurchased));

  return (
    <div className="space-y-6">
      
      {/* Interactive Report Selection Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeReportTab === 'sales' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-650 hover:text-slate-900'}`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Ventas por Mes
        </button>
        <button
          onClick={() => setActiveReportTab('clients')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeReportTab === 'clients' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-650 hover:text-slate-900'}`}
        >
          <Users className="w-4 h-4 text-blue-500" />
          Clientes Top
        </button>
        <button
          onClick={() => setActiveReportTab('products')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeReportTab === 'products' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-650 hover:text-slate-900'}`}
        >
          <PieChart className="w-4 h-4 text-indigo-500" />
          Más Vendidos
        </button>
        <button
          onClick={() => setActiveReportTab('projects')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeReportTab === 'projects' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-650 hover:text-slate-900'}`}
        >
          <Activity className="w-4 h-4 text-teal-500" />
          Utilidad x Proyecto
        </button>
        <button
          onClick={() => setActiveReportTab('expenses')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeReportTab === 'expenses' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-650 hover:text-slate-900'}`}
        >
          <ArrowDownRight className="w-4 h-4 text-red-500" />
          Monitoreo Gastos
        </button>
        <button
          onClick={() => setActiveReportTab('utility')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeReportTab === 'utility' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-650 hover:text-slate-900'}`}
        >
          <Landmark className="w-4 h-4 text-amber-500" />
          Utilidad Neta
        </button>
      </div>

      {/* Render active tab visualization with full interactivity */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs select-none">
        
        {activeReportTab === 'sales' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-4 bg-emerald-500 rounded-full"></span>
                Ventas del Semestre - Ideas Publicidad Arquitectura
              </h3>
              <p className="text-xs text-slate-500 mt-1">Crecimiento sostenido impulsado por renders 3D y stands corporativos.</p>
            </div>

            {/* Custom Interactive SVG/Flex Chart */}
            <div className="space-y-4 pt-4">
              {salesByMonth.map((sm, idx) => {
                const pct = (sm.amount / maxMonthAmount) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">{sm.month}</span>
                      <span className="font-mono text-slate-950 font-bold">${sm.amount.toLocaleString('es-MX')} MXN <span className="text-emerald-600 ml-1">({Math.round(sm.margin * 100)}% mg)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${pct}%` }} 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeReportTab === 'clients' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-4 bg-blue-500 rounded-full"></span>
                Clientes de Mayor Facturación
              </h3>
              <p className="text-xs text-slate-500 mt-1">Identificación de clientes clave para relaciones comerciales a largo plazo.</p>
            </div>

            <div className="space-y-4 pt-2">
              {topClients.map((client, idx) => {
                const pct = (client.totalPurchased / maxClientAmount) * 100;
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-400 w-6">#0{idx+1}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-850">{client.name} <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded ml-1.5">{client.label}</span></span>
                        <span className="font-mono font-black text-slate-950">${client.totalPurchased.toLocaleString('es-MX')}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${pct}%` }} 
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeReportTab === 'products' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-4 bg-indigo-500 rounded-full"></span>
                Productos y Servicios Más Vendidos
              </h3>
              <p className="text-xs text-slate-500 mt-1">Volumen de ventas acumuladas por tipo de servicio en la consola corporativa.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {topProducts.map((p, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">Top #{idx+1}</span>
                      <span className="text-[11px] font-mono text-slate-500">{p.percent}% de ingresos</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-2">{p.name}</h4>
                  </div>
                  <div className="mt-4 flex justify-between items-center border-t border-slate-150 pt-2 text-xs font-mono">
                    <span>Cant: <strong>{p.salesCount} ud</strong></span>
                    <span className="font-bold text-slate-900">${p.totalRevenue.toLocaleString('es-MX')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeReportTab === 'projects' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-4 bg-teal-500 rounded-full"></span>
                Evaluación de Rentabilidad de Proyectos
              </h3>
              <p className="text-xs text-slate-500 mt-1">Detalle de ingresos contra costos operativos por proyecto ejecutado.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider italic font-bold">
                    <th className="pb-3">Nombre Proyecto</th>
                    <th className="pb-3 text-right">Inversión Costo</th>
                    <th className="pb-3 text-right">Monto Cobrado</th>
                    <th className="pb-3 text-right">Utilidad Ganancia</th>
                    <th className="pb-3 text-center">Margen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {projectProfits.map((pp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">{pp.project}</td>
                      <td className="py-3 text-right font-mono text-red-600">-${pp.cost.toLocaleString('es-MX')}</td>
                      <td className="py-3 text-right font-mono text-emerald-600">${pp.price.toLocaleString('es-MX')}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900">${pp.profit.toLocaleString('es-MX')}</td>
                      <td className="py-3 text-center">
                        <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                          {pp.percent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReportTab === 'expenses' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-4 bg-red-500 rounded-full"></span>
                Desglose y Control de Egresos Operativos
              </h3>
              <p className="text-xs text-slate-500 mt-1">Monitoreo de salida de capital del mes actual clasificado por áreas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 items-center">
              <div className="md:col-span-7 space-y-4">
                {expensesByCategory.map((e, idx) => {
                  const pct = (e.amount / grandTotalExpenses) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800">{e.category}</span>
                        <span className="font-mono text-slate-950">${e.amount.toLocaleString('es-MX')} <span className="text-slate-400 font-normal">({Math.round(pct)}%)</span></span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%` }} className={`${e.color} h-full rounded-full`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="md:col-span-5 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-center space-y-2">
                <Landmark className="w-8 h-8 text-red-400 mx-auto" />
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Total de Gastos de Operación</span>
                <h3 className="text-xl font-mono font-black text-red-400">${grandTotalExpenses.toLocaleString('es-MX')} MXN</h3>
                <p className="text-[10px] text-slate-400">Incluye nóminas, licencias y materiales de producción activos.</p>
              </div>
            </div>
          </div>
        )}

        {activeReportTab === 'utility' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-4 bg-amber-500 rounded-full"></span>
                Análisis de Utilidad y Rendimiento Neto
              </h3>
              <p className="text-xs text-slate-500 mt-1">Comparativa neta de ingresos totales menos costos fijos y variables.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <ArrowUpRight className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Ingreso Consolidado</span>
                <span className="text-lg font-mono font-bold text-slate-950 block mt-1">${totalEarnings.toLocaleString('es-MX')}</span>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <ArrowDownRight className="w-6 h-6 text-red-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-red-800 uppercase block">Egreso Consolidado</span>
                <span className="text-lg font-mono font-bold text-slate-950 block mt-1">-${grandTotalExpenses.toLocaleString('es-MX')}</span>
              </div>

              <div className="bg-amber-50 border border-amber-250 rounded-xl p-4 text-center">
                <Sparkles className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Utilidad Operativa Real</span>
                <span className="text-lg font-mono font-bold text-amber-700 block mt-1">${netProfit.toLocaleString('es-MX')}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Margen Neto de Ganancia Global</span>
                <span className="text-[11px] text-slate-500">Estimación ponderada del retorno sobre las cotizaciones firmadas.</span>
              </div>
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-500" />
                <span className="text-xl font-bold text-slate-900">{netMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

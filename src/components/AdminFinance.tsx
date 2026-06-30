import React, { useState } from 'react';
import { Quotation, Invoice } from '../types';
import { 
  Plus, Trash2, ArrowUpRight, ArrowDownRight, DollarSign, Wallet, 
  Layers, Landmark, Check, AlertCircle, Edit, Calendar
} from 'lucide-react';

interface AdminFinanceProps {
  quotations: Quotation[];
  invoices: Invoice[];
  transactions: { id: string; description: string; category: string; amount: number; date: string; type: 'ingreso' | 'egreso' }[];
  onAddTransaction: (t: { description: string; category: string; amount: number; date: string; type: 'ingreso' | 'egreso' }) => void;
  onDeleteTransaction: (id: string) => void;
  fixedCosts: { id: string; name: string; amount: number; status: 'pagado' | 'pendiente' }[];
  onToggleFixedCostStatus: (id: string) => void;
  onUpdateFixedCostAmount: (id: string, amount: number) => void;
}

export default function AdminFinance({
  quotations,
  invoices,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  fixedCosts,
  onToggleFixedCostStatus,
  onUpdateFixedCostAmount
}: AdminFinanceProps) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'ingreso' | 'egreso'>('ingreso');
  
  // States for updating fixed cost inline
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [editingAmountValue, setEditingAmountValue] = useState('');

  // Calculations
  const totalIngresos = transactions
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEgresos = transactions
    .filter(t => t.type === 'egreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFixedCostsPending = fixedCosts
    .filter(fc => fc.status === 'pendiente')
    .reduce((sum, fc) => sum + fc.amount, 0);

  const totalFixedCostsPaid = fixedCosts
    .filter(fc => fc.status === 'pagado')
    .reduce((sum, fc) => sum + fc.amount, 0);

  const utilidadBrutaMensual = totalIngresos - totalEgresos;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!description.trim() || !category.trim() || isNaN(num) || num <= 0) return;

    onAddTransaction({
      description,
      category,
      amount: num,
      date,
      type
    });

    setDescription('');
    setCategory('');
    setAmount('');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase block font-mono">Ingresos Registrados</span>
            <span className="text-base font-mono font-black text-slate-900 mt-1 block">${totalIngresos.toLocaleString('es-MX')}</span>
          </div>
          <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-red-800 uppercase block font-mono">Egresos Registrados</span>
            <span className="text-base font-mono font-black text-slate-900 mt-1 block">${totalEgresos.toLocaleString('es-MX')}</span>
          </div>
          <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center text-red-700">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between border border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Utilidad Bruta</span>
            <span className={`text-base font-mono font-black mt-1 block ${utilidadBrutaMensual >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
              ${utilidadBrutaMensual.toLocaleString('es-MX')}
            </span>
          </div>
          <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-amber-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Main Columns Layout: Register transaction & fixed costs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Form & list of transactions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Form to add Transaction */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-500" />
              Registrar Movimiento Financiero
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">TIPO</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as 'ingreso' | 'egreso')}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="ingreso">Ingreso (+)</option>
                    <option value="egreso">Egreso (-)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">CATEGORÍA</label>
                  <input
                    type="text"
                    required
                    placeholder="Materiales, Nómina, Venta Renders"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">CONCEPTO / DESCRIPCIÓN</label>
                <input
                  type="text"
                  required
                  placeholder="Cobro de anticipo de maqueta Delta S.A."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">MONTO ($ MXN)</label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">FECHA</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2 px-4 rounded-lg transition"
              >
                Agregar Movimiento
              </button>
            </form>
          </div>

          {/* Transactions History Log */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Bitácora de Movimientos</span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">{transactions.length} registrados</span>
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <p className="text-xs text-center text-slate-450 italic py-8">No se han registrado movimientos.</p>
              ) : (
                transactions.map(t => (
                  <div key={t.id} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-150 flex items-center justify-between transition gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-10 rounded-full ${t.type === 'ingreso' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">{t.description}</h4>
                        <span className="text-[9px] text-slate-400 font-mono">{t.date} • <span className="uppercase">{t.category}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-black ${t.type === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'ingreso' ? '+' : '-'}${t.amount.toLocaleString('es-MX')}
                      </span>
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="text-slate-350 hover:text-red-500 p-1"
                        title="Eliminar transacción"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right: Fixed Costs & Projections */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Fixed costs manager */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Gastos Fijos de Operación</span>
              <span className="text-[10px] text-slate-450 font-mono">Mes Corriente</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-4 leading-normal">Control mensual de compromisos fijos del taller y oficinas de Ideas.</p>

            <div className="space-y-3">
              {fixedCosts.map(fc => (
                <div key={fc.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex flex-col justify-between gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{fc.name}</h4>
                      {editingCostId === fc.id ? (
                        <div className="mt-1 flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editingAmountValue}
                            onChange={(e) => setEditingAmountValue(e.target.value)}
                            className="w-20 bg-white border border-slate-200 rounded p-0.5 text-xs font-bold"
                          />
                          <button
                            onClick={() => {
                              const val = parseFloat(editingAmountValue);
                              if (!isNaN(val) && val > 0) {
                                onUpdateFixedCostAmount(fc.id, val);
                                setEditingCostId(null);
                              }
                            }}
                            className="bg-slate-900 text-white text-[10px] p-1 rounded font-bold"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <span 
                          onClick={() => {
                            setEditingCostId(fc.id);
                            setEditingAmountValue(fc.amount.toString());
                          }}
                          className="text-[10px] text-slate-400 font-mono font-semibold hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                          title="Click para editar monto"
                        >
                          ${fc.amount.toLocaleString('es-MX')} MXN <Edit className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onToggleFixedCostStatus(fc.id)}
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        fc.status === 'pagado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                      }`}
                    >
                      {fc.status === 'pagado' ? 'Pagado ✓' : 'Pendiente ◯'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total summary info */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 font-mono text-[11px] text-slate-500">
              <div className="flex justify-between">
                <span>Gastos fijos liquidados:</span>
                <span className="text-emerald-600 font-bold">${totalFixedCostsPaid.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between">
                <span>Gastos fijos pendientes:</span>
                <span className="text-amber-600 font-bold">${totalFixedCostsPending.toLocaleString('es-MX')}</span>
              </div>
            </div>
          </div>

          {/* Interactive Utility per Quotation list */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Utilidad Estimada por Pedido</h3>
            <p className="text-[11px] text-slate-500 mb-3 leading-normal">Mapeo del rendimiento bruto proyectado de las cotizaciones activas.</p>

            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {quotations.filter(q => q.status !== 'pendiente').map(q => {
                // assume an average of 45% production/cost variables per quote
                const estimatedCost = q.total * 0.45;
                const estimatedProfit = q.total - estimatedCost;
                return (
                  <div key={q.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-850 truncate max-w-[150px]">{q.clientName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{q.folio}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-slate-900 block font-bold">${q.total.toLocaleString('es-MX')}</span>
                      <span className="text-[10px] text-emerald-600 font-extrabold">+{estimatedProfit.toLocaleString('es-MX')} (55%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ServiceItem, ServiceType } from '../types';
import { Plus, ListFilter, DollarSign, PenSquare, X, Check, Eye } from 'lucide-react';

interface CatalogManagerProps {
  services: ServiceItem[];
  onAddService: (newService: ServiceItem) => void;
  onUpdateServicePrice: (id: string, newPrice: number) => void;
  role: 'Administrador' | 'Personal de Apoyo';
}

export default function CatalogManager({ services, onAddService, onUpdateServicePrice, role }: CatalogManagerProps) {
  const [filterType, setFilterType] = useState<'all' | ServiceType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New service form fields
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ServiceType>('publicidad');
  const [newUnit, setNewUnit] = useState('m²');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filteredServices = services.filter(
    (s) => filterType === 'all' || s.type === filterType
  );

  const startEditPrice = (item: ServiceItem) => {
    if (role === 'Personal de Apoyo') return; // Restriction
    setEditingId(item.id);
    setTempPrice(item.price.toString());
  };

  const savePrice = (id: string) => {
    const parsed = parseFloat(tempPrice);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateServicePrice(id, parsed);
    }
    setEditingId(null);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    const parsedPrice = parseFloat(newPrice);
    if (isNaN(parsedPrice)) return;

    const newObj: ServiceItem = {
      id: `service-${Date.now()}`,
      name: newName,
      type: newType,
      unit: newUnit,
      price: parsedPrice,
      description: newDesc
    };

    onAddService(newObj);
    // Reset
    setNewName('');
    setNewPrice('');
    setNewDesc('');
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Search Header and Filter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 flex-1">
          <button
            id="cat-filter-all"
            onClick={() => setFilterType('all')}
            className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>
          <button
            id="cat-filter-pub"
            onClick={() => setFilterType('publicidad')}
            className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all ${
              filterType === 'publicidad'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Publicidad
          </button>
          <button
            id="cat-filter-arq"
            onClick={() => setFilterType('arquitectura')}
            className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all ${
              filterType === 'arquitectura'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Arquitectura
          </button>
        </div>

        {role === 'Administrador' && (
          <button
            id="cat-add-btn"
            onClick={() => setShowAddForm(true)}
            className="bg-slate-900 text-white p-2.5 rounded-lg active:scale-95 transition-transform"
            title="Registrar Servicio"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Add Form Accordion/Modal */}
      {showAddForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Registrar en Catálogo</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateService} className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Nombre de Servicio/Insumo
              </label>
              <input
                id="new-service-name"
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Diseño de Maqueta, Impresión Lona"
                className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Categoría
                </label>
                <select
                  id="new-service-type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ServiceType)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white"
                >
                  <option value="publicidad">Publicidad</option>
                  <option value="arquitectura">Arquitectura</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Unidad de Medida
                </label>
                <input
                  id="new-service-unit"
                  type="text"
                  required
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="Ej. m², Proyecto, Visita..."
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Precio Base (MXN)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <span className="text-xs font-medium">$</span>
                  </div>
                  <input
                    id="new-service-price"
                    type="number"
                    required
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="250"
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg pl-6 pr-2 py-2 focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Descripción
              </label>
              <textarea
                id="new-service-desc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Breve descripción del alcance del servicio..."
                rows={2}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white resize-none"
              />
            </div>

            <button
              id="new-service-submit"
              type="submit"
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-lg text-xs transition-all active:scale-95 shadow-sm"
            >
              Registrar en Catálogo
            </button>
          </form>
        </div>
      )}

      {/* Services List Card Display optimized for cell screens */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-[11px] font-mono uppercase tracking-wider text-slate-500 mt-2 px-1">
          <span>Servicio / Insumo</span>
          <span>Precio Unitario</span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No se encontraron servicios en esta categoría.
          </div>
        ) : (
          filteredServices.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-3 shadow-none hover:border-slate-300 transition-colors flex flex-col gap-1"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold ${
                        item.type === 'arquitectura'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 font-mono">
                      {item.unit}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 leading-tight break-all">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                    {item.description}
                  </p>
                </div>

                <div className="text-right flex flex-col items-end shrink-0 justify-center">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-md p-1">
                      <span className="text-xs font-mono text-slate-500">$</span>
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        className="w-16 bg-white border-none rounded text-xs font-mono text-right p-0.5 focus:outline-none focus:ring-0"
                        autoFocus
                      />
                      <button
                        onClick={() => savePrice(item.id)}
                        className="bg-emerald-500 text-white p-0.5 rounded hover:bg-emerald-600 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-slate-200 text-slate-600 p-0.5 rounded hover:bg-slate-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-slate-950 font-mono">
                        ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {role === 'Administrador' ? (
                        <button
                          onClick={() => startEditPrice(item)}
                          className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-900 mt-1"
                        >
                          <PenSquare className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                          Solo Lectura
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Delivery } from '../types';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle, 
  ChevronLeft, ChevronRight, Bell, Pin, Layers 
} from 'lucide-react';

interface CalendarDeliveriesProps {
  deliveries: Delivery[];
  onToggleDeliveryStatus: (id: string) => void;
}

export default function CalendarDeliveries({ deliveries, onToggleDeliveryStatus }: CalendarDeliveriesProps) {
  // Current virtual date constraint: June 3, 2026 (According to additional metadata)
  const VIRTUAL_TODAYS__DATE = new Date('2026-06-03');
  const [selectedDateStr, setSelectedDateStr] = useState('2026-06-03');

  // Days list for a weekly picker (June 1st to June 7th 2026 is the core mock week)
  const DAYS_OF_WEEK = [
    { dayName: 'Lun', dateNum: 1, dateStr: '2026-06-01' },
    { dayName: 'Mar', dateNum: 2, dateStr: '2026-06-02' },
    { dayName: 'Mié', dateNum: 3, dateStr: '2026-06-03' }, // Hoy
    { dayName: 'Jue', dateNum: 4, dateStr: '2026-06-04' }, // Mañana
    { dayName: 'Vie', dateNum: 5, dateStr: '2026-06-05' },
    { dayName: 'Sáb', dateNum: 6, dateStr: '2026-06-06' },
    { dayName: 'Dom', dateNum: 7, dateStr: '2026-06-07' }
  ];

  // Calculate hours left for alert warning tag
  const getAlertTag = (deliveryDateStr: string, status: string) => {
    if (status === 'entregado') return null;
    
    const deliveryDate = new Date(deliveryDateStr);
    const timeDiff = deliveryDate.getTime() - VIRTUAL_TODAYS__DATE.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff === 1) {
      return {
        text: '⚠️ Alerta crítica: Vence en 24 Horas',
        className: 'bg-red-50 text-red-700 border-red-200 animate-pulse'
      };
    } else if (daysDiff === 2) {
      return {
        text: '⏳ Alerta: Vence en 1 Sola Entrega (48h)',
        className: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    } else if (daysDiff < 0) {
      return {
        text: '🚨 Plazo Vencido Impuntual',
        className: 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
      };
    }
    return null;
  };

  const handleNextDay = () => {
    const idx = DAYS_OF_WEEK.findIndex(d => d.dateStr === selectedDateStr);
    if (idx !== -1 && idx < DAYS_OF_WEEK.length - 1) {
      setSelectedDateStr(DAYS_OF_WEEK[idx + 1].dateStr);
    }
  };

  const handlePrevDay = () => {
    const idx = DAYS_OF_WEEK.findIndex(d => d.dateStr === selectedDateStr);
    if (idx > 0) {
      setSelectedDateStr(DAYS_OF_WEEK[idx - 1].dateStr);
    }
  };

  const selectedDeliveries = deliveries.filter(d => d.date === selectedDateStr);
  const pendingUrgentCount = deliveries.filter(d => {
    if (d.status === 'entregado') return false;
    const diff = Math.ceil((new Date(d.date).getTime() - VIRTUAL_TODAYS__DATE.getTime()) / (1000 * 3600 * 24));
    return diff === 1 || diff === 2 || diff < 0;
  }).length;

  return (
    <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-200">
      
      {/* Alertas Automatizadas Banner */}
      {pendingUrgentCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col gap-2 shadow-xs animate-bounce-short">
          <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold leading-none">
            <Bell className="w-4.5 h-4.5 text-amber-600 animate-swing" />
            <span>Notificaciones de Alerta Activa</span>
            <span className="bg-amber-600 text-white rounded-full text-[9px] px-1.5 py-0.2 font-mono ml-auto font-bold">
              {pendingUrgentCount}
            </span>
          </div>
          <p className="text-[11px] text-amber-700 leading-normal">
            Tienes entregas urgentes programadas para las próximas 24-48 horas. Las fechas son sagradas para mantener la confianza del cliente.
          </p>
        </div>
      )}

      {/* Week slider selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between gap-1 mb-2">
          <button
            onClick={handlePrevDay}
            className="p-1 px-2 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Semana Actual (Junio 2026)</span>
          </span>

          <button
            onClick={handleNextDay}
            className="p-1 px-2 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar visual indicators */}
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = day.dateStr === selectedDateStr;
            const isToday = day.dateStr === '2026-06-03';
            const deliveriesCount = deliveries.filter(d => d.date === day.dateStr).length;
            const hasPending = deliveries.some(d => d.date === day.dateStr && d.status === 'pendiente');

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all relative ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : isToday
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-950'
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600'
                }`}
              >
                <span className="text-[9px] uppercase tracking-normal">{day.dayName}</span>
                <span className="text-xs font-extrabold font-mono mt-0.5">{day.dateNum}</span>
                
                {/* Count dot */}
                {deliveriesCount > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                    hasPending ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day details section */}
      <div>
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
          Entregas para el día {selectedDateStr === '2026-06-03' ? 'Hoy' : selectedDateStr}
        </h4>

        {selectedDeliveries.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Sin entregas asignadas para esta fecha.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedDeliveries.map((del) => {
              const alertObj = getAlertTag(del.date, del.status);
              return (
                <div
                  key={del.id}
                  className={`bg-white border rounded-xl p-3.5 flex flex-col gap-2.5 shadow-xs transition-colors ${
                    del.status === 'entregado' ? 'border-slate-200 opacity-80' : 'border-indigo-100 bg-linear-to-b from-indigo-50/10 to-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wide px-1.5 py-0.2 rounded-full ${
                          del.category === 'arquitectura'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {del.category}
                        </span>
                        <span className={`text-[8px] font-bold uppercase py-0.2 px-1.5 rounded-full ${
                          del.priority === 'alta'
                            ? 'bg-red-100 text-red-800'
                            : del.priority === 'media'
                            ? 'bg-amber-100 text-amber-850'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          Prioridad: {del.priority}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1.5">{del.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Proyecto: {del.projectName}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Cliente: {del.clientName}</p>
                    </div>

                    <button
                      onClick={() => onToggleDeliveryStatus(del.id)}
                      className={`text-[9px] font-bold uppercase tracking-wider py-1.5 px-2.5 rounded-md self-start shrink-0 transition-transform active:scale-95 flex items-center gap-1.5 border ${
                        del.status === 'entregado'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-500 shadow-xs'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>{del.status === 'entregado' ? 'Entregado' : 'Marcar Entregado'}</span>
                    </button>
                  </div>

                  {alertObj && (
                    <div className={`border p-2 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 ${alertObj.className}`}>
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{alertObj.text}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Global alert notifications panel summary */}
      <div className="bg-slate-900 text-slate-300 rounded-xl p-4 flex flex-col gap-2 mt-2">
        <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Gobernanza de Entregas Ideas</span>
        </h5>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
            <span className="block text-xs font-extrabold text-white font-mono">
              {deliveries.filter(d => d.status === 'pendiente').length}
            </span>
            <span className="text-[9px] text-slate-500 uppercase font-bold">Conceptos Pendientes</span>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
            <span className="block text-xs font-extrabold text-emerald-400 font-mono">
              {deliveries.filter(d => d.status === 'entregado').length}
            </span>
            <span className="text-[9px] text-slate-500 uppercase font-bold">Terminados</span>
          </div>
        </div>
      </div>
    </div>
  );
}

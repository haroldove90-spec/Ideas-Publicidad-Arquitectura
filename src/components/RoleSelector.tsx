/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Users, HelpCircle } from 'lucide-react';

interface RoleSelectorProps {
  currentRole: 'Administrador' | 'Personal de Apoyo';
  onChangeRole: (role: 'Administrador' | 'Personal de Apoyo') => void;
}

export default function RoleSelector({ currentRole, onChangeRole }: RoleSelectorProps) {
  return (
    <div className="bg-slate-900 border-b border-slate-800 p-3 pt-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-md mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              IDEAS SIMULADOR MÓVIL
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
            <span>Hora Local: 2026-06-03</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-xs font-semibold text-slate-300">Rol Activo:</span>
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 w-2/3">
            <button
              id="role-admin-btn"
              onClick={() => onChangeRole('Administrador')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium transition-all ${
                currentRole === 'Administrador'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              id="role-support-btn"
              onClick={() => onChangeRole('Personal de Apoyo')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium transition-all ${
                currentRole === 'Personal de Apoyo'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Apoyo</span>
            </button>
          </div>
        </div>

        {/* Warning notification regarding accessibility restrictions */}
        <p className="text-[10px] text-slate-400 leading-normal text-center mt-1 border-t border-slate-800 pt-1.5">
          {currentRole === 'Personal de Apoyo' ? (
            <span className="text-sky-400 font-medium">
              🔒 <strong>Acceso Restringido:</strong> Solo puedes registrar entregas, contra-recibos y adjuntar fotos. Cotizaciones, ganancias y facturas están bloqueadas.
            </span>
          ) : (
            <span className="text-amber-400 font-medium">
              ✨ <strong>Acceso Total:</strong> Vista global de cotizaciones, conversión de facturas, análisis de ganancias y validación de contra-recibos.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

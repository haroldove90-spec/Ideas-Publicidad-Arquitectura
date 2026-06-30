import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Shield, User, Key, Lock, CheckCircle2, XCircle } from 'lucide-react';

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

interface AdminUsersProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onUpdateEmployee: (emp: Employee) => void;
}

export default function AdminUsers({
  employees,
  onAddEmployee,
  onDeleteEmployee,
  onUpdateEmployee
}: AdminUsersProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Administrador' | 'Diseño' | 'Producción' | 'Almacén'>('Diseño');
  
  // Custom permissions for the newly created user
  const [permFullMetrics, setPermFullMetrics] = useState(false);
  const [permEditCatalog, setPermEditCatalog] = useState(true);
  const [permCreateQuotes, setPermCreateQuotes] = useState(true);
  const [permAccessFinance, setPermAccessFinance] = useState(false);
  const [permAccessUsers, setPermAccessUsers] = useState(false);
  const [permLogInvoices, setPermLogInvoices] = useState(false);
  const [permViewDeliveries, setPermViewDeliveries] = useState(true);

  // Editing state
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'Administrador' | 'Diseño' | 'Producción' | 'Almacén'>('Diseño');

  const handleRoleChange = (newRole: 'Administrador' | 'Diseño' | 'Producción' | 'Almacén') => {
    setRole(newRole);
    // Auto-configure templates for ease of use
    if (newRole === 'Administrador') {
      setPermFullMetrics(true);
      setPermEditCatalog(true);
      setPermCreateQuotes(true);
      setPermAccessFinance(true);
      setPermAccessUsers(true);
      setPermLogInvoices(true);
      setPermViewDeliveries(true);
    } else if (newRole === 'Diseño') {
      setPermFullMetrics(false);
      setPermEditCatalog(true);
      setPermCreateQuotes(true);
      setPermAccessFinance(false);
      setPermAccessUsers(false);
      setPermLogInvoices(false);
      setPermViewDeliveries(true);
    } else if (newRole === 'Producción') {
      setPermFullMetrics(false);
      setPermEditCatalog(false);
      setPermCreateQuotes(false);
      setPermAccessFinance(false);
      setPermAccessUsers(false);
      setPermLogInvoices(false);
      setPermViewDeliveries(true);
    } else if (newRole === 'Almacén') {
      setPermFullMetrics(false);
      setPermEditCatalog(false);
      setPermCreateQuotes(false);
      setPermAccessFinance(false);
      setPermAccessUsers(false);
      setPermLogInvoices(false);
      setPermViewDeliveries(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) return;

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name,
      username,
      password,
      role,
      permissions: {
        fullMetrics: permFullMetrics,
        editCatalog: permEditCatalog,
        createQuotes: permCreateQuotes,
        accessFinance: permAccessFinance,
        accessUsers: permAccessUsers,
        logInvoices: permLogInvoices,
        viewDeliveries: permViewDeliveries
      }
    };

    onAddEmployee(newEmployee);
    setName('');
    setUsername('');
    setPassword('');
  };

  const togglePermission = (emp: Employee, field: keyof Employee['permissions']) => {
    const updated = {
      ...emp,
      permissions: {
        ...emp.permissions,
        [field]: !emp.permissions[field]
      }
    };
    onUpdateEmployee(updated);
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Add/Edit employee form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-500" />
              Alta de Empleado
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">NOMBRE COMPLETO</label>
                <input
                  type="text"
                  required
                  placeholder="Carlos Alberto Ruiz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">USUARIO DE ACCESO</label>
                  <input
                    type="text"
                    required
                    placeholder="carlos.ideas"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">CONTRASEÑA</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ROL OPERATIVO</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Administrador">Administrador (Acceso Total)</option>
                  <option value="Diseño">Diseño (Taller creativo)</option>
                  <option value="Producción">Producción (Obras y Maquetas)</option>
                  <option value="Almacén">Almacén (Logística e Insumos)</option>
                </select>
              </div>

              {/* Configure Permissions section */}
              <div className="border-t border-slate-200 pt-3.5 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 block uppercase mb-1.5">Permisos del Sistema (Configurables)</span>
                
                <div className="grid grid-cols-1 gap-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permFullMetrics}
                      onChange={(e) => setPermFullMetrics(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    Ver Tableros y Métricas Económicas
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permEditCatalog}
                      onChange={(e) => setPermEditCatalog(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    Editar Catálogo de Servicios
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permCreateQuotes}
                      onChange={(e) => setPermCreateQuotes(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    Elaborar Cotizaciones Comerciales
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permAccessFinance}
                      onChange={(e) => setPermAccessFinance(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    Control Financiero (Ingresos/Gastos)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permLogInvoices}
                      onChange={(e) => setPermLogInvoices(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    Asociar Números de Factura SAT
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2 px-4 rounded-lg transition"
              >
                Registrar Empleado
              </button>
            </form>
          </div>
        </div>

        {/* Right column: List and manage permissions of active employees */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Plantilla de Empleados y Permisos por Rol</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">Ideas</span>
          </h3>

          <div className="space-y-4">
            {employees.map(emp => (
              <div key={emp.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      {editingEmpId === emp.id ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-white border border-slate-200 rounded p-1 text-xs font-bold"
                          />
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as any)}
                            className="bg-white border border-slate-200 rounded p-1 text-xs font-bold"
                          >
                            <option value="Administrador">Administrador</option>
                            <option value="Diseño">Diseño</option>
                            <option value="Producción">Producción</option>
                            <option value="Almacén">Almacén</option>
                          </select>
                          <button
                            onClick={() => {
                              onUpdateEmployee({
                                ...emp,
                                name: editName,
                                role: editRole
                              });
                              setEditingEmpId(null);
                            }}
                            className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-bold"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                          {emp.name}
                          <button 
                            onClick={() => {
                              setEditingEmpId(emp.id);
                              setEditName(emp.name);
                              setEditRole(emp.role);
                            }}
                            className="text-[10px] text-indigo-500 hover:underline font-normal"
                          >
                            (Editar)
                          </button>
                        </h4>
                      )}
                      <span className="text-[10px] text-slate-450 font-mono">Usuario: {emp.username} | <strong className="text-indigo-600">{emp.role}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteEmployee(emp.id)}
                    className="text-slate-350 hover:text-red-500 p-1"
                    title="Dar de baja"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Permissions matrix for the employee */}
                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                  
                  <button
                    onClick={() => togglePermission(emp, 'fullMetrics')}
                    className="flex items-center gap-1.5 text-left text-slate-700 hover:bg-slate-100 p-1 rounded"
                  >
                    {emp.permissions.fullMetrics ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                    Métricas Económicas
                  </button>

                  <button
                    onClick={() => togglePermission(emp, 'editCatalog')}
                    className="flex items-center gap-1.5 text-left text-slate-700 hover:bg-slate-100 p-1 rounded"
                  >
                    {emp.permissions.editCatalog ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                    Editar Catálogo
                  </button>

                  <button
                    onClick={() => togglePermission(emp, 'createQuotes')}
                    className="flex items-center gap-1.5 text-left text-slate-700 hover:bg-slate-100 p-1 rounded"
                  >
                    {emp.permissions.createQuotes ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                    Crear Cotizaciones
                  </button>

                  <button
                    onClick={() => togglePermission(emp, 'accessFinance')}
                    className="flex items-center gap-1.5 text-left text-slate-700 hover:bg-slate-100 p-1 rounded"
                  >
                    {emp.permissions.accessFinance ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                    Control Financiero
                  </button>

                  <button
                    onClick={() => togglePermission(emp, 'logInvoices')}
                    className="flex items-center gap-1.5 text-left text-slate-700 hover:bg-slate-100 p-1 rounded"
                  >
                    {emp.permissions.logInvoices ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                    Asociar Factura SAT
                  </button>

                  <button
                    onClick={() => togglePermission(emp, 'viewDeliveries')}
                    className="flex items-center gap-1.5 text-left text-slate-700 hover:bg-slate-100 p-1 rounded"
                  >
                    {emp.permissions.viewDeliveries ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                    Ver Entregas
                  </button>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

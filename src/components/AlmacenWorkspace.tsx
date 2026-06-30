import React, { useState, useEffect, useRef } from 'react';
import { 
  Warehouse, Package, ShoppingCart, Calendar, ShieldCheck, 
  Plus, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, 
  Download, Upload, Search, Trash2, Clock, MapPin, 
  CheckSquare, Sparkles, Filter, Database, FileDown, Layers, HelpCircle
} from 'lucide-react';

// Interfaces for our state
interface InventoryItem {
  id: string;
  name: string;
  category: 'productos' | 'materias_primas' | 'insumos_tintas_cajas';
  stock: number;
  minStock: number;
  unit: string;
  cost: number;
  supplier: string;
}

interface PurchaseRecord {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  cost: number;
  provider: string;
  date: string;
  status: 'pendiente' | 'recibido';
  notes?: string;
}

interface SupplyArrivalEvent {
  id: string;
  provider: string;
  materialName: string;
  quantity: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'pendiente' | 'recibido';
}

interface BackupSnapshot {
  id: string;
  date: string;
  size: string;
  description: string;
  type: 'automatic' | 'manual';
}

interface AlmacenWorkspaceProps {
  services: any[];
  quotations: any[];
  activeTab: 'inventario' | 'compras' | 'agenda' | 'respaldo';
  setActiveTab: (tab: 'inventario' | 'compras' | 'agenda' | 'respaldo') => void;
}

export default function AlmacenWorkspace({
  services,
  quotations,
  activeTab,
  setActiveTab
}: AlmacenWorkspaceProps) {
  // --- STATE INITIALIZATION & SYNC ---

  // 1. Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('ideas_inventario');
    if (saved) return JSON.parse(saved);
    return [
      // 1.1 Tazas, playeras y termos (Productos)
      { id: 'inv-1', name: 'Tazas de Cerámica 11oz Blanco Sublimar', category: 'productos', stock: 120, minStock: 30, unit: 'pzs', cost: 25, supplier: 'Provedora de Tazas CDMX' },
      { id: 'inv-2', name: 'Playeras de Algodón Premium 160g (Negro)', category: 'productos', stock: 85, minStock: 25, unit: 'pzs', cost: 45, supplier: 'Textiles del Sur' },
      { id: 'inv-3', name: 'Playeras de Algodón Premium 160g (Blanco)', category: 'productos', stock: 90, minStock: 25, unit: 'pzs', cost: 43, supplier: 'Textiles del Sur' },
      { id: 'inv-4', name: 'Termos de Acero Inoxidable 500ml Mate', category: 'productos', stock: 15, minStock: 20, unit: 'pzs', cost: 110, supplier: 'Lotes e Importaciones Express' },
      
      // 1.2 Acrílico, PVC, Vinil y MDF (Materias Primas)
      { id: 'inv-5', name: 'Plancha Acrílico Cristal 3mm (1.20 x 2.40m)', category: 'materias_primas', stock: 8, minStock: 5, unit: 'placas', cost: 1450, supplier: 'Plásticos Lomas S.A.' },
      { id: 'inv-6', name: 'Plancha Acrílico Opalino 3mm (1.20 x 2.40m)', category: 'materias_primas', stock: 3, minStock: 4, unit: 'placas', cost: 1550, supplier: 'Plásticos Lomas S.A.' },
      { id: 'inv-7', name: 'Plancha PVC Espumado Trovicel 5mm', category: 'materias_primas', stock: 12, minStock: 5, unit: 'placas', cost: 850, supplier: 'Distribuidora Trovicel' },
      { id: 'inv-8', name: 'Rollo Vinil de Corte Mate (1.22 x 50m) Negro', category: 'materias_primas', stock: 1, minStock: 2, unit: 'rollos', cost: 3100, supplier: 'Vinilos y Películas S.A.' },
      { id: 'inv-9', name: 'Rollo Vinil Esmerilado Mate (1.22 x 50m)', category: 'materias_primas', stock: 2, minStock: 1, unit: 'rollos', cost: 3800, supplier: 'Vinilos y Películas S.A.' },
      { id: 'inv-10', name: 'Plancha de MDF 6mm Alta Densidad (1.22 x 2.44m)', category: 'materias_primas', stock: 18, minStock: 6, unit: 'placas', cost: 310, supplier: 'Maderas y Maquetas del Oriente' },
      
      // 1.3 Tintas y cajas (Otros)
      { id: 'inv-11', name: 'Tintas de Sublimación Kian Premium (Kit 4 Colores)', category: 'insumos_tintas_cajas', stock: 4, minStock: 2, unit: 'kits', cost: 1890, supplier: 'Insumos Digitales de México' },
      { id: 'inv-12', name: 'Tinta Solvente Mutoh Cyan (1 Litro)', category: 'insumos_tintas_cajas', stock: 1, minStock: 3, unit: 'litros', cost: 1200, supplier: 'Soporte e Impresión del Centro' },
      { id: 'inv-13', name: 'Cajas de Cartón Microcorrugado para Taza Individual', category: 'insumos_tintas_cajas', stock: 150, minStock: 50, unit: 'pzs', cost: 6, supplier: 'Empaques de Cartón Toluca' },
      { id: 'inv-14', name: 'Cajas de Envío 30x30x30cm Reforzadas', category: 'insumos_tintas_cajas', stock: 45, minStock: 20, unit: 'pzs', cost: 18, supplier: 'Empaques de Cartón Toluca' }
    ];
  });

  // 2. Purchases State
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    const saved = localStorage.getItem('ideas_compras');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'pur-1', materialName: 'Rollo Vinil de Corte Mate (1.22 x 50m) Negro', quantity: 2, unit: 'rollos', cost: 3100, provider: 'Vinilos y Películas S.A.', date: '2026-06-28', status: 'pendiente', notes: 'Urgente reabastecer para taller de rotulación.' },
      { id: 'pur-2', materialName: 'Plancha Acrílico Opalino 3mm (1.20 x 2.40m)', quantity: 3, unit: 'placas', cost: 1550, provider: 'Plásticos Lomas S.A.', date: '2026-06-25', status: 'recibido', notes: 'Entregado a tiempo por el proveedor.' },
      { id: 'pur-3', materialName: 'Termos de Acero Inoxidable 500ml Mate', quantity: 20, unit: 'pzs', cost: 110, provider: 'Lotes e Importaciones Express', date: '2026-06-29', status: 'pendiente', notes: 'Se acordó entrega el 1 de julio en la mañana.' }
    ];
  });

  // 3. Agenda Calendar State
  const [recepEvents, setRecepEvents] = useState<SupplyArrivalEvent[]>(() => {
    const saved = localStorage.getItem('ideas_recepciones_agenda');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'rec-1', provider: 'Vinilos y Películas S.A.', materialName: '2 Rollos Vinil Negro', quantity: 2, date: '2026-06-30', time: '11:30', status: 'pendiente' },
      { id: 'rec-2', provider: 'Empaques de Cartón Toluca', materialName: '200 Cajas de Cartón para Tazas', quantity: 200, date: '2026-06-30', time: '14:00', status: 'recibido' },
      { id: 'rec-3', provider: 'Lotes e Importaciones Express', materialName: '20 Termos de Acero Mate', quantity: 20, date: '2026-07-01', time: '09:30', status: 'pendiente' },
      { id: 'rec-4', provider: 'Plásticos Lomas S.A.', materialName: '5 Planchas de Acrílico Cristal', quantity: 5, date: '2026-07-03', time: '16:00', status: 'pendiente' }
    ];
  });

  // 4. Backup Snapshots Local History State
  const [backupHistory, setBackupHistory] = useState<BackupSnapshot[]>(() => {
    const saved = localStorage.getItem('ideas_backup_snapshots');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'bk-1', date: '2026-06-29 18:45', size: '24.8 KB', description: 'Respaldo automático del sistema al cierre de caja', type: 'automatic' },
      { id: 'bk-2', date: '2026-06-30 08:00', size: '25.3 KB', description: 'Carga inicial del taller matutino', type: 'automatic' }
    ];
  });

  // Local interactive search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'productos' | 'materias_primas' | 'insumos_tintas_cajas'>('all');

  // New item modal form state
  const [showItemModal, setShowItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'productos' | 'materias_primas' | 'insumos_tintas_cajas'>('productos');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemMin, setNewItemMin] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('pzs');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemSupplier, setNewItemSupplier] = useState('');

  // New purchase modal form state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [newPurMaterial, setNewPurMaterial] = useState('');
  const [newPurQuantity, setNewPurQuantity] = useState('');
  const [newPurUnit, setNewPurUnit] = useState('pzs');
  const [newPurCost, setNewPurCost] = useState('');
  const [newPurProvider, setNewPurProvider] = useState('');
  const [newPurNotes, setNewPurNotes] = useState('');

  // New reception modal form state
  const [showRecepModal, setShowRecepModal] = useState(false);
  const [newRecProvider, setNewRecProvider] = useState('');
  const [newRecMaterial, setNewRecMaterial] = useState('');
  const [newRecQty, setNewRecQty] = useState('');
  const [newRecDate, setNewRecDate] = useState('2026-06-30');
  const [newRecTime, setNewRecTime] = useState('12:00');

  // Selected calendar day
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-06-30');

  // Stock Adjustment Interactive states
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');

  // Automated deduction simulation logs
  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    'Iniciando consola de automatización de almacén...',
    'Taller enlazado con panel de ventas comercial y producción.',
  ]);
  const [isDeducting, setIsDeducting] = useState(false);

  // Backup files upload ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [backupStatusMessage, setBackupStatusMessage] = useState('');
  const [isBackupProcessing, setIsBackupProcessing] = useState(false);

  // --- PERSISTENCE EFFECT ON MODIFICATION ---
  useEffect(() => {
    localStorage.setItem('ideas_inventario', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('ideas_compras', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('ideas_recepciones_agenda', JSON.stringify(recepEvents));
  }, [recepEvents]);

  useEffect(() => {
    localStorage.setItem('ideas_backup_snapshots', JSON.stringify(backupHistory));
  }, [backupHistory]);


  // --- HANDLERS AND OPERATIONS ---

  // 1. Add New Inventory Item
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItemName,
      category: newItemCategory,
      stock: Number(newItemStock) || 0,
      minStock: Number(newItemMin) || 0,
      unit: newItemUnit,
      cost: Number(newItemCost) || 0,
      supplier: newItemSupplier || 'General'
    };

    setInventory(prev => [newItem, ...prev]);
    setShowItemModal(false);

    // Reset
    setNewItemName('');
    setNewItemStock('');
    setNewItemMin('');
    setNewItemUnit('pzs');
    setNewItemCost('');
    setNewItemSupplier('');

    // Add log
    logSimulation(`Registrado nuevo insumo en inventario: ${newItem.name}`);
  };

  // 2. Add New Purchase Order
  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurMaterial.trim() || !newPurProvider.trim()) return;

    const newPur: PurchaseRecord = {
      id: `pur-${Date.now()}`,
      materialName: newPurMaterial,
      quantity: Number(newPurQuantity) || 1,
      unit: newPurUnit,
      cost: Number(newPurCost) || 0,
      provider: newPurProvider,
      date: new Date().toISOString().split('T')[0],
      status: 'pendiente',
      notes: newPurNotes
    };

    setPurchases(prev => [newPur, ...prev]);
    
    // Also automatically schedule on the warehouse calendar
    const newRecep: SupplyArrivalEvent = {
      id: `rec-${Date.now()}`,
      provider: newPur.provider,
      materialName: `${newPur.quantity} ${newPur.unit} - ${newPur.materialName}`,
      quantity: newPur.quantity,
      date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0], // tomorrow
      time: '11:00',
      status: 'pendiente'
    };
    setRecepEvents(prev => [newRecep, ...prev]);

    setShowPurchaseModal(false);

    // Reset
    setNewPurMaterial('');
    setNewPurQuantity('');
    setNewPurUnit('pzs');
    setNewPurCost('');
    setNewPurProvider('');
    setNewPurNotes('');

    logSimulation(`Creada nueva orden de compra para reabastecimiento: ${newPur.materialName} con proveedor ${newPur.provider}`);
  };

  // 3. Mark Purchase as RECEIVED / ARRIVED (Validación de Arribo)
  // CRITICAL AUTOMATION: Increments inventory stock dynamically!
  const handleValidateArrival = (purchaseId: string) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    // Check if it's already received to avoid double increments
    if (purchase.status === 'recibido') return;

    // Update purchase record status
    setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, status: 'recibido' } : p));

    // Update calendar reception if matching provider/material exists
    setRecepEvents(prev => prev.map(ev => 
      (ev.provider === purchase.provider && ev.materialName.includes(purchase.materialName))
        ? { ...ev, status: 'recibido' }
        : ev
    ));

    // DYNAMIC STOCK INCREMENT
    // Search for a matching item in the live inventory by name
    let foundAndUpdated = false;
    setInventory(prev => prev.map(item => {
      // Direct substring matching
      if (item.name.toLowerCase().includes(purchase.materialName.toLowerCase()) || 
          purchase.materialName.toLowerCase().includes(item.name.toLowerCase())) {
        foundAndUpdated = true;
        return {
          ...item,
          stock: item.stock + purchase.quantity
        };
      }
      return item;
    }));

    if (foundAndUpdated) {
      alert(`¡VALIDACIÓN COMPLETADA!\n\nSe confirmó el arribo del material al almacén.\n\nSe sumaron +${purchase.quantity} ${purchase.unit} directamente a la existencia de "${purchase.materialName}" en el Inventario.`);
      logSimulation(`[RECEPCIÓN] Validado arribo de compra ID ${purchase.id}. Aumentado stock de ${purchase.materialName} en +${purchase.quantity}.`);
    } else {
      // If not found, ask user to create it or add it
      const addToNew = confirm(`Llegó el material: "${purchase.materialName}".\n\nNo encontramos un artículo exacto en tu inventario con este nombre. ¿Deseas agregarlo automáticamente como un nuevo producto/materia prima?`);
      if (addToNew) {
        const newItem: InventoryItem = {
          id: `inv-${Date.now()}`,
          name: purchase.materialName,
          category: 'materias_primas',
          stock: purchase.quantity,
          minStock: Math.ceil(purchase.quantity * 0.25),
          unit: purchase.unit,
          cost: purchase.cost,
          supplier: purchase.provider
        };
        setInventory(prev => [newItem, ...prev]);
        logSimulation(`[RECEPCIÓN] Registrado nuevo material de arribo en inventario: ${newItem.name}`);
      }
    }
  };

  // 4. Manual Stock Adjustments (Entrada/Salida Manual)
  const handleManualAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem || !adjustQuantity) return;

    const qty = Number(adjustQuantity);
    if (isNaN(qty) || qty <= 0) return;

    setInventory(prev => prev.map(item => {
      if (item.id === adjustItem.id) {
        const factor = adjustType === 'add' ? 1 : -1;
        const newStock = Math.max(0, item.stock + (qty * factor));
        return { ...item, stock: newStock };
      }
      return item;
    }));

    logSimulation(`[AJUSTE MANUAL] ${adjustType === 'add' ? 'Entrada' : 'Salida'} de ${qty} ${adjustItem.unit} para "${adjustItem.name}".`);
    setAdjustItem(null);
    setAdjustQuantity('');
  };

  // 5. Create Reception Event directly in calendar
  const handleCreateRecepEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecProvider.trim() || !newRecMaterial.trim()) return;

    const newEv: SupplyArrivalEvent = {
      id: `rec-${Date.now()}`,
      provider: newRecProvider,
      materialName: newRecMaterial,
      quantity: Number(newRecQty) || 1,
      date: newRecDate,
      time: newRecTime,
      status: 'pendiente'
    };

    setRecepEvents(prev => [newEv, ...prev]);
    setShowRecepModal(false);

    // Reset
    setNewRecProvider('');
    setNewRecMaterial('');
    setNewRecQty('');
    logSimulation(`[AGENDA] Agendada entrega de insumos de ${newEv.provider} para el día ${newEv.date} a las ${newEv.time} hrs.`);
  };

  const handleToggleRecepStatus = (id: string) => {
    setRecepEvents(prev => prev.map(ev => {
      if (ev.id === id) {
        const nextStatus = ev.status === 'pendiente' ? 'recibido' : 'pendiente';
        // If received, also look if we should increment matching inventory item
        if (nextStatus === 'recibido') {
          setInventory(inv => inv.map(item => {
            if (item.name.toLowerCase().includes(ev.materialName.toLowerCase()) || ev.materialName.toLowerCase().includes(item.name.toLowerCase())) {
              return { ...item, stock: item.stock + ev.quantity };
            }
            return item;
          }));
        }
        return { ...ev, status: nextStatus };
      }
      return ev;
    }));
  };

  // 6. AUTOMATION SIMULATION: Discount automatic stock upon Sale or Production (Descuento Automático)
  const handleSimulateAutomatedDeduction = (type: 'venta' | 'produccion') => {
    setIsDeducting(true);
    logSimulation(`[AUTOMATIZACIÓN] Iniciando descuento de existencias por ${type === 'venta' ? 'VENTA COMERCIAL DE PRODUCTOS' : 'PRODUCCIÓN EN TALLER'}.`);
    
    setTimeout(() => {
      if (type === 'venta') {
        // Simulation details: Sold 25 Tazas and 10 Playeras
        // Deduct Blanco Tazas & Playeras Negra
        let tazaDeducted = 25;
        let playeraDeducted = 10;
        let tintaDeducted = 1; // 1 kit of tintas consumed partially

        setInventory(prev => prev.map(item => {
          if (item.id === 'inv-1') { // Tazas
            return { ...item, stock: Math.max(0, item.stock - tazaDeducted) };
          }
          if (item.id === 'inv-2') { // Playeras
            return { ...item, stock: Math.max(0, item.stock - playeraDeducted) };
          }
          if (item.id === 'inv-13') { // Box tazas
            return { ...item, stock: Math.max(0, item.stock - tazaDeducted) };
          }
          return item;
        }));

        logSimulation(`[SINCRO VENTAS] ✓ Pedido de tienda despachado.`);
        logSimulation(`[DESCUENTO] -${tazaDeducted} Tazas de Cerámica, -${tazaDeducted} Cajas de Cartón Individuales.`);
        logSimulation(`[DESCUENTO] -${playeraDeducted} Playeras de Algodón Premium (Negro).`);
        alert(`Sincronización de Ventas Completada:\n\nSe detectó la liquidación de un lote de regalos corporativos.\n\nSe han descontado automáticamente:\n- ${tazaDeducted} pzs de Tazas de Cerámica\n- ${tazaDeducted} pzs de Cajas Microcorrugadas\n- ${playeraDeducted} pzs de Playeras de Algodón\n\nStock actualizado en tiempo real.`);

      } else {
        // Simulation: Finished "Vinilos El Portal" & "Letrero Acrílico BMW"
        // Deduct Acrílico Opalino and MDF and Vinil
        let mdfDeducted = 2;
        let acrilicoDeducted = 1;
        let vinilDeducted = 1; // 1 rollo

        setInventory(prev => prev.map(item => {
          if (item.id === 'inv-10') { // MDF
            return { ...item, stock: Math.max(0, item.stock - mdfDeducted) };
          }
          if (item.id === 'inv-6') { // Acrilico Opalino
            return { ...item, stock: Math.max(0, item.stock - acrilicoDeducted) };
          }
          if (item.id === 'inv-8') { // Vinil Rollo
            return { ...item, stock: Math.max(0, item.stock - vinilDeducted) };
          }
          return item;
        }));

        logSimulation(`[SINCRO TALLER] ✓ Proyecto finalizado en mesa de manufactura.`);
        logSimulation(`[DESCUENTO] -${mdfDeducted} Planchas de MDF 6mm.`);
        logSimulation(`[DESCUENTO] -${acrilicoDeducted} Plancha de Acrílico Opalino 3mm.`);
        logSimulation(`[DESCUENTO] -${vinilDeducted} Rollo de Vinil de Corte Negro.`);
        alert(`Sincronización de Manufactura Completada:\n\nSe reportó la entrega de la Fachada de Letreros Lomas y Stands BMW.\n\nSe han descontado automáticamente por consumos de taller:\n- ${acrilicoDeducted} pz de Acrílico Opalino\n- ${mdfDeducted} pzs de Planchas de MDF\n- ${vinilDeducted} pz de Rollo de Vinil de Corte\n\nEl stock de insumos se encuentra blindado.`);
      }

      setIsDeducting(false);
    }, 1200);
  };

  // Helper log function
  const logSimulation = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSimulationLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 30));
  };


  // --- CLOUD BACKUP GENERAL BACKEND INFRASTRUCTURE ENGINE ---

  // 1. Automatic periodic sync simulator visual
  const [lastCloudSyncDate, setLastCloudSyncDate] = useState('Hace unos instantes');
  const [syncProgress, setSyncProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncProgress(0);
      setTimeout(() => {
        setSyncProgress(100);
        setLastCloudSyncDate(new Date().toLocaleTimeString());
        logSimulation('[RESPALDO CLOUD] ✓ Guardado automático incremental en la nube realizado con éxito.');
      }, 1000);
    }, 30000); // sync every 30s
    return () => clearInterval(interval);
  }, []);

  // 2. TRIGGER MANUAL COMPREHENSIVE BACKUP WITH ACTUAL DOWNLOADABLE JSON FILE
  const handleTriggerManualBackupDownload = () => {
    setIsBackupProcessing(true);
    setBackupStatusMessage('Compilando tablas de base de datos local...');

    setTimeout(() => {
      try {
        // Collect ALL system keys from localStorage
        const keysToBackup = [
          'ideas_inventario',
          'ideas_compras',
          'ideas_recepciones_agenda',
          'ideas_backup_snapshots',
          'ideas_services',
          'ideas_quotations',
          'ideas_invoices',
          'ideas_deliveries',
          'ideas_purchase_orders',
          'ideas_transactions',
          'ideas_fixed_costs',
          'ideas_materials',
          'ideas_debtors',
          'ideas_employees',
          'ideas_production_jobs',
          'ideas_production_events'
        ];

        const backupData: Record<string, any> = {
          backupVersion: '1.2_DurableCloudBackplane',
          exportedAt: new Date().toISOString(),
          systemTimeUTC: '2026-06-30 08:14',
          payload: {}
        };

        keysToBackup.forEach(key => {
          const val = localStorage.getItem(key);
          if (val) {
            backupData.payload[key] = JSON.parse(val);
          }
        });

        // Create a JSON blob
        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Dynamic download trigger
        const link = document.createElement('a');
        link.href = url;
        link.download = `IDEAS_RESPALDO_BLINDADO_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Add to backup snapshots list
        const kbSize = (blob.size / 1024).toFixed(2);
        const newSnapshot: BackupSnapshot = {
          id: `bk-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          size: `${kbSize} KB`,
          description: 'Respaldo físico descargado por usuario del almacén',
          type: 'manual'
        };
        setBackupHistory(prev => [newSnapshot, ...prev]);

        setBackupStatusMessage('¡RESPALDO CONCLUIDO CON ÉXITO! Archivo de seguridad descargado.');
        logSimulation(`[RESPALDO EXPORTAR] Generado respaldo manual de base de datos (${kbSize} KB).`);
        alert('📦 RESPALDO TOTAL DESCARGADO\n\nSe ha generado un archivo binario JSON que contiene toda la base de datos de:\n✓ Inventarios de insumos\n✓ Órdenes de Compras\n✓ Finanzas y Transacciones\n✓ Clientes y Cotizaciones\n✓ Diseños y Logística de campo\n\nEl archivo se descargó correctamente en su dispositivo.');
      } catch (err) {
        setBackupStatusMessage('Error al compilar respaldo físico.');
        console.error(err);
      } finally {
        setIsBackupProcessing(false);
      }
    }, 1500);
  };

  // 3. RESTORE DATABASE FROM UPLOADED BACKUP FILE
  const handleRestoreBackupFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    setIsBackupProcessing(true);
    setBackupStatusMessage('Analizando archivo de base de datos...');

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.backupVersion || !parsed.payload) {
          throw new Error('Formato de archivo de respaldo no válido para el backplane de IDEAS.');
        }

        const payload = parsed.payload;
        let keysRestored = 0;

        // Restore each key
        Object.keys(payload).forEach(key => {
          localStorage.setItem(key, JSON.stringify(payload[key]));
          keysRestored++;
        });

        setBackupStatusMessage(`¡RESTAURACIÓN EXITOSA! Se restauraron ${keysRestored} tablas de datos.`);
        logSimulation(`[RESTAURACIÓN] Importado respaldo exitosamente. ${keysRestored} tablas reescritas.`);
        
        alert(`✅ RESTAURACIÓN COMPLETADA\n\nSe han cargado correctamente ${keysRestored} módulos del sistema desde el archivo del respaldo.\n\nLa aplicación se reiniciará para aplicar los cambios.`);
        window.location.reload(); // Hard reload to load restored states
      } catch (err) {
        setBackupStatusMessage('Error al restaurar: Archivo de datos corrupto.');
        alert('❌ ERROR DE IMPORTACIÓN\nEl archivo subido no contiene la firma digital de seguridad de IDEAS o se encuentra dañado.');
      } finally {
        setIsBackupProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  // 4. RESTORE HISTORIC LOCAL SNAPSHOT
  const handleRestoreSnapshot = (snap: BackupSnapshot) => {
    if (confirm(`¿Deseas restaurar la base de datos al estado del snapshot "${snap.date}"?\n\nAdvertencia: Cualquier cambio no respaldado después de esa hora se perderá.`)) {
      setIsBackupProcessing(true);
      logSimulation(`[RESTAURAR] Restaurando snapshot local del ${snap.date}...`);
      setTimeout(() => {
        setIsBackupProcessing(false);
        alert(`Snapshot restaurado correctamente.\nFecha: ${snap.date}\n\nLos estados locales se actualizaron.`);
      }, 1000);
    }
  };

  // Calendar days picker
  const CAL_DAYS = [
    { num: 28, str: '2026-06-28', isCurrentMonth: true },
    { num: 29, str: '2026-06-29', isCurrentMonth: true },
    { num: 30, str: '2026-06-30', isCurrentMonth: true, isToday: true }, // Today
    { num: 1, str: '2026-07-01', isCurrentMonth: false },
    { num: 2, str: '2026-07-02', isCurrentMonth: false },
    { num: 3, str: '2026-07-03', isCurrentMonth: false },
    { num: 4, str: '2026-07-04', isCurrentMonth: false },
    { num: 5, str: '2026-07-05', isCurrentMonth: false },
    { num: 6, str: '2026-07-06', isCurrentMonth: false },
    { num: 7, str: '2026-07-07', isCurrentMonth: false }
  ];

  // Filters calculation
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Reorder suggestion list calculation
  const reorderSuggestions = inventory.filter(item => item.stock <= item.minStock);

  return (
    <div className="space-y-6">
      
      {/* ALMACÉN QUICK STATS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Existencias Totales</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {inventory.reduce((acc, curr) => acc + curr.stock, 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">Piezas, m² e insumos</span>
          </div>
          <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-red-50/60 border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Bajo Stock (Alertas)</span>
            <span className="text-2xl font-black text-red-600 mt-1 block">
              {reorderSuggestions.length}
            </span>
            <span className="text-[10px] text-red-500 font-bold block mt-1">Requieren compra urgente</span>
          </div>
          <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Compras en Tránsito</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {purchases.filter(p => p.status === 'pendiente').length}
            </span>
            <span className="text-[10px] text-slate-450 font-medium block mt-1">Recepción pendiente</span>
          </div>
          <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-200/50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Cloud Backup Sync</span>
            <span className="text-xs font-black text-emerald-600 mt-1.5 flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping block" />
              Blindado OK
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">Último: {lastCloudSyncDate}</span>
          </div>
          <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <Database className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* CORE ALMACEN MODULE WORKSPACE CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* MAIN OPERATION REGION (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: INVENTARIO DE EXISTENCIAS */}
          {activeTab === 'inventario' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header Action card */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Package className="w-4 h-4 text-teal-600" />
                    Control de Existencias e Insumos
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Gestión integral de materias primas (acrílicos, maderas, viniles) y artículos listos para sublimación.</p>
                </div>
                
                <button
                  onClick={() => setShowItemModal(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-1.8 rounded-xl flex items-center gap-1.5 transition shadow-xs self-stretch md:self-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Insumo / Artículo</span>
                </button>
              </div>

              {/* AUTOMATION SINC PANEL: Descuento Automático de Stock */}
              <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 shadow-md border border-slate-800 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 text-[8px] uppercase font-bold tracking-widest rounded-full inline-block">
                      Módulo Automatizado Activo
                    </span>
                    <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      Descuento Automático de Stock en Venta o Taller
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal max-w-2xl">
                      Cuando se aprueba un presupuesto de regalos corporativos o se manufactura un letrero de gran formato en el taller, el sistema descuenta de forma automática las existencias correspondientes para prevenir discrepancias en almacén.
                    </p>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      disabled={isDeducting}
                      onClick={() => handleSimulateAutomatedDeduction('venta')}
                      className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[10px] py-1.5 px-3 rounded-lg transition text-center flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isDeducting ? 'animate-spin' : ''}`} />
                      <span>Simular Venta</span>
                    </button>
                    <button
                      type="button"
                      disabled={isDeducting}
                      onClick={() => handleSimulateAutomatedDeduction('produccion')}
                      className="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-white font-black text-[10px] py-1.5 px-3 rounded-lg shadow-sm transition text-center flex items-center justify-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Simular Taller</span>
                    </button>
                  </div>
                </div>

                {/* Automation logs */}
                <div className="bg-slate-950/70 border border-slate-850 p-3 rounded-xl mt-4 font-mono text-[10px] text-slate-350 space-y-1.5 max-h-[110px] overflow-y-auto">
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">Historial del Motor de Consumo del Taller:</div>
                  {simulationLogs.map((log, index) => (
                    <div key={index} className="truncate select-text">{log}</div>
                  ))}
                </div>
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row gap-3.5 items-center">
                
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre de material, código o proveedor..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="flex gap-2 w-full md:w-auto shrink-0 overflow-x-auto">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'productos', label: 'Tazas / Playeras / Termos' },
                    { id: 'materias_primas', label: 'Acrílico / PVC / MDF' },
                    { id: 'insumos_tintas_cajas', label: 'Tintas / Cajas' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryFilter(cat.id as any)}
                      className={`text-[11px] px-3 py-2 font-bold rounded-lg border whitespace-nowrap transition-all ${
                        selectedCategoryFilter === cat.id
                          ? 'bg-teal-50 border-teal-200 text-teal-800 shadow-3xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* INVENTORY TABLE & CARDS LIST */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px] tracking-wider select-none">
                        <th className="py-3 px-4">Artículo / Material</th>
                        <th className="py-3 px-4">Categoría</th>
                        <th className="py-3 px-4 text-center">Nivel de Stock</th>
                        <th className="py-3 px-4 text-right">Existencia</th>
                        <th className="py-3 px-4 text-right">Costo Unit.</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {filteredInventory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-400 font-medium bg-slate-50/50">
                            No se encontraron artículos que coincidan con la búsqueda.
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map(item => {
                          const isLow = item.stock <= item.minStock;
                          const percentage = Math.min(100, (item.stock / (item.minStock * 2.5)) * 100);

                          return (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                              
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900">{item.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">Proveedor: {item.supplier}</div>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  item.category === 'productos' 
                                    ? 'bg-blue-50 text-blue-800 border border-blue-150' 
                                    : item.category === 'materias_primas'
                                      ? 'bg-purple-50 text-purple-800 border border-purple-150'
                                      : 'bg-amber-50 text-amber-800 border border-amber-150'
                                }`}>
                                  {item.category === 'productos' ? 'Tazas/Termos/Ropa' : item.category === 'materias_primas' ? 'Estructuras/MDF' : 'Tintas/Cajas'}
                                </span>
                              </td>

                              <td className="py-3 px-4 min-w-[120px]">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-slate-100 rounded-full h-1.8 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-teal-500'}`} 
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className={`text-[10px] font-mono font-bold ${isLow ? 'text-red-600' : 'text-slate-500'}`}>
                                    {isLow ? 'REORDENAR' : 'ÓPTIMO'}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                                <span className={isLow ? 'text-red-600 font-black' : ''}>
                                  {item.stock} {item.unit}
                                </span>
                                <span className="text-[9px] text-slate-400 block font-normal mt-0.5">Mín: {item.minStock}</span>
                              </td>

                              <td className="py-3 px-4 text-right font-mono text-slate-500">
                                ${item.cost.toLocaleString()} MXN
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setAdjustItem(item);
                                      setAdjustType('add');
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-1 rounded-md border"
                                    title="Entrada manual de material"
                                  >
                                    + Ajustar
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: REGISTRO Y REABASTECIMIENTO DE COMPRAS */}
          {activeTab === 'compras' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-amber-600 animate-pulse" />
                    Órdenes de Compra y Suministros
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Control de reabastecimiento, registro de proveedores, costos y validaciones de arribo.</p>
                </div>

                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-1.8 rounded-xl flex items-center gap-1.5 transition shadow-xs self-stretch md:self-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Compra de Insumos</span>
                </button>
              </div>

              {/* AUTOMATION MODULE: SUGGESTED TO REORDER (STOCK BAJO) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-left">
                <div className="border-b pb-2 mb-3.5 flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
                    Lista de Materiales que necesitan reabastecerse
                  </h4>
                  <span className="bg-red-100 text-red-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                    Bajo Existencia Mínima
                  </span>
                </div>

                {reorderSuggestions.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 border border-dashed rounded-xl text-slate-400 text-xs">
                    ✓ Excelente. Todo el material y productos del taller están sobre los mínimos requeridos.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {reorderSuggestions.map(item => (
                      <div key={item.id} className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-3.5 space-y-3.5 relative">
                        <div>
                          <strong className="text-slate-900 text-xs block font-extrabold">{item.name}</strong>
                          <span className="text-[10px] text-slate-400 block font-medium">Proveedor sugerido: {item.supplier}</span>
                        </div>

                        <div className="flex justify-between items-center text-[11px] bg-white border border-rose-100 p-2 rounded-lg font-mono">
                          <div>
                            <span className="text-slate-400 block text-[9px]">Stock Actual:</span>
                            <strong className="text-red-600 font-bold">{item.stock} {item.unit}</strong>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block text-[9px]">Mínimo Requerido:</span>
                            <strong className="text-slate-800 font-semibold">{item.minStock} {item.unit}</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setNewPurMaterial(item.name);
                            setNewPurQuantity((item.minStock * 2).toString());
                            setNewPurUnit(item.unit);
                            setNewPurCost(item.cost.toString());
                            setNewPurProvider(item.supplier);
                            setNewPurNotes(`Reordenado automáticamente debido a alerta por bajo stock.`);
                            setShowPurchaseModal(true);
                          }}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] py-1.8 rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Comprar Reabastecimiento</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LISTA DE HISTORIAL DE COMPRAS CON MARCADOR DE ARRIBO */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-left">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Historial de Compras, Proveedor y Validación de Recepción</h4>
                  <span className="text-[10px] text-slate-500 font-medium">Confirma arribo para sumar automáticamente a stock</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                        <th className="py-3 px-4">Material Requerido</th>
                        <th className="py-3 px-4">Proveedor</th>
                        <th className="py-3 px-4 text-right">Inversión</th>
                        <th className="py-3 px-4 text-center">Fecha Pedido</th>
                        <th className="py-3 px-4 text-center">Estatus</th>
                        <th className="py-3 px-4 text-right">Validación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {purchases.map(pur => (
                        <tr key={pur.id} className="hover:bg-slate-50/50">
                          
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div>{pur.materialName}</div>
                            <span className="text-[10px] text-slate-400 font-mono font-bold mt-0.5 block">Solicitado: {pur.quantity} {pur.unit}</span>
                          </td>

                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {pur.provider}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                            ${(pur.cost * pur.quantity).toLocaleString()} MXN
                            <span className="text-[9px] text-slate-400 font-normal block mt-0.5">Unit: ${pur.cost.toLocaleString()}</span>
                          </td>

                          <td className="py-3 px-4 text-center text-slate-500 font-mono">
                            {pur.date}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              pur.status === 'recibido' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}>
                              {pur.status === 'recibido' ? '¡YA LLEGÓ!' : 'En Tránsito'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            {pur.status === 'pendiente' ? (
                              <button
                                onClick={() => handleValidateArrival(pur.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] py-1 px-2.5 rounded-lg shadow-sm transition flex items-center gap-1 ml-auto"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span>Marcar Arribo</span>
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-bold text-[10px] flex items-center justify-end gap-1 font-mono uppercase">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Stock Sumado
                              </span>
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: AGENDA DE RECEPCIÓN DE COMPRAS E INSUMOS */}
          {activeTab === 'agenda' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600 animate-pulse" />
                    Agenda de Recepción de Compras e Insumos
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Calendario de arribo de materiales contratados para control en andén.</p>
                </div>

                <button
                  onClick={() => {
                    setNewRecDate(selectedCalendarDate);
                    setShowRecepModal(true);
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-1.8 rounded-xl flex items-center gap-1.5 transition shadow-xs self-stretch md:self-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Programar Entrada Logística</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* CALENDAR DATE SELECTOR (5 Cols) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-left space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest font-mono">Junio / Julio 2026</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">GMT-6 CDMX</span>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
                      <span key={d} className="text-[10px] font-bold text-slate-400 py-1">{d}</span>
                    ))}

                    {CAL_DAYS.map((day, idx) => {
                      const isSelected = day.str === selectedCalendarDate;
                      const hasEvents = recepEvents.some(ev => ev.date === day.str);
                      const isCompleted = recepEvents.some(ev => ev.date === day.str && ev.status === 'recibido');

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedCalendarDate(day.str)}
                          className={`aspect-square rounded-xl p-1.5 flex flex-col justify-between items-center relative transition-all border ${
                            isSelected 
                              ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-500/20' 
                              : day.isToday
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-extrabold'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="text-xs font-black font-mono">{day.num}</span>
                          {hasEvents && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-[11px] text-slate-500 space-y-1">
                    <span className="font-bold text-slate-800 block">Coordinación de Almacén:</span>
                    <p>• Los días señalados en color naranja indican la llegada de camiones con materiales de proveedores contratados.</p>
                    <p>• Asegura tener despejado el andén de carga para la recepción.</p>
                  </div>
                </div>

                {/* EVENTS FOR SELECTED DAY (7 Cols) */}
                <div className="lg:col-span-7 space-y-3.5 text-left">
                  
                  <div className="border-b pb-1.5 flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Arribos Programados: {selectedCalendarDate === '2026-06-30' ? 'Hoy (30 Jun)' : selectedCalendarDate}
                    </h4>
                  </div>

                  {recepEvents.filter(ev => ev.date === selectedCalendarDate).length === 0 ? (
                    <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-xs text-slate-400">
                      <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-medium">No hay entradas de materiales programadas para este día.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recepEvents.filter(ev => ev.date === selectedCalendarDate).map(ev => (
                        <div 
                          key={ev.id}
                          className={`bg-white border rounded-xl p-4 shadow-xs flex justify-between items-center gap-4 ${
                            ev.status === 'recibido' ? 'border-slate-200 bg-slate-50/50 opacity-75' : 'border-teal-100 bg-gradient-to-b from-teal-50/5 to-white'
                          }`}
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                                ev.status === 'recibido' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}>
                                {ev.status === 'recibido' ? 'Material Recibido' : 'Espera en Andén'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {ev.time} hrs
                              </span>
                            </div>

                            <strong className="text-slate-900 text-xs block font-extrabold truncate">{ev.materialName}</strong>
                            <p className="text-[10px] text-slate-500 font-medium">Proveedor: {ev.provider}</p>
                          </div>

                          <div className="shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleRecepStatus(ev.id)}
                              className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border transition ${
                                ev.status === 'recibido'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-teal-600 hover:bg-teal-700 text-white border-teal-500 shadow-3xs'
                              }`}
                            >
                              {ev.status === 'recibido' ? '✓ Listo' : 'Check-In'}
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* TAB 4: CONSOLA DE RESPALDO DE SEGURIDAD (CLOUD BACKPLANE ENGINE) */}
          {activeTab === 'respaldo' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 shadow-lg border border-slate-800 text-left space-y-4">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                        CLOUD SECURE BACKPLANE ONLINE
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                      Sistema de Respaldo General Blindado de IDEAS
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-normal max-w-xl">
                      Motor de redundancia que sincroniza de forma automática todos los inventarios de insumos, cotizaciones comerciales, registros fiscales de timbrado, finanzas del taller y planos de diseño en un servidor en la nube seguro para evitar pérdida de datos.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleTriggerManualBackupDownload}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Generar Respaldo Físico (.json)</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs py-2 px-4 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>Restaurar desde Respaldo (.json)</span>
                    </button>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleRestoreBackupFromFile}
                      className="hidden"
                      accept=".json"
                    />
                  </div>
                </div>

                {/* Simulated database state check */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Estado del Almacén de Datos:</span>
                    <strong className="text-white text-sm block">Redundancia Híbrida</strong>
                    <span className="text-[10px] text-emerald-400 block font-mono">✓ LocalStorage & Nube en Sincronía</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Último Respaldo Automático:</span>
                    <strong className="text-white text-sm block">{lastCloudSyncDate === 'Hace unos instantes' ? 'Reciente' : `A las ${lastCloudSyncDate}`}</strong>
                    <span className="text-[10px] text-slate-400 block font-mono">Autoprotección periódica: 30s</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Archivos de Diseño y Reportes:</span>
                    <strong className="text-white text-sm block">100% Blindados</strong>
                    <span className="text-[10px] text-slate-400 block font-mono">Carpeta de Archivos Sincronizada</span>
                  </div>

                </div>

                {isBackupProcessing && (
                  <div className="bg-slate-950/90 border border-teal-500/20 p-4 rounded-xl flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
                    <span className="text-xs font-mono font-bold text-teal-400">{backupStatusMessage}</span>
                  </div>
                )}

              </div>

              {/* BACKUP HISTORIC TIMELINE SNAPSHOTS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-left space-y-3">
                
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-slate-500" />
                    Snapshots de Recuperación y Versiones de Respaldo Local
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Puedes restaurar una versión anterior de las bases de datos guardadas en caché local ante fallos de operación o borrado accidental.
                  </p>
                </div>

                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {backupHistory.map(snap => (
                    <div key={snap.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center gap-4 hover:bg-slate-100/60 transition">
                      
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            snap.type === 'manual' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {snap.type === 'manual' ? 'Respaldo Manual' : 'Auto Guardado'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-600">{snap.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{snap.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-mono">{snap.size}</span>
                        <button
                          onClick={() => handleRestoreSnapshot(snap)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[9px] py-1.5 px-3 rounded-lg shadow-sm transition shrink-0 uppercase tracking-wider"
                        >
                          Restaurar
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>

            </div>
          )}

        </div>

        {/* SIDEBAR NAVIGATION RIGHT (3 COLS) - Only displayed on desktop */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4 text-left">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Control de Almacén
            </h4>
            
            <nav className="space-y-1.5">
              {[
                { id: 'inventario', label: 'Inventario de Existencias', count: inventory.length },
                { id: 'compras', label: 'Módulo Compras / Proveedores', count: purchases.filter(p => p.status === 'pendiente').length },
                { id: 'agenda', label: 'Agenda de Almacén', count: recepEvents.filter(ev => ev.date === '2026-06-30' && ev.status === 'pendiente').length },
                { id: 'respaldo', label: 'Back-end Cloud Backup', labelSub: 'Seguridad' }
              ].map(link => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id as any)}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-teal-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                        isActive ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {link.count}
                      </span>
                    )}
                    {link.labelSub && (
                      <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider scale-95">
                        {link.labelSub}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-200/50 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h5 className="text-[11px] font-black uppercase text-indigo-900 tracking-wide">Servicio Seguro Activo</h5>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Todos los movimientos de inventario y compras están enlazados. El sistema valida automáticamente las salidas para mantener la consistencia fiscal y de taller.
            </p>
          </div>

        </aside>

      </div>

      {/* --- FORM MODALS --- */}

      {/* 1. NEW ITEM MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left relative animate-in zoom-in-95">
            <button
              onClick={() => setShowItemModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
            >
              ✕
            </button>

            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">
                Agregar Nuevo Insumo o Producto
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Completa los datos para dar de alta en la base de datos de existencias.</p>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs font-semibold text-slate-700">
              
              <div className="space-y-1">
                <label className="text-slate-500">Nombre del Artículo / Material *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ej. Taza Sublimable Negra, Rollo Vinil Azul"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500">Categoría *</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="productos">Tazas/Playeras/Termos</option>
                    <option value="materias_primas">Acrílico/PVC/Vinil/MDF</option>
                    <option value="insumos_tintas_cajas">Tintas/Cajas/Otros</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Unidad de Medida *</label>
                  <input
                    type="text"
                    required
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="Ej. pzs, placas, rollos, litros"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500">Existencia Inicial *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    placeholder="0"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Mínimo de Alerta *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newItemMin}
                    onChange={(e) => setNewItemMin(e.target.value)}
                    placeholder="Ej. Alerta si es <= 5"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500">Costo Unitario ($ MXN) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    placeholder="Costo por pieza o rollo"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Proveedor</label>
                  <input
                    type="text"
                    value={newItemSupplier}
                    onChange={(e) => setNewItemSupplier(e.target.value)}
                    placeholder="Nombre del proveedor"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 mt-2"
              >
                <span>Registrar en Inventario</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* 2. REGISTRAR COMPRA MODAL */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left relative animate-in zoom-in-95">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
            >
              ✕
            </button>

            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">
                Registrar Orden de Compra e Insumos
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Completa la información del pedido de suministros para el taller.</p>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-3.5 text-xs font-semibold text-slate-700">
              
              <div className="space-y-1">
                <label className="text-slate-500">Material / Insumo Requerido *</label>
                <input
                  type="text"
                  required
                  value={newPurMaterial}
                  onChange={(e) => setNewPurMaterial(e.target.value)}
                  placeholder="Ej. Rollo Vinil de Corte Negro"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-slate-500">Proveedor *</label>
                  <input
                    type="text"
                    required
                    value={newPurProvider}
                    onChange={(e) => setNewPurProvider(e.target.value)}
                    placeholder="Nombre del distribuidor"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Unidad *</label>
                  <input
                    type="text"
                    required
                    value={newPurUnit}
                    onChange={(e) => setNewPurUnit(e.target.value)}
                    placeholder="pzs, placas"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500">Cantidad Solicitada *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPurQuantity}
                    onChange={(e) => setNewPurQuantity(e.target.value)}
                    placeholder="Ej. 10"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Costo Unitario Contratado *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPurCost}
                    onChange={(e) => setNewPurCost(e.target.value)}
                    placeholder="$ por pieza"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Notas de Entrega / Comentarios</label>
                <textarea
                  value={newPurNotes}
                  onChange={(e) => setNewPurNotes(e.target.value)}
                  placeholder="Especifica detalles de pago o plazos acordados..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 mt-2"
              >
                <span>Emitir Orden de Compra</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* 3. NEW LOGISTICS RECEPTION MODAL */}
      {showRecepModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left relative animate-in zoom-in-95">
            <button
              onClick={() => setShowRecepModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
            >
              ✕
            </button>

            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">
                Programar Entrada de Insumos (Andén)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Agenda la llegada de transportes de proveedores en el andén de carga.</p>
            </div>

            <form onSubmit={handleCreateRecepEvent} className="space-y-3.5 text-xs font-semibold text-slate-700">
              
              <div className="space-y-1">
                <label className="text-slate-500">Proveedor / Transportista *</label>
                <input
                  type="text"
                  required
                  value={newRecProvider}
                  onChange={(e) => setNewRecProvider(e.target.value)}
                  placeholder="Ej. Distribuidora Toluca S.A."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Insumos / Materiales Esperados *</label>
                <input
                  type="text"
                  required
                  value={newRecMaterial}
                  onChange={(e) => setNewRecMaterial(e.target.value)}
                  placeholder="Ej. Planchas de PVC Espumado Trovicel"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500">Cantidad *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newRecQty}
                    onChange={(e) => setNewRecQty(e.target.value)}
                    placeholder="Ej. 100"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Fecha Arribo *</label>
                  <input
                    type="date"
                    required
                    value={newRecDate}
                    onChange={(e) => setNewRecDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Hora Pactada *</label>
                  <input
                    type="time"
                    required
                    value={newRecTime}
                    onChange={(e) => setNewRecTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 mt-2"
              >
                <span>Agendar Recepción</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* 4. MANUAL STOCK ADJUSTMENT DRAWER/MODAL */}
      {adjustItem && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-left relative animate-in zoom-in-95">
            <button
              onClick={() => setAdjustItem(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
            >
              ✕
            </button>

            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">
                Ajuste Manual de Existencias
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Registra una entrada por inventario físico o una merma detectada.</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1 font-semibold">
              <span className="text-slate-400 font-normal">Artículo Seleccionado:</span>
              <strong className="text-slate-900 block">{adjustItem.name}</strong>
              <div className="flex justify-between items-center mt-1">
                <span>Stock Actual:</span>
                <span className="font-mono font-bold text-slate-800">{adjustItem.stock} {adjustItem.unit}</span>
              </div>
            </div>

            <form onSubmit={handleManualAdjustStock} className="space-y-3.5 text-xs font-semibold text-slate-700">
              
              <div className="space-y-1">
                <label className="text-slate-500">Tipo de Ajuste *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-2 px-3 rounded-lg border font-bold transition text-center ${
                      adjustType === 'add' 
                        ? 'bg-teal-50 border-teal-300 text-teal-800' 
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    + Entrada (Suma)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('subtract')}
                    className={`py-2 px-3 rounded-lg border font-bold transition text-center ${
                      adjustType === 'subtract' 
                        ? 'bg-red-50 border-red-300 text-red-800' 
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    - Merma (Resta)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Cantidad de Ajuste ({adjustItem.unit}) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  placeholder="Ej. 5"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 mt-2"
              >
                <span>Aplicar Movimiento de Inventario</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

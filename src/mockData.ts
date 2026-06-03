/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceItem, Quotation, Invoice, Delivery, PurchaseOrder } from './types';

export const INITIAL_SERVICES: ServiceItem[] = [
  // Arquitectura
  {
    id: 'arq-1',
    name: 'Render 3D Fotorrealista Premium',
    type: 'arquitectura',
    unit: 'Imagen',
    price: 3500,
    description: 'Modelado en 3D y renderizado de alta fidelidad, iluminación diurna/nocturna.'
  },
  {
    id: 'arq-2',
    name: 'Diseño y Firma de Planos Executivos',
    type: 'arquitectura',
    unit: 'm²',
    price: 180,
    description: 'Planos arquitectónicos, estructurales y de instalaciones eléctricas/hidráulicas.'
  },
  {
    id: 'arq-3',
    name: 'Maqueta Física de Escala Fina',
    type: 'arquitectura',
    unit: 'Proyecto',
    price: 15000,
    description: 'Maqueta detallada cortada en láser y ensamblada a mano para presentaciones ejecutivas.'
  },
  {
    id: 'arq-4',
    name: 'Supervisión y Bitácora de Obra',
    type: 'arquitectura',
    unit: 'Visita',
    price: 1200,
    description: 'Visita técnica de obra con reporte fotográfico, control de calidad y bitácora.'
  },
  // Publicidad
  {
    id: 'pub-1',
    name: 'Impresión de Lona Publicitaria 13oz',
    type: 'publicidad',
    unit: 'm²',
    price: 110,
    description: 'Lona vinílica brillante con ojillos y dobladillo reforzado. Resolución 1200 DPI.'
  },
  {
    id: 'pub-2',
    name: 'Stand Corporativo Configurable 3x3',
    type: 'publicidad',
    unit: 'Estructura',
    price: 24500,
    description: 'Estructura de aluminio modular, paneles de PVC impresos en alta resolución, luces LED.'
  },
  {
    id: 'pub-3',
    name: 'Impresión de Vinil Adhesivo Mate',
    type: 'publicidad',
    unit: 'm²',
    price: 160,
    description: 'Vinil autoadherible permanente para muros, cristales o rotulación vehicular.'
  },
  {
    id: 'pub-4',
    name: 'Diseño de Identidad de Marca Pro',
    type: 'publicidad',
    unit: 'Paquete',
    price: 8500,
    description: 'Logotipo, manual de identidad, tipografía, paleta de colores y plantillas de papelería.'
  },
  {
    id: 'pub-5',
    name: 'Anuncio Espectacular Metálico (Renta)',
    type: 'publicidad',
    unit: 'Mes',
    price: 18000,
    description: 'Renta mensual de estructura cartelera de 12.00 x 7.20 m con iluminación nocturna.'
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'q-101',
    folio: 'IDEAS-COT-0101',
    clientName: 'Inmobiliaria Delta S.A.',
    clientPhone: '5512345678',
    clientEmail: 'contacto@deltabienesraices.com',
    date: '2026-06-01',
    items: [
      { serviceId: 'arq-1', name: 'Render 3D Fotorrealista Premium', quantity: 4, price: 3500 },
      { serviceId: 'arq-2', name: 'Diseño y Firma de Planos Executivos', quantity: 150, price: 180 }
    ],
    total: 41000,
    status: 'aceptada',
    notes: 'Requiere entrega de renders antes del 15 de junio para preventa.'
  },
  {
    id: 'q-102',
    folio: 'IDEAS-COT-0102',
    clientName: 'Restaurante El Portal',
    clientPhone: '5598765432',
    clientEmail: 'gerencia@elportalmexico.com',
    date: '2026-06-02',
    items: [
      { serviceId: 'pub-1', name: 'Impresión de Lona Publicitaria 13oz', quantity: 20, price: 110 },
      { serviceId: 'pub-3', name: 'Impresión de Vinil Adhesivo Mate', quantity: 15, price: 160 }
    ],
    total: 4600,
    status: 'pendiente',
    notes: 'Instalación incluida en fachada principal.'
  },
  {
    id: 'q-103',
    folio: 'IDEAS-COT-0103',
    clientName: 'Corporativo Bancomer',
    clientPhone: '5577665544',
    clientEmail: 'compras@corporativobbva.mx',
    date: '2026-05-28',
    items: [
      { serviceId: 'pub-2', name: 'Stand Corporativo Configurable 3x3', quantity: 1, price: 24500 }
    ],
    total: 24500,
    status: 'facturada',
    notes: 'Evento Congreso Anual Bancomer.'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-501',
    folio: 'FACL-10521',
    quotationId: 'q-103',
    clientName: 'Corporativo Bancomer',
    clientRfc: 'CBA920315XX2',
    date: '2026-05-29',
    subtotal: 24500,
    iva: 3920,
    total: 28420,
    status: 'timbrada',
    xmlUrl: 'XML-FACL-10521.xml'
  }
];

export const INITIAL_DELIVERIES: Delivery[] = [
  {
    id: 'del-1',
    title: 'Entrega Renders Fachada N',
    projectName: 'Preventa Torre Delta',
    clientName: 'Inmobiliaria Delta S.A.',
    date: '2026-06-04', // Mañana (según fecha local 2026-06-03)
    category: 'arquitectura',
    status: 'pendiente',
    priority: 'alta'
  },
  {
    id: 'del-2',
    title: 'Rotulación de Fachada Principal',
    projectName: 'Apertura El Portal',
    clientName: 'Restaurante El Portal',
    date: '2026-06-05', // Pasado mañana
    category: 'publicidad',
    status: 'pendiente',
    priority: 'media'
  },
  {
    id: 'del-3',
    title: 'Montaje de Stand Bancomer',
    projectName: 'Convención Expo Santa Fe',
    clientName: 'Corporativo Bancomer',
    date: '2026-05-31', // Pasado
    category: 'publicidad',
    status: 'entregado',
    priority: 'alta'
  },
  {
    id: 'del-4',
    title: 'Entrega de Planos Ejecutivos',
    projectName: 'Residencia Lomas de Chapultepec',
    clientName: 'Arq. Sofía Martínez',
    date: '2026-06-08', // Próxima semana
    category: 'arquitectura',
    status: 'pendiente',
    priority: 'baja'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-201',
    folio: 'OC-2026-089',
    type: 'orden_compra',
    providerOrClient: 'Distribuidora de Aluminios S.A.',
    date: '2026-06-01',
    description: 'Perfiles estructurales de aluminio de 1 pulgada para ensamble de Stand.',
    amount: 14200,
    registeredBy: 'Ricardo Gómez (Apoyo)',
    status: 'aprobada',
    photoUrl: 'images/mock-invoice-1.jpg' // we will provide a realistic visual component or mock viewer
  },
  {
    id: 'po-202',
    folio: 'CR-5026-11',
    type: 'contra_recibo',
    providerOrClient: 'Sistemas Inteligentes de Impresión',
    date: '2026-06-03',
    description: 'Contra-recibo por 5 rollos de lona brillo 13oz y suministro de tinta cian.',
    amount: 6850,
    registeredBy: 'Mariana López (Apoyo)',
    status: 'pendiente',
    photoUrl: 'images/mock-invoice-2.jpg'
  }
];

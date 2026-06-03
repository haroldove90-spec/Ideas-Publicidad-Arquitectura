/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ServiceType = 'publicidad' | 'arquitectura';

export interface ServiceItem {
  id: string;
  name: string;
  type: ServiceType;
  unit: string;
  price: number;
  description: string;
}

export type QuotationStatus = 'pendiente' | 'aceptada' | 'facturada';

export interface QuotationItem {
  serviceId: string;
  name: string; // snapshots name at quoting time
  quantity: number;
  price: number;
}

export interface Quotation {
  id: string;
  folio: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  date: string;
  items: QuotationItem[];
  total: number;
  status: QuotationStatus;
  notes?: string;
}

export interface Invoice {
  id: string;
  folio: string;
  quotationId?: string;
  clientName: string;
  clientRfc: string;
  date: string;
  subtotal: number;
  iva: number;
  total: number;
  status: 'timbrada' | 'borrador';
  xmlUrl?: string;
}

export interface Delivery {
  id: string;
  title: string;
  projectName: string;
  clientName: string;
  date: string; // YYYY-MM-DD
  category: ServiceType;
  status: 'pendiente' | 'entregado';
  priority: 'alta' | 'media' | 'baja';
}

export interface AuthRole {
  name: 'Administrador' | 'Personal de Apoyo';
  restricted: boolean;
}

export interface PurchaseOrder {
  id: string;
  folio: string;
  type: 'orden_compra' | 'contra_recibo';
  providerOrClient: string;
  date: string;
  description: string;
  amount: number;
  registeredBy: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  photoUrl?: string; // photo base64 or mock URL
}

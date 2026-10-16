/**
 * Entidad: Package
 * Representa un paquete en el sistema
 */

export interface Package {
  id: number;
  businessId: number;
  propertyUnitId: number;
  residentId?: number;
  packageStatusId: number;
  carrier: string;
  trackingNumber: string;
  qrCode: string;
  receivedByUserId?: number;
  receivedAt?: string;
  deliveredByUserId?: number;
  deliveredAt?: string;
  description?: string;
  notes?: string;
  notifyResident: boolean;
  notificationSentAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  propertyUnitNumber?: string;
  propertyUnitBlock?: string;
  residentName?: string;
  receivedByName?: string;
  deliveredByName?: string;
  statusName?: string;
  statusCode?: string;
}

export interface PackageListDTO {
  id: number;
  trackingNumber: string;
  carrier: string;
  propertyUnitNumber: string;
  /** Tipo de unidad en Tayazal ("Casa", "Dúplex", "Local", "Jardín"); se muestra "Casa 126". */
  propertyUnitBlock?: string;
  residentName: string;
  description?: string;
  statusName: string;
  statusCode: string;
  receivedAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

/** Grupo de estados de paquete: por entregar, entregados o devueltos/perdidos. */
export type PackageStatusGroup = 'pending' | 'delivered' | 'closed';

/** Conteos de la portería de paquetes. */
export interface PackagesSummary {
  pending: number;
  /** Por entregar recibidos hace más de 3 días. */
  pendingOverdue: number;
  deliveredToday: number;
  delivered: number;
  closed: number;
  total: number;
}

export interface PackagesPaginated {
  packages: PackageListDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreatePackageDTO {
  propertyUnitId: number;
  residentId?: number;
  carrier: string;
  trackingNumber: string;
  description?: string;
  notes?: string;
  notifyResident?: boolean;
}

export interface DeliverPackageDTO {
  notes?: string;
}

export interface UpdatePackageStatusDTO {
  packageStatusId: number;
  notes?: string;
}

export interface PackageStatus {
  id: number;
  code: string;
  name: string;
  description: string;
  isFinal: boolean;
  isActive: boolean;
}

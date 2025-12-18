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
  residentName?: string;
  statusName?: string;
  statusCode?: string;
}

export interface PackageListDTO {
  id: number;
  trackingNumber: string;
  carrier: string;
  propertyUnitNumber: string;
  residentName: string;
  statusName: string;
  statusCode: string;
  receivedAt?: string;
  deliveredAt?: string;
  createdAt: string;
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

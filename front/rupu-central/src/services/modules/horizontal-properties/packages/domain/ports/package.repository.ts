/**
 * Puerto (Interface): IPackagesRepository
 * Define los métodos para gestionar paquetes
 */

import {
  Package,
  PackageListDTO,
  PackagesPaginated,
  CreatePackageDTO,
  DeliverPackageDTO,
  UpdatePackageStatusDTO,
  PackageStatus,
  PackageStatusGroup,
  PackagesSummary,
} from '../entities';

export interface GetPackagesParams {
  businessId: number;
  token: string;
  page?: number;
  pageSize?: number;
  propertyUnitId?: number;
  residentId?: number;
  packageStatusId?: number;
  startDate?: string;
  endDate?: string;
  statusGroup?: PackageStatusGroup;
  /** Solo los entregados hoy (hora de Colombia). */
  deliveredToday?: boolean;
  /** Busca por guía, transportadora, unidad ("Casa 126") o residente. */
  search?: string;
}

export interface GetPackagesSummaryParams {
  businessId: number;
  token: string;
}

export interface GetPackageByIdParams {
  businessId: number;
  packageId: number;
  token: string;
}

export interface GetPackageByQRCodeParams {
  qrCode: string;
  token: string;
}

export interface ReceivePackageParams {
  businessId: number;
  data: CreatePackageDTO;
  token: string;
}

export interface DeliverPackageParams {
  businessId: number;
  packageId: number;
  data: DeliverPackageDTO;
  token: string;
}

export interface UpdatePackageStatusParams {
  businessId: number;
  packageId: number;
  data: UpdatePackageStatusDTO;
  token: string;
}

export interface GetPackageStatusesParams {
  token: string;
}

export interface DeletePackageParams {
  businessId: number;
  packageId: number;
  token: string;
}

export interface IPackagesRepository {
  getPackages(params: GetPackagesParams): Promise<PackagesPaginated>;
  getPackagesSummary(params: GetPackagesSummaryParams): Promise<PackagesSummary>;
  getPackageById(params: GetPackageByIdParams): Promise<Package>;
  getPackageByQRCode(params: GetPackageByQRCodeParams): Promise<Package>;
  receivePackage(params: ReceivePackageParams): Promise<Package>;
  deliverPackage(params: DeliverPackageParams): Promise<Package>;
  updatePackageStatus(params: UpdatePackageStatusParams): Promise<Package>;
  getPackageStatuses(params: GetPackageStatusesParams): Promise<PackageStatus[]>;
  deletePackage(params: DeletePackageParams): Promise<void>;
}

/**
 * Entity: Proxy (Apoderado)
 */

export interface Proxy {
  id: number;
  businessId: number;
  propertyUnitId: number;
  proxyName: string;
  proxyDni: string;
  proxyEmail: string | null;
  proxyPhone: string | null;
  proxyAddress: string | null;
  proxyType: 'external' | 'resident' | 'family';
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  powerOfAttorney: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProxyDTO {
  businessId: number;
  propertyUnitId: number;
  proxyName: string;
  proxyDni: string;
  proxyEmail?: string;
  proxyPhone?: string;
  proxyAddress?: string;
  proxyType: 'external' | 'resident' | 'family';
  startDate: string;
  endDate?: string;
  powerOfAttorney?: string;
  notes?: string;
}

export interface UpdateProxyDTO {
  proxyName?: string;
  proxyDni?: string;
  proxyEmail?: string;
  proxyPhone?: string;
  proxyAddress?: string;
  proxyType?: 'external' | 'resident' | 'family';
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  powerOfAttorney?: string;
  notes?: string;
}


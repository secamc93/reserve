import { BusinessListDTO } from '@/features/business/domain/Business';

export interface BusinessRepository {
  getBusinesses(): Promise<BusinessListDTO>;
}

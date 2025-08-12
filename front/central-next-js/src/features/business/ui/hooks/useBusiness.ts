import { useState, useEffect, useCallback } from 'react';
import { Business, CreateBusinessRequest, UpdateBusinessRequest } from '../../domain/Business';
import { BusinessType, CreateBusinessTypeRequest, UpdateBusinessTypeRequest } from '../../domain/Business';
import { BusinessRepositoryHttp } from '../../adapters/http/BusinessRepositoryHttp';
import { BusinessTypeRepositoryHttp } from '../../adapters/http/BusinessTypeRepositoryHttp';
import { GetBusinessesUseCase } from '../../application/GetBusinessesUseCase';
import { CreateBusinessUseCase } from '../../application/CreateBusinessUseCase';
import { UpdateBusinessUseCase } from '../../application/UpdateBusinessUseCase';
import { DeleteBusinessUseCase } from '../../application/DeleteBusinessUseCase';

export const useBusiness = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const businessRepository = new BusinessRepositoryHttp();
  const businessTypeRepository = new BusinessTypeRepositoryHttp();

  const getBusinessesUseCase = new GetBusinessesUseCase(businessRepository);
  const createBusinessUseCase = new CreateBusinessUseCase(businessRepository);
  const updateBusinessUseCase = new UpdateBusinessUseCase(businessRepository);
  const deleteBusinessUseCase = new DeleteBusinessUseCase(businessRepository);

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBusinessesUseCase.execute();
      setBusinesses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBusinessTypes = useCallback(async () => {
    try {
      const data = await businessTypeRepository.getBusinessTypes();
      setBusinessTypes(data);
    } catch (err: any) {
      console.error('Error loading business types:', err);
    }
  }, []);

  const createBusiness = useCallback(async (businessData: CreateBusinessRequest | FormData): Promise<Business> => {
    setLoading(true);
    setError(null);
    try {
      const newBusiness = await createBusinessUseCase.execute(businessData);
      setBusinesses(prev => [...prev, newBusiness]);
      return newBusiness;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBusiness = useCallback(async (id: number, businessData: UpdateBusinessRequest | FormData): Promise<Business> => {
    setLoading(true);
    setError(null);
    try {
      const updatedBusiness = await updateBusinessUseCase.execute(id, businessData);
      setBusinesses(prev => prev.map(b => b.id === id ? updatedBusiness : b));
      return updatedBusiness;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBusiness = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteBusinessUseCase.execute(id);
      setBusinesses(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBusinessById = useCallback(async (id: number): Promise<Business> => {
    try {
      const business = await businessRepository.getBusinessById(id);
      setSelectedBusiness(business);
      return business;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [businessRepository]);

  const createBusinessType = useCallback(async (businessTypeData: CreateBusinessTypeRequest): Promise<BusinessType> => {
    setLoading(true);
    setError(null);
    try {
      const newBusinessType = await businessTypeRepository.createBusinessType(businessTypeData);
      setBusinessTypes(prev => [...prev, newBusinessType]);
      return newBusinessType;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessTypeRepository]);

  const updateBusinessType = useCallback(async (id: number, businessTypeData: UpdateBusinessTypeRequest): Promise<BusinessType> => {
    setLoading(true);
    setError(null);
    try {
      const updatedBusinessType = await businessTypeRepository.updateBusinessType(id, businessTypeData);
      setBusinessTypes(prev => prev.map(bt => bt.id === id ? updatedBusinessType : bt));
      return updatedBusinessType;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessTypeRepository]);

  const deleteBusinessType = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await businessTypeRepository.deleteBusinessType(id);
      setBusinessTypes(prev => prev.filter(bt => bt.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessTypeRepository]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSelectedBusiness = useCallback(() => {
    setSelectedBusiness(null);
  }, []);

  useEffect(() => {
    loadBusinesses();
    loadBusinessTypes();
  }, [loadBusinesses, loadBusinessTypes]);

  return {
    businesses,
    businessTypes,
    loading,
    error,
    selectedBusiness,
    loadBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinessById,
    createBusinessType,
    updateBusinessType,
    deleteBusinessType,
    clearError,
    clearSelectedBusiness,
  };
}; 
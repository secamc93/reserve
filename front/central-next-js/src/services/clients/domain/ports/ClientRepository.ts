import { Client, CreateClientDTO, UpdateClientDTO } from '@/services/clients/domain/entities/Client';

export interface ClientRepository {
  getClients(): Promise<Client[]>;
  getClientById(id: number): Promise<Client>;
  createClient(data: CreateClientDTO): Promise<{ success: boolean; message?: string }>;
  updateClient(id: number, data: UpdateClientDTO): Promise<{ success: boolean; message?: string }>;
  deleteClient(id: number): Promise<{ success: boolean; message?: string }>;
}

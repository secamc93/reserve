/**
 * Use Case: Create Proxy
 */

import { IProxyRepository } from '../../domain/ports/attendance';
import { Proxy, CreateProxyDTO } from '../../domain/entities/attendance';

export interface CreateProxyInput {
  token: string;
  data: CreateProxyDTO;
}

export interface CreateProxyOutput {
  proxy: Proxy;
}

export class CreateProxyUseCase {
  constructor(private readonly proxyRepository: IProxyRepository) {}

  async execute(input: CreateProxyInput): Promise<CreateProxyOutput> {
    try {
      const proxy = await this.proxyRepository.createProxy({
        token: input.token,
        data: input.data,
      });

      return { proxy };
    } catch (error: unknown) {
      throw new Error(`Error creating proxy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

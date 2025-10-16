import { IResidentsRepository, BulkUpdateResidentsParams } from '../domain/ports';

export interface BulkUpdateResidentsInput extends BulkUpdateResidentsParams {}

export interface BulkUpdateResidentsOutput {
  success: boolean;
  message: string;
  data: {
    total_processed: number;
    updated: number;
    errors: number;
    error_details: Array<{
      row: number;
      property_unit_number: string;
      error: string;
    }>;
  };
}

export class BulkUpdateResidentsUseCase {
  constructor(private residentsRepository: IResidentsRepository) {}

  async execute(input: BulkUpdateResidentsInput): Promise<BulkUpdateResidentsOutput> {
    const result = await this.residentsRepository.bulkUpdateResidents(input);
    return result;
  }
}

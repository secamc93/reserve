import { IPropertyUnitsRepository, DeletePropertyUnitParams } from '../../domain';

export class DeletePropertyUnitUseCase {
  constructor(private repository: IPropertyUnitsRepository) {}

  async execute(params: DeletePropertyUnitParams): Promise<void> {
    return await this.repository.deletePropertyUnit(params);
  }
}

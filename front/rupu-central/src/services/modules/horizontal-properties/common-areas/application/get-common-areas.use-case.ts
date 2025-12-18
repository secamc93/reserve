import { ICommonAreasRepository, GetCommonAreasParams, CommonAreasPaginated } from '../domain';

export class GetCommonAreasUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(params: GetCommonAreasParams): Promise<CommonAreasPaginated> {
    return await this.repository.getCommonAreas(params);
  }
}

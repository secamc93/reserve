import { ICommonAreasRepository, CreateCommonAreaParams, CommonArea } from '../domain';

export class CreateCommonAreaUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(params: CreateCommonAreaParams): Promise<CommonArea> {
    return await this.repository.createCommonArea(params);
  }
}

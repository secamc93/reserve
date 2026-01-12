import { ICommonAreasRepository, GetCommonAreaByIdParams, CommonArea } from '../domain';

export class GetCommonAreaByIdUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(params: GetCommonAreaByIdParams): Promise<CommonArea> {
    return await this.repository.getCommonAreaById(params);
  }
}

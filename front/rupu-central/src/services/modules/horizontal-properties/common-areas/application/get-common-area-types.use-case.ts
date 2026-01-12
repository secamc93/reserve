import { ICommonAreasRepository, CommonAreaType } from '../domain';

export class GetCommonAreaTypesUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(token: string): Promise<CommonAreaType[]> {
    return await this.repository.getCommonAreaTypes(token);
  }
}

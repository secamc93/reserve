import { IVisitsRepository } from '../domain';
import { CreateVisitorParams, Visitor } from '../domain';

export class CreateVisitorUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: CreateVisitorParams): Promise<Visitor> {
    return await this.repository.createVisitor(params);
  }
}

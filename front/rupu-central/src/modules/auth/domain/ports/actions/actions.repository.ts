/**
 * Puerto de dominio: Repositorio de Actions
 */

import {
  ActionsList,
  GetActionsParams,
  GetActionByIdParams,
  CreateActionParams,
  CreateActionResponse,
  UpdateActionParams,
  UpdateActionResponse,
  DeleteActionParams,
  DeleteActionResponse,
} from '../../entities/action.entity';

export interface IActionsRepository {
  getActions(params: GetActionsParams): Promise<ActionsList>;
  getActionById(params: GetActionByIdParams): Promise<CreateActionResponse>;
  createAction(params: CreateActionParams): Promise<CreateActionResponse>;
  updateAction(params: UpdateActionParams): Promise<UpdateActionResponse>;
  deleteAction(params: DeleteActionParams): Promise<DeleteActionResponse>;
}


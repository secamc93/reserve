import { getActionsAction } from './get-actions.action';
import { getActionByIdAction } from './get-action-by-id.action';
import { createActionAction } from './create-action.action';
import { updateActionAction } from './update-action.action';
import { deleteActionAction } from './delete-action.action';

export interface ActionsActionsInput {
    getActions: (input: Parameters<typeof getActionsAction>[0]) => ReturnType<typeof getActionsAction>;
    getActionById: (input: Parameters<typeof getActionByIdAction>[0]) => ReturnType<typeof getActionByIdAction>;
    createAction: (input: Parameters<typeof createActionAction>[0]) => ReturnType<typeof createActionAction>;
    updateAction: (input: Parameters<typeof updateActionAction>[0]) => ReturnType<typeof updateActionAction>;
    deleteAction: (input: Parameters<typeof deleteActionAction>[0]) => ReturnType<typeof deleteActionAction>;
}

export class ActionsActions implements ActionsActionsInput {
    async getActions(input: Parameters<typeof getActionsAction>[0]) {
        return getActionsAction(input);
    }

    async getActionById(input: Parameters<typeof getActionByIdAction>[0]) {
        return getActionByIdAction(input);
    }

    async createAction(input: Parameters<typeof createActionAction>[0]) {
        return createActionAction(input);
    }

    async updateAction(input: Parameters<typeof updateActionAction>[0]) {
        return updateActionAction(input);
    }

    async deleteAction(input: Parameters<typeof deleteActionAction>[0]) {
        return deleteActionAction(input);
    }
}

export * from './get-actions.action';
export * from './get-action-by-id.action';
export * from './create-action.action';
export * from './update-action.action';
export * from './delete-action.action';

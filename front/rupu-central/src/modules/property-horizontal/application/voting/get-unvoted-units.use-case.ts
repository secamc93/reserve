import { getUnvotedUnitsAction, type GetUnvotedUnitsInput, type GetUnvotedUnitsResult } from '@/modules/property-horizontal/infrastructure/actions/voting/get-unvoted-units.action';

export interface GetUnvotedUnitsUseCaseParams {
  token: string;
  hpId: number;
  groupId: number;
  votingId: number;
  unitNumber?: string;
}

export interface GetUnvotedUnitsUseCaseResult {
  success: boolean;
  data?: Array<{
    id: number;
    number: string;
    residentId: number | null;
    residentName: string | null;
  }>;
  error?: string;
}

export class GetUnvotedUnitsUseCase {
  async execute(params: GetUnvotedUnitsUseCaseParams): Promise<GetUnvotedUnitsUseCaseResult> {
    try {
      const input: GetUnvotedUnitsInput = {
        token: params.token,
        hpId: params.hpId,
        groupId: params.groupId,
        votingId: params.votingId,
        unitNumber: params.unitNumber
      };

      const result: GetUnvotedUnitsResult = await getUnvotedUnitsAction(input);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Error al obtener unidades sin votar'
        };
      }

      // Mapear datos al formato del dominio
      const mappedData = result.data?.map(unit => ({
        id: unit.unit_id,
        number: unit.unit_number,
        residentId: unit.resident_id,
        residentName: unit.resident_name
      })) || [];

      return {
        success: true,
        data: mappedData
      };
    } catch (error) {
      console.error('❌ Error en GetUnvotedUnitsUseCase:', error);
      return {
        success: false,
        error: 'Error interno al obtener unidades sin votar'
      };
    }
  }
}


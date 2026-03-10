/**
 * Players Repository Port
 * Contrato de interfaz para el repositorio de jugadores
 */

import { Player, CreatePlayerDTO, UpdatePlayerDTO } from '../entities';

/**
 * Parámetros para obtener lista de jugadores (paginada)
 */
export interface GetPlayersParams {
  businessId: number;
  token: string;
  page?: number;
  pageSize?: number;
  name?: string;
  documentNumber?: string;
  skillLevelId?: number;
  isActive?: boolean;
}

/**
 * Parámetros para obtener un jugador por ID
 */
export interface GetPlayerByIdParams {
  businessId: number;
  playerId: number;
  token: string;
}

/**
 * Parámetros para crear jugador
 */
export interface CreatePlayerParams {
  token: string;
  data: CreatePlayerDTO;
}

/**
 * Parámetros para actualizar jugador
 */
export interface UpdatePlayerParams {
  businessId: number;
  playerId: number;
  token: string;
  data: UpdatePlayerDTO;
}

/**
 * Parámetros para eliminar jugador
 */
export interface DeletePlayerParams {
  businessId: number;
  playerId: number;
  token: string;
}

/**
 * Response paginado de jugadores
 */
export interface PlayersPaginated {
  data: Player[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Interfaz del repositorio de jugadores
 */
export interface IPlayersRepository {
  getPlayers(params: GetPlayersParams): Promise<PlayersPaginated>;
  getPlayerById(params: GetPlayerByIdParams): Promise<Player>;
  createPlayer(params: CreatePlayerParams): Promise<Player>;
  updatePlayer(params: UpdatePlayerParams): Promise<Player>;
  deletePlayer(params: DeletePlayerParams): Promise<void>;
}

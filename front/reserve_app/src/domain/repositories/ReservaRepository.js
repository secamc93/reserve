// Domain Repository Interface
export class ReservaRepository {
  async getReservas(filters = {}) {
    throw new Error('Method not implemented');
  }

  async getReservaById(id) {
    throw new Error('Method not implemented');
  }

  async createReserva(reservaData) {
    throw new Error('Method not implemented');
  }

  async updateReservaStatus(id, status) {
    throw new Error('Method not implemented');
  }

  async cancelReserva(id) {
    throw new Error('Method not implemented');
  }

  async assignTable(reservaId, tableId) {
    throw new Error('Method not implemented');
  }
} 
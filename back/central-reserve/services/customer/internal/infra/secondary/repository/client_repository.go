package repository

import (
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/secundary/repository/mapper"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
)

// ClientRepository implementa ports.IClientRepository

// GetClients obtiene todos los clientes
func (r *Repository) GetClients(ctx context.Context) ([]entities.Client, error) {
	var dbClients []models.Client
	if err := r.database.Conn(ctx).Model(&models.Client{}).Find(&dbClients).Error; err != nil {
		r.logger.Error().Msg("Error al obtener clientes")
		return nil, err
	}

	clients := mapper.ToClientEntitySlice(dbClients)
	return clients, nil
}

// GetClientByID obtiene un cliente por su ID
func (r *Repository) GetClientByID(ctx context.Context, id uint) (*entities.Client, error) {
	var dbClient models.Client
	if err := r.database.Conn(ctx).Model(&models.Client{}).Where("id = ?", id).First(&dbClient).Error; err != nil {
		r.logger.Error().Uint("id", id).Msg("Error al obtener cliente por ID")
		return nil, err
	}

	client := mapper.ToClientEntity(dbClient)
	return &client, nil
}

// GetClientByEmail obtiene un cliente por su email
func (r *Repository) GetClientByEmail(ctx context.Context, email string) (*entities.Client, error) {
	var dbClient models.Client
	if err := r.database.Conn(ctx).Model(&models.Client{}).Where("email = ?", email).First(&dbClient).Error; err != nil {
		r.logger.Error().Str("email", email).Msg("Error al obtener cliente por email")
		return nil, err
	}

	client := mapper.ToClientEntity(dbClient)
	return &client, nil
}

// GetClientByEmailAndBusiness obtiene un cliente por su email y business_id
func (r *Repository) GetClientByEmailAndBusiness(ctx context.Context, email string, businessID uint) (*entities.Client, error) {
	var dbClient models.Client
	if err := r.database.Conn(ctx).Model(&models.Client{}).Where("email = ? AND business_id = ?", email, businessID).First(&dbClient).Error; err != nil {
		r.logger.Error().Str("email", email).Uint("business_id", businessID).Msg("Error al obtener cliente por email y business")
		return nil, err
	}

	client := mapper.ToClientEntity(dbClient)
	return &client, nil
}

// CreateClient crea un nuevo cliente
func (r *Repository) CreateClient(ctx context.Context, client entities.Client) (string, error) {
	clientModel := mapper.CreateClientModel(client)

	if err := r.database.Conn(ctx).Model(&models.Client{}).Create(&clientModel).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear cliente")
		return "", err
	}

	return fmt.Sprintf("Cliente creado con ID: %d", clientModel.ID), nil
}

// UpdateClient actualiza un cliente existente
func (r *Repository) UpdateClient(ctx context.Context, id uint, client entities.Client) (string, error) {
	clientModel := mapper.CreateClientModel(client)

	if err := r.database.Conn(ctx).Model(&models.Client{}).Where("id = ?", id).Updates(&clientModel).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar cliente")
		return "", err
	}

	return fmt.Sprintf("Cliente actualizado con ID: %d", id), nil
}

// DeleteClient elimina un cliente
func (r *Repository) DeleteClient(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Model(&models.Client{}).Where("id = ?", id).Delete(&models.Client{}).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar cliente")
		return "", err
	}

	return fmt.Sprintf("Cliente eliminado con ID: %d", id), nil
}

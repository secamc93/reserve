package mapper

import (
	"central_reserve/internal/domain/entities"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// ToAPIKeyModel convierte una entidad APIKey del dominio al modelo de base de datos
func ToAPIKeyModel(apiKey entities.APIKey) models.APIKey {
	return models.APIKey{
		Model: gorm.Model{
			ID:        apiKey.ID,
			CreatedAt: apiKey.CreatedAt,
			UpdatedAt: apiKey.UpdatedAt,
		},
		UserID:      apiKey.UserID,
		BusinessID:  apiKey.BusinessID,
		CreatedByID: apiKey.CreatedByID,
		Name:        apiKey.Name,
		Description: apiKey.Description,
		KeyHash:     apiKey.KeyHash,
		LastUsedAt:  apiKey.LastUsedAt,
		Revoked:     apiKey.Revoked,
		RevokedAt:   apiKey.RevokedAt,
		RateLimit:   apiKey.RateLimit,
		IPWhitelist: apiKey.IPWhitelist,
	}
}

// ToAPIKeyEntity convierte un modelo APIKey de base de datos a entidad del dominio
func ToAPIKeyEntity(model models.APIKey) entities.APIKey {
	return entities.APIKey{
		ID:          model.ID,
		UserID:      model.UserID,
		BusinessID:  model.BusinessID,
		CreatedByID: model.CreatedByID,
		Name:        model.Name,
		Description: model.Description,
		KeyHash:     model.KeyHash,
		LastUsedAt:  model.LastUsedAt,
		Revoked:     model.Revoked,
		RevokedAt:   model.RevokedAt,
		RateLimit:   model.RateLimit,
		IPWhitelist: model.IPWhitelist,
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}
}

// ToAPIKeyInfoEntity convierte un modelo APIKey a APIKeyInfo del dominio
func ToAPIKeyInfoEntity(model models.APIKey) entities.APIKeyInfo {
	return entities.APIKeyInfo{
		ID:          model.ID,
		UserID:      model.UserID,
		BusinessID:  model.BusinessID,
		Name:        model.Name,
		Description: model.Description,
		LastUsedAt:  model.LastUsedAt,
		Revoked:     model.Revoked,
		RateLimit:   model.RateLimit,
		CreatedAt:   model.CreatedAt,
	}
}

// ToAPIKeyInfoEntitySlice convierte un slice de modelos APIKey a slice de APIKeyInfo
func ToAPIKeyInfoEntitySlice(models []models.APIKey) []entities.APIKeyInfo {
	result := make([]entities.APIKeyInfo, len(models))
	for i, model := range models {
		result[i] = ToAPIKeyInfoEntity(model)
	}
	return result
}

// ToAPIKeyEntitySlice convierte un slice de modelos APIKey a slice de entidades APIKey
func ToAPIKeyEntitySlice(models []models.APIKey) []entities.APIKey {
	result := make([]entities.APIKey, len(models))
	for i, model := range models {
		result[i] = ToAPIKeyEntity(model)
	}
	return result
}

// CreateAPIKeyModel crea un modelo APIKey para inserción (sin ID)
func CreateAPIKeyModel(apiKey entities.APIKey, keyHash string) models.APIKey {
	return models.APIKey{
		UserID:      apiKey.UserID,
		BusinessID:  apiKey.BusinessID,
		CreatedByID: apiKey.CreatedByID,
		Name:        apiKey.Name,
		Description: apiKey.Description,
		KeyHash:     keyHash,
		RateLimit:   apiKey.RateLimit,
		IPWhitelist: apiKey.IPWhitelist,
	}
}

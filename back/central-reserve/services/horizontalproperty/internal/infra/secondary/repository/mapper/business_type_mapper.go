package mapper

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"dbpostgres/app/infra/models"
)

// ToBusinessType mapea un modelo GORM BusinessType a entidad de dominio
func ToBusinessType(bt *models.BusinessType) *domain.BusinessType {
	if bt == nil {
		return nil
	}
	return &domain.BusinessType{
		ID:          bt.ID,
		Name:        bt.Name,
		Code:        bt.Code,
		Description: bt.Description,
		Icon:        bt.Icon,
		IsActive:    bt.IsActive,
	}
}

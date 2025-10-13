package repository

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"math"

	"gorm.io/gorm"
)

func (r *Repository) CreateResident(ctx context.Context, resident *domain.Resident) (*domain.Resident, error) {
	model := &models.Resident{BusinessID: resident.BusinessID, PropertyUnitID: resident.PropertyUnitID,
		ResidentTypeID: resident.ResidentTypeID, Name: resident.Name, Email: resident.Email, Phone: resident.Phone,
		Dni: resident.Dni, EmergencyContact: resident.EmergencyContact, IsMainResident: resident.IsMainResident,
		MoveInDate: resident.MoveInDate, LeaseStartDate: resident.LeaseStartDate,
		LeaseEndDate: resident.LeaseEndDate, MonthlyRent: resident.MonthlyRent, IsActive: resident.IsActive}
	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		return nil, fmt.Errorf("error creando residente: %w", err)
	}
	return mapResidentToDomain(model), nil
}

func (r *Repository) GetResidentByID(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
	var m models.Resident
	if err := r.db.Conn(ctx).Preload("PropertyUnit").Preload("ResidentType").First(&m, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrResidentNotFound
		}
		return nil, fmt.Errorf("error obteniendo residente: %w", err)
	}
	return &domain.ResidentDetailDTO{ID: m.ID, BusinessID: m.BusinessID, PropertyUnitID: m.PropertyUnitID,
		PropertyUnitNumber: m.PropertyUnit.Number, ResidentTypeID: m.ResidentTypeID, ResidentTypeName: m.ResidentType.Name,
		ResidentTypeCode: m.ResidentType.Code, Name: m.Name, Email: m.Email, Phone: m.Phone, Dni: m.Dni,
		EmergencyContact: m.EmergencyContact, IsMainResident: m.IsMainResident, IsActive: m.IsActive,
		MoveInDate: m.MoveInDate, MoveOutDate: m.MoveOutDate, LeaseStartDate: m.LeaseStartDate,
		LeaseEndDate: m.LeaseEndDate, MonthlyRent: m.MonthlyRent, CreatedAt: m.CreatedAt, UpdatedAt: m.UpdatedAt}, nil
}

func (r *Repository) ListResidents(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error) {
	var ms []models.Resident
	var total int64
	query := r.db.Conn(ctx).Model(&models.Resident{}).Preload("PropertyUnit").Preload("ResidentType").
		Where("residents.business_id = ?", filters.BusinessID)

	if filters.PropertyUnitNumber != "" {
		query = query.Joins("JOIN property_units ON property_units.id = residents.property_unit_id").
			Where("property_units.number ILIKE ?", "%"+filters.PropertyUnitNumber+"%")
	}
	if filters.Name != "" {
		query = query.Where("residents.name ILIKE ?", "%"+filters.Name+"%")
	}
	if filters.PropertyUnitID != nil {
		query = query.Where("property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentTypeID != nil {
		query = query.Where("resident_type_id = ?", *filters.ResidentTypeID)
	}
	if filters.IsActive != nil {
		query = query.Where("residents.is_active = ?", *filters.IsActive)
	}
	if filters.IsMainResident != nil {
		query = query.Where("is_main_resident = ?", *filters.IsMainResident)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando: %w", err)
	}
	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("residents.name ASC").Limit(filters.PageSize).Offset(offset).Find(&ms).Error; err != nil {
		return nil, fmt.Errorf("error listando: %w", err)
	}
	residents := make([]domain.ResidentListDTO, len(ms))
	for i, m := range ms {
		residents[i] = domain.ResidentListDTO{ID: m.ID, PropertyUnitNumber: m.PropertyUnit.Number,
			ResidentTypeName: m.ResidentType.Name, Name: m.Name, Email: m.Email, Phone: m.Phone,
			IsMainResident: m.IsMainResident, IsActive: m.IsActive}
	}
	return &domain.PaginatedResidentsDTO{Residents: residents, Total: total, Page: filters.Page,
		PageSize: filters.PageSize, TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize)))}, nil
}

func (r *Repository) UpdateResident(ctx context.Context, id uint, resident *domain.Resident) (*domain.Resident, error) {
	model := &models.Resident{PropertyUnitID: resident.PropertyUnitID, ResidentTypeID: resident.ResidentTypeID,
		Name: resident.Name, Email: resident.Email, Phone: resident.Phone, Dni: resident.Dni,
		EmergencyContact: resident.EmergencyContact, IsMainResident: resident.IsMainResident, IsActive: resident.IsActive,
		MoveInDate: resident.MoveInDate, MoveOutDate: resident.MoveOutDate, LeaseStartDate: resident.LeaseStartDate,
		LeaseEndDate: resident.LeaseEndDate, MonthlyRent: resident.MonthlyRent}
	if err := r.db.Conn(ctx).Model(&models.Resident{}).Where("id = ?", id).Updates(model).Error; err != nil {
		return nil, fmt.Errorf("error actualizando: %w", err)
	}
	var updated models.Resident
	if err := r.db.Conn(ctx).First(&updated, id).Error; err != nil {
		return nil, err
	}
	return mapResidentToDomain(&updated), nil
}

func (r *Repository) DeleteResident(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.Resident{}, id).Error; err != nil {
		return fmt.Errorf("error eliminando: %w", err)
	}
	return nil
}

func (r *Repository) ExistsResidentByEmail(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error) {
	var count int64
	query := r.db.Conn(ctx).Model(&models.Resident{}).Where("business_id = ? AND email = ?", businessID, email)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("error verificando: %w", err)
	}
	return count > 0, nil
}

func (r *Repository) ExistsResidentByDni(ctx context.Context, businessID uint, dni string, excludeID uint) (bool, error) {
	var count int64
	query := r.db.Conn(ctx).Model(&models.Resident{}).Where("business_id = ? AND dni = ?", businessID, dni)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("error verificando: %w", err)
	}
	return count > 0, nil
}

func (r *Repository) GetResidentByUnitAndDni(ctx context.Context, hpID, propertyUnitID uint, dni string) (*domain.ResidentBasicDTO, error) {
	var m models.Resident
	err := r.db.Conn(ctx).
		Preload("PropertyUnit").
		Where("business_id = ? AND property_unit_id = ? AND dni = ? AND is_active = ?", hpID, propertyUnitID, dni, true).
		First(&m).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("residente no encontrado")
		}
		return nil, fmt.Errorf("error buscando residente: %w", err)
	}

	return &domain.ResidentBasicDTO{
		ID:                 m.ID,
		Name:               m.Name,
		PropertyUnitID:     m.PropertyUnitID,
		PropertyUnitNumber: m.PropertyUnit.Number,
	}, nil
}

func mapResidentToDomain(m *models.Resident) *domain.Resident {
	return &domain.Resident{ID: m.ID, BusinessID: m.BusinessID, PropertyUnitID: m.PropertyUnitID,
		ResidentTypeID: m.ResidentTypeID, Name: m.Name, Email: m.Email, Phone: m.Phone, Dni: m.Dni,
		EmergencyContact: m.EmergencyContact, IsMainResident: m.IsMainResident, IsActive: m.IsActive,
		MoveInDate: m.MoveInDate, MoveOutDate: m.MoveOutDate, LeaseStartDate: m.LeaseStartDate,
		LeaseEndDate: m.LeaseEndDate, MonthlyRent: m.MonthlyRent, CreatedAt: m.CreatedAt, UpdatedAt: m.UpdatedAt}
}

package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type VisitorRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewVisitorRepository(db db.IDatabase, logger log.ILogger) domain.VisitorRepository {
	return &VisitorRepository{
		db:     db,
		logger: logger,
	}
}

// FindByDNI busca un visitante por DNI
func (r *VisitorRepository) FindByDNI(ctx context.Context, businessID *uint, dni string) (*domain.Visitor, error) {
	var visitor models.Visitor
	query := r.db.Conn(ctx).Where("dni = ?", dni)

	if businessID != nil {
		query = query.Where("(business_id = ? OR business_id IS NULL)", *businessID)
	} else {
		query = query.Where("business_id IS NULL")
	}

	err := query.First(&visitor).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil // No encontrado, pero no es error
	}
	if err != nil {
		return nil, fmt.Errorf("error buscando visitante por DNI: %w", err)
	}

	return mapVisitorToDomain(&visitor), nil
}

// CreateOrGetVisitor busca por DNI, si no existe lo crea
func (r *VisitorRepository) CreateOrGetVisitor(ctx context.Context, businessID *uint, dni string, name string, phone string) (*domain.Visitor, error) {
	visitor, err := r.FindByDNI(ctx, businessID, dni)
	if err != nil {
		return nil, err
	}

	if visitor != nil {
		// Actualizar datos si cambiaron
		updated := false
		if name != "" && visitor.FullName != name {
			visitor.FullName = name
			updated = true
		}
		if phone != "" && visitor.Phone != phone {
			visitor.Phone = phone
			updated = true
		}
		if updated {
			return r.UpdateVisitor(ctx, visitor)
		}
		return visitor, nil
	}

	// Crear nuevo visitante
	newVisitor := &domain.Visitor{
		BusinessID: businessID,
		DNI:        dni,
		FullName:   name,
		Phone:      phone,
	}
	return r.CreateVisitor(ctx, newVisitor)
}

// CreateVisitor crea un nuevo visitante
func (r *VisitorRepository) CreateVisitor(ctx context.Context, visitor *domain.Visitor) (*domain.Visitor, error) {
	model := &models.Visitor{
		BusinessID:  visitor.BusinessID,
		DNI:         visitor.DNI,
		FullName:    visitor.FullName,
		Phone:       visitor.Phone,
		Email:       visitor.Email,
		PhotoURL:    visitor.PhotoURL,
		IsVerified:  visitor.IsVerified,
		TotalVisits: visitor.TotalVisits,
		Notes:       visitor.Notes,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando visitante")
		return nil, fmt.Errorf("error creando visitante: %w", err)
	}

	return mapVisitorToDomain(model), nil
}

// GetVisitorByID obtiene un visitante por ID
func (r *VisitorRepository) GetVisitorByID(ctx context.Context, id uint) (*domain.Visitor, error) {
	var visitor models.Visitor
	if err := r.db.Conn(ctx).First(&visitor, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrVisitorNotFound
		}
		return nil, fmt.Errorf("error obteniendo visitante: %w", err)
	}

	return mapVisitorToDomain(&visitor), nil
}

// UpdateVisitor actualiza un visitante
func (r *VisitorRepository) UpdateVisitor(ctx context.Context, visitor *domain.Visitor) (*domain.Visitor, error) {
	updates := map[string]interface{}{
		"full_name":   visitor.FullName,
		"phone":       visitor.Phone,
		"email":       visitor.Email,
		"photo_url":   visitor.PhotoURL,
		"is_verified": visitor.IsVerified,
		"notes":       visitor.Notes,
	}

	if visitor.LastVisitAt != nil {
		updates["last_visit_at"] = visitor.LastVisitAt
	}
	if visitor.TotalVisits > 0 {
		updates["total_visits"] = visitor.TotalVisits
	}

	if err := r.db.Conn(ctx).Model(&models.Visitor{}).Where("id = ?", visitor.ID).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("error actualizando visitante: %w", err)
	}

	var updated models.Visitor
	if err := r.db.Conn(ctx).First(&updated, visitor.ID).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo visitante actualizado: %w", err)
	}

	return mapVisitorToDomain(&updated), nil
}

// mapVisitorToDomain mapea modelo a entidad de dominio
func mapVisitorToDomain(m *models.Visitor) *domain.Visitor {
	return &domain.Visitor{
		ID:           m.ID,
		BusinessID:   m.BusinessID,
		DNI:          m.DNI,
		FullName:     m.FullName,
		Phone:        m.Phone,
		Email:        m.Email,
		PhotoURL:     m.PhotoURL,
		HasBlacklist: m.HasBlacklist,
		IsVerified:   m.IsVerified,
		LastVisitAt:  m.LastVisitAt,
		TotalVisits:  m.TotalVisits,
		Notes:        m.Notes,
		CreatedAt:    m.CreatedAt,
		UpdatedAt:    m.UpdatedAt,
	}
}

package usecasepropertyunit

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

func (uc *propertyUnitUseCase) CreatePropertyUnit(ctx context.Context, dto domain.CreatePropertyUnitDTO) (*domain.PropertyUnitDetailDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "CreatePropertyUnit")

	// Validaciones
	if dto.Number == "" {
		uc.logger.Error(ctx).Str("number", dto.Number).Msg("Número de unidad requerido")
		return nil, domain.ErrPropertyUnitNumberRequired
	}

	// Verificar que no exista una unidad con el mismo número
	exists, err := uc.repo.ExistsPropertyUnitByNumber(ctx, dto.BusinessID, dto.Number, 0)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", dto.BusinessID).Str("number", dto.Number).Msg("Error verificando número de unidad existente")
		return nil, err
	}
	if exists {
		uc.logger.Warn(ctx).Uint("business_id", dto.BusinessID).Str("number", dto.Number).Msg("Número de unidad ya existe")
		return nil, domain.ErrPropertyUnitNumberExists
	}

	// Crear entidad
	entity := &domain.PropertyUnit{
		BusinessID:               dto.BusinessID,
		Number:                   dto.Number,
		Floor:                    dto.Floor,
		Block:                    dto.Block,
		UnitType:                 dto.UnitType,
		Area:                     dto.Area,
		Bedrooms:                 dto.Bedrooms,
		Bathrooms:                dto.Bathrooms,
		ParticipationCoefficient: dto.ParticipationCoefficient,
		Description:              dto.Description,
		IsActive:                 true,
	}

	// Guardar en repositorio
	created, err := uc.repo.CreatePropertyUnit(ctx, entity)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", dto.BusinessID).Str("number", dto.Number).Msg("Error creando unidad de propiedad en repositorio")
		return nil, err
	}

	// Convertir a DTO de respuesta
	return &domain.PropertyUnitDetailDTO{
		ID:                       created.ID,
		BusinessID:               created.BusinessID,
		Number:                   created.Number,
		Floor:                    created.Floor,
		Block:                    created.Block,
		UnitType:                 created.UnitType,
		Area:                     created.Area,
		Bedrooms:                 created.Bedrooms,
		Bathrooms:                created.Bathrooms,
		ParticipationCoefficient: created.ParticipationCoefficient,
		Description:              created.Description,
		IsActive:                 created.IsActive,
		CreatedAt:                created.CreatedAt,
		UpdatedAt:                created.UpdatedAt,
	}, nil
}

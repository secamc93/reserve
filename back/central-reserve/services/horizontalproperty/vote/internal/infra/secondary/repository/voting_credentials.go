package repository

import (
	"context"
	"errors"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// ============================================
// CONTRASEÑAS DE VOTO POR UNIDAD Y GRUPO
// Tablas consultadas fuera del módulo: property_units, residents, resident_units
// (solo lectura, replicadas localmente - ver repository-isolation.md)
// ============================================

// unitNumberOrder ordena las unidades numéricas como número (2 antes de 10) y deja al final las
// que tienen letras.
const unitNumberOrder = "CASE WHEN property_units.number ~ '^[0-9]+$' THEN property_units.number::bigint END NULLS LAST, property_units.number"

// ListActiveUnitIDsByBusiness devuelve los IDs de las unidades activas de la propiedad.
func (r *Repository) ListActiveUnitIDsByBusiness(ctx context.Context, businessID uint) ([]uint, error) {
	var ids []uint
	if err := r.db.Conn(ctx).Model(&models.PropertyUnit{}).
		Where("business_id = ? AND is_active = ?", businessID, true).
		Order("id").
		Pluck("id", &ids).Error; err != nil {
		return nil, fmt.Errorf("error listando unidades activas: %w", err)
	}
	return ids, nil
}

// ListVotingCredentialUnitIDs devuelve las unidades que ya tienen contraseña en el grupo.
func (r *Repository) ListVotingCredentialUnitIDs(ctx context.Context, groupID uint) ([]uint, error) {
	var ids []uint
	if err := r.db.Conn(ctx).Model(&models.VotingCredential{}).
		Where("voting_group_id = ?", groupID).
		Pluck("property_unit_id", &ids).Error; err != nil {
		return nil, fmt.Errorf("error listando contraseñas del grupo: %w", err)
	}
	return ids, nil
}

// SaveVotingCredentials guarda las contraseñas del grupo en una transacción. Con replaceAll
// borra (definitivamente) las anteriores: las credenciales impresas antes dejan de servir.
func (r *Repository) SaveVotingCredentials(ctx context.Context, groupID uint, credentials []domain.VotingCredential, replaceAll bool) error {
	return r.db.Conn(ctx).Transaction(func(tx *gorm.DB) error {
		if replaceAll {
			if err := tx.Unscoped().Where("voting_group_id = ?", groupID).Delete(&models.VotingCredential{}).Error; err != nil {
				return fmt.Errorf("error borrando contraseñas anteriores: %w", err)
			}
		}
		if len(credentials) == 0 {
			return nil
		}
		rows := make([]models.VotingCredential, len(credentials))
		for i, c := range credentials {
			rows[i] = models.VotingCredential{
				BusinessID:     c.BusinessID,
				VotingGroupID:  groupID,
				PropertyUnitID: c.PropertyUnitID,
				Password:       c.Password,
			}
		}
		if err := tx.CreateInBatches(rows, 200).Error; err != nil {
			return fmt.Errorf("error guardando contraseñas: %w", err)
		}
		return nil
	})
}

// CountVotingCredentials cuenta las contraseñas del grupo.
func (r *Repository) CountVotingCredentials(ctx context.Context, groupID uint) (int64, error) {
	var total int64
	if err := r.db.Conn(ctx).Model(&models.VotingCredential{}).
		Where("voting_group_id = ?", groupID).
		Count(&total).Error; err != nil {
		return 0, fmt.Errorf("error contando contraseñas del grupo: %w", err)
	}
	return total, nil
}

// GetVotingCredentialPassword devuelve la contraseña de la unidad en el grupo, o "" si no tiene.
func (r *Repository) GetVotingCredentialPassword(ctx context.Context, groupID, propertyUnitID uint) (string, error) {
	var cred models.VotingCredential
	err := r.db.Conn(ctx).
		Where("voting_group_id = ? AND property_unit_id = ?", groupID, propertyUnitID).
		First(&cred).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("error obteniendo contraseña de la unidad: %w", err)
	}
	return cred.Password, nil
}

// ListVotingCredentials lista las contraseñas del grupo con la unidad y su residente principal,
// ordenadas por número de unidad.
func (r *Repository) ListVotingCredentials(ctx context.Context, groupID uint, page, pageSize int) ([]domain.VotingCredentialDTO, int64, error) {
	base := r.db.Conn(ctx).Model(&models.VotingCredential{}).
		Joins("JOIN horizontal_property.property_units ON property_units.id = voting_credentials.property_unit_id AND property_units.deleted_at IS NULL").
		Where("voting_credentials.voting_group_id = ?", groupID)

	var total int64
	if err := base.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("error contando contraseñas del grupo: %w", err)
	}

	var rows []struct {
		PropertyUnitID uint
		UnitNumber     string
		UnitBlock      string
		OwnerName      string
		Password       string
	}
	ownerName := `COALESCE((SELECT residents.name FROM horizontal_property.residents
		JOIN horizontal_property.resident_units ON resident_units.resident_id = residents.id AND resident_units.deleted_at IS NULL
		WHERE resident_units.property_unit_id = property_units.id AND residents.deleted_at IS NULL AND residents.is_active
		ORDER BY resident_units.is_main_resident DESC, residents.id LIMIT 1), '') AS owner_name`
	if err := base.Session(&gorm.Session{}).
		Select("voting_credentials.property_unit_id, property_units.number AS unit_number, property_units.block AS unit_block, " + ownerName + ", voting_credentials.password").
		Order(unitNumberOrder).
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Scan(&rows).Error; err != nil {
		return nil, 0, fmt.Errorf("error listando contraseñas del grupo: %w", err)
	}

	out := make([]domain.VotingCredentialDTO, len(rows))
	for i, row := range rows {
		out[i] = domain.VotingCredentialDTO{
			PropertyUnitID: row.PropertyUnitID,
			UnitNumber:     row.UnitNumber,
			UnitBlock:      row.UnitBlock,
			OwnerName:      row.OwnerName,
			Password:       row.Password,
		}
	}
	return out, total, nil
}

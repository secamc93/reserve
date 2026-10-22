package repository

import (
	"context"
	"fmt"
	"time"

	"dbpostgres/app/infra/models"
)

// colombia es la hora de Colombia (UTC-5, sin horario de verano): los días de votación se cuentan
// en el calendario local, igual que en el módulo votingbilling.
var colombia = time.FixedZone("COT", -5*60*60)

// IsVotingPaymentPending dice si el grupo de la votación todavía debe días de votación: la
// propiedad no está exenta y los pagos aprobados no cubren los días entre inicio y cierre. Una
// votación inexistente devuelve false (la rechazan las demás validaciones).
//
// Tablas consultadas: voting_billing_settings y voting_group_payments (gestionadas por el módulo
// votingbilling). Consultas replicadas localmente, ver repository-isolation.md.
func (r *Repository) IsVotingPaymentPending(ctx context.Context, votingID uint) (bool, error) {
	conn := r.db.Conn(ctx)

	var voting models.Voting
	if err := conn.Select("id", "voting_group_id").Where("id = ?", votingID).Limit(1).Find(&voting).Error; err != nil {
		return false, fmt.Errorf("error obteniendo votación: %w", err)
	}
	if voting.ID == 0 {
		return false, nil
	}
	var group models.VotingGroup
	if err := conn.Select("id", "business_id", "voting_start_date", "voting_end_date").Where("id = ?", voting.VotingGroupID).Limit(1).Find(&group).Error; err != nil {
		return false, fmt.Errorf("error obteniendo grupo de votación: %w", err)
	}
	if group.ID == 0 {
		return false, nil
	}

	var setting models.VotingBillingSetting
	if err := conn.Where("business_id = ?", group.BusinessID).Limit(1).Find(&setting).Error; err != nil {
		return false, fmt.Errorf("error leyendo exención de cobro: %w", err)
	}
	if setting.ID != 0 && setting.Exempt {
		return false, nil
	}

	var paidDays int
	if err := conn.Model(&models.VotingGroupPayment{}).
		Where("voting_group_id = ? AND status = ?", group.ID, "APPROVED").
		Select("COALESCE(SUM(days), 0)").Scan(&paidDays).Error; err != nil {
		return false, fmt.Errorf("error sumando días pagados: %w", err)
	}
	return votingDays(group.VotingStartDate, group.VotingEndDate) > paidDays, nil
}

// votingDays cuenta los días calendario (hora de Colombia) entre inicio y cierre, ambos incluidos.
func votingDays(start, end time.Time) int {
	s, e := start.In(colombia), end.In(colombia)
	sd := time.Date(s.Year(), s.Month(), s.Day(), 0, 0, 0, 0, time.UTC)
	ed := time.Date(e.Year(), e.Month(), e.Day(), 0, 0, 0, 0, time.UTC)
	if days := int(ed.Sub(sd).Hours()/24) + 1; days > 1 {
		return days
	}
	return 1
}

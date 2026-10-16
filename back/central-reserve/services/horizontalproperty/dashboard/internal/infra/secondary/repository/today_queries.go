package repository

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/dashboard/internal/domain"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// ============================================
// RESUMEN DE HOY DE UNA PROPIEDAD
// Tablas consultadas (solo lectura, replicadas localmente - ver repository-isolation.md):
// visits, visitors, visit_types, property_units, packages, package_statuses,
// common_area_reservations, common_areas, voting_groups, votings, votes,
// attendance_lists, attendance_records, parking_slots, parking_zones, parking_assignments,
// residents, resident_units.
// ============================================

const insideVisitsLimit = 8

// GetTodaySummary ver domain.DashboardRepository.
func (r *DashboardRepository) GetTodaySummary(ctx context.Context, businessID uint, today time.Time) (*domain.TodaySummary, error) {
	out := &domain.TodaySummary{}
	conn := r.db.Conn(ctx)
	now := time.Now()
	day := today.Format("2006-01-02")

	// Visitas dentro: con entrada y sin salida.
	inside := conn.Model(&models.Visit{}).Where("visits.business_id = ? AND visits.actual_entry_time IS NOT NULL AND visits.actual_exit_time IS NULL", businessID)
	if err := inside.Count(&out.VisitsInsideCount).Error; err != nil {
		return nil, fmt.Errorf("error contando visitas dentro: %w", err)
	}
	if err := conn.Model(&models.Visit{}).
		Where("visits.business_id = ? AND visits.actual_entry_time IS NOT NULL AND visits.actual_exit_time IS NULL", businessID).
		Where("(visits.duration_exceeded = TRUE OR (visits.scheduled_end_time IS NOT NULL AND visits.scheduled_end_time < ?))", now).
		Count(&out.VisitsExceededCount).Error; err != nil {
		return nil, fmt.Errorf("error contando visitas excedidas: %w", err)
	}
	var visits []struct {
		VisitorName      string
		VisitType        string
		UnitNumber       string
		UnitBlock        string
		ActualEntryTime  time.Time
		ScheduledEndTime *time.Time
		DurationExceeded bool
	}
	if err := conn.Model(&models.Visit{}).
		Select("COALESCE(vr.full_name, '') AS visitor_name, COALESCE(vt.name, '') AS visit_type, COALESCE(pu.number, '') AS unit_number, COALESCE(pu.block, '') AS unit_block, visits.actual_entry_time, visits.scheduled_end_time, visits.duration_exceeded").
		Joins("LEFT JOIN horizontal_property.visitors vr ON vr.id = visits.visitor_id").
		Joins("LEFT JOIN horizontal_property.visit_types vt ON vt.id = visits.visit_type_id").
		Joins("LEFT JOIN horizontal_property.property_units pu ON pu.id = visits.property_unit_id").
		Where("visits.business_id = ? AND visits.actual_entry_time IS NOT NULL AND visits.actual_exit_time IS NULL", businessID).
		Order("visits.actual_entry_time ASC").
		Limit(insideVisitsLimit).
		Scan(&visits).Error; err != nil {
		return nil, fmt.Errorf("error listando visitas dentro: %w", err)
	}
	for _, v := range visits {
		out.VisitsInside = append(out.VisitsInside, domain.InsideVisit{
			VisitorName: v.VisitorName,
			VisitType:   v.VisitType,
			UnitNumber:  v.UnitNumber,
			UnitBlock:   v.UnitBlock,
			EntryTime:   v.ActualEntryTime,
			Exceeded:    v.DurationExceeded || (v.ScheduledEndTime != nil && v.ScheduledEndTime.Before(now)),
		})
	}

	// Paquetes por entregar.
	pending := func() *gorm.DB {
		return conn.Model(&models.Package{}).
			Joins("JOIN horizontal_property.package_statuses ps ON ps.id = packages.package_status_id").
			Where("packages.business_id = ? AND packages.delivered_at IS NULL AND ps.code IN ?", businessID, []string{"received", "in_storage", "notified"})
	}
	if err := pending().Count(&out.PackagesPending).Error; err != nil {
		return nil, fmt.Errorf("error contando paquetes por entregar: %w", err)
	}
	if err := pending().Where("COALESCE(packages.received_at, packages.created_at) < ?", now.AddDate(0, 0, -5)).Count(&out.PackagesOld).Error; err != nil {
		return nil, fmt.Errorf("error contando paquetes antiguos: %w", err)
	}

	// Reservas de zonas comunes de hoy (sin canceladas ni rechazadas).
	var res []struct {
		StartTime        string
		EndTime          string
		AreaName         string
		UnitNumber       string
		UnitBlock        string
		RequiresApproval bool
		ApprovedAt       *time.Time
	}
	if err := conn.Model(&models.CommonAreaReservation{}).
		Select("common_area_reservations.start_time, common_area_reservations.end_time, COALESCE(ca.name, '') AS area_name, COALESCE(pu.number, '') AS unit_number, COALESCE(pu.block, '') AS unit_block, common_area_reservations.requires_approval, common_area_reservations.approved_at").
		Joins("LEFT JOIN horizontal_property.common_areas ca ON ca.id = common_area_reservations.common_area_id").
		Joins("LEFT JOIN horizontal_property.property_units pu ON pu.id = common_area_reservations.property_unit_id").
		Where("common_area_reservations.business_id = ? AND common_area_reservations.reservation_date::date = ?", businessID, day).
		Where("common_area_reservations.cancelled_at IS NULL AND common_area_reservations.rejected_at IS NULL").
		Order("common_area_reservations.start_time ASC").
		Scan(&res).Error; err != nil {
		return nil, fmt.Errorf("error listando reservas de hoy: %w", err)
	}
	for _, x := range res {
		approved := x.ApprovedAt != nil || !x.RequiresApproval
		if !approved {
			out.ReservationsPending++
		}
		out.ReservationsToday = append(out.ReservationsToday, domain.TodayReservation{
			StartTime: x.StartTime, EndTime: x.EndTime, AreaName: x.AreaName, UnitNumber: x.UnitNumber, UnitBlock: x.UnitBlock, Approved: approved,
		})
	}

	// Votación activa (la primera del grupo activo más reciente).
	var voting struct {
		GroupID          uint
		GroupName        string
		VotingID         uint
		Title            string
		RequiresQuorum   bool
		QuorumPercentage *float64
	}
	if err := conn.Model(&models.Voting{}).
		Select("vg.id AS group_id, vg.name AS group_name, votings.id AS voting_id, votings.title, vg.requires_quorum, vg.quorum_percentage").
		Joins("JOIN horizontal_property.voting_groups vg ON vg.id = votings.voting_group_id AND vg.deleted_at IS NULL").
		Where("vg.business_id = ? AND votings.is_active = TRUE", businessID).
		Order("vg.id DESC, votings.display_order ASC").
		Limit(1).
		Scan(&voting).Error; err != nil {
		return nil, fmt.Errorf("error buscando votación activa: %w", err)
	}
	if voting.VotingID != 0 {
		av := &domain.ActiveVotingSummary{GroupID: voting.GroupID, GroupName: voting.GroupName, VotingID: voting.VotingID, Title: voting.Title}
		if voting.RequiresQuorum {
			av.QuorumPercentage = voting.QuorumPercentage
		}
		if err := conn.Model(&models.Vote{}).Where("voting_id = ?", voting.VotingID).Distinct("property_unit_id").Count(&av.VotedUnits).Error; err != nil {
			return nil, fmt.Errorf("error contando unidades que votaron: %w", err)
		}
		if err := conn.Model(&models.PropertyUnit{}).Where("business_id = ? AND is_active = TRUE", businessID).Count(&av.TotalUnits).Error; err != nil {
			return nil, fmt.Errorf("error contando unidades: %w", err)
		}
		var coef struct {
			Total    float64
			Attended float64
		}
		if err := conn.Model(&models.AttendanceRecord{}).
			Select("COALESCE(SUM(pu.participation_coefficient), 0) AS total, COALESCE(SUM(CASE WHEN attendance_records.attended_as_owner OR attendance_records.attended_as_proxy THEN pu.participation_coefficient ELSE 0 END), 0) AS attended").
			Joins("JOIN horizontal_property.attendance_lists al ON al.id = attendance_records.attendance_list_id AND al.deleted_at IS NULL").
			Joins("JOIN horizontal_property.property_units pu ON pu.id = attendance_records.property_unit_id").
			Where("al.voting_group_id = ?", voting.GroupID).
			Scan(&coef).Error; err != nil {
			return nil, fmt.Errorf("error calculando asistencia por coeficiente: %w", err)
		}
		if coef.Total > 0 {
			pct := coef.Attended / coef.Total * 100
			av.AttendanceByCoef = &pct
		}
		out.ActiveVoting = av
	}

	// Ocupación.
	o := &out.Occupancy
	if err := conn.Model(&models.PropertyUnit{}).Where("business_id = ? AND is_active = TRUE", businessID).Count(&o.Units).Error; err != nil {
		return nil, fmt.Errorf("error contando unidades: %w", err)
	}
	if err := conn.Model(&models.PropertyUnit{}).Where("business_id = ? AND is_active = TRUE", businessID).
		Where("EXISTS (SELECT 1 FROM horizontal_property.resident_units ru JOIN horizontal_property.residents r ON r.id = ru.resident_id AND r.deleted_at IS NULL AND r.is_active WHERE ru.property_unit_id = property_units.id AND ru.deleted_at IS NULL)").
		Count(&o.UnitsWithResident).Error; err != nil {
		return nil, fmt.Errorf("error contando unidades con residente: %w", err)
	}
	if err := conn.Model(&models.ParkingSlot{}).
		Joins("JOIN horizontal_property.parking_zones pz ON pz.id = parking_slots.parking_zone_id AND pz.deleted_at IS NULL").
		Where("pz.business_id = ? AND parking_slots.is_active = TRUE", businessID).Count(&o.ParkingSlots).Error; err != nil {
		return nil, fmt.Errorf("error contando cupos: %w", err)
	}
	if err := conn.Model(&models.ParkingAssignment{}).Where("business_id = ? AND is_active = TRUE", businessID).Count(&o.ParkingAssigned).Error; err != nil {
		return nil, fmt.Errorf("error contando cupos asignados: %w", err)
	}
	if err := conn.Model(&models.Resident{}).Where("business_id = ? AND is_active = TRUE", businessID).Count(&o.Residents).Error; err != nil {
		return nil, fmt.Errorf("error contando residentes: %w", err)
	}
	if err := conn.Model(&models.Resident{}).Where("business_id = ? AND is_active = TRUE AND email IS NOT NULL AND email <> ''", businessID).Count(&o.ResidentsWithEmail).Error; err != nil {
		return nil, fmt.Errorf("error contando residentes con correo: %w", err)
	}
	return out, nil
}

package repository

// ============================================
// CONSULTAS DEL RESUMEN DEL RESIDENTE
// (Replicadas localmente - no compartir repos). Solo lectura.
// Tablas consultadas: visits/visitors (módulo visit), packages/package_statuses (packages),
// common_area_reservations/common_areas (commonarea), voting_groups/votings/votes (vote),
// parking_assignments/parking_slots (parking).
// ============================================

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"dbpostgres/app/infra/models"
)

const recentActivityLimit = 8

// GetResidentOverview arma el resumen del residente a partir de sus unidades.
func (r *ResidentRepository) GetResidentOverview(ctx context.Context, businessID, residentID uint, now time.Time) (*domain.ResidentOverviewDTO, error) {
	db := r.db.Conn(ctx)
	out := &domain.ResidentOverviewDTO{Housemates: []domain.HousemateDTO{}, Activity: []domain.ActivityDTO{}}

	var unitIDs []uint
	if err := db.Model(&models.ResidentUnit{}).
		Where("resident_id = ? AND business_id = ?", residentID, businessID).
		Pluck("property_unit_id", &unitIDs).Error; err != nil {
		return nil, fmt.Errorf("error consultando unidades del residente: %w", err)
	}

	// Otros residentes de las mismas unidades
	if len(unitIDs) > 0 {
		if err := db.Model(&models.ResidentUnit{}).
			Select("DISTINCT residents.id, residents.name, resident_types.name AS type_name, resident_units.is_main_resident AS is_main").
			Joins("JOIN horizontal_property.residents ON residents.id = resident_units.resident_id AND residents.deleted_at IS NULL").
			Joins("JOIN horizontal_property.resident_types ON resident_types.id = residents.resident_type_id").
			Where("resident_units.property_unit_id IN ? AND residents.id <> ?", unitIDs, residentID).
			Order("is_main DESC, residents.name ASC").
			Scan(&out.Housemates).Error; err != nil {
			return nil, fmt.Errorf("error consultando residentes de la unidad: %w", err)
		}
	}

	// Parqueadero: por residente o por sus unidades
	type parkingRow struct {
		StartDate    time.Time
		VehiclePlate string
		SlotNumber   string
	}
	var parking []parkingRow
	pq := db.Model(&models.ParkingAssignment{}).
		Select("parking_assignments.start_date, parking_assignments.vehicle_plate, parking_slots.slot_number").
		Joins("LEFT JOIN horizontal_property.parking_slots ON parking_slots.id = parking_assignments.parking_slot_id").
		Where("parking_assignments.business_id = ? AND parking_assignments.is_active = ?", businessID, true)
	if len(unitIDs) > 0 {
		pq = pq.Where("(parking_assignments.resident_id = ? OR parking_assignments.property_unit_id IN ?)", residentID, unitIDs)
	} else {
		pq = pq.Where("parking_assignments.resident_id = ?", residentID)
	}
	if err := pq.Order("parking_assignments.start_date DESC").Limit(3).Scan(&parking).Error; err != nil {
		return nil, fmt.Errorf("error consultando parqueaderos: %w", err)
	}
	for _, p := range parking {
		out.Activity = append(out.Activity, domain.ActivityDTO{
			Kind: domain.ActivityParking, Title: "Cupo de parqueo " + p.SlotNumber, Subtitle: p.VehiclePlate, At: p.StartDate,
		})
	}

	if len(unitIDs) == 0 {
		return out, nil
	}

	// Visitas
	since30 := now.AddDate(0, 0, -30)
	if err := db.Model(&models.Visit{}).
		Where("business_id = ? AND property_unit_id IN ? AND scheduled_date >= ?", businessID, unitIDs, since30).
		Count(&out.Stats.Visits30d).Error; err != nil {
		return nil, fmt.Errorf("error contando visitas: %w", err)
	}
	type visitRow struct {
		ScheduledDate   time.Time
		ActualEntryTime *time.Time
		VisitorName     string
	}
	var visits []visitRow
	if err := db.Model(&models.Visit{}).
		Select("visits.scheduled_date, visits.actual_entry_time, visitors.full_name AS visitor_name").
		Joins("LEFT JOIN horizontal_property.visitors ON visitors.id = visits.visitor_id").
		Where("visits.business_id = ? AND visits.property_unit_id IN ?", businessID, unitIDs).
		Order("visits.scheduled_date DESC").Limit(5).Scan(&visits).Error; err != nil {
		return nil, fmt.Errorf("error consultando visitas: %w", err)
	}
	for _, v := range visits {
		at := v.ScheduledDate
		title := "Visita programada"
		if v.ActualEntryTime != nil {
			at, title = *v.ActualEntryTime, "Visita ingresó"
		}
		out.Activity = append(out.Activity, domain.ActivityDTO{Kind: domain.ActivityVisit, Title: title, Subtitle: v.VisitorName, At: at})
	}

	// Paquetes
	if err := db.Model(&models.Package{}).
		Joins("JOIN horizontal_property.package_statuses ON package_statuses.id = packages.package_status_id").
		Where("packages.business_id = ? AND packages.property_unit_id IN ? AND package_statuses.is_final = ?", businessID, unitIDs, false).
		Count(&out.Stats.PackagesPending).Error; err != nil {
		return nil, fmt.Errorf("error contando paquetes: %w", err)
	}
	type packageRow struct {
		Carrier     string
		StatusName  string
		ReceivedAt  *time.Time
		DeliveredAt *time.Time
		CreatedAt   time.Time
	}
	var packages []packageRow
	if err := db.Model(&models.Package{}).
		Select("packages.carrier, package_statuses.name AS status_name, packages.received_at, packages.delivered_at, packages.created_at").
		Joins("LEFT JOIN horizontal_property.package_statuses ON package_statuses.id = packages.package_status_id").
		Where("packages.business_id = ? AND packages.property_unit_id IN ?", businessID, unitIDs).
		Order("packages.created_at DESC").Limit(5).Scan(&packages).Error; err != nil {
		return nil, fmt.Errorf("error consultando paquetes: %w", err)
	}
	for _, p := range packages {
		at, title := p.CreatedAt, "Paquete recibido"
		if p.ReceivedAt != nil {
			at = *p.ReceivedAt
		}
		if p.DeliveredAt != nil {
			at, title = *p.DeliveredAt, "Paquete entregado"
		}
		out.Activity = append(out.Activity, domain.ActivityDTO{
			Kind: domain.ActivityPackage, Title: title, Subtitle: joinNonEmpty(" · ", p.Carrier, p.StatusName), At: at,
		})
	}

	// Reservas de zonas comunes
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	if err := db.Model(&models.CommonAreaReservation{}).
		Where("business_id = ? AND property_unit_id IN ? AND reservation_date >= ?", businessID, unitIDs, today).
		Count(&out.Stats.Reservations).Error; err != nil {
		return nil, fmt.Errorf("error contando reservas: %w", err)
	}
	type reservationRow struct {
		ReservationDate time.Time
		StartTime       string
		AreaName        string
	}
	var reservations []reservationRow
	if err := db.Model(&models.CommonAreaReservation{}).
		Select("common_area_reservations.reservation_date, common_area_reservations.start_time::text AS start_time, common_areas.name AS area_name").
		Joins("LEFT JOIN horizontal_property.common_areas ON common_areas.id = common_area_reservations.common_area_id").
		Where("common_area_reservations.business_id = ? AND common_area_reservations.property_unit_id IN ?", businessID, unitIDs).
		Order("common_area_reservations.reservation_date DESC").Limit(5).Scan(&reservations).Error; err != nil {
		return nil, fmt.Errorf("error consultando reservas: %w", err)
	}
	for _, rv := range reservations {
		out.Activity = append(out.Activity, domain.ActivityDTO{
			Kind: domain.ActivityReservation, Title: "Reserva · " + rv.AreaName, Subtitle: shortTime(rv.StartTime), At: rv.ReservationDate,
		})
	}

	// Votaciones: último grupo de votación de la propiedad
	var group models.VotingGroup
	res := db.Model(&models.VotingGroup{}).Where("business_id = ?", businessID).Order("voting_start_date DESC").Limit(1).Find(&group)
	if res.Error != nil {
		return nil, fmt.Errorf("error consultando grupos de votación: %w", res.Error)
	}
	if res.RowsAffected > 0 {
		if err := db.Model(&models.Voting{}).Where("voting_group_id = ?", group.ID).Count(&out.Stats.VotesTotal).Error; err != nil {
			return nil, fmt.Errorf("error contando votaciones: %w", err)
		}
		if err := db.Model(&models.Vote{}).
			Joins("JOIN horizontal_property.votings ON votings.id = votes.voting_id AND votings.deleted_at IS NULL").
			Where("votings.voting_group_id = ? AND votes.property_unit_id IN ?", group.ID, unitIDs).
			Distinct("votes.voting_id").Count(&out.Stats.VotesCast).Error; err != nil {
			return nil, fmt.Errorf("error contando votos: %w", err)
		}
	}
	type voteRow struct {
		VotedAt time.Time
		Title   string
	}
	var votes []voteRow
	if err := db.Model(&models.Vote{}).
		Select("votes.voted_at, votings.title").
		Joins("JOIN horizontal_property.votings ON votings.id = votes.voting_id").
		Joins("JOIN horizontal_property.voting_groups ON voting_groups.id = votings.voting_group_id").
		Where("voting_groups.business_id = ? AND votes.property_unit_id IN ?", businessID, unitIDs).
		Order("votes.voted_at DESC").Limit(5).Scan(&votes).Error; err != nil {
		return nil, fmt.Errorf("error consultando votos: %w", err)
	}
	for _, v := range votes {
		out.Activity = append(out.Activity, domain.ActivityDTO{Kind: domain.ActivityVote, Title: "Votó", Subtitle: v.Title, At: v.VotedAt})
	}

	sort.SliceStable(out.Activity, func(i, j int) bool { return out.Activity[i].At.After(out.Activity[j].At) })
	if len(out.Activity) > recentActivityLimit {
		out.Activity = out.Activity[:recentActivityLimit]
	}
	return out, nil
}

func joinNonEmpty(sep string, parts ...string) string {
	kept := make([]string, 0, len(parts))
	for _, p := range parts {
		if strings.TrimSpace(p) != "" {
			kept = append(kept, strings.TrimSpace(p))
		}
	}
	return strings.Join(kept, sep)
}

// shortTime "08:00:00" → "08:00".
func shortTime(t string) string {
	if len(t) >= 5 {
		return t[:5]
	}
	return t
}

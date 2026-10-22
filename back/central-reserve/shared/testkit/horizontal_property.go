//go:build integration

package testkit

import (
	"context"
	"fmt"
	"testing"

	"central_reserve/shared/db"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// UnitSpec describe una unidad a crear en una propiedad horizontal de prueba.
type UnitSpec struct {
	Number      string
	Coefficient float64 // coeficiente de participación (los de una propiedad suman 100)
	// ResidentName, si no está vacío, crea un residente principal (tipo `owner`) para la unidad.
	ResidentName string
}

// HorizontalProperty es una propiedad horizontal creada para una prueba.
type HorizontalProperty struct {
	BusinessID uint
	Code       string
	// Units en el mismo orden de las UnitSpec recibidas.
	Units []models.PropertyUnit
	// ResidentIDByUnit: unidad -> residente principal (solo las unidades con ResidentName).
	ResidentIDByUnit map[uint]uint
	ResidentNames    map[uint]string
}

// UnitID devuelve el id de la i-ésima unidad creada.
func (hp *HorizontalProperty) UnitID(i int) uint { return hp.Units[i].ID }

const hpBusinessTypeCode = "horizontal_property"

// NewHorizontalProperty crea un negocio de tipo propiedad horizontal con sus unidades (y
// residentes principales si se piden), con nombres propios de la corrida. Registra en
// t.Cleanup el borrado físico de TODO lo colgado del negocio (votos, asistencia, opciones,
// votaciones, grupos, residentes, unidades y el negocio), aunque lo haya creado el código
// probado y no el fixture.
func NewHorizontalProperty(t *testing.T, database db.IDatabase, units []UnitSpec) *HorizontalProperty {
	t.Helper()
	ctx := context.Background()
	conn := database.Conn(ctx)
	sfx := Suffix()

	businessTypeID := ensureHPBusinessType(t, conn)

	business := models.Business{
		Name:           "IT PH " + sfx,
		Code:           "it-ph-" + sfx,
		BusinessTypeID: businessTypeID,
		CustomDomain:   "it-ph-" + sfx + ".test", // único en la tabla: no puede ir vacío
		IsActive:       true,
	}
	if err := conn.Create(&business).Error; err != nil {
		t.Fatalf("testkit: creando negocio de prueba: %v", err)
	}
	t.Cleanup(func() { cleanupBusiness(t, database, business.ID) })

	// Las pruebas de votaciones no tratan del cobro: la propiedad de prueba queda exenta. Las del
	// cobro quitan la exención (SetVotingBillingExempt).
	SetVotingBillingExempt(t, database, business.ID, true)

	hp := &HorizontalProperty{
		BusinessID:       business.ID,
		Code:             business.Code,
		ResidentIDByUnit: map[uint]uint{},
		ResidentNames:    map[uint]string{},
	}

	var ownerTypeID uint
	for i, spec := range units {
		coef := spec.Coefficient
		unit := models.PropertyUnit{
			BusinessID:               business.ID,
			Number:                   spec.Number,
			UnitType:                 "apartment",
			ParticipationCoefficient: &coef,
			IsActive:                 true,
		}
		if err := conn.Create(&unit).Error; err != nil {
			t.Fatalf("testkit: creando unidad %q: %v", spec.Number, err)
		}
		hp.Units = append(hp.Units, unit)

		if spec.ResidentName == "" {
			continue
		}
		if ownerTypeID == 0 {
			ownerTypeID = residentTypeID(t, conn, "owner")
		}
		resident := models.Resident{
			BusinessID:     business.ID,
			ResidentTypeID: ownerTypeID,
			Name:           spec.ResidentName,
			Email:          fmt.Sprintf("it-%s-%d@rupu.test", sfx, i),
			IsActive:       true,
		}
		if err := conn.Create(&resident).Error; err != nil {
			t.Fatalf("testkit: creando residente %q: %v", spec.ResidentName, err)
		}
		link := models.ResidentUnit{
			BusinessID:     business.ID,
			ResidentID:     resident.ID,
			PropertyUnitID: unit.ID,
			IsMainResident: true,
		}
		if err := conn.Create(&link).Error; err != nil {
			t.Fatalf("testkit: asignando residente a unidad %q: %v", spec.Number, err)
		}
		hp.ResidentIDByUnit[unit.ID] = resident.ID
		hp.ResidentNames[unit.ID] = resident.Name
	}
	return hp
}

// ensureHPBusinessType devuelve el id del tipo de negocio `horizontal_property`. Es un
// catálogo que el entorno necesita de todos modos (ver entorno-local.md): si falta, se crea
// de forma idempotente y NO se borra al final.
func ensureHPBusinessType(t *testing.T, conn *gorm.DB) uint {
	t.Helper()
	var bt models.BusinessType
	err := conn.Where("code = ?", hpBusinessTypeCode).First(&bt).Error
	if err == nil {
		return bt.ID
	}
	if err != gorm.ErrRecordNotFound {
		t.Fatalf("testkit: buscando tipo de negocio %s: %v", hpBusinessTypeCode, err)
	}
	bt = models.BusinessType{Name: "Propiedad Horizontal", Code: hpBusinessTypeCode, IsActive: true}
	if err := conn.Clauses(clause.OnConflict{DoNothing: true}).Create(&bt).Error; err != nil {
		t.Fatalf("testkit: creando tipo de negocio %s: %v", hpBusinessTypeCode, err)
	}
	if err := conn.Where("code = ?", hpBusinessTypeCode).First(&bt).Error; err != nil {
		t.Fatalf("testkit: tipo de negocio %s no disponible: %v", hpBusinessTypeCode, err)
	}
	return bt.ID
}

func residentTypeID(t *testing.T, conn *gorm.DB, code string) uint {
	t.Helper()
	var rt models.ResidentType
	if err := conn.Where("code = ?", code).First(&rt).Error; err != nil {
		t.Fatalf("testkit: tipo de residente %q no encontrado (%v). Migra la BD del checkout con `make run-migrations`, que siembra los tipos de residente", code, err)
	}
	return rt.ID
}

// cleanupBusiness borra físicamente (Unscoped) todo lo de votaciones y unidades de un
// negocio, en orden de dependencias (las FK de la BD no son en cascada). Los votos se buscan
// por votación, por opción y por unidad del negocio, para no dejar huérfanos aunque una
// prueba mezcle datos de dos negocios.
func cleanupBusiness(t *testing.T, database db.IDatabase, businessID uint) {
	t.Helper()
	// Session hace reutilizable la cadena: sin ella las condiciones se acumularían entre consultas.
	conn := database.Conn(context.Background()).Unscoped().Session(&gorm.Session{})

	groupIDs := conn.Model(&models.VotingGroup{}).Select("id").Where("business_id = ?", businessID)
	votingIDs := conn.Model(&models.Voting{}).Select("id").Where("voting_group_id IN (?)", groupIDs)
	listIDs := conn.Model(&models.AttendanceList{}).Select("id").Where("voting_group_id IN (?)", groupIDs)
	optionIDs := conn.Model(&models.VotingOption{}).Select("id").Where("voting_id IN (?)", votingIDs)
	unitIDs := conn.Model(&models.PropertyUnit{}).Select("id").Where("business_id = ?", businessID)

	steps := []struct {
		name  string
		model any
		where string
		arg   any
	}{
		{"pagos de días de votación", &models.VotingGroupPayment{}, "business_id = ?", businessID},
		{"configuración de cobro", &models.VotingBillingSetting{}, "business_id = ?", businessID},
		{"votos", &models.Vote{}, "voting_id IN (?) OR voting_option_id IN (?) OR property_unit_id IN (?)", nil},
		{"registros de asistencia", &models.AttendanceRecord{}, "attendance_list_id IN (?) OR property_unit_id IN (?)", nil},
		{"listas de asistencia", &models.AttendanceList{}, "voting_group_id IN (?)", groupIDs},
		{"opciones", &models.VotingOption{}, "voting_id IN (?)", votingIDs},
		{"votaciones", &models.Voting{}, "voting_group_id IN (?)", groupIDs},
		{"grupos de votación", &models.VotingGroup{}, "business_id = ?", businessID},
		{"residentes por unidad", &models.ResidentUnit{}, "business_id = ?", businessID},
		{"residentes", &models.Resident{}, "business_id = ?", businessID},
		{"unidades", &models.PropertyUnit{}, "business_id = ?", businessID},
		{"negocio", &models.Business{}, "id = ?", businessID},
	}
	for _, s := range steps {
		var err error
		switch s.name {
		case "votos":
			err = conn.Where(s.where, votingIDs, optionIDs, unitIDs).Delete(s.model).Error
		case "registros de asistencia":
			err = conn.Where(s.where, listIDs, unitIDs).Delete(s.model).Error
		default:
			err = conn.Where(s.where, s.arg).Delete(s.model).Error
		}
		if err != nil {
			t.Errorf("testkit: limpieza de %s del negocio %d: %v", s.name, businessID, err)
			return
		}
	}
}

// SetVotingBillingExempt marca o desmarca la propiedad como exenta del cobro por día de votación.
func SetVotingBillingExempt(t *testing.T, database db.IDatabase, businessID uint, exempt bool) {
	t.Helper()
	err := database.Conn(context.Background()).Exec(`
		INSERT INTO horizontal_property.voting_billing_settings (business_id, exempt, created_at, updated_at)
		VALUES (?, ?, NOW(), NOW())
		ON CONFLICT (business_id) DO UPDATE SET exempt = EXCLUDED.exempt, updated_at = NOW(), deleted_at = NULL`,
		businessID, exempt).Error
	if err != nil {
		t.Fatalf("testkit: configurando exención de cobro: %v", err)
	}
}

package domain

import "context"

// ResidentRepository - Puerto para repositorio de residentes
type ResidentRepository interface {
	CreateResident(ctx context.Context, resident *Resident) (*Resident, error)
	GetResidentByID(ctx context.Context, id uint) (*ResidentDetailDTO, error)
	ListResidents(ctx context.Context, filters ResidentFiltersDTO) (*PaginatedResidentsDTO, error)
	UpdateResident(ctx context.Context, id uint, resident *Resident) (*Resident, error)
	DeleteResident(ctx context.Context, id uint) error
	ExistsResidentByEmail(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error)
	ExistsResidentByDni(ctx context.Context, businessID uint, dni string, excludeID uint) (bool, error)
	GetResidentByUnitAndDni(ctx context.Context, hpID, propertyUnitID uint, dni string) (*ResidentBasicDTO, error)
	GetPropertyUnitsByNumbers(ctx context.Context, businessID uint, numbers []string) (map[string]uint, error) // Retorna map[number]unit_id
	CreateResidentsInBatch(ctx context.Context, residents []*Resident) error                                   // Crear múltiples residentes en transacción
	// Nuevos métodos para edición masiva eficiente
	GetMainResidentsByUnitIDs(ctx context.Context, businessID uint, unitIDs []uint) (map[uint]ResidentDetailDTO, error)
	UpdateResidentsInBatch(ctx context.Context, pairs []ResidentUpdatePair) error
	// Métodos para relación muchos-a-muchos resident-unidad
	GetResidentIDsByDni(ctx context.Context, businessID uint, dnis []string) (map[string]uint, error)
	CreateResidentUnitsInBatch(ctx context.Context, pivots []ResidentUnit) error
}

// ResidentUseCase - Puerto para casos de uso de residentes
type ResidentUseCase interface {
	CreateResident(ctx context.Context, dto CreateResidentDTO) (*ResidentDetailDTO, error)
	GetResidentByID(ctx context.Context, id uint) (*ResidentDetailDTO, error)
	ListResidents(ctx context.Context, filters ResidentFiltersDTO) (*PaginatedResidentsDTO, error)
	UpdateResident(ctx context.Context, id uint, dto UpdateResidentDTO) (*ResidentDetailDTO, error)
	DeleteResident(ctx context.Context, id uint) error
	ImportResidentsFromExcel(ctx context.Context, businessID uint, filePath string) (*ImportResidentsResult, error)
	BulkUpdateResidents(ctx context.Context, businessID uint, request BulkUpdateResidentsRequest) (*BulkUpdateResidentsResult, error)
	BulkUpdateResidentsFromExcel(ctx context.Context, businessID uint, filePath string) (*BulkUpdateResidentsResult, error)
}

package usecases

import (
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"

	"gorm.io/gorm"
)

// HorizontalPropertyMigrationUseCase maneja la migración de datos iniciales para propiedad horizontal
type HorizontalPropertyMigrationUseCase struct {
	systemUseCase *SystemUseCase
	scopeUseCase  *ScopeUseCase
	db            *gorm.DB
	logger        log.ILogger
}

// NewHorizontalPropertyMigrationUseCase crea una nueva instancia
func NewHorizontalPropertyMigrationUseCase(
	systemUseCase *SystemUseCase,
	scopeUseCase *ScopeUseCase,
	db *gorm.DB,
	logger log.ILogger,
) *HorizontalPropertyMigrationUseCase {
	return &HorizontalPropertyMigrationUseCase{
		systemUseCase: systemUseCase,
		scopeUseCase:  scopeUseCase,
		db:            db,
		logger:        logger,
	}
}

// Execute ejecuta la migración de datos iniciales para propiedad horizontal
func (uc *HorizontalPropertyMigrationUseCase) Execute() error {
	uc.logger.Info().Msg("Inicializando datos de propiedad horizontal...")

	// 1. Crear tipos de residentes básicos
	if err := uc.createResidentTypes(); err != nil {
		return err
	}

	// 2. Crear tipo de negocio para propiedad horizontal
	if err := uc.createHorizontalPropertyBusinessType(); err != nil {
		return err
	}

	// 3. Crear tipos de comités y consejos
	if err := uc.createCommitteeTypes(); err != nil {
		return err
	}

	// 4. Crear cargos/posiciones de comités
	if err := uc.createCommitteePositions(); err != nil {
		return err
	}

	// 5. Crear tipos de empleados/staff
	if err := uc.createStaffTypes(); err != nil {
		return err
	}

	// 6. Crear datos iniciales para sistema de votaciones
	if err := uc.createVotingInitialData(); err != nil {
		return err
	}

	uc.logger.Info().Msg("✅ Datos de propiedad horizontal inicializados correctamente")
	return nil
}

// createResidentTypes crea los tipos de residentes básicos
func (uc *HorizontalPropertyMigrationUseCase) createResidentTypes() error {
	uc.logger.Info().Msg("Creando tipos de residentes...")

	residentTypes := []models.ResidentType{
		{
			Name:        "Propietario",
			Code:        "owner",
			Description: "Propietario de la unidad de propiedad",
			IsActive:    true,
		},
		{
			Name:        "Arrendatario",
			Code:        "tenant",
			Description: "Arrendatario de la unidad de propiedad",
			IsActive:    true,
		},
		{
			Name:        "Familiar",
			Code:        "family",
			Description: "Familiar del propietario o arrendatario",
			IsActive:    true,
		},
		{
			Name:        "Invitado",
			Code:        "guest",
			Description: "Invitado temporal",
			IsActive:    true,
		},
	}

	for _, residentType := range residentTypes {
		var existing models.ResidentType
		if err := uc.db.Where("code = ?", residentType.Code).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := uc.db.Create(&residentType).Error; err != nil {
					uc.logger.Error().Err(err).Str("code", residentType.Code).Msg("Error creando tipo de residente")
					return err
				}
				uc.logger.Info().Str("code", residentType.Code).Str("name", residentType.Name).Msg("Tipo de residente creado")
			} else {
				return err
			}
		} else {
			uc.logger.Info().Str("code", residentType.Code).Msg("Tipo de residente ya existe")
		}
	}

	return nil
}

// createHorizontalPropertyBusinessType crea el tipo de negocio para propiedad horizontal
func (uc *HorizontalPropertyMigrationUseCase) createHorizontalPropertyBusinessType() error {
	uc.logger.Info().Msg("Creando tipo de negocio para propiedad horizontal...")

	businessType := models.BusinessType{
		Name:        "Propiedad Horizontal",
		Code:        "horizontal_property",
		Description: "Condominios, edificios residenciales y propiedades horizontales",
		Icon:        "building",
		IsActive:    true,
	}

	var existing models.BusinessType
	if err := uc.db.Where("code = ?", businessType.Code).First(&existing).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			if err := uc.db.Create(&businessType).Error; err != nil {
				uc.logger.Error().Err(err).Str("code", businessType.Code).Msg("Error creando tipo de negocio")
				return err
			}
			uc.logger.Info().Str("code", businessType.Code).Str("name", businessType.Name).Msg("Tipo de negocio creado")
		} else {
			return err
		}
	} else {
		uc.logger.Info().Str("code", businessType.Code).Msg("Tipo de negocio ya existe")
	}

	return nil
}

// createCommitteeTypes crea los tipos de comités y consejos requeridos por ley
func (uc *HorizontalPropertyMigrationUseCase) createCommitteeTypes() error {
	uc.logger.Info().Msg("Creando tipos de comités...")

	committeeTypes := []models.CommitteeType{
		{
			Name:               "Consejo de Administración",
			Code:               "admin_council",
			Description:        "Órgano ejecutivo de la propiedad horizontal, responsable de la administración y ejecución de decisiones",
			IsRequired:         true,
			MaxMembers:         &[]int{9}[0],  // Máximo 9 miembros según ley
			MinMembers:         3,             // Mínimo 3 miembros
			RequiresOwnership:  true,          // Solo propietarios
			TermDurationMonths: &[]int{24}[0], // 2 años
			IsActive:           true,
		},
		{
			Name:               "Comité de Convivencia",
			Code:               "coexistence_committee",
			Description:        "Comité encargado de la resolución de conflictos y promoción de la convivencia pacífica",
			IsRequired:         true,
			MaxMembers:         &[]int{3}[0],  // Máximo 3 miembros
			MinMembers:         3,             // Exactamente 3 miembros
			RequiresOwnership:  true,          // Solo propietarios
			TermDurationMonths: &[]int{24}[0], // 2 años
			IsActive:           true,
		},
		{
			Name:               "Revisoría Fiscal",
			Code:               "fiscal_review",
			Description:        "Órgano de control fiscal y financiero de la propiedad horizontal",
			IsRequired:         true,
			MaxMembers:         &[]int{1}[0], // Solo 1 revisor fiscal
			MinMembers:         1,
			RequiresOwnership:  false,         // Puede ser externo
			TermDurationMonths: &[]int{12}[0], // 1 año
			IsActive:           true,
		},
		{
			Name:               "Asamblea General",
			Code:               "general_assembly",
			Description:        "Órgano máximo de decisión, conformado por todos los propietarios",
			IsRequired:         true,
			MaxMembers:         nil, // Sin límite (todos los propietarios)
			MinMembers:         1,
			RequiresOwnership:  true, // Solo propietarios
			TermDurationMonths: nil,  // Permanente
			IsActive:           true,
		},
	}

	for _, committeeType := range committeeTypes {
		var existing models.CommitteeType
		if err := uc.db.Where("code = ?", committeeType.Code).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := uc.db.Create(&committeeType).Error; err != nil {
					uc.logger.Error().Err(err).Str("code", committeeType.Code).Msg("Error creando tipo de comité")
					return err
				}
				uc.logger.Info().Str("code", committeeType.Code).Str("name", committeeType.Name).Msg("Tipo de comité creado")
			} else {
				return err
			}
		} else {
			uc.logger.Info().Str("code", committeeType.Code).Msg("Tipo de comité ya existe")
		}
	}

	return nil
}

// createCommitteePositions crea los cargos/posiciones dentro de los comités
func (uc *HorizontalPropertyMigrationUseCase) createCommitteePositions() error {
	uc.logger.Info().Msg("Creando cargos de comités...")

	positions := []models.CommitteePosition{
		{
			Name:        "Presidente",
			Code:        "president",
			Description: "Presidente del comité o consejo",
			Level:       1, // Nivel más alto
			IsActive:    true,
		},
		{
			Name:        "Vicepresidente",
			Code:        "vicepresident",
			Description: "Vicepresidente del comité o consejo",
			Level:       2,
			IsActive:    true,
		},
		{
			Name:        "Secretario",
			Code:        "secretary",
			Description: "Secretario del comité o consejo",
			Level:       3,
			IsActive:    true,
		},
		{
			Name:        "Tesorero",
			Code:        "treasurer",
			Description: "Tesorero del comité o consejo",
			Level:       3,
			IsActive:    true,
		},
		{
			Name:        "Vocal",
			Code:        "member",
			Description: "Miembro vocal del comité o consejo",
			Level:       4,
			IsActive:    true,
		},
		{
			Name:        "Revisor Fiscal",
			Code:        "fiscal_reviewer",
			Description: "Revisor fiscal de la propiedad horizontal",
			Level:       1,
			IsActive:    true,
		},
		{
			Name:        "Suplente",
			Code:        "alternate",
			Description: "Miembro suplente del comité o consejo",
			Level:       5,
			IsActive:    true,
		},
	}

	for _, position := range positions {
		var existing models.CommitteePosition
		if err := uc.db.Where("code = ?", position.Code).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := uc.db.Create(&position).Error; err != nil {
					uc.logger.Error().Err(err).Str("code", position.Code).Msg("Error creando cargo de comité")
					return err
				}
				uc.logger.Info().Str("code", position.Code).Str("name", position.Name).Msg("Cargo de comité creado")
			} else {
				return err
			}
		} else {
			uc.logger.Info().Str("code", position.Code).Msg("Cargo de comité ya existe")
		}
	}

	return nil
}

// createStaffTypes crea los tipos de empleados/staff genéricos y específicos para propiedades horizontales
func (uc *HorizontalPropertyMigrationUseCase) createStaffTypes() error {
	uc.logger.Info().Msg("Creando tipos de empleados...")

	// Obtener BusinessType de propiedad horizontal para tipos específicos
	var horizontalPropertyBT models.BusinessType
	if err := uc.db.Where("code = ?", "horizontal_property").First(&horizontalPropertyBT).Error; err != nil {
		uc.logger.Warn().Msg("BusinessType 'horizontal_property' no encontrado, creando tipos genéricos")
	}

	staffTypes := []models.StaffType{
		// Tipos genéricos (aplicables a cualquier negocio)
		{
			Name:            "Administrador",
			Code:            "administrator",
			Description:     "Administrador general responsable de la gestión operativa",
			BusinessTypeID:  nil, // Genérico
			IsRequired:      false,
			RequiresLicense: false,
			IsActive:        true,
		},
		{
			Name:            "Contador",
			Code:            "accountant",
			Description:     "Contador público encargado de la contabilidad y estados financieros",
			BusinessTypeID:  nil, // Genérico
			IsRequired:      false,
			RequiresLicense: true, // Requiere tarjeta profesional
			IsActive:        true,
		},
		{
			Name:            "Abogado",
			Code:            "lawyer",
			Description:     "Abogado asesor para temas legales y jurídicos",
			BusinessTypeID:  nil, // Genérico
			IsRequired:      false,
			RequiresLicense: true, // Requiere tarjeta profesional
			IsActive:        true,
		},
		{
			Name:            "Secretario(a)",
			Code:            "secretary",
			Description:     "Secretario(a) administrativo(a) para apoyo en gestión",
			BusinessTypeID:  nil, // Genérico
			IsRequired:      false,
			RequiresLicense: false,
			IsActive:        true,
		},
		// Tipos específicos para propiedades horizontales
		{
			Name:        "Revisor Fiscal",
			Code:        "fiscal_reviewer_hp",
			Description: "Revisor fiscal específico para propiedades horizontales",
			BusinessTypeID: func() *uint {
				if horizontalPropertyBT.ID != 0 {
					return &horizontalPropertyBT.ID
				} else {
					return nil
				}
			}(),
			IsRequired:      true, // Obligatorio por ley para propiedades horizontales
			RequiresLicense: true,
			IsActive:        true,
		},
		{
			Name:            "Portero/Vigilante",
			Code:            "security_guard",
			Description:     "Personal de seguridad y portería",
			BusinessTypeID:  nil, // Genérico (hoteles, oficinas, etc. también lo usan)
			IsRequired:      false,
			RequiresLicense: false,
			IsActive:        true,
		},
		{
			Name:            "Conserje",
			Code:            "janitor",
			Description:     "Personal de mantenimiento y aseo",
			BusinessTypeID:  nil, // Genérico
			IsRequired:      false,
			RequiresLicense: false,
			IsActive:        true,
		},
	}

	for _, staffType := range staffTypes {
		var existing models.StaffType
		if err := uc.db.Where("code = ?", staffType.Code).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := uc.db.Create(&staffType).Error; err != nil {
					uc.logger.Error().Err(err).Str("code", staffType.Code).Msg("Error creando tipo de empleado")
					return err
				}
				uc.logger.Info().Str("code", staffType.Code).Str("name", staffType.Name).Msg("Tipo de empleado creado")
			} else {
				return err
			}
		} else {
			uc.logger.Info().Str("code", staffType.Code).Msg("Tipo de empleado ya existe")
		}
	}

	return nil
}

// createVotingInitialData crea datos iniciales para el sistema de votaciones
func (uc *HorizontalPropertyMigrationUseCase) createVotingInitialData() error {
	uc.logger.Info().Msg("Inicializando sistema de votaciones...")

	// Por ahora solo loggeamos que el sistema está listo
	// Los grupos de votación y votaciones se crearán dinámicamente por los administradores
	uc.logger.Info().Msg("✅ Sistema de votaciones inicializado y listo para usar")

	return nil
}

package usecases

import (
	"dbpostgres/app/domain"
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"
)

// SystemUseCase maneja la lógica de negocio para la inicialización del sistema
type SystemUseCase struct {
	permissionRepo domain.PermissionRepository
	roleRepo       domain.RoleRepository
	userRepo       domain.UserRepository
	businessRepo   domain.BusinessRepository
	tableRepo      domain.TableRepository
	statusRepo     domain.ReservationStatusRepository
	logger         log.ILogger
}

// NewSystemUseCase crea una nueva instancia del caso de uso del sistema
func NewSystemUseCase(
	permissionRepo domain.PermissionRepository,
	roleRepo domain.RoleRepository,
	userRepo domain.UserRepository,
	businessRepo domain.BusinessRepository,
	tableRepo domain.TableRepository,
	statusRepo domain.ReservationStatusRepository,
	logger log.ILogger,
) *SystemUseCase {
	return &SystemUseCase{
		permissionRepo: permissionRepo,
		roleRepo:       roleRepo,
		userRepo:       userRepo,
		businessRepo:   businessRepo,
		tableRepo:      tableRepo,
		statusRepo:     statusRepo,
		logger:         logger,
	}
}

// InitializePermissions inicializa los permisos del sistema
func (uc *SystemUseCase) InitializePermissions(permissions []models.Permission) error {
	uc.logger.Info().Msg("Inicializando permisos del sistema...")

	// Verificar si todos los permisos ya existen
	allExist := true
	for _, permission := range permissions {
		exists, err := uc.permissionRepo.ExistsByCode(permission.Code)
		if err != nil {
			return err
		}
		if !exists {
			allExist = false
			break
		}
	}

	if allExist {
		uc.logger.Info().Int("permissions_count", len(permissions)).Msg("✅ Permisos del sistema ya existen, saltando migración de permisos")
		return nil
	}

	for _, permission := range permissions {
		exists, err := uc.permissionRepo.ExistsByCode(permission.Code)
		if err != nil {
			return err
		}

		if !exists {
			if err := uc.permissionRepo.Create(&permission); err != nil {
				return err
			}
		}
	}

	uc.logger.Info().Int("permissions_count", len(permissions)).Msg("✅ Permisos del sistema inicializados correctamente")
	return nil
}

// InitializeRoles inicializa los roles del sistema
func (uc *SystemUseCase) InitializeRoles(roles []models.Role) error {
	uc.logger.Info().Msg("Inicializando roles del sistema...")

	// Verificar si todos los roles ya existen
	allExist := true
	for _, role := range roles {
		exists, err := uc.roleRepo.ExistsByCode(role.Code)
		if err != nil {
			return err
		}
		if !exists {
			allExist = false
			break
		}
	}

	if allExist {
		uc.logger.Info().Int("roles_count", len(roles)).Msg("✅ Roles del sistema ya existen, saltando migración de roles")
		return nil
	}

	for _, role := range roles {
		exists, err := uc.roleRepo.ExistsByCode(role.Code)
		if err != nil {
			return err
		}

		if !exists {
			if err := uc.roleRepo.Create(&role); err != nil {
				return err
			}
		}
	}

	uc.logger.Info().Int("roles_count", len(roles)).Msg("✅ Roles del sistema inicializados correctamente")
	return nil
}

// InitializeUsers inicializa los usuarios del sistema
func (uc *SystemUseCase) InitializeUsers(users []models.User) error {
	uc.logger.Info().Msg("Inicializando usuarios del sistema...")

	for _, user := range users {
		exists, err := uc.userRepo.ExistsByEmail(user.Email)
		if err != nil {
			return err
		}

		if !exists {
			if err := uc.userRepo.Create(&user); err != nil {
				return err
			}
		}
	}

	uc.logger.Info().Int("users_count", len(users)).Msg("Usuarios del sistema inicializados correctamente")
	return nil
}

// InitializeBusinesses inicializa los negocios del sistema
func (uc *SystemUseCase) InitializeBusinesses(businesses []models.Business) error {
	uc.logger.Info().Msg("Inicializando negocios del sistema...")

	for _, business := range businesses {
		exists, err := uc.businessRepo.ExistsByCode(business.Code)
		if err != nil {
			return err
		}

		if !exists {
			if err := uc.businessRepo.Create(&business); err != nil {
				return err
			}
		}
	}

	uc.logger.Info().Int("businesses_count", len(businesses)).Msg("Negocios del sistema inicializados correctamente")
	return nil
}

// InitializeTables inicializa las mesas del sistema
func (uc *SystemUseCase) InitializeTables(tables []models.Table) error {
	uc.logger.Info().Msg("Inicializando mesas del sistema...")

	for _, table := range tables {
		exists, err := uc.tableRepo.ExistsByBusinessAndNumber(table.BusinessID, table.Number)
		if err != nil {
			return err
		}

		if !exists {
			if err := uc.tableRepo.Create(&table); err != nil {
				return err
			}
		}
	}

	uc.logger.Info().Int("tables_count", len(tables)).Msg("Mesas del sistema inicializadas correctamente")
	return nil
}

// InitializeReservationStatuses inicializa los estados de reserva del sistema
func (uc *SystemUseCase) InitializeReservationStatuses(statuses []models.ReservationStatus) error {
	uc.logger.Info().Msg("Inicializando estados de reserva del sistema...")

	// Verificar si todos los estados ya existen
	allExist := true
	for _, status := range statuses {
		exists, err := uc.statusRepo.ExistsByCode(status.Code)
		if err != nil {
			return err
		}
		if !exists {
			allExist = false
			break
		}
	}

	if allExist {
		uc.logger.Info().Int("statuses_count", len(statuses)).Msg("✅ Estados de reserva ya existen, saltando migración de estados de reserva")
		return nil
	}

	for _, status := range statuses {
		exists, err := uc.statusRepo.ExistsByCode(status.Code)
		if err != nil {
			return err
		}

		if !exists {
			if err := uc.statusRepo.Create(&status); err != nil {
				return err
			}
		}
	}

	uc.logger.Info().Int("statuses_count", len(statuses)).Msg("✅ Estados de reserva inicializados correctamente")
	return nil
}

// AssignPermissionsToRole asigna permisos a un rol
func (uc *SystemUseCase) AssignPermissionsToRole(roleCode string, permissionCodes []string) error {
	uc.logger.Info().Str("role_code", roleCode).Msg("Asignando permisos a rol...")

	// Obtener el rol
	role, err := uc.roleRepo.GetByCode(roleCode)
	if err != nil {
		return err
	}

	// Obtener los IDs de los permisos
	var permissionIDs []uint
	for _, permissionCode := range permissionCodes {
		permission, err := uc.permissionRepo.GetByCode(permissionCode)
		if err != nil {
			return err
		}
		permissionIDs = append(permissionIDs, permission.ID)
	}

	// Asignar permisos al rol
	if err := uc.roleRepo.AssignPermissions(role.ID, permissionIDs); err != nil {
		return err
	}

	uc.logger.Info().Str("role_code", roleCode).Int("permissions_count", len(permissionCodes)).Msg("✅ Permisos asignados al rol correctamente")
	return nil
}

// AssignRolesToUser asigna roles a un usuario
func (uc *SystemUseCase) AssignRolesToUser(userEmail string, roleCodes []string) error {
	uc.logger.Info().Str("user_email", userEmail).Msg("Asignando roles a usuario...")

	// Obtener el usuario
	user, err := uc.userRepo.GetByEmail(userEmail)
	if err != nil {
		return err
	}

	// Obtener los IDs de los roles
	var roleIDs []uint
	for _, roleCode := range roleCodes {
		role, err := uc.roleRepo.GetByCode(roleCode)
		if err != nil {
			return err
		}
		roleIDs = append(roleIDs, role.ID)
	}

	// Asignar roles al usuario
	if err := uc.userRepo.AssignRoles(user.ID, roleIDs); err != nil {
		return err
	}

	uc.logger.Info().Str("user_email", userEmail).Int("roles_count", len(roleCodes)).Msg("✅ Roles asignados al usuario correctamente")
	return nil
}

// UserExists verifica si existe al menos un usuario en el sistema
func (uc *SystemUseCase) UserExists() (bool, error) {
	return uc.userRepo.UserExists()
}

// CreateUser crea un nuevo usuario
func (uc *SystemUseCase) CreateUser(user *models.User) error {
	return uc.userRepo.Create(user)
}

// ExistsUserByEmail verifica si existe un usuario con el email especificado
func (uc *SystemUseCase) ExistsUserByEmail(email string) (bool, error) {
	return uc.userRepo.ExistsByEmail(email)
}

// GetRoleByCode obtiene un rol por su código
func (uc *SystemUseCase) GetRoleByCode(code string) (*models.Role, error) {
	return uc.roleRepo.GetByCode(code)
}

// GetPermissionByCode obtiene un permiso por su código
func (uc *SystemUseCase) GetPermissionByCode(code string) (*models.Permission, error) {
	return uc.permissionRepo.GetByCode(code)
}

// GetAllReservationStatuses obtiene todos los estados de reserva
func (uc *SystemUseCase) GetAllReservationStatuses() ([]models.ReservationStatus, error) {
	return uc.statusRepo.GetAll()
}

// ExistsBusinessByCode verifica si existe un negocio con el código especificado
func (uc *SystemUseCase) ExistsBusinessByCode(code string) (bool, error) {
	return uc.businessRepo.ExistsByCode(code)
}

// CreateBusiness crea un nuevo negocio
func (uc *SystemUseCase) CreateBusiness(business *models.Business) error {
	return uc.businessRepo.Create(business)
}

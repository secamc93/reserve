package usecases

import (
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/env"
	"dbpostgres/pkg/log"
	"fmt"
)

// SuperAdminMigrationUseCase maneja la migración e inicialización del usuario administrador súper
type SuperAdminMigrationUseCase struct {
	systemUseCase *SystemUseCase
	logger        log.ILogger
	config        env.IConfig
}

// NewSuperAdminMigrationUseCase crea una nueva instancia del caso de uso de migración del usuario administrador súper
func NewSuperAdminMigrationUseCase(systemUseCase *SystemUseCase, logger log.ILogger, config env.IConfig) *SuperAdminMigrationUseCase {
	return &SuperAdminMigrationUseCase{
		systemUseCase: systemUseCase,
		logger:        logger,
		config:        config,
	}
}

// Execute ejecuta la migración del usuario administrador súper
func (uc *SuperAdminMigrationUseCase) Execute() error {
	uc.logger.Info().Msg("Inicializando usuario administrador súper...")

	// 1. Verificar que el rol requerido existe
	uc.logger.Debug().Msg("Verificando dependencias: rol 'super_admin'")

	superAdminRole, err := uc.systemUseCase.GetRoleByCode("super_admin")
	if err != nil {
		uc.logger.Error().Err(err).Str("role_code", "super_admin").Msg("❌ Error al verificar rol 'super_admin'")
		return err
	}
	if superAdminRole == nil {
		uc.logger.Error().Str("role_code", "super_admin").Msg("❌ Rol 'super_admin' no encontrado. Asegúrate de ejecutar la migración de roles primero")
		return fmt.Errorf("rol 'super_admin' no encontrado")
	}
	uc.logger.Debug().Str("role_code", "super_admin").Uint("role_id", superAdminRole.ID).Msg("✅ Rol 'super_admin' encontrado")

	// 2. Verificar si ya existe un usuario administrador
	uc.logger.Debug().Msg("Verificando si ya existe un usuario administrador...")
	exists, err := uc.systemUseCase.UserExists()
	if err != nil {
		uc.logger.Error().Err(err).Msg("❌ Error al verificar usuario existente")
		return err
	}

	if exists {
		uc.logger.Info().Msg("✅ Usuario administrador ya existe, saltando creación")
		return nil
	}

	// 3. Crear el usuario administrador súper
	uc.logger.Info().Str("email", uc.config.Get("SUPER_ADMIN_EMAIL")).Msg("Creando usuario administrador súper...")

	superAdmin := models.User{
		Name:     "Super Administrador",
		Email:    uc.config.Get("EMAIL_USER_DEFAULT"),
		Password: uc.config.Get("USER_PASS_DEFAULT"),
		IsActive: true,
	}

	if err := uc.systemUseCase.CreateUser(&superAdmin); err != nil {
		uc.logger.Error().Err(err).Str("email", superAdmin.Email).Msg("❌ Error al crear usuario administrador")
		return err
	}
	uc.logger.Debug().Str("email", superAdmin.Email).Uint("user_id", superAdmin.ID).Msg("✅ Usuario administrador creado")

	// 4. Asignar rol de super admin al usuario
	uc.logger.Info().Str("email", superAdmin.Email).Str("role_code", "super_admin").Msg("Asignando rol de super admin...")
	if err := uc.systemUseCase.AssignRolesToUser(superAdmin.Email, []string{"super_admin"}); err != nil {
		uc.logger.Error().Err(err).Str("email", superAdmin.Email).Str("role_code", "super_admin").Msg("❌ Error al asignar rol de super admin")
		return err
	}

	uc.logger.Info().Str("email", superAdmin.Email).Uint("user_id", superAdmin.ID).Uint("role_id", superAdminRole.ID).Msg("✅ Usuario administrador súper creado correctamente")
	return nil
}

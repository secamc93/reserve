package repository

import (
	"dbpostgres/app/domain"
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// userRepository implementa domain.UserRepository
type userRepository struct {
	db     *gorm.DB
	logger log.ILogger
}

// NewUserRepository crea una nueva instancia del repositorio de usuarios
func NewUserRepository(db *gorm.DB, logger log.ILogger) domain.UserRepository {
	return &userRepository{
		db:     db,
		logger: logger,
	}
}

// Create crea un nuevo usuario
func (r *userRepository) Create(user *models.User) error {
	// Cifrar la contraseña antes de guardar
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		r.logger.Error().Err(err).Str("email", user.Email).Msg("Error al cifrar contraseña")
		return err
	}

	// Reemplazar la contraseña en texto plano con la cifrada
	user.Password = string(hashedPassword)

	if err := r.db.Create(user).Error; err != nil {
		r.logger.Error().Err(err).Str("email", user.Email).Msg("Error al crear usuario")
		return err
	}

	r.logger.Info().Str("email", user.Email).Uint("user_id", user.ID).Msg("Usuario creado exitosamente con contraseña cifrada")
	return nil
}

// GetByEmail obtiene un usuario por su email
func (r *userRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		r.logger.Error().Err(err).Str("email", email).Msg("Error al obtener usuario por email")
		return nil, err
	}
	return &user, nil
}

// GetByID obtiene un usuario por su ID
func (r *userRepository) GetByID(id uint) (*models.User, error) {
	var user models.User
	if err := r.db.First(&user, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error al obtener usuario por ID")
		return nil, err
	}
	return &user, nil
}

// ExistsByEmail verifica si existe un usuario con el email especificado
func (r *userRepository) ExistsByEmail(email string) (bool, error) {
	var count int64
	if err := r.db.Model(&models.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Str("email", email).Msg("Error al verificar existencia de usuario por email")
		return false, err
	}
	return count > 0, nil
}

// AssignRoles asigna roles a un usuario
func (r *userRepository) AssignRoles(userID uint, roleIDs []uint) error {
	// Si no hay roles para asignar, no hacemos nada
	if len(roleIDs) == 0 {
		r.logger.Info().Uint("user_id", userID).Int("roles_count", 0).Msg("No se asignaron roles al usuario (lista vacía)")
		return nil
	}

	// Preparamos los valores para el batch insert
	var userRoles []map[string]interface{}
	for _, roleID := range roleIDs {
		userRoles = append(userRoles, map[string]interface{}{
			"user_id": userID,
			"role_id": roleID,
		})
	}

	// Insertamos los nuevos roles en la tabla user_roles usando GORM ORM y Table
	if err := r.db.Table("user_roles").Create(&userRoles).Error; err != nil {
		r.logger.Error().Err(err).Uint("user_id", userID).Msg("Error al asignar nuevos roles al usuario")
		return err
	}

	r.logger.Info().Uint("user_id", userID).Int("roles_count", len(roleIDs)).Msg("Roles asignados al usuario correctamente")
	return nil
}

// UserExists verifica si existe al menos un usuario en el sistema
func (r *userRepository) UserExists() (bool, error) {
	var count int64
	if err := r.db.Model(&models.User{}).Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al verificar existencia de usuarios")
		return false, err
	}
	return count > 0, nil
}

// ValidatePassword verifica si una contraseña coincide con el hash almacenado
func (r *userRepository) ValidatePassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

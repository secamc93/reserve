package middleware

import (
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// LogsAuthMiddleware es un middleware específico para el endpoint de logs
// Acepta tokens principales (main) o business tokens, pero solo para super admins
func LogsAuthMiddleware(jwtService IJWTService, authUseCase IAuthService, logger log.ILogger) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			logger.Error().Msg("Token de autorización requerido")
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token de autorización requerido",
			})
			c.Abort()
			return
		}

		// Remover el prefijo "Bearer " si existe
		if len(token) > 7 && strings.HasPrefix(token, "Bearer ") {
			token = token[7:]
		}

		var userID uint
		var isSuperAdmin bool

		// Intentar validar como business token primero
		businessClaims, err := jwtService.ValidateBusinessToken(token)
		if err == nil && businessClaims.TokenType == "business" {
			// Es un business token, verificar si es super admin (business_id = 0)
			userID = businessClaims.UserID
			isSuperAdmin = businessClaims.BusinessID == 0

			if isSuperAdmin {
				logger.Debug().
					Uint("user_id", userID).
					Msg("Business token de SUPER ADMIN validado para logs")
			} else {
				logger.Warn().
					Uint("user_id", userID).
					Uint("business_id", businessClaims.BusinessID).
					Msg("Business token de usuario normal rechazado para logs")
				c.JSON(http.StatusForbidden, gin.H{
					"error": "Solo super administradores pueden ver logs",
				})
				c.Abort()
				return
			}

			// Guardar información en el contexto
			c.Set("user_id", userID)
			c.Set("business_id", businessClaims.BusinessID)
			c.Set("is_super_admin", true)
			c.Set("business_token_claims", businessClaims)
		} else {
			// Intentar validar como token principal
			mainClaims, err2 := jwtService.ValidateToken(token)
			if err2 != nil {
				logger.Error().Err(err2).Msg("Token inválido")
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "Token inválido",
				})
				c.Abort()
				return
			}

			// Verificar que sea token principal
			if mainClaims.TokenType != "main" {
				logger.Error().
					Str("token_type", mainClaims.TokenType).
					Msg("Token type inválido para logs")
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": fmt.Sprintf("Token type inválido: %s", mainClaims.TokenType),
				})
				c.Abort()
				return
			}

			userID = mainClaims.UserID

			// Verificar si el usuario es super admin consultando sus roles
			var roles []Role
			var err error

			if authUseCase != nil {
				// Usar authUseCase si está disponible
				roles, err = authUseCase.GetUserRoles(c.Request.Context(), userID)
			} else {
				// Consultar directamente la base de datos
				roles, err = getUserRolesFromDB(c.Request.Context(), userID, logger)
			}

			if err != nil {
				logger.Error().Err(err).Uint("user_id", userID).Msg("Error al obtener roles del usuario")
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Error al verificar permisos",
				})
				c.Abort()
				return
			}

			// Verificar si tiene rol con scope platform
			for _, role := range roles {
				if role.ScopeCode == "platform" || role.ScopeID == 1 {
					isSuperAdmin = true
					logger.Debug().
						Uint("user_id", userID).
						Uint("role_id", role.ID).
						Str("scope_code", role.ScopeCode).
						Msg("Usuario identificado como SUPER ADMIN desde token principal")
					break
				}
			}

			if !isSuperAdmin {
				logger.Warn().
					Uint("user_id", userID).
					Msg("Usuario no es super admin, acceso denegado a logs")
				c.JSON(http.StatusForbidden, gin.H{
					"error": "Solo super administradores pueden ver logs",
				})
				c.Abort()
				return
			}

			// Guardar información en el contexto
			c.Set("user_id", userID)
			c.Set("business_id", uint(0)) // Super admin sin business específico
			c.Set("is_super_admin", true)
			c.Set("jwt_claims", mainClaims)
		}

		// Agregar información al logger para trazabilidad
		logger.Debug().
			Uint("user_id", userID).
			Bool("is_super_admin", isSuperAdmin).
			Msg("Usuario autenticado para logs")

		c.Next()
	}
}

// getUserRolesFromDB consulta directamente la base de datos para obtener los roles del usuario
func getUserRolesFromDB(ctx context.Context, userID uint, logger log.ILogger) ([]Role, error) {
	// Crear instancia de base de datos temporal
	envConfig := env.New(logger)
	database := db.New(logger, envConfig)
	defer database.Close()

	var userRoles []models.BusinessStaff
	var roles []Role

	err := database.Conn(ctx).
		Model(&models.BusinessStaff{}).
		Preload("Role.Scope").
		Where("user_id = ?", userID).
		Find(&userRoles).Error

	if err != nil {
		logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener roles del usuario desde DB")
		return nil, err
	}

	for _, staff := range userRoles {
		// Verificar que el Role tenga un ID válido (fue cargado con Preload)
		// RoleID es un puntero, pero Role es un campo directo
		if staff.RoleID != nil && *staff.RoleID > 0 && staff.Role.ID > 0 {
			roles = append(roles, Role{
				ID:          staff.Role.ID,
				Name:        staff.Role.Name,
				Description: staff.Role.Description,
				Level:       staff.Role.Level,
				IsSystem:    staff.Role.IsSystem,
				ScopeID:     staff.Role.ScopeID,
				ScopeName:   staff.Role.Scope.Name,
				ScopeCode:   staff.Role.Scope.Code,
			})
		}
	}

	return roles, nil
}

// LogsAuth retorna el middleware de autenticación para logs usando la configuración global
func LogsAuth() gin.HandlerFunc {
	ensureInitialized()
	return LogsAuthMiddleware(defaultJWTService, defaultAuthUseCase, defaultLogger)
}

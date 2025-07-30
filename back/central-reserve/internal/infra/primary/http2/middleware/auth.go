package middleware

import (
	"central_reserve/internal/app/usecaseauth"
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/pkg/jwt"
	"central_reserve/internal/pkg/log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthType representa el tipo de autenticación
type AuthType string

const (
	AuthTypeJWT     AuthType = "jwt"
	AuthTypeAPIKey  AuthType = "api_key"
	AuthTypeUnknown AuthType = "unknown"
)

// AuthInfo contiene la información de autenticación
type AuthInfo struct {
	Type       AuthType
	UserID     uint
	Email      string
	Roles      []string
	BusinessID uint
	APIKey     string
	JWTClaims  *jwt.Claims
}

// AuthMiddleware crea un middleware de autenticación JWT (mantiene compatibilidad)
func AuthMiddleware(jwtService *jwt.JWTService, logger log.ILogger) gin.HandlerFunc {
	return func(c *gin.Context) {
		authInfo, err := validateJWT(c, jwtService)
		if err != nil {
			logger.Error().Err(err).Msg("Token inválido")
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": err.Error(),
			})
			c.Abort()
			return
		}

		// Almacenar la información de autenticación en el contexto
		c.Set("auth_info", authInfo)
		c.Set("auth_type", authInfo.Type)
		c.Set("user_id", authInfo.UserID)
		c.Set("user_email", authInfo.Email)
		c.Set("user_roles", authInfo.Roles)
		c.Set("jwt_claims", authInfo.JWTClaims)

		// Agregar información al logger para trazabilidad
		logger.Debug().
			Str("auth_type", string(authInfo.Type)).
			Uint("user_id", authInfo.UserID).
			Str("user_email", authInfo.Email).
			Strs("user_roles", authInfo.Roles).
			Msg("Usuario autenticado con JWT")

		c.Next()
	}
}

func APIKeyMiddleware(authUseCase usecaseauth.IAuthUseCase, logger log.ILogger) gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := extractAPIKey(c)
		if apiKey == "" {
			logger.Error().Msg("API Key requerida")
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "API Key requerida",
			})
			c.Abort()
			return
		}

		request := dtos.ValidateAPIKeyRequest{
			APIKey: apiKey,
		}

		response, err := authUseCase.ValidateAPIKey(c.Request.Context(), request)
		if err != nil {
			logger.Error().Err(err).Msg("Error al validar API Key")
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": err.Error(),
			})
			c.Abort()
			return
		}

		if !response.Success {
			logger.Error().Str("message", response.Message).Msg("API Key inválida")
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": response.Message,
			})
			c.Abort()
			return
		}

		authInfo := &AuthInfo{
			Type:       AuthTypeAPIKey,
			UserID:     response.UserID,
			Email:      response.Email,
			Roles:      response.Roles,
			BusinessID: response.BusinessID,
			APIKey:     apiKey,
		}

		c.Set("auth_info", authInfo)
		c.Set("auth_type", authInfo.Type)
		c.Set("user_id", authInfo.UserID)
		c.Set("user_email", authInfo.Email)
		c.Set("user_roles", authInfo.Roles)
		c.Set("jwt_claims", nil)

		logger.Debug().
			Str("auth_type", string(authInfo.Type)).
			Uint("user_id", authInfo.UserID).
			Str("user_email", authInfo.Email).
			Strs("user_roles", authInfo.Roles).
			Msg("Usuario autenticado con API Key")

		c.Next()
	}
}

func AutoAuthMiddleware(jwtService *jwt.JWTService, authUseCase usecaseauth.IAuthUseCase, logger log.ILogger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Detectar si tiene Authorization header (JWT)
		authHeader := c.GetHeader("Authorization")

		// Detectar si tiene API Key header o query
		apiKey := extractAPIKey(c)

		if authHeader != "" {
			// Usar JWT middleware
			authMiddleware := AuthMiddleware(jwtService, logger)
			authMiddleware(c)
		} else if apiKey != "" {
			// Usar API Key middleware
			apiKeyMiddleware := APIKeyMiddleware(authUseCase, logger)
			apiKeyMiddleware(c)
		} else {
			logger.Error().Msg("No se encontró método de autenticación")
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Se requiere autenticación (JWT o API Key)",
			})
			c.Abort()
			return
		}
	}
}

// validateJWT valida la autenticación por JWT
func validateJWT(c *gin.Context, jwtService *jwt.JWTService) (*AuthInfo, error) {
	token := c.GetHeader("Authorization")
	if token == "" {
		return nil, &AuthError{Message: "Token de autorización requerido"}
	}

	// Remover el prefijo "Bearer " si existe
	if len(token) > 7 && strings.HasPrefix(token, "Bearer ") {
		token = token[7:]
	}

	// Validar y decodificar el token
	claims, err := jwtService.ValidateToken(token)
	if err != nil {
		return nil, &AuthError{Message: "Token JWT inválido"}
	}

	return &AuthInfo{
		Type:      AuthTypeJWT,
		UserID:    claims.UserID,
		Email:     claims.Email,
		Roles:     claims.Roles,
		JWTClaims: claims,
	}, nil
}

func extractAPIKey(c *gin.Context) string {
	apiKey := c.GetHeader("X-API-Key")
	if apiKey == "" {
		apiKey = c.Query("api_key")
	}
	return apiKey
}

// AuthError representa un error de autenticación
type AuthError struct {
	Message string
}

func (e *AuthError) Error() string {
	return e.Message
}

// GetAuthInfo obtiene la información de autenticación desde el contexto
func GetAuthInfo(c *gin.Context) (*AuthInfo, bool) {
	authInfo, exists := c.Get("auth_info")
	if !exists {
		return nil, false
	}
	if a, ok := authInfo.(*AuthInfo); ok {
		return a, true
	}
	return nil, false
}

// GetAuthType obtiene el tipo de autenticación desde el contexto
func GetAuthType(c *gin.Context) (AuthType, bool) {
	authType, exists := c.Get("auth_type")
	if !exists {
		return AuthTypeUnknown, false
	}
	if a, ok := authType.(AuthType); ok {
		return a, true
	}
	return AuthTypeUnknown, false
}

// GetAPIKey obtiene la API Key desde el contexto
func GetAPIKey(c *gin.Context) (string, bool) {
	authInfo, exists := GetAuthInfo(c)
	if !exists || authInfo.Type != AuthTypeAPIKey {
		return "", false
	}
	return authInfo.APIKey, true
}

// GetUserID obtiene el ID del usuario desde el contexto de Gin
func GetUserID(c *gin.Context) (uint, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}
	if id, ok := userID.(uint); ok {
		return id, true
	}
	return 0, false
}

// GetUserEmail obtiene el email del usuario desde el contexto de Gin
func GetUserEmail(c *gin.Context) (string, bool) {
	email, exists := c.Get("user_email")
	if !exists {
		return "", false
	}
	if e, ok := email.(string); ok {
		return e, true
	}
	return "", false
}

// GetUserRoles obtiene los roles del usuario desde el contexto de Gin
func GetUserRoles(c *gin.Context) ([]string, bool) {
	roles, exists := c.Get("user_roles")
	if !exists {
		return nil, false
	}
	if r, ok := roles.([]string); ok {
		return r, true
	}
	return nil, false
}

// GetJWTClaims obtiene los claims completos del JWT desde el contexto de Gin
func GetJWTClaims(c *gin.Context) (*jwt.Claims, bool) {
	claims, exists := c.Get("jwt_claims")
	if !exists {
		return nil, false
	}
	if c, ok := claims.(*jwt.Claims); ok {
		return c, true
	}
	return nil, false
}

// GetBusinessID obtiene el BusinessID desde el contexto de Gin
func GetBusinessID(c *gin.Context) (uint, bool) {
	authInfo, exists := GetAuthInfo(c)
	if !exists {
		return 0, false
	}
	return authInfo.BusinessID, true
}

// RequireRole crea un middleware que requiere un rol específico
func RequireRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roles, exists := GetUserRoles(c)
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Acceso denegado: roles no disponibles",
			})
			c.Abort()
			return
		}

		// Verificar si el usuario tiene el rol requerido
		hasRole := false
		for _, role := range roles {
			if role == requiredRole {
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Acceso denegado: rol requerido",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAnyRole crea un middleware que requiere al menos uno de los roles especificados
func RequireAnyRole(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roles, exists := GetUserRoles(c)
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Acceso denegado: roles no disponibles",
			})
			c.Abort()
			return
		}

		// Verificar si el usuario tiene al menos uno de los roles requeridos
		hasRole := false
		for _, userRole := range roles {
			for _, requiredRole := range requiredRoles {
				if userRole == requiredRole {
					hasRole = true
					break
				}
			}
			if hasRole {
				break
			}
		}

		if !hasRole {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Acceso denegado: rol requerido",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAuthType crea un middleware que requiere un tipo específico de autenticación
func RequireAuthType(authType AuthType) gin.HandlerFunc {
	return func(c *gin.Context) {
		currentAuthType, exists := GetAuthType(c)
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Acceso denegado: tipo de autenticación no disponible",
			})
			c.Abort()
			return
		}

		if currentAuthType != authType {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Acceso denegado: tipo de autenticación requerido",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireJWT crea un middleware que requiere autenticación JWT específicamente
func RequireJWT() gin.HandlerFunc {
	return RequireAuthType(AuthTypeJWT)
}

// RequireAPIKey crea un middleware que requiere autenticación por API Key específicamente
func RequireAPIKey() gin.HandlerFunc {
	return RequireAuthType(AuthTypeAPIKey)
}

// AuthBuilder permite especificar el tipo de autenticación de forma fluida
type AuthBuilder struct {
	jwtService  *jwt.JWTService
	authUseCase usecaseauth.IAuthUseCase
	logger      log.ILogger
}

// NewAuthBuilder crea un nuevo builder de autenticación
func NewAuthBuilder(jwtService *jwt.JWTService, authUseCase usecaseauth.IAuthUseCase, logger log.ILogger) *AuthBuilder {
	return &AuthBuilder{
		jwtService:  jwtService,
		authUseCase: authUseCase,
		logger:      logger,
	}
}

// JWT especifica que solo se debe usar autenticación JWT
func (ab *AuthBuilder) JWT() gin.HandlerFunc {
	return AuthMiddleware(ab.jwtService, ab.logger)
}

// APIKey especifica que solo se debe usar autenticación por API Key
func (ab *AuthBuilder) APIKey() gin.HandlerFunc {
	return APIKeyMiddleware(ab.authUseCase, ab.logger)
}

// Auto permite ambos tipos de autenticación (detección automática)
func (ab *AuthBuilder) Auto() gin.HandlerFunc {
	return AutoAuthMiddleware(ab.jwtService, ab.authUseCase, ab.logger)
}

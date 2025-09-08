package middleware

import (
	"central_reserve/services/auth/internal/app/usecaseauth"
	"central_reserve/services/auth/internal/domain"
	"central_reserve/shared/log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type AuthType string

const (
	AuthTypeUnknown AuthType = "unknown"
	AuthTypeJWT     AuthType = "jwt"
	AuthTypeAPIKey  AuthType = "api_key"
)

type AuthInfo struct {
	Type       AuthType
	UserID     uint
	Email      string
	Roles      []string
	BusinessID uint
	APIKey     string
	JWTClaims  *domain.JWTClaims
}

func AuthMiddleware(jwtService domain.IJWTService, logger log.ILogger) gin.HandlerFunc {
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
		c.Set("business_id", authInfo.BusinessID)
		c.Set("jwt_claims", authInfo.JWTClaims)

		// Log adicional para verificar que se guardó correctamente
		logger.Debug().
			Uint("business_id_stored", authInfo.BusinessID).
			Msg("BusinessID guardado en contexto")

		// Verificar que se guardó correctamente en el contexto
		if storedBusinessID, exists := c.Get("business_id"); exists {
			if businessID, ok := storedBusinessID.(uint); ok {
				logger.Debug().
					Uint("business_id_verified", businessID).
					Msg("BusinessID verificado en contexto")
			} else {
				logger.Error().
					Interface("stored_business_id", storedBusinessID).
					Msg("BusinessID no es del tipo correcto en contexto")
			}
		} else {
			logger.Error().Msg("BusinessID no encontrado en contexto después de guardarlo")
		}

		// Agregar información al logger para trazabilidad
		logger.Debug().
			Str("auth_type", string(authInfo.Type)).
			Uint("user_id", authInfo.UserID).
			Str("user_email", authInfo.Email).
			Strs("user_roles", authInfo.Roles).
			Uint("business_id", authInfo.BusinessID).
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

		request := domain.ValidateAPIKeyRequest{
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
		c.Set("business_id", authInfo.BusinessID)
		c.Set("jwt_claims", nil)

		logger.Debug().
			Str("auth_type", string(authInfo.Type)).
			Uint("user_id", authInfo.UserID).
			Str("user_email", authInfo.Email).
			Strs("user_roles", authInfo.Roles).
			Uint("business_id", authInfo.BusinessID).
			Msg("Usuario autenticado con API Key")

		c.Next()
	}
}

func AutoAuthMiddleware(jwtService domain.IJWTService, authUseCase usecaseauth.IAuthUseCase, logger log.ILogger) gin.HandlerFunc {
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
func validateJWT(c *gin.Context, jwtService domain.IJWTService) (*AuthInfo, error) {
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

	// Log para debuggear los claims
	logger := log.New()
	logger.Debug().
		Uint("claims_user_id", claims.UserID).
		Str("claims_email", claims.Email).
		Strs("claims_roles", claims.Roles).
		Uint("claims_business_id", claims.BusinessID).
		Msg("Claims extraídos del JWT")

	authInfo := &AuthInfo{
		Type:       AuthTypeJWT,
		UserID:     claims.UserID,
		Email:      claims.Email,
		Roles:      claims.Roles,
		BusinessID: claims.BusinessID,
		JWTClaims:  claims,
	}

	// Log para debuggear el AuthInfo creado
	logger.Debug().
		Uint("auth_info_business_id", authInfo.BusinessID).
		Msg("AuthInfo creado con BusinessID")

	return authInfo, nil
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
func GetJWTClaims(c *gin.Context) (*domain.JWTClaims, bool) {
	claims, exists := c.Get("jwt_claims")
	if !exists {
		return nil, false
	}
	if c, ok := claims.(*domain.JWTClaims); ok {
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

// GetBusinessIDFromContext obtiene el BusinessID directamente del contexto
func GetBusinessIDFromContext(c *gin.Context) (uint, bool) {
	businessID, exists := c.Get("business_id")
	if !exists {
		return 0, false
	}
	if id, ok := businessID.(uint); ok {
		return id, true
	}
	return 0, false
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
	jwtService  domain.IJWTService
	authUseCase usecaseauth.IAuthUseCase
	logger      log.ILogger
}

// NewAuthBuilder crea un nuevo builder de autenticación
func NewAuthBuilder(jwtService domain.IJWTService, authUseCase usecaseauth.IAuthUseCase, logger log.ILogger) *AuthBuilder {
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

// Configuración global para simplificar el uso desde otros servicios
var (
	defaultJWTService  domain.IJWTService
	defaultAuthUseCase usecaseauth.IAuthUseCase
	defaultLogger      log.ILogger
	initialized        bool
)

// Configure inicializa el middleware con las dependencias necesarias
func Configure(jwtService domain.IJWTService, authUseCase usecaseauth.IAuthUseCase, logger log.ILogger) {
	defaultJWTService = jwtService
	defaultAuthUseCase = authUseCase
	defaultLogger = logger
	initialized = true
}

func ensureInitialized() {
	if !initialized {
		panic("auth middleware not configured: call middleware.Configure(...) during service bootstrap")
	}
}

// JWT retorna el middleware de autenticación JWT usando la configuración global
func JWT() gin.HandlerFunc {
	ensureInitialized()
	return AuthMiddleware(defaultJWTService, defaultLogger)
}

// APIKey retorna el middleware de autenticación por API Key usando la configuración global
func APIKey() gin.HandlerFunc {
	ensureInitialized()
	return APIKeyMiddleware(defaultAuthUseCase, defaultLogger)
}

// Auto retorna el middleware que detecta JWT o API Key usando la configuración global
func Auto() gin.HandlerFunc {
	ensureInitialized()
	return AutoAuthMiddleware(defaultJWTService, defaultAuthUseCase, defaultLogger)
}

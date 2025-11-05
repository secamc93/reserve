package middleware

import (
	"central_reserve/services/auth/internal/app/usecaseauth"
	"central_reserve/services/auth/internal/domain"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"fmt"
	"net/http"
	"strings"

	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// Adaptador: shared/jwt -> domain.IJWTService
// Permite inicializar JWT en este paquete sin acoplar dominio
type jwtAdapter struct {
	impl sharedjwt.IJWTService
}

func (a jwtAdapter) GenerateToken(userID uint) (string, error) {
	return a.impl.GenerateToken(userID)
}

func (a jwtAdapter) ValidateToken(tokenString string) (*domain.JWTClaims, error) {
	claims, err := a.impl.ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}
	return &domain.JWTClaims{
		UserID:    claims.UserID,
		TokenType: claims.TokenType,
	}, nil
}

func (a jwtAdapter) RefreshToken(tokenString string) (string, error) {
	return a.impl.RefreshToken(tokenString)
}

func (a jwtAdapter) GenerateBusinessToken(userID, businessID, businessTypeID, roleID uint) (string, error) {
	return a.impl.GenerateBusinessToken(userID, businessID, businessTypeID, roleID)
}

func (a jwtAdapter) ValidateBusinessToken(tokenString string) (*domain.BusinessTokenClaims, error) {
	claims, err := a.impl.ValidateBusinessToken(tokenString)
	if err != nil {
		return nil, err
	}
	return &domain.BusinessTokenClaims{
		UserID:         claims.UserID,
		BusinessID:     claims.BusinessID,
		BusinessTypeID: claims.BusinessTypeID,
		RoleID:         claims.RoleID,
		TokenType:      claims.TokenType,
	}, nil
}

// InitFromEnv inicializa el JWT y configura el middleware global
func InitFromEnv(cfg env.IConfig, logger log.ILogger) {
	if logger == nil {
		logger = log.New()
	}
	if cfg == nil {
		cfg = env.New(logger)
	}
	secret := cfg.Get("JWT_SECRET")
	shared := sharedjwt.New(secret)
	Configure(jwtAdapter{impl: shared}, nil, logger)
}

// GetJWTService retorna el servicio JWT configurado globalmente
func GetJWTService() domain.IJWTService {
	ensureInitialized()
	return defaultJWTService
}

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
		c.Set("jwt_claims", authInfo.JWTClaims)

		// Agregar información al logger para trazabilidad
		logger.Debug().
			Str("auth_type", string(authInfo.Type)).
			Uint("user_id", authInfo.UserID).
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
			AuthMiddleware(jwtService, logger)(c)
			if c.IsAborted() {
				return
			}
			c.Next()
			return
		}
		if apiKey != "" {
			APIKeyMiddleware(authUseCase, logger)(c)
			if c.IsAborted() {
				return
			}
			c.Next()
			return
		}

		logger.Error().Msg("No se encontró método de autenticación")
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Se requiere autenticación (JWT o API Key)",
		})
		c.Abort()
	}
}

// validateJWT valida la autenticación por JWT
// Solo acepta business tokens (con business_id, business_type_id, role_id)
// Rechaza tokens principales (solo con user_id)
func validateJWT(c *gin.Context, jwtService domain.IJWTService) (*AuthInfo, error) {
	token := c.GetHeader("Authorization")
	if token == "" {
		return nil, &AuthError{Message: "Token de autorización requerido"}
	}

	// Remover el prefijo "Bearer " si existe
	if len(token) > 7 && strings.HasPrefix(token, "Bearer ") {
		token = token[7:]
	}

	// Intentar validar como business token primero
	businessClaims, err := jwtService.ValidateBusinessToken(token)
	if err == nil {
		// Verificar que sea business token
		if businessClaims.TokenType != "business" {
			return nil, &AuthError{Message: fmt.Sprintf("Token type inválido: %s, se requiere 'business'", businessClaims.TokenType)}
		}
	} else {
		// Si no es business token, intentar validar como token principal para dar mejor error
		mainClaims, err2 := jwtService.ValidateToken(token)
		if err2 == nil {
			if mainClaims.TokenType == "main" {
				return nil, &AuthError{Message: "Este endpoint requiere un business token, no un token principal"}
			}
		}
		return nil, &AuthError{Message: "Se requiere un business token válido"}
	}

	// Es un business token, guardar toda la información
	logger := log.New()

	// Verificar si es super admin (business_id = 0)
	isSuperAdmin := businessClaims.BusinessID == 0

	if isSuperAdmin {
		logger.Debug().
			Uint("user_id", businessClaims.UserID).
			Msg("Business token de SUPER ADMIN validado exitosamente")
	} else {
		logger.Debug().
			Uint("user_id", businessClaims.UserID).
			Uint("business_id", businessClaims.BusinessID).
			Uint("business_type_id", businessClaims.BusinessTypeID).
			Uint("role_id", businessClaims.RoleID).
			Msg("Business token validado exitosamente")
	}

	// Guardar información adicional en el contexto
	c.Set("business_id", businessClaims.BusinessID)
	c.Set("business_type_id", businessClaims.BusinessTypeID)
	c.Set("role_id", businessClaims.RoleID)
	c.Set("business_token_claims", businessClaims)
	c.Set("is_super_admin", isSuperAdmin)

	authInfo := &AuthInfo{
		Type:       AuthTypeJWT,
		UserID:     businessClaims.UserID,
		BusinessID: businessClaims.BusinessID,
	}

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

// BusinessTokenAuth es un middleware específico para el endpoint de generar business token
// Solo permite tokens principales (solo con user_id)
// Rechaza business tokens (con business_id, business_type_id, role_id)
func BusinessTokenAuth() gin.HandlerFunc {
	ensureInitialized()
	return BusinessTokenAuthMiddleware(defaultJWTService, defaultLogger)
}

// BusinessTokenAuthMiddleware valida solo tokens principales para el endpoint de business token
func BusinessTokenAuthMiddleware(jwtService domain.IJWTService, logger log.ILogger) gin.HandlerFunc {
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

		// Intentar validar como token principal primero
		mainClaims, err := jwtService.ValidateToken(token)
		if err != nil {
			logger.Error().Err(err).Msg("Token inválido")
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token inválido",
			})
			c.Abort()
			return
		}

		// Verificar que sea token principal por token_type
		if mainClaims.TokenType != "main" {
			logger.Error().
				Str("token_type", mainClaims.TokenType).
				Msg("Se intentó usar un business token en lugar de token principal")
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Se requiere un token principal, no un business token",
			})
			c.Abort()
			return
		}

		// Log de los claims del token principal
		logger.Debug().
			Uint("user_id", mainClaims.UserID).
			Msg("Token principal validado exitosamente")

		// Guardar información en el contexto
		c.Set("user_id", mainClaims.UserID)
		c.Set("jwt_claims", mainClaims)

		c.Next()
	}
}

// GetBusinessTokenClaims obtiene los claims del business token desde el contexto
func GetBusinessTokenClaims(c *gin.Context) (*domain.BusinessTokenClaims, bool) {
	claims, exists := c.Get("business_token_claims")
	if !exists {
		return nil, false
	}
	if c, ok := claims.(*domain.BusinessTokenClaims); ok {
		return c, true
	}
	return nil, false
}

// GetBusinessTypeID obtiene el BusinessTypeID desde el contexto
func GetBusinessTypeID(c *gin.Context) (uint, bool) {
	typeID, exists := c.Get("business_type_id")
	if !exists {
		return 0, false
	}
	if id, ok := typeID.(uint); ok {
		return id, true
	}
	return 0, false
}

// GetRoleID obtiene el RoleID desde el contexto
func GetRoleID(c *gin.Context) (uint, bool) {
	roleID, exists := c.Get("role_id")
	if !exists {
		return 0, false
	}
	if id, ok := roleID.(uint); ok {
		return id, true
	}
	return 0, false
}

// IsSuperAdmin verifica si el usuario es super admin
func IsSuperAdmin(c *gin.Context) bool {
	// Verificar si tiene business_id = 0
	businessID, exists := c.Get("business_id")
	if !exists {
		return false
	}
	if id, ok := businessID.(uint); ok {
		return id == 0
	}
	return false
}

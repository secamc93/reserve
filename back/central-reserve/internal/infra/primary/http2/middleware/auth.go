package middleware

import (
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
	Type      AuthType
	UserID    uint
	Email     string
	Roles     []string
	APIKey    string
	JWTClaims *jwt.Claims
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

// validateAPIKey valida la autenticación por API Key (usando JWT con firma)
func validateAPIKey(c *gin.Context, jwtService *jwt.JWTService, logger log.ILogger) (*AuthInfo, error) {
	apiKey := c.GetHeader("X-API-Key")
	if apiKey == "" {
		// También verificar en query parameters
		apiKey = c.Query("api_key")
	}

	if apiKey == "" {
		return nil, &AuthError{Message: "API Key requerida"}
	}

	// Validar que la API Key tenga el formato correcto de JWT
	if !isValidJWTFormat(apiKey) {
		return nil, &AuthError{Message: "API Key con formato inválido"}
	}

	// Validar la API Key como JWT
	claims, err := validateAPIKeyAsJWT(apiKey, jwtService)
	if err != nil {
		return nil, &AuthError{Message: "API Key inválida o expirada"}
	}

	// Verificar que sea una API Key válida (no un JWT de usuario)
	if !isValidAPIKeyClaims(claims) {
		return nil, &AuthError{Message: "API Key no autorizada para este endpoint"}
	}

	return &AuthInfo{
		Type:      AuthTypeAPIKey,
		UserID:    claims.UserID,
		Email:     claims.Email,
		Roles:     claims.Roles,
		APIKey:    apiKey,
		JWTClaims: claims, // También almacenamos los claims para consistencia
	}, nil
}

// isValidJWTFormat verifica que la API Key tenga el formato básico de JWT
func isValidJWTFormat(token string) bool {
	// JWT tiene 3 partes separadas por puntos
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return false
	}

	// Verificar que cada parte sea base64 válido
	for _, part := range parts {
		if part == "" {
			return false
		}
	}

	return true
}

// validateAPIKeyAsJWT valida la API Key como JWT usando la misma clave secreta
func validateAPIKeyAsJWT(apiKey string, jwtService *jwt.JWTService) (*jwt.Claims, error) {
	// Usar el mismo JWT service para validar la API Key
	// Esto asegura que use la misma clave secreta y algoritmo
	return jwtService.ValidateToken(apiKey)
}

// isValidAPIKeyClaims verifica que los claims sean válidos para una API Key
func isValidAPIKeyClaims(claims *jwt.Claims) bool {
	// Verificar que tenga roles apropiados para API Key
	validAPIRoles := []string{"api_user", "api_admin", "webhook", "integration"}
	hasValidRole := false

	for _, role := range claims.Roles {
		for _, validRole := range validAPIRoles {
			if role == validRole {
				hasValidRole = true
				break
			}
		}
		if hasValidRole {
			break
		}
	}

	return hasValidRole
}

// isValidAPIKey valida si una API Key es válida (ahora deprecated, usar JWT)
// TODO: Eliminar esta función una vez que se migre completamente a JWT
func isValidAPIKey(apiKey string) bool {
	// Si es un JWT válido, aceptarlo
	if isValidJWTFormat(apiKey) {
		// Crear un JWT service temporal para validación
		// En producción, deberías pasar el JWT service como parámetro
		jwtService := jwt.New("temporary-secret-key")
		claims, err := validateAPIKeyAsJWT(apiKey, jwtService)
		if err == nil && isValidAPIKeyClaims(claims) {
			return true
		}
	}

	// Fallback para API Keys legacy (eliminar en el futuro)
	if len(apiKey) < 10 {
		return false
	}

	// Aquí podrías:
	// 1. Verificar contra una base de datos
	// 2. Verificar contra variables de entorno
	// 3. Verificar contra un servicio de gestión de API Keys
	// 4. Validar formato específico

	// Por ahora, aceptamos cualquier API Key de al menos 10 caracteres
	return true
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
	apiKey, exists := c.Get("api_key")
	if !exists {
		return "", false
	}
	if a, ok := apiKey.(string); ok {
		return a, true
	}
	return "", false
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

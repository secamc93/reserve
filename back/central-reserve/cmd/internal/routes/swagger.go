package routes

import (
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"net/http"
	"net/url"
	"strings"

	authDocs "central_reserve/shared/docs/auth"
	propertiesDocs "central_reserve/shared/docs/properties"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SetupSwagger registra las rutas de Swagger UI separadas por módulo
func SetupSwagger(r *gin.Engine, e env.IConfig, logger log.ILogger) {
	// Configurar Host y Schemes según URL_BASE_SWAGGER
	base := e.Get("URL_BASE_SWAGGER")
	if base == "" {
		base = "http://localhost:" + e.Get("HTTP_PORT")
	}

	var host string
	var schemes []string
	if u, err := url.Parse(base); err == nil && u.Host != "" {
		host = u.Host
		if u.Scheme == "https" {
			schemes = []string{"https"}
		} else if u.Scheme == "http" {
			schemes = []string{"http"}
		}
	} else {
		host = strings.TrimPrefix(strings.TrimPrefix(base, "http://"), "https://")
		schemes = []string{"http", "https"}
	}

	// Configurar Swagger para módulo Auth
	setupAuthSwagger(r, host, schemes, logger)

	// Configurar Swagger para módulo Properties (horizontalproperty)
	setupPropertiesSwagger(r, host, schemes, logger)
}

// setupAuthSwagger configura Swagger para el módulo de Auth
func setupAuthSwagger(r *gin.Engine, host string, schemes []string, logger log.ILogger) {
	// Configurar información de Swagger para Auth
	authDocs.SwaggerInfo.Host = host
	authDocs.SwaggerInfo.Schemes = schemes
	if authDocs.SwaggerInfo.BasePath == "" {
		authDocs.SwaggerInfo.BasePath = "/api/v1"
	}

	// Crear grupo de rutas para /docs/auth
	authDocsGroup := r.Group("/docs/auth")
	{
		// Redirigir /docs/auth a /docs/auth/index.html
		authDocsGroup.GET("", func(c *gin.Context) {
			c.Redirect(http.StatusMovedPermanently, "/docs/auth/index.html")
		})

		// Registrar UI con wildcard para Auth usando InstanceName
		// Esto evita conflictos porque swag maneja internamente todas las rutas necesarias
		authDocsGroup.GET("/*any", ginSwagger.WrapHandler(
			swaggerFiles.Handler,
			ginSwagger.InstanceName(authDocs.SwaggerInfo.InstanceName()),
			ginSwagger.DefaultModelsExpandDepth(-1),
		))
	}
}

// setupPropertiesSwagger configura Swagger para el módulo de Properties
func setupPropertiesSwagger(r *gin.Engine, host string, schemes []string, logger log.ILogger) {
	// Configurar información de Swagger para Properties
	propertiesDocs.SwaggerInfo.Host = host
	propertiesDocs.SwaggerInfo.Schemes = schemes
	if propertiesDocs.SwaggerInfo.BasePath == "" {
		propertiesDocs.SwaggerInfo.BasePath = "/api/v1"
	}

	// Crear grupo de rutas para /docs/properties
	propertiesDocsGroup := r.Group("/docs/properties")
	{
		// Redirigir /docs/properties a /docs/properties/index.html
		propertiesDocsGroup.GET("", func(c *gin.Context) {
			c.Redirect(http.StatusMovedPermanently, "/docs/properties/index.html")
		})

		// Registrar UI con wildcard para Properties usando InstanceName
		// Esto evita conflictos porque swag maneja internamente todas las rutas necesarias
		propertiesDocsGroup.GET("/*any", ginSwagger.WrapHandler(
			swaggerFiles.Handler,
			ginSwagger.InstanceName(propertiesDocs.SwaggerInfo.InstanceName()),
			ginSwagger.DefaultModelsExpandDepth(-1),
		))
	}
}

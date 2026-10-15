// main.go

// @title						Rupü - Propiedad Horizontal API
// @version					1.0
// @description				Servicio REST para la gestión de propiedades horizontales.
// @termsOfService				https://ejemplo.com/terminos
//
// @contact.name				Equipo de Backend
// @contact.email				backend@example.com
//
// @license.name				MIT
// @license.url				https://opensource.org/licenses/MIT
//
// @host						localhost:3050
// @BasePath					/api/v1
//
// @securityDefinitions.apikey	BearerAuth
// @in							header
// @name						Authorization
// @description				Token de business JWT con el prefijo **Bearer** (para todos los endpoints)
//
// @securityDefinitions.apikey	BusinessTokenAuth
// @in							header
// @name						Authorization
// @description				Token principal JWT con el prefijo **Bearer** (solo para /auth/business-token)
package main

import (
	"context"

	"central_reserve/cmd/internal/server"
)

func main() {
	_ = server.Init(context.Background())
	select {}
}

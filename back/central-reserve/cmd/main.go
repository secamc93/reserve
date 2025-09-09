// main.go

// @title           Restaurant Reservation API
// @version         1.0
// @description     Servicio REST para la gestión de reservas multi-restaurante.
// @termsOfService  https://ejemplo.com/terminos
//
// @contact.name   Equipo de Backend
// @contact.email  backend@example.com
//
// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT
//
// @host      localhost:3050
// @BasePath  /api/v1
//
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Ingrese su token JWT con el prefijo **Bearer**
package main

import (
	"context"

	"central_reserve/cmd/internal/server"
)

func main() {
	_ = server.Init(context.Background())
	select {}
}

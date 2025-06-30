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
// @host      localhost:8080
// @BasePath  /api/v1
//
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Ingrese su token JWT con el prefijo **Bearer**
package main

import (
	"context"

	"os"
	"os/signal"
	"syscall"

	"central_reserve/internal/infra/primary/server"
)

func main() {
	ctx := context.Background()
	services, err := server.InitServer(ctx)
	if err != nil {
		if services != nil && services.Logger != nil {
			services.Logger.Error(ctx).Err(err).Msg("No se pudo inicializar el servidor")
		}
		os.Exit(1)
	}

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig
	services.Logger.Info(ctx).Msg("Apagando servidor...")
}

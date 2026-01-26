package unit

import (
	"fmt"
	"strings"

	sharedclient "reserve/testing/shared/client"
	"reserve/testing/shared/db"
)

// Bundle representa el módulo de testing de unidades
type Bundle struct {
	name       string
	client     *sharedclient.Client
	db         db.IDatabase
	businessID uint
}

// NewBundle crea una nueva instancia del bundle con el contexto autenticado
func NewBundle(client *sharedclient.Client, database db.IDatabase, businessID uint) *Bundle {
	return &Bundle{
		name:       "unit",
		client:     client,
		db:         database,
		businessID: businessID,
	}
}

// Execute ejecuta el módulo de unidades
func (b *Bundle) Execute() {
	fmt.Println("\n🏠 Módulo: Unit (Unidades)")
	fmt.Println(strings.Repeat("-", 40))

	// TODO: Implementar infraestructura y casos de uso
	fmt.Println("\n⚠️  Módulo en desarrollo...")
	fmt.Println("   Próximamente: APIs de gestión de unidades")
}

// GetName retorna el nombre del bundle
func (b *Bundle) GetName() string {
	return b.name
}

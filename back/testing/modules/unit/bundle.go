package unit

import "fmt"

// Bundle representa el módulo de testing unitario
type Bundle struct {
	name string
}

// NewBundle crea una nueva instancia del bundle
func NewBundle() *Bundle {
	return &Bundle{name: "unit"}
}

// Execute ejecuta las pruebas del módulo
func (b *Bundle) Execute() {
	fmt.Printf("  ✓ Ejecutando bundle: %s\n", b.name)
	// TODO: Implementar lógica de testing unitario
}

// GetName retorna el nombre del bundle
func (b *Bundle) GetName() string {
	return b.name
}

package residents

import "fmt"

// Bundle representa el módulo de testing de residents
type Bundle struct {
	name string
}

// NewBundle crea una nueva instancia del bundle
func NewBundle() *Bundle {
	return &Bundle{name: "residents"}
}

// Execute ejecuta las pruebas del módulo
func (b *Bundle) Execute() {
	fmt.Printf("  ✓ Ejecutando bundle: %s\n", b.name)
	// TODO: Implementar lógica de testing de residents
}

// GetName retorna el nombre del bundle
func (b *Bundle) GetName() string {
	return b.name
}

package cli

import (
	"context"
	"fmt"
	"reserve/testing/modules/visit/internal/application/usecases"
	"strings"
)

// CatalogHandlers maneja las operaciones de catálogos desde CLI
type CatalogHandlers struct {
	catalogUC *usecases.CatalogUseCases
}

// NewCatalogHandlers crea una nueva instancia de CatalogHandlers
func NewCatalogHandlers(catalogUC *usecases.CatalogUseCases) *CatalogHandlers {
	return &CatalogHandlers{
		catalogUC: catalogUC,
	}
}

// ListVisitTypes lista los tipos de visita
func (h *CatalogHandlers) ListVisitTypes() error {
	fmt.Println("\n📋 TIPOS DE VISITA")
	fmt.Println(strings.Repeat("-", 40))

	ctx := context.Background()
	types, err := h.catalogUC.ListVisitTypes(ctx)
	if err != nil {
		return err
	}

	fmt.Println("\n✅ Tipos de visita disponibles:")
	for _, vType := range types {
		fmt.Printf("   [%d] %s\n", vType.ID, vType.Name)
	}

	return nil
}

// ListVisitStatuses lista los estados de visita
func (h *CatalogHandlers) ListVisitStatuses() error {
	fmt.Println("\n📊 ESTADOS DE VISITA")
	fmt.Println(strings.Repeat("-", 40))

	ctx := context.Background()
	statuses, err := h.catalogUC.ListVisitStatuses(ctx)
	if err != nil {
		return err
	}

	fmt.Println("\n✅ Estados de visita disponibles:")
	for _, status := range statuses {
		fmt.Printf("   [%d] %s\n", status.ID, status.Name)
	}

	return nil
}

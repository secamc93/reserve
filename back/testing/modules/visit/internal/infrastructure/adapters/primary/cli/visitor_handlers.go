package cli

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"reserve/testing/modules/visit/internal/application"
	"reserve/testing/modules/visit/internal/application/usecases"
	"reserve/testing/modules/visit/internal/domain"
	"strings"
)

// VisitorHandlers maneja las operaciones de visitantes desde CLI
type VisitorHandlers struct {
	visitorUC    *usecases.VisitorUseCases
	stateManager *StateManager
}

// NewVisitorHandlers crea una nueva instancia de VisitorHandlers
func NewVisitorHandlers(visitorUC *usecases.VisitorUseCases, sm *StateManager) *VisitorHandlers {
	return &VisitorHandlers{
		visitorUC:    visitorUC,
		stateManager: sm,
	}
}

// CreateVisitor maneja la creación de un visitante
func (h *VisitorHandlers) CreateVisitor() error {
	fmt.Println("\n👤 CREAR VISITANTE")
	fmt.Println(strings.Repeat("-", 40))

	reader := bufio.NewReader(os.Stdin)

	fmt.Print("DNI/Cédula: ")
	dni, _ := reader.ReadString('\n')
	dni = strings.TrimSpace(dni)

	fmt.Print("Nombre completo: ")
	fullName, _ := reader.ReadString('\n')
	fullName = strings.TrimSpace(fullName)

	fmt.Print("Teléfono: ")
	phone, _ := reader.ReadString('\n')
	phone = strings.TrimSpace(phone)

	fmt.Print("Email (opcional, presione ENTER para omitir): ")
	email, _ := reader.ReadString('\n')
	email = strings.TrimSpace(email)

	dto := application.CreateVisitorDTO{
		DNI:      dni,
		FullName: fullName,
		Phone:    phone,
		Email:    email,
	}

	ctx := context.Background()
	visitor, err := h.visitorUC.CreateVisitor(ctx, dto)
	if err != nil {
		return err
	}

	h.stateManager.SetLastVisitorID(visitor.ID)
	fmt.Printf("\n✅ Visitante creado exitosamente (ID: %d)\n", visitor.ID)

	return nil
}

// SearchVisitor maneja la búsqueda de un visitante por DNI
func (h *VisitorHandlers) SearchVisitor() error {
	fmt.Println("\n🔍 BUSCAR VISITANTE POR DNI")
	fmt.Println(strings.Repeat("-", 40))

	reader := bufio.NewReader(os.Stdin)

	fmt.Print("DNI/Cédula: ")
	dni, _ := reader.ReadString('\n')
	dni = strings.TrimSpace(dni)

	ctx := context.Background()
	visitor, err := h.visitorUC.SearchVisitorByDNI(ctx, dni)
	if err != nil {
		if err == domain.ErrVisitorNotFound {
			fmt.Println("\n❌ Visitante no encontrado")
			return nil
		}
		return err
	}

	h.stateManager.SetLastVisitorID(visitor.ID)
	fmt.Println("\n✅ Visitante encontrado:")
	fmt.Printf("   ID: %d\n", visitor.ID)
	fmt.Printf("   DNI: %s\n", visitor.DNI)
	fmt.Printf("   Nombre: %s\n", visitor.FullName)
	fmt.Printf("   Teléfono: %s\n", visitor.Phone)
	if visitor.Email != "" {
		fmt.Printf("   Email: %s\n", visitor.Email)
	}

	return nil
}

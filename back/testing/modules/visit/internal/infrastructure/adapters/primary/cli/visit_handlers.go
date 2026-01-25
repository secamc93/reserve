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
	"time"
)

// VisitHandlers maneja las operaciones de visitas desde CLI
type VisitHandlers struct {
	visitUC      *usecases.VisitUseCases
	stateManager *StateManager
}

// NewVisitHandlers crea una nueva instancia de VisitHandlers
func NewVisitHandlers(visitUC *usecases.VisitUseCases, sm *StateManager) *VisitHandlers {
	return &VisitHandlers{
		visitUC:      visitUC,
		stateManager: sm,
	}
}

// CreateVisit maneja la creación de una visita
func (h *VisitHandlers) CreateVisit() error {
	fmt.Println("\n📝 CREAR NUEVA VISITA")
	fmt.Println(strings.Repeat("-", 40))

	reader := bufio.NewReader(os.Stdin)

	var visitorID, propertyUnitID, visitTypeID uint

	// Usar el último visitor_id si está disponible
	if h.stateManager.GetLastVisitorID() > 0 {
		fmt.Printf("Usar último Visitor ID (%d)? (s/n): ", h.stateManager.GetLastVisitorID())
		input, _ := reader.ReadString('\n')
		if strings.TrimSpace(strings.ToLower(input)) == "s" || strings.TrimSpace(strings.ToLower(input)) == "y" {
			visitorID = h.stateManager.GetLastVisitorID()
		}
	}

	if visitorID == 0 {
		fmt.Print("Visitor ID: ")
		fmt.Scanf("%d", &visitorID)
		reader.ReadString('\n')
	}

	fmt.Print("Property Unit ID: ")
	fmt.Scanf("%d", &propertyUnitID)
	reader.ReadString('\n')

	h.stateManager.SetLastPropertyUnitID(propertyUnitID)

	fmt.Print("Visit Type ID (1=Visitante, 2=Proveedor, etc.): ")
	fmt.Scanf("%d", &visitTypeID)
	reader.ReadString('\n')

	fmt.Print("Propósito de la visita: ")
	purpose, _ := reader.ReadString('\n')
	purpose = strings.TrimSpace(purpose)

	scheduledDate := time.Now().Format("2006-01-02")
	scheduledStartTime := time.Now().Format(time.RFC3339)

	dto := application.CreateVisitDTO{
		VisitorID:          visitorID,
		PropertyUnitID:     propertyUnitID,
		VisitTypeID:        visitTypeID,
		ScheduledDate:      scheduledDate,
		ScheduledStartTime: scheduledStartTime,
		Purpose:            purpose,
		NumberOfVisitors:   1,
		NotifyResident:     true,
		NotifySecurity:     true,
	}

	ctx := context.Background()
	visit, err := h.visitUC.CreateVisit(ctx, dto)
	if err != nil {
		return err
	}

	h.stateManager.SetLastVisitID(visit.ID)
	fmt.Printf("\n✅ Visita creada exitosamente\n")
	fmt.Printf("   Visit ID: %d\n", visit.ID)
	if visit.QRCode != "" {
		fmt.Printf("   QR Code: %s\n", visit.QRCode)
	}

	return nil
}

// ListVisits lista todas las visitas
func (h *VisitHandlers) ListVisits() error {
	fmt.Println("\n📋 LISTAR VISITAS")
	fmt.Println(strings.Repeat("-", 40))

	ctx := context.Background()
	visits, err := h.visitUC.ListVisits(ctx)
	if err != nil {
		return err
	}

	fmt.Printf("\n✅ Se encontraron %d visitas:\n\n", len(visits))
	for i, visit := range visits {
		fmt.Printf("%d. ID: %d | Visitante: %d\n", i+1, visit.ID, visit.VisitorID)
		if visit.Purpose != "" {
			fmt.Printf("   Propósito: %s\n", visit.Purpose)
		}
	}

	return nil
}

// GetVisitByID obtiene una visita por ID
func (h *VisitHandlers) GetVisitByID() error {
	fmt.Println("\n🔍 OBTENER VISITA POR ID")
	fmt.Println(strings.Repeat("-", 40))

	reader := bufio.NewReader(os.Stdin)
	var visitID uint

	if h.stateManager.GetLastVisitID() > 0 {
		fmt.Printf("Usar última Visit ID (%d)? (s/n): ", h.stateManager.GetLastVisitID())
		input, _ := reader.ReadString('\n')
		if strings.TrimSpace(strings.ToLower(input)) == "s" || strings.TrimSpace(strings.ToLower(input)) == "y" {
			visitID = h.stateManager.GetLastVisitID()
		}
	}

	if visitID == 0 {
		fmt.Print("Visit ID: ")
		fmt.Scanf("%d", &visitID)
	}

	ctx := context.Background()
	visit, err := h.visitUC.GetVisitByID(ctx, visitID)
	if err != nil {
		if err == domain.ErrVisitNotFound {
			fmt.Println("\n❌ Visita no encontrada")
			return nil
		}
		return err
	}

	fmt.Println("\n✅ Detalles de la visita:")
	fmt.Printf("   ID: %d\n", visit.ID)

	return nil
}

// GetVisitByQR obtiene una visita por código QR
func (h *VisitHandlers) GetVisitByQR() error {
	fmt.Println("\n🔍 BUSCAR VISITA POR QR")
	fmt.Println(strings.Repeat("-", 40))

	reader := bufio.NewReader(os.Stdin)

	fmt.Print("Código QR: ")
	qrCode, _ := reader.ReadString('\n')
	qrCode = strings.TrimSpace(qrCode)

	ctx := context.Background()
	visit, err := h.visitUC.GetVisitByQR(ctx, qrCode)
	if err != nil {
		if err == domain.ErrVisitNotFound {
			fmt.Println("\n❌ Visita no encontrada")
			return nil
		}
		return err
	}

	fmt.Println("\n✅ Visita encontrada:")
	fmt.Printf("   QR Code: %s\n", visit.QRCode)

	return nil
}

// RegisterEntry registra la entrada de una visita
func (h *VisitHandlers) RegisterEntry() error {
	fmt.Println("\n🟢 REGISTRAR ENTRADA")
	fmt.Println(strings.Repeat("-", 40))

	reader := bufio.NewReader(os.Stdin)
	visitID := h.stateManager.GetLastVisitID()

	if visitID == 0 {
		fmt.Print("Visit ID: ")
		fmt.Scanf("%d", &visitID)
		reader.ReadString('\n')
	} else {
		fmt.Printf("Usando Visit ID: %d\n", visitID)
	}

	fmt.Print("Puerta/Gate (ej: Principal): ")
	gate, _ := reader.ReadString('\n')
	gate = strings.TrimSpace(gate)

	if gate == "" {
		gate = "Principal"
	}

	dto := application.EntryRequestDTO{
		VisitID: visitID,
		Gate:    gate,
		Method:  "qr_code",
	}

	ctx := context.Background()
	err := h.visitUC.RegisterEntry(ctx, dto)
	if err != nil {
		return err
	}

	fmt.Println("\n✅ Entrada registrada exitosamente")

	return nil
}

// RegisterExit registra la salida de una visita
func (h *VisitHandlers) RegisterExit() error {
	fmt.Println("\n🔴 REGISTRAR SALIDA")
	fmt.Println(strings.Repeat("-", 40))

	reader := bufio.NewReader(os.Stdin)
	visitID := h.stateManager.GetLastVisitID()

	if visitID == 0 {
		fmt.Print("Visit ID: ")
		fmt.Scanf("%d", &visitID)
		reader.ReadString('\n')
	} else {
		fmt.Printf("Usando Visit ID: %d\n", visitID)
	}

	fmt.Print("Puerta/Gate (ej: Principal): ")
	gate, _ := reader.ReadString('\n')
	gate = strings.TrimSpace(gate)

	if gate == "" {
		gate = "Principal"
	}

	dto := application.ExitRequestDTO{
		VisitID: visitID,
		Gate:    gate,
	}

	ctx := context.Background()
	err := h.visitUC.RegisterExit(ctx, dto)
	if err != nil {
		return err
	}

	fmt.Println("\n✅ Salida registrada exitosamente")

	return nil
}

// ListCompanions lista los acompañantes de una visita
func (h *VisitHandlers) ListCompanions() error {
	fmt.Println("\n👥 LISTAR ACOMPAÑANTES")
	fmt.Println(strings.Repeat("-", 40))

	reader := bufio.NewReader(os.Stdin)
	visitID := h.stateManager.GetLastVisitID()

	if visitID == 0 {
		fmt.Print("Visit ID: ")
		fmt.Scanf("%d", &visitID)
		reader.ReadString('\n')
	} else {
		fmt.Printf("Usando Visit ID: %d\n", visitID)
	}

	ctx := context.Background()
	companions, err := h.visitUC.ListCompanions(ctx, visitID)
	if err != nil {
		return err
	}

	fmt.Printf("\n✅ Acompañantes (%d):\n", len(companions))
	for i, c := range companions {
		fmt.Printf("%d. %s - %s\n", i+1, c.DNI, c.FullName)
	}

	return nil
}

// CreateCompanion crea un acompañante
func (h *VisitHandlers) CreateCompanion() error {
	fmt.Println("\n👤 CREAR ACOMPAÑANTE")
	fmt.Println(strings.Repeat("-", 40))

	reader := bufio.NewReader(os.Stdin)
	visitID := h.stateManager.GetLastVisitID()

	if visitID == 0 {
		fmt.Print("Visit ID: ")
		fmt.Scanf("%d", &visitID)
		reader.ReadString('\n')
	} else {
		fmt.Printf("Usando Visit ID: %d\n", visitID)
	}

	fmt.Print("DNI del acompañante: ")
	dni, _ := reader.ReadString('\n')
	dni = strings.TrimSpace(dni)

	fmt.Print("Nombre completo: ")
	fullName, _ := reader.ReadString('\n')
	fullName = strings.TrimSpace(fullName)

	dto := application.CreateCompanionDTO{
		DNI:      dni,
		FullName: fullName,
	}

	ctx := context.Background()
	_, err := h.visitUC.CreateCompanion(ctx, visitID, dto)
	if err != nil {
		return err
	}

	fmt.Println("\n✅ Acompañante creado exitosamente")

	return nil
}

// RegisterAssets registra activos de una visita
func (h *VisitHandlers) RegisterAssets() error {
	fmt.Println("\n📦 REGISTRAR ACTIVOS")
	fmt.Println(strings.Repeat("-", 40))

	reader := bufio.NewReader(os.Stdin)
	visitID := h.stateManager.GetLastVisitID()

	if visitID == 0 {
		fmt.Print("Visit ID: ")
		fmt.Scanf("%d", &visitID)
		reader.ReadString('\n')
	} else {
		fmt.Printf("Usando Visit ID: %d\n", visitID)
	}

	fmt.Print("Descripción del activo: ")
	description, _ := reader.ReadString('\n')
	description = strings.TrimSpace(description)

	fmt.Print("Cantidad: ")
	var quantity int
	fmt.Scanf("%d", &quantity)
	reader.ReadString('\n')

	dto := application.RegisterAssetDTO{
		Description: description,
		Quantity:    quantity,
	}

	ctx := context.Background()
	_, err := h.visitUC.RegisterAssets(ctx, visitID, dto)
	if err != nil {
		return err
	}

	fmt.Println("\n✅ Activos registrados exitosamente")

	return nil
}

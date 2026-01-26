package cli

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strings"

	"reserve/testing/modules/visit/internal/application"
	"reserve/testing/modules/visit/internal/application/usecases"
	"reserve/testing/modules/visit/internal/domain"
	"reserve/testing/modules/visit/internal/infrastructure/secondary/faker"
	"reserve/testing/modules/visit/internal/infrastructure/secondary/repository"
)

// AutoTester maneja las pruebas automáticas con generación de datos
type AutoTester struct {
	visitorUC *usecases.VisitorUseCases
	visitUC   *usecases.VisitUseCases
	repo      *repository.VisitRepository
	faker     *faker.Faker
	state     *StateManager
}

// NewAutoTester crea una nueva instancia de AutoTester
func NewAutoTester(
	visitorUC *usecases.VisitorUseCases,
	visitUC *usecases.VisitUseCases,
	repo *repository.VisitRepository,
	state *StateManager,
) *AutoTester {
	return &AutoTester{
		visitorUC: visitorUC,
		visitUC:   visitUC,
		repo:      repo,
		faker:     faker.New(),
		state:     state,
	}
}

// TestCreateVisitor prueba la creación de visitante con opciones automáticas
func (t *AutoTester) TestCreateVisitor() error {
	fmt.Println("\n📝 CREAR VISITANTE - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	reader := bufio.NewReader(os.Stdin)
	ctx := context.Background()

	// Verificar si hay visitantes existentes
	count, _ := t.repo.CountVisitors(ctx)

	fmt.Println("\n¿Qué tipo de datos desea usar?")
	fmt.Println()
	if count > 0 {
		fmt.Printf("[1] Usar visitante EXISTENTE (hay %d en BD)\n", count)
	} else {
		fmt.Println("[1] Usar visitante EXISTENTE (no hay datos)")
	}
	fmt.Println("[2] Generar visitante NUEVO (datos simulados)")
	fmt.Println("[0] Cancelar")

	fmt.Print("\n➤ Seleccione: ")
	input, _ := reader.ReadString('\n')
	input = strings.TrimSpace(input)

	switch input {
	case "0":
		fmt.Println("\n❌ Operación cancelada")
		return nil

	case "1":
		return t.createVisitorFromExisting(ctx)

	case "2":
		return t.createVisitorNew(ctx)

	default:
		fmt.Println("\n❌ Opción inválida")
		return nil
	}
}

func (t *AutoTester) createVisitorFromExisting(ctx context.Context) error {
	visitor, err := t.repo.GetRandomVisitor(ctx)
	if err != nil {
		fmt.Println("\n⚠️  No hay visitantes existentes. Generando uno nuevo...")
		return t.createVisitorNew(ctx)
	}

	fmt.Println("\n📋 Visitante existente seleccionado:")
	fmt.Printf("   DNI:    %s\n", visitor.DNI)
	fmt.Printf("   Nombre: %s\n", visitor.FullName)
	fmt.Printf("   Tel:    %s\n", visitor.Phone)
	fmt.Printf("   Email:  %s\n", visitor.Email)

	fmt.Println("\n⚠️  Este visitante ya existe. Si desea crear, se actualizará o fallará.")
	fmt.Print("¿Continuar con la petición? (s/n): ")

	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	if strings.TrimSpace(strings.ToLower(input)) != "s" {
		return nil
	}

	// Hacer la petición
	dto := application.CreateVisitorDTO{
		DNI:      visitor.DNI,
		FullName: visitor.FullName,
		Phone:    visitor.Phone,
		Email:    visitor.Email,
	}

	result, err := t.visitorUC.CreateVisitor(ctx, dto)
	if err != nil {
		return err
	}

	t.state.SetLastVisitorID(result.ID)
	fmt.Printf("\n✅ Respuesta recibida - Visitor ID: %d\n", result.ID)

	return nil
}

func (t *AutoTester) createVisitorNew(ctx context.Context) error {
	// Generar datos únicos
	var generated faker.Visitor
	maxAttempts := 10

	for i := 0; i < maxAttempts; i++ {
		generated = t.faker.GenerateVisitor()

		// Verificar que no existe
		exists, err := t.repo.VisitorExistsByDNI(ctx, generated.DNI)
		if err != nil {
			return fmt.Errorf("error verificando DNI: %w", err)
		}

		if !exists {
			break
		}

		if i == maxAttempts-1 {
			fmt.Println("\n⚠️  No se pudo generar un DNI único después de varios intentos")
		}
	}

	fmt.Println("\n🎲 Datos generados automáticamente:")
	fmt.Printf("   DNI:    %s\n", generated.DNI)
	fmt.Printf("   Nombre: %s\n", generated.FullName)
	fmt.Printf("   Tel:    %s\n", generated.Phone)
	fmt.Printf("   Email:  %s\n", generated.Email)

	fmt.Print("\n¿Crear visitante con estos datos? (s/n): ")
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	if strings.TrimSpace(strings.ToLower(input)) != "s" {
		return nil
	}

	// Hacer la petición
	dto := application.CreateVisitorDTO{
		DNI:      generated.DNI,
		FullName: generated.FullName,
		Phone:    generated.Phone,
		Email:    generated.Email,
	}

	result, err := t.visitorUC.CreateVisitor(ctx, dto)
	if err != nil {
		return err
	}

	t.state.SetLastVisitorID(result.ID)
	fmt.Printf("\n✅ Visitante creado exitosamente - ID: %d\n", result.ID)

	return nil
}

// TestCreateVisit prueba la creación de visita con datos automáticos
func (t *AutoTester) TestCreateVisit() error {
	fmt.Println("\n📝 CREAR VISITA - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()
	businessID := t.state.GetBusinessID()

	// 1. Obtener o generar visitante
	fmt.Println("\n🔍 Buscando visitante...")
	visitor, err := t.repo.GetRandomVisitor(ctx)
	if err != nil {
		fmt.Println("   ⚠️  No hay visitantes, generando uno nuevo...")
		if err := t.createVisitorNew(ctx); err != nil {
			return err
		}
		visitor, _ = t.repo.GetRandomVisitor(ctx)
	}
	fmt.Printf("   ✓ Visitante: %s (ID: %d)\n", visitor.FullName, visitor.ID)

	// 2. Obtener unidad aleatoria
	fmt.Println("\n🏠 Buscando unidad...")
	unit, err := t.repo.GetRandomPropertyUnit(ctx, businessID)
	if err != nil {
		return fmt.Errorf("no hay unidades en este negocio: %w", err)
	}
	fmt.Printf("   ✓ Unidad: %s - %s (ID: %d)\n", unit.Identifier, unit.Block, unit.ID)

	// 3. Obtener tipo de visita aleatorio
	fmt.Println("\n📋 Seleccionando tipo de visita...")
	visitType, err := t.repo.GetRandomVisitType(ctx)
	if err != nil {
		return fmt.Errorf("error obteniendo tipo de visita: %w", err)
	}
	fmt.Printf("   ✓ Tipo: %s (ID: %d)\n", visitType.Name, visitType.ID)

	// 4. Generar datos adicionales
	purpose := t.faker.GeneratePurpose()
	scheduled := t.faker.GenerateScheduledDateTime()
	numberOfVisitors := t.faker.GenerateNumberOfVisitors()

	fmt.Println("\n📝 Datos de la visita:")
	fmt.Printf("   Propósito:    %s\n", purpose)
	fmt.Printf("   Fecha:        %s\n", scheduled.Date)
	fmt.Printf("   Hora:         %s\n", scheduled.StartTime)
	fmt.Printf("   # Visitantes: %d\n", numberOfVisitors)

	fmt.Print("\n¿Crear visita con estos datos? (s/n): ")
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	if strings.TrimSpace(strings.ToLower(input)) != "s" {
		return nil
	}

	// Hacer la petición
	dto := application.CreateVisitDTO{
		VisitorID:          visitor.ID,
		PropertyUnitID:     unit.ID,
		VisitTypeID:        visitType.ID,
		ScheduledDate:      scheduled.Date,
		ScheduledStartTime: scheduled.StartTime,
		Purpose:            purpose,
		NumberOfVisitors:   numberOfVisitors,
		NotifyResident:     true,
		NotifySecurity:     true,
	}

	result, err := t.visitUC.CreateVisit(ctx, dto)
	if err != nil {
		return err
	}

	t.state.SetLastVisitID(result.ID)
	fmt.Printf("\n✅ Visita creada exitosamente\n")
	fmt.Printf("   ID: %d\n", result.ID)
	if result.QRCode != "" {
		fmt.Printf("   QR: %s\n", result.QRCode)
	}

	return nil
}

// TestRegisterEntry prueba el registro de entrada automático
func (t *AutoTester) TestRegisterEntry() error {
	fmt.Println("\n🟢 REGISTRAR ENTRADA - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()
	businessID := t.state.GetBusinessID()

	// Obtener visita aleatoria con estado pendiente
	visit, err := t.repo.GetRandomVisit(ctx, businessID)
	if err != nil {
		return fmt.Errorf("no hay visitas disponibles: %w", err)
	}

	fmt.Printf("\n📋 Visita seleccionada: ID %d\n", visit.ID)
	fmt.Printf("   Propósito: %s\n", visit.Purpose)

	gate := t.faker.GenerateGate()
	method := t.faker.GenerateEntryMethod()

	fmt.Printf("\n🚪 Datos de entrada:\n")
	fmt.Printf("   Puerta: %s\n", gate)
	fmt.Printf("   Método: %s\n", method)

	fmt.Print("\n¿Registrar entrada? (s/n): ")
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	if strings.TrimSpace(strings.ToLower(input)) != "s" {
		return nil
	}

	dto := application.EntryRequestDTO{
		VisitID: visit.ID,
		Gate:    gate,
		Method:  method,
	}

	if err := t.visitUC.RegisterEntry(ctx, dto); err != nil {
		return err
	}

	t.state.SetLastVisitID(visit.ID)
	fmt.Println("\n✅ Entrada registrada exitosamente")

	return nil
}

// TestRegisterExit prueba el registro de salida automático
func (t *AutoTester) TestRegisterExit() error {
	fmt.Println("\n🔴 REGISTRAR SALIDA - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()
	businessID := t.state.GetBusinessID()

	visit, err := t.repo.GetRandomVisit(ctx, businessID)
	if err != nil {
		return fmt.Errorf("no hay visitas disponibles: %w", err)
	}

	fmt.Printf("\n📋 Visita seleccionada: ID %d\n", visit.ID)

	gate := t.faker.GenerateGate()

	fmt.Printf("\n🚪 Datos de salida:\n")
	fmt.Printf("   Puerta: %s\n", gate)

	fmt.Print("\n¿Registrar salida? (s/n): ")
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	if strings.TrimSpace(strings.ToLower(input)) != "s" {
		return nil
	}

	dto := application.ExitRequestDTO{
		VisitID: visit.ID,
		Gate:    gate,
	}

	if err := t.visitUC.RegisterExit(ctx, dto); err != nil {
		return err
	}

	t.state.SetLastVisitID(visit.ID)
	fmt.Println("\n✅ Salida registrada exitosamente")

	return nil
}

// TestCreateCompanion prueba la creación de acompañante automático
func (t *AutoTester) TestCreateCompanion() error {
	fmt.Println("\n👤 CREAR ACOMPAÑANTE - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()
	businessID := t.state.GetBusinessID()

	visit, err := t.repo.GetRandomVisit(ctx, businessID)
	if err != nil {
		return fmt.Errorf("no hay visitas disponibles: %w", err)
	}

	fmt.Printf("\n📋 Visita seleccionada: ID %d\n", visit.ID)

	// Generar acompañante
	companion := t.faker.GenerateCompanion()

	fmt.Printf("\n🎲 Acompañante generado:\n")
	fmt.Printf("   DNI:    %s\n", companion.DNI)
	fmt.Printf("   Nombre: %s\n", companion.FullName)

	fmt.Print("\n¿Crear acompañante? (s/n): ")
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	if strings.TrimSpace(strings.ToLower(input)) != "s" {
		return nil
	}

	dto := application.CreateCompanionDTO{
		DNI:      companion.DNI,
		FullName: companion.FullName,
	}

	_, err = t.visitUC.CreateCompanion(ctx, visit.ID, dto)
	if err != nil {
		return err
	}

	t.state.SetLastVisitID(visit.ID)
	fmt.Println("\n✅ Acompañante creado exitosamente")

	return nil
}

// TestRegisterAssets prueba el registro de activos automático
func (t *AutoTester) TestRegisterAssets() error {
	fmt.Println("\n📦 REGISTRAR ACTIVOS - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()
	businessID := t.state.GetBusinessID()

	visit, err := t.repo.GetRandomVisit(ctx, businessID)
	if err != nil {
		return fmt.Errorf("no hay visitas disponibles: %w", err)
	}

	fmt.Printf("\n📋 Visita seleccionada: ID %d\n", visit.ID)

	// Generar activo
	description := t.faker.GenerateAssetDescription()
	brand := t.faker.GenerateAssetBrand()

	fmt.Printf("\n🎲 Activo generado:\n")
	fmt.Printf("   Nombre: %s\n", description)
	fmt.Printf("   Marca:  %s\n", brand)

	fmt.Print("\n¿Registrar activo? (s/n): ")
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	if strings.TrimSpace(strings.ToLower(input)) != "s" {
		return nil
	}

	dto := application.RegisterAssetDTO{
		Description: description,
		Brand:       brand,
	}

	_, err = t.visitUC.RegisterAssets(ctx, visit.ID, dto)
	if err != nil {
		return err
	}

	t.state.SetLastVisitID(visit.ID)
	fmt.Println("\n✅ Activo registrado exitosamente")

	return nil
}

// TestSearchVisitor prueba la búsqueda con DNI existente
func (t *AutoTester) TestSearchVisitor() error {
	fmt.Println("\n🔍 BUSCAR VISITANTE - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()

	// Obtener un visitante existente para buscar
	visitor, err := t.repo.GetRandomVisitor(ctx)
	if err != nil {
		return fmt.Errorf("no hay visitantes para buscar: %w", err)
	}

	fmt.Printf("\n📋 Buscando visitante con DNI: %s\n", visitor.DNI)

	result, err := t.visitorUC.SearchVisitorByDNI(ctx, visitor.DNI)
	if err != nil {
		if err == domain.ErrVisitorNotFound {
			fmt.Println("\n❌ Visitante no encontrado")
			return nil
		}
		return err
	}

	fmt.Println("\n✅ Visitante encontrado:")
	fmt.Printf("   ID:     %d\n", result.ID)
	fmt.Printf("   DNI:    %s\n", result.DNI)
	fmt.Printf("   Nombre: %s\n", result.FullName)
	fmt.Printf("   Tel:    %s\n", result.Phone)

	t.state.SetLastVisitorID(result.ID)

	return nil
}

// TestGetVisitByID prueba obtener visita con ID existente
func (t *AutoTester) TestGetVisitByID() error {
	fmt.Println("\n🔍 OBTENER VISITA - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()
	businessID := t.state.GetBusinessID()

	visit, err := t.repo.GetRandomVisit(ctx, businessID)
	if err != nil {
		return fmt.Errorf("no hay visitas disponibles: %w", err)
	}

	fmt.Printf("\n📋 Obteniendo visita ID: %d\n", visit.ID)

	result, err := t.visitUC.GetVisitByID(ctx, visit.ID)
	if err != nil {
		return err
	}

	fmt.Println("\n✅ Visita obtenida:")
	fmt.Printf("   ID: %d\n", result.ID)

	t.state.SetLastVisitID(result.ID)

	return nil
}

// TestGetVisitByQR prueba obtener visita por QR
func (t *AutoTester) TestGetVisitByQR() error {
	fmt.Println("\n🔍 OBTENER VISITA POR QR - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()
	businessID := t.state.GetBusinessID()

	// Obtener una visita que tenga QR
	visit, err := t.repo.GetRandomVisit(ctx, businessID)
	if err != nil {
		return fmt.Errorf("no hay visitas disponibles: %w", err)
	}

	if visit.QRCode == "" {
		fmt.Println("\n⚠️  La visita seleccionada no tiene código QR")
		return nil
	}

	fmt.Printf("\n📋 Buscando visita con QR: %s\n", visit.QRCode)

	result, err := t.visitUC.GetVisitByQR(ctx, visit.QRCode)
	if err != nil {
		if err == domain.ErrVisitNotFound {
			fmt.Println("\n❌ Visita no encontrada")
			return nil
		}
		return err
	}

	fmt.Println("\n✅ Visita encontrada:")
	fmt.Printf("   QR Code: %s\n", result.QRCode)

	return nil
}

// TestListVisits prueba listar visitas
func (t *AutoTester) TestListVisits() error {
	fmt.Println("\n📋 LISTAR VISITAS - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()

	visits, err := t.visitUC.ListVisits(ctx)
	if err != nil {
		return err
	}

	fmt.Printf("\n✅ Se encontraron %d visitas\n", len(visits))

	if len(visits) > 0 {
		fmt.Println("\nÚltimas visitas:")
		limit := 5
		if len(visits) < limit {
			limit = len(visits)
		}
		for i := 0; i < limit; i++ {
			v := visits[i]
			fmt.Printf("   [%d] ID: %d | Visitor: %d | %s\n", i+1, v.ID, v.VisitorID, v.Purpose)
		}
	}

	return nil
}

// TestListCompanions prueba listar acompañantes de una visita
func (t *AutoTester) TestListCompanions() error {
	fmt.Println("\n👥 LISTAR ACOMPAÑANTES - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()
	businessID := t.state.GetBusinessID()

	visit, err := t.repo.GetRandomVisit(ctx, businessID)
	if err != nil {
		return fmt.Errorf("no hay visitas disponibles: %w", err)
	}

	fmt.Printf("\n📋 Listando acompañantes de visita ID: %d\n", visit.ID)

	companions, err := t.visitUC.ListCompanions(ctx, visit.ID)
	if err != nil {
		return err
	}

	fmt.Printf("\n✅ Acompañantes (%d):\n", len(companions))
	for i, c := range companions {
		fmt.Printf("   [%d] %s - %s\n", i+1, c.DNI, c.FullName)
	}

	t.state.SetLastVisitID(visit.ID)

	return nil
}

// TestDeleteVisit prueba eliminar visita
func (t *AutoTester) TestDeleteVisit() error {
	fmt.Println("\n🗑️  ELIMINAR VISITA - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()
	businessID := t.state.GetBusinessID()

	visit, err := t.repo.GetRandomVisit(ctx, businessID)
	if err != nil {
		return fmt.Errorf("no hay visitas disponibles: %w", err)
	}

	fmt.Printf("\n📋 Visita a eliminar: ID %d\n", visit.ID)
	fmt.Printf("   Propósito: %s\n", visit.Purpose)

	fmt.Print("\n⚠️  ¿Confirmar eliminación? (s/n): ")
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	if strings.TrimSpace(strings.ToLower(input)) != "s" {
		fmt.Println("\n❌ Operación cancelada")
		return nil
	}

	if err := t.visitUC.DeleteVisit(ctx, visit.ID); err != nil {
		return err
	}

	fmt.Println("\n✅ Visita eliminada exitosamente")

	return nil
}

// TestUpdateVisit prueba actualizar visita
func (t *AutoTester) TestUpdateVisit() error {
	fmt.Println("\n✏️  ACTUALIZAR VISITA - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()
	businessID := t.state.GetBusinessID()

	visit, err := t.repo.GetRandomVisit(ctx, businessID)
	if err != nil {
		return fmt.Errorf("no hay visitas disponibles: %w", err)
	}

	fmt.Printf("\n📋 Visita a actualizar: ID %d\n", visit.ID)
	fmt.Printf("   Propósito actual: %s\n", visit.Purpose)

	// Generar nuevo propósito
	newPurpose := t.faker.GeneratePurpose()
	fmt.Printf("\n🎲 Nuevo propósito: %s\n", newPurpose)

	fmt.Print("\n¿Actualizar visita? (s/n): ")
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	if strings.TrimSpace(strings.ToLower(input)) != "s" {
		return nil
	}

	dto := application.UpdateVisitDTO{
		Purpose: newPurpose,
	}

	_, err = t.visitUC.UpdateVisit(ctx, visit.ID, dto)
	if err != nil {
		return err
	}

	t.state.SetLastVisitID(visit.ID)
	fmt.Println("\n✅ Visita actualizada exitosamente")

	return nil
}

// TestDeleteCompanion prueba eliminar acompañante
func (t *AutoTester) TestDeleteCompanion() error {
	fmt.Println("\n🗑️  ELIMINAR ACOMPAÑANTE - MODO AUTOMÁTICO")
	fmt.Println(strings.Repeat("-", 50))

	ctx := context.Background()
	businessID := t.state.GetBusinessID()

	// Buscar visita con acompañantes
	visit, err := t.repo.GetVisitWithCompanions(ctx, businessID)
	if err != nil {
		return fmt.Errorf("no hay visitas con acompañantes: %w", err)
	}

	fmt.Printf("\n📋 Visita con acompañantes: ID %d\n", visit.ID)

	// Listar acompañantes
	companions, err := t.visitUC.ListCompanions(ctx, visit.ID)
	if err != nil {
		return err
	}

	if len(companions) == 0 {
		return fmt.Errorf("esta visita no tiene acompañantes")
	}

	fmt.Println("\n👥 Acompañantes:")
	for i, c := range companions {
		fmt.Printf("   [%d] ID: %d | %s - %s\n", i+1, c.ID, c.DNI, c.FullName)
	}

	// Seleccionar el primero para eliminar
	companionToDelete := companions[0]
	fmt.Printf("\n⚠️  Se eliminará: %s (ID: %d)\n", companionToDelete.FullName, companionToDelete.ID)

	fmt.Print("¿Confirmar eliminación? (s/n): ")
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	if strings.TrimSpace(strings.ToLower(input)) != "s" {
		return nil
	}

	if err := t.visitUC.DeleteCompanion(ctx, visit.ID, companionToDelete.ID); err != nil {
		return err
	}

	fmt.Println("\n✅ Acompañante eliminado exitosamente")

	return nil
}

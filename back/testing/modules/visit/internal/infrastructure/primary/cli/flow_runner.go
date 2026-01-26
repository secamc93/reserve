package cli

import (
	"context"
	"fmt"
	"strings"
	"time"

	"reserve/testing/modules/visit/internal/application"
	"reserve/testing/modules/visit/internal/application/usecases"
	"reserve/testing/modules/visit/internal/domain"
	"reserve/testing/modules/visit/internal/infrastructure/secondary/faker"
	"reserve/testing/modules/visit/internal/infrastructure/secondary/repository"
)

// Colores para el reporte
const (
	colorSuccess = "\033[32m" // Verde
	colorError   = "\033[31m" // Rojo
	colorWarning = "\033[33m" // Amarillo
	colorInfo    = "\033[36m" // Cyan
	colorBold    = "\033[1m"
)

// StepResult representa el resultado de un paso
type StepResult struct {
	Name      string
	Success   bool
	Duration  time.Duration
	Error     string
	ErrorFull string // Error completo de la API para el reporte
	Details   string
	CreatedID uint
	// Info de la API para mostrar en errores
	APIMethod string
	APIPath   string
}

// FlowReport representa el reporte final del flujo
type FlowReport struct {
	TotalSteps    int
	SuccessSteps  int
	FailedSteps   int
	SkippedSteps  int
	TotalDuration time.Duration
	Steps         []StepResult
}

// FlowRunner ejecuta flujos de prueba automatizados
type FlowRunner struct {
	visitorUC *usecases.VisitorUseCases
	visitUC   *usecases.VisitUseCases
	catalogUC *usecases.CatalogUseCases
	repo      *repository.VisitRepository
	faker     *faker.Faker
	state     *StateManager

	// Datos del flujo actual
	createdVisitorID   uint
	createdVisitorDNI  string
	createdVisitID     uint
	createdVisitQR     string
	createdCompanionID uint

	// Reporte
	report FlowReport
}

// NewFlowRunner crea una nueva instancia de FlowRunner
func NewFlowRunner(
	visitorUC *usecases.VisitorUseCases,
	visitUC *usecases.VisitUseCases,
	catalogUC *usecases.CatalogUseCases,
	repo *repository.VisitRepository,
	state *StateManager,
) *FlowRunner {
	return &FlowRunner{
		visitorUC: visitorUC,
		visitUC:   visitUC,
		catalogUC: catalogUC,
		repo:      repo,
		faker:     faker.New(),
		state:     state,
		report: FlowReport{
			Steps: make([]StepResult, 0),
		},
	}
}

// RunCompleteFlow ejecuta el flujo completo de pruebas
func (f *FlowRunner) RunCompleteFlow() {
	fmt.Println("\n" + strings.Repeat("═", 60))
	fmt.Printf("%s🚀 FLUJO AUTOMATIZADO DE PRUEBAS - VISITAS%s\n", colorBold, colorReset)
	fmt.Println(strings.Repeat("═", 60))
	fmt.Println()
	fmt.Println("Este flujo ejecutará todas las APIs del módulo de visitas")
	fmt.Println("en orden lógico, creando y reutilizando datos automáticamente.")
	fmt.Println()
	fmt.Printf("Business ID: %d\n", f.state.GetBusinessID())
	fmt.Println()
	fmt.Println(strings.Repeat("-", 60))

	startTime := time.Now()

	// Ejecutar pasos en orden
	f.step01_ListVisitTypes()
	f.step02_ListVisitStatuses()
	f.step03_CreateVisitor()
	f.step04_SearchVisitor()
	f.step05_CreateVisit()
	f.step06_ListVisits()
	f.step07_GetVisitByID()
	f.step08_GetVisitByQR()
	f.step09_RegisterEntry()
	f.step10_CreateCompanion()
	f.step11_ListCompanions()
	f.step12_RegisterAssets()
	f.step13_RegisterExit()
	f.step14_UpdateVisit()
	// Opcional: eliminar datos creados
	// f.step15_DeleteCompanion()
	// f.step16_DeleteVisit()

	f.report.TotalDuration = time.Since(startTime)

	// Mostrar reporte final
	f.printReport()
}

func (f *FlowRunner) addResult(result StepResult) {
	f.report.Steps = append(f.report.Steps, result)
	f.report.TotalSteps++
	if result.Success {
		f.report.SuccessSteps++
	} else if result.Error == "SKIPPED" {
		f.report.SkippedSteps++
	} else {
		f.report.FailedSteps++
	}
}

func (f *FlowRunner) printStepStart(stepNum int, name string) {
	fmt.Printf("\n%s[%02d]%s %s%s%s\n", colorInfo, stepNum, colorReset, colorBold, name, colorReset)
	fmt.Print("     ")
}

func (f *FlowRunner) printStepResult(success bool, message string) {
	if success {
		fmt.Printf("%s✓%s %s\n", colorSuccess, colorReset, message)
	} else {
		fmt.Printf("%s✗%s %s\n", colorError, colorReset, message)
	}
}

// ══════════════════════════════════════════════════════════════
// PASOS DEL FLUJO
// ══════════════════════════════════════════════════════════════

func (f *FlowRunner) step01_ListVisitTypes() {
	f.printStepStart(1, "GET /visits/types - Listar tipos de visita")
	start := time.Now()

	ctx := context.Background()
	types, err := f.catalogUC.ListVisitTypes(ctx)

	result := StepResult{
		Name:      "Listar tipos de visita",
		Duration:  time.Since(start),
		APIMethod: "GET",
		APIPath:   "/horizontal-properties/visits/types",
	}

	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		result.Success = true
		result.Details = fmt.Sprintf("%d tipos encontrados", len(types))
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step02_ListVisitStatuses() {
	f.printStepStart(2, "GET /visits/statuses - Listar estados de visita")
	start := time.Now()

	ctx := context.Background()
	statuses, err := f.catalogUC.ListVisitStatuses(ctx)

	result := StepResult{
		Name:      "Listar estados de visita",
		Duration:  time.Since(start),
		APIMethod: "GET",
		APIPath:   "/horizontal-properties/visits/statuses",
	}

	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		result.Success = true
		result.Details = fmt.Sprintf("%d estados encontrados", len(statuses))
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step03_CreateVisitor() {
	f.printStepStart(3, "POST /visitors - Crear visitante")
	start := time.Now()

	ctx := context.Background()

	// Generar datos únicos
	var generated faker.Visitor
	for i := 0; i < 10; i++ {
		generated = f.faker.GenerateVisitor()
		exists, _ := f.repo.VisitorExistsByDNI(ctx, generated.DNI)
		if !exists {
			break
		}
	}

	dto := application.CreateVisitorDTO{
		DNI:      generated.DNI,
		FullName: generated.FullName,
		Phone:    generated.Phone,
		Email:    generated.Email,
	}

	result := StepResult{
		Name:      "Crear visitante",
		Duration:  time.Since(start),
		APIMethod: "POST",
		APIPath:   "/horizontal-properties/visits/visitors",
	}

	visitor, err := f.visitorUC.CreateVisitor(ctx, dto)
	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		f.createdVisitorID = visitor.ID
		f.createdVisitorDNI = visitor.DNI
		result.Success = true
		result.CreatedID = visitor.ID
		result.Details = fmt.Sprintf("ID: %d | DNI: %s | %s", visitor.ID, visitor.DNI, visitor.FullName)
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step04_SearchVisitor() {
	f.printStepStart(4, "GET /search-visitor - Buscar visitante por DNI")
	start := time.Now()

	result := StepResult{
		Name:      "Buscar visitante por DNI",
		Duration:  time.Since(start),
		APIMethod: "GET",
		APIPath:   "/horizontal-properties/visits/search-visitor?dni=" + f.createdVisitorDNI,
	}

	if f.createdVisitorDNI == "" {
		result.Success = false
		result.Error = "SKIPPED"
		result.Details = "No hay DNI del paso anterior"
		f.printStepResult(false, "Saltado - No hay DNI previo")
		f.addResult(result)
		return
	}

	ctx := context.Background()
	visitor, err := f.visitorUC.SearchVisitorByDNI(ctx, f.createdVisitorDNI)

	result.Duration = time.Since(start)

	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		result.Success = true
		result.Details = fmt.Sprintf("Encontrado: %s (ID: %d)", visitor.FullName, visitor.ID)
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step05_CreateVisit() {
	f.printStepStart(5, "POST /visits - Crear visita")
	start := time.Now()

	ctx := context.Background()
	businessID := f.state.GetBusinessID()

	result := StepResult{
		Name:      "Crear visita",
		APIMethod: "POST",
		APIPath:   "/horizontal-properties/visits",
	}

	// Obtener unidad y tipo aleatorios
	unit, err := f.repo.GetRandomPropertyUnit(ctx, businessID)
	if err != nil {
		result.Success = false
		result.Error = "No hay unidades en este negocio"
		result.Duration = time.Since(start)
		f.printStepResult(false, result.Error)
		f.addResult(result)
		return
	}

	visitType, err := f.repo.GetRandomVisitType(ctx)
	if err != nil {
		result.Success = false
		result.Error = "No hay tipos de visita"
		result.Duration = time.Since(start)
		f.printStepResult(false, result.Error)
		f.addResult(result)
		return
	}

	// Si no tenemos visitor, obtener uno existente
	visitorID := f.createdVisitorID
	if visitorID == 0 {
		visitor, err := f.repo.GetRandomVisitor(ctx)
		if err != nil {
			result.Success = false
			result.Error = "No hay visitantes disponibles"
			result.Duration = time.Since(start)
			f.printStepResult(false, result.Error)
			f.addResult(result)
			return
		}
		visitorID = visitor.ID
	}

	// Generar fecha y hora consistentes
	scheduled := f.faker.GenerateScheduledDateTime()

	dto := application.CreateVisitDTO{
		VisitorID:          visitorID,
		PropertyUnitID:     unit.ID,
		VisitTypeID:        visitType.ID,
		ScheduledDate:      scheduled.Date,
		ScheduledStartTime: scheduled.StartTime,
		Purpose:            f.faker.GeneratePurpose(),
		NumberOfVisitors:   f.faker.GenerateNumberOfVisitors(),
		NotifyResident:     true,
		NotifySecurity:     true,
	}

	visit, err := f.visitUC.CreateVisit(ctx, dto)
	result.Duration = time.Since(start)

	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		f.createdVisitID = visit.ID
		f.createdVisitQR = visit.QRCode
		result.Success = true
		result.CreatedID = visit.ID
		result.Details = fmt.Sprintf("ID: %d | QR: %s", visit.ID, visit.QRCode)
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step06_ListVisits() {
	f.printStepStart(6, "GET /visits - Listar visitas")
	start := time.Now()

	ctx := context.Background()
	visits, err := f.visitUC.ListVisits(ctx)

	result := StepResult{
		Name:      "Listar visitas",
		Duration:  time.Since(start),
		APIMethod: "GET",
		APIPath:   "/horizontal-properties/visits",
	}

	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		result.Success = true
		result.Details = fmt.Sprintf("%d visitas encontradas", len(visits))
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step07_GetVisitByID() {
	f.printStepStart(7, "GET /visits/{id} - Obtener visita por ID")
	start := time.Now()

	result := StepResult{
		Name:      "Obtener visita por ID",
		APIMethod: "GET",
		APIPath:   fmt.Sprintf("/horizontal-properties/visits/%d", f.createdVisitID),
	}

	if f.createdVisitID == 0 {
		result.Success = false
		result.Error = "SKIPPED"
		result.Details = "No hay visit ID del paso anterior"
		result.Duration = time.Since(start)
		f.printStepResult(false, "Saltado - No hay visit ID previo")
		f.addResult(result)
		return
	}

	ctx := context.Background()
	visit, err := f.visitUC.GetVisitByID(ctx, f.createdVisitID)
	result.Duration = time.Since(start)

	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		result.Success = true
		result.Details = fmt.Sprintf("Visit ID: %d obtenida correctamente", visit.ID)
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step08_GetVisitByQR() {
	f.printStepStart(8, "GET /visits/qr/{qr} - Obtener visita por QR")
	start := time.Now()

	result := StepResult{
		Name:      "Obtener visita por QR",
		APIMethod: "GET",
		APIPath:   fmt.Sprintf("/horizontal-properties/visits/qr/%s", f.createdVisitQR),
	}

	if f.createdVisitQR == "" {
		result.Success = false
		result.Error = "SKIPPED"
		result.Details = "No hay QR del paso anterior"
		result.Duration = time.Since(start)
		f.printStepResult(false, "Saltado - No hay QR previo")
		f.addResult(result)
		return
	}

	ctx := context.Background()
	visit, err := f.visitUC.GetVisitByQR(ctx, f.createdVisitQR)
	result.Duration = time.Since(start)

	if err != nil {
		if err == domain.ErrVisitNotFound {
			result.Success = false
			result.Error = "Visita no encontrada por QR"
		} else {
			result.Success = false
			result.Error = err.Error()
		}
		f.printStepResult(false, result.Error)
	} else {
		result.Success = true
		result.Details = fmt.Sprintf("Encontrada por QR: %s", visit.QRCode)
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step09_RegisterEntry() {
	f.printStepStart(9, "POST /visits/{id}/register-entry - Registrar entrada")
	start := time.Now()

	result := StepResult{
		Name:      "Registrar entrada",
		APIMethod: "POST",
		APIPath:   fmt.Sprintf("/horizontal-properties/visits/%d/register-entry", f.createdVisitID),
	}

	if f.createdVisitID == 0 {
		result.Success = false
		result.Error = "SKIPPED"
		result.Duration = time.Since(start)
		f.printStepResult(false, "Saltado - No hay visit ID")
		f.addResult(result)
		return
	}

	ctx := context.Background()
	dto := application.EntryRequestDTO{
		VisitID: f.createdVisitID,
		Gate:    f.faker.GenerateGate(),
		Method:  f.faker.GenerateEntryMethod(),
	}

	err := f.visitUC.RegisterEntry(ctx, dto)
	result.Duration = time.Since(start)

	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		result.Success = true
		result.Details = fmt.Sprintf("Entrada registrada en %s", dto.Gate)
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step10_CreateCompanion() {
	f.printStepStart(10, "POST /visits/{id}/companions - Crear acompañante")
	start := time.Now()

	result := StepResult{
		Name:      "Crear acompañante",
		APIMethod: "POST",
		APIPath:   fmt.Sprintf("/horizontal-properties/visits/%d/companions", f.createdVisitID),
	}

	if f.createdVisitID == 0 {
		result.Success = false
		result.Error = "SKIPPED"
		result.Duration = time.Since(start)
		f.printStepResult(false, "Saltado - No hay visit ID")
		f.addResult(result)
		return
	}

	ctx := context.Background()
	companion := f.faker.GenerateCompanion()
	dto := application.CreateCompanionDTO{
		DNI:      companion.DNI,
		FullName: companion.FullName,
	}

	created, err := f.visitUC.CreateCompanion(ctx, f.createdVisitID, dto)
	result.Duration = time.Since(start)

	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		if created != nil {
			f.createdCompanionID = created.ID
		}
		result.Success = true
		result.Details = fmt.Sprintf("Acompañante: %s | DNI: %s", companion.FullName, companion.DNI)
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step11_ListCompanions() {
	f.printStepStart(11, "GET /visits/{id}/companions - Listar acompañantes")
	start := time.Now()

	result := StepResult{
		Name:      "Listar acompañantes",
		APIMethod: "GET",
		APIPath:   fmt.Sprintf("/horizontal-properties/visits/%d/companions", f.createdVisitID),
	}

	if f.createdVisitID == 0 {
		result.Success = false
		result.Error = "SKIPPED"
		result.Duration = time.Since(start)
		f.printStepResult(false, "Saltado - No hay visit ID")
		f.addResult(result)
		return
	}

	ctx := context.Background()
	companions, err := f.visitUC.ListCompanions(ctx, f.createdVisitID)
	result.Duration = time.Since(start)

	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		result.Success = true
		result.Details = fmt.Sprintf("%d acompañantes encontrados", len(companions))
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step12_RegisterAssets() {
	f.printStepStart(12, "POST /visits/{id}/assets - Registrar activos")
	start := time.Now()

	result := StepResult{
		Name:      "Registrar activos",
		APIMethod: "POST",
		APIPath:   fmt.Sprintf("/horizontal-properties/visits/%d/assets", f.createdVisitID),
	}

	if f.createdVisitID == 0 {
		result.Success = false
		result.Error = "SKIPPED"
		result.Duration = time.Since(start)
		f.printStepResult(false, "Saltado - No hay visit ID")
		f.addResult(result)
		return
	}

	ctx := context.Background()
	dto := application.RegisterAssetDTO{
		Description: f.faker.GenerateAssetDescription(),
		Brand:       f.faker.GenerateAssetBrand(),
	}

	_, err := f.visitUC.RegisterAssets(ctx, f.createdVisitID, dto)
	result.Duration = time.Since(start)

	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		result.Success = true
		result.Details = fmt.Sprintf("%s (%s)", dto.Description, dto.Brand)
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step13_RegisterExit() {
	f.printStepStart(13, "POST /visits/{id}/register-exit - Registrar salida")
	start := time.Now()

	result := StepResult{
		Name:      "Registrar salida",
		APIMethod: "POST",
		APIPath:   fmt.Sprintf("/horizontal-properties/visits/%d/register-exit", f.createdVisitID),
	}

	if f.createdVisitID == 0 {
		result.Success = false
		result.Error = "SKIPPED"
		result.Duration = time.Since(start)
		f.printStepResult(false, "Saltado - No hay visit ID")
		f.addResult(result)
		return
	}

	ctx := context.Background()
	dto := application.ExitRequestDTO{
		VisitID: f.createdVisitID,
		Gate:    f.faker.GenerateGate(),
	}

	err := f.visitUC.RegisterExit(ctx, dto)
	result.Duration = time.Since(start)

	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		result.Success = true
		result.Details = fmt.Sprintf("Salida registrada en %s", dto.Gate)
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

func (f *FlowRunner) step14_UpdateVisit() {
	f.printStepStart(14, "PUT /visits/{id} - Actualizar visita")
	start := time.Now()

	result := StepResult{
		Name:      "Actualizar visita",
		APIMethod: "PUT",
		APIPath:   fmt.Sprintf("/horizontal-properties/visits/%d", f.createdVisitID),
	}

	if f.createdVisitID == 0 {
		result.Success = false
		result.Error = "SKIPPED"
		result.Duration = time.Since(start)
		f.printStepResult(false, "Saltado - No hay visit ID")
		f.addResult(result)
		return
	}

	ctx := context.Background()
	newPurpose := f.faker.GeneratePurpose() + " (Actualizado)"
	dto := application.UpdateVisitDTO{
		Purpose: newPurpose,
	}

	_, err := f.visitUC.UpdateVisit(ctx, f.createdVisitID, dto)
	result.Duration = time.Since(start)

	if err != nil {
		result.Success = false
		result.Error = err.Error()
		f.printStepResult(false, err.Error())
	} else {
		result.Success = true
		result.Details = fmt.Sprintf("Nuevo propósito: %s", newPurpose)
		f.printStepResult(true, result.Details)
	}

	f.addResult(result)
}

// ══════════════════════════════════════════════════════════════
// REPORTE FINAL
// ══════════════════════════════════════════════════════════════

func (f *FlowRunner) printReport() {
	fmt.Println()
	fmt.Println(strings.Repeat("═", 60))
	fmt.Printf("%s📊 REPORTE FINAL%s\n", colorBold, colorReset)
	fmt.Println(strings.Repeat("═", 60))

	// Estadísticas generales
	fmt.Println()
	fmt.Printf("%-25s %s\n", "Total de pasos:", fmt.Sprintf("%d", f.report.TotalSteps))
	fmt.Printf("%-25s %s%d%s\n", "Exitosos:", colorSuccess, f.report.SuccessSteps, colorReset)
	fmt.Printf("%-25s %s%d%s\n", "Fallidos:", colorError, f.report.FailedSteps, colorReset)
	fmt.Printf("%-25s %s%d%s\n", "Saltados:", colorWarning, f.report.SkippedSteps, colorReset)
	fmt.Printf("%-25s %s\n", "Duración total:", f.report.TotalDuration.Round(time.Millisecond))

	// Porcentaje de éxito
	successRate := float64(f.report.SuccessSteps) / float64(f.report.TotalSteps) * 100
	fmt.Printf("%-25s %.1f%%\n", "Tasa de éxito:", successRate)

	// Detalle de pasos
	fmt.Println()
	fmt.Println(strings.Repeat("-", 60))
	fmt.Printf("%sDETALLE DE PASOS%s\n", colorBold, colorReset)
	fmt.Println(strings.Repeat("-", 60))
	fmt.Println()

	for i, step := range f.report.Steps {
		status := fmt.Sprintf("%s✓%s", colorSuccess, colorReset)
		if !step.Success {
			if step.Error == "SKIPPED" {
				status = fmt.Sprintf("%s⊘%s", colorWarning, colorReset)
			} else {
				status = fmt.Sprintf("%s✗%s", colorError, colorReset)
			}
		}

		fmt.Printf("%s [%02d] %-30s %8s\n", status, i+1, step.Name, step.Duration.Round(time.Millisecond))
		if step.Details != "" && step.Success {
			fmt.Printf("       %s%s%s\n", colorGray, step.Details, colorReset)
		}
		if !step.Success && step.Error != "" && step.Error != "SKIPPED" {
			// Mostrar endpoint que falló
			if step.APIMethod != "" && step.APIPath != "" {
				fmt.Printf("       %sEndpoint: %s %s%s\n", colorGray, step.APIMethod, step.APIPath, colorReset)
			}
			fmt.Printf("       %sError: %s%s\n", colorError, step.Error, colorReset)
		}
	}

	// Datos creados
	fmt.Println()
	fmt.Println(strings.Repeat("-", 60))
	fmt.Printf("%sDATOS CREADOS EN ESTE FLUJO%s\n", colorBold, colorReset)
	fmt.Println(strings.Repeat("-", 60))
	fmt.Println()

	if f.createdVisitorID > 0 {
		fmt.Printf("   Visitor ID:   %d (DNI: %s)\n", f.createdVisitorID, f.createdVisitorDNI)
	}
	if f.createdVisitID > 0 {
		fmt.Printf("   Visit ID:     %d\n", f.createdVisitID)
	}
	if f.createdVisitQR != "" {
		fmt.Printf("   Visit QR:     %s\n", f.createdVisitQR)
	}
	if f.createdCompanionID > 0 {
		fmt.Printf("   Companion ID: %d\n", f.createdCompanionID)
	}

	// Resultado final
	fmt.Println()
	fmt.Println(strings.Repeat("═", 60))
	if f.report.FailedSteps == 0 {
		fmt.Printf("%s✅ FLUJO COMPLETADO EXITOSAMENTE%s\n", colorSuccess+colorBold, colorReset)
	} else {
		fmt.Printf("%s⚠️  FLUJO COMPLETADO CON %d ERRORES%s\n", colorWarning+colorBold, f.report.FailedSteps, colorReset)
	}
	fmt.Println(strings.Repeat("═", 60))
	fmt.Println()
}

package cli

import (
	"bufio"
	"context"
	"fmt"
	"reserve/testing/modules/visit/internal/application/usecases"
	"strings"
)

// DatabaseHandlers maneja las operaciones de BD desde CLI
type DatabaseHandlers struct {
	dbUC         *usecases.DatabaseUseCases
	stateManager *StateManager
}

// NewDatabaseHandlers crea una nueva instancia de DatabaseHandlers
func NewDatabaseHandlers(dbUC *usecases.DatabaseUseCases, sm *StateManager) *DatabaseHandlers {
	return &DatabaseHandlers{
		dbUC:         dbUC,
		stateManager: sm,
	}
}

// ListVisitorsFromDB lista visitantes desde la BD
func (h *DatabaseHandlers) ListVisitorsFromDB() error {
	fmt.Println("\n👥 VISITANTES (Consulta directa a BD)")
	fmt.Println(strings.Repeat("-", 40))

	ctx := context.Background()
	visitors, err := h.dbUC.ListVisitorsFromDB(ctx)
	if err != nil {
		return fmt.Errorf("error consultando visitantes: %w", err)
	}

	if len(visitors) == 0 {
		fmt.Println("\n⚠️  No hay visitantes registrados")
		return nil
	}

	fmt.Printf("\n✅ Se encontraron %d visitantes (últimos 20):\n\n", len(visitors))
	fmt.Printf("%-6s %-15s %-30s %-15s %-30s\n", "ID", "DNI", "Nombre", "Teléfono", "Email")
	fmt.Println(strings.Repeat("-", 100))

	for _, v := range visitors {
		email := v.Email
		if email == "" {
			email = "-"
		}
		fmt.Printf("%-6d %-15s %-30s %-15s %-30s\n",
			v.ID, v.DNI, v.FullName, v.Phone, email)
	}

	return nil
}

// ListVisitsFromDB lista visitas desde la BD
func (h *DatabaseHandlers) ListVisitsFromDB() error {
	fmt.Println("\n📋 VISITAS (Consulta directa a BD)")
	fmt.Println(strings.Repeat("-", 40))

	businessID := h.stateManager.GetBusinessID()
	if businessID == 0 {
		return fmt.Errorf("no hay business_id seleccionado")
	}

	ctx := context.Background()
	visits, err := h.dbUC.ListVisitsFromDB(ctx, businessID)
	if err != nil {
		return fmt.Errorf("error consultando visitas: %w", err)
	}

	if len(visits) == 0 {
		fmt.Println("\n⚠️  No hay visitas registradas para este negocio")
		return nil
	}

	fmt.Printf("\n✅ Se encontraron %d visitas (últimas 20):\n\n", len(visits))
	fmt.Printf("%-6s %-10s %-10s %-8s %-8s %-15s\n",
		"ID", "Visitor", "Unit", "Status", "Type", "Fecha")
	fmt.Println(strings.Repeat("-", 70))

	for _, v := range visits {
		fmt.Printf("%-6d %-10d %-10d %-8d %-8d %-15s\n",
			v.ID, v.VisitorID, v.PropertyUnitID, v.VisitStatusID, v.VisitTypeID,
			v.ScheduledDate)
	}

	return nil
}

// ShowVisitStatistics muestra estadísticas de visitas
func (h *DatabaseHandlers) ShowVisitStatistics() error {
	fmt.Println("\n📊 ESTADÍSTICAS DE VISITAS")
	fmt.Println(strings.Repeat("-", 40))

	businessID := h.stateManager.GetBusinessID()
	if businessID == 0 {
		return fmt.Errorf("no hay business_id seleccionado")
	}

	ctx := context.Background()
	stats, err := h.dbUC.GetVisitStatistics(ctx, businessID)
	if err != nil {
		return fmt.Errorf("error consultando estadísticas: %w", err)
	}

	fmt.Println("\n✅ Estadísticas del negocio:")
	fmt.Printf("\n   Total de visitas:      %d\n", stats.TotalVisits)
	fmt.Printf("   Visitas pendientes:    %d\n", stats.PendingVisits)
	fmt.Printf("   Visitas activas:       %d\n", stats.ActiveVisits)
	fmt.Printf("   Visitas completadas:   %d\n", stats.CompletedVisits)
	fmt.Printf("   Visitas hoy:           %d\n", stats.TodayVisits)
	fmt.Println()

	return nil
}

// ExecuteCustomQuery ejecuta una consulta SQL personalizada
func (h *DatabaseHandlers) ExecuteCustomQuery(reader *bufio.Reader) error {
	fmt.Println("\n💻 CONSULTA SQL PERSONALIZADA")
	fmt.Println(strings.Repeat("-", 40))
	fmt.Println("\n⚠️  ADVERTENCIA: Solo consultas SELECT")
	fmt.Println("   Escribe tu consulta SQL (termina con ;):")
	fmt.Print("\nSQL> ")

	query, _ := reader.ReadString('\n')
	query = strings.TrimSpace(query)

	if query == "" {
		fmt.Println("Consulta vacía, cancelando")
		return nil
	}

	// Validar que sea una consulta SELECT
	if !strings.HasPrefix(strings.ToUpper(query), "SELECT") {
		return fmt.Errorf("solo se permiten consultas SELECT")
	}

	ctx := context.Background()
	results, err := h.dbUC.ExecuteCustomQuery(ctx, query)
	if err != nil {
		return fmt.Errorf("error ejecutando consulta: %w", err)
	}

	if len(results) == 0 {
		fmt.Println("\n⚠️  La consulta no retornó resultados")
		return nil
	}

	fmt.Printf("\n✅ Se encontraron %d registros:\n\n", len(results))

	for i, row := range results {
		fmt.Printf("Registro %d:\n", i+1)
		for key, value := range row {
			fmt.Printf("  %s: %v\n", key, value)
		}
		fmt.Println()
	}

	return nil
}

// CheckDatabaseConnection verifica la conexión a la BD
func (h *DatabaseHandlers) CheckDatabaseConnection() error {
	fmt.Println("\n🔌 VERIFICAR CONEXIÓN A BASE DE DATOS")
	fmt.Println(strings.Repeat("-", 40))

	ctx := context.Background()
	stats, err := h.dbUC.CheckConnection(ctx)
	if err != nil {
		fmt.Printf("\n❌ Error verificando conexión: %v\n", err)
		return err
	}

	fmt.Println("\n✅ Conexión a base de datos activa")
	fmt.Printf("\n   Conexiones abiertas:    %d\n", stats.OpenConnections)
	fmt.Printf("   Conexiones en uso:      %d\n", stats.InUse)
	fmt.Printf("   Conexiones idle:        %d\n", stats.Idle)
	fmt.Printf("   Conexiones esperando:   %d\n", stats.WaitCount)
	fmt.Println()

	return nil
}

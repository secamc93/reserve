package cli

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"

	"reserve/testing/modules/visit/internal/domain"
)

// DataSelector proporciona métodos para seleccionar datos desde BD
type DataSelector struct {
	dbPort       domain.DatabasePort
	stateManager *StateManager
}

// NewDataSelector crea una nueva instancia de DataSelector
func NewDataSelector(dbPort domain.DatabasePort, sm *StateManager) *DataSelector {
	return &DataSelector{
		dbPort:       dbPort,
		stateManager: sm,
	}
}

// SelectVisitor permite seleccionar un visitante existente o ingresar ID manualmente
func (ds *DataSelector) SelectVisitor() (uint, error) {
	reader := bufio.NewReader(os.Stdin)
	ctx := context.Background()

	fmt.Println("\n" + strings.Repeat("-", 50))
	fmt.Println("👤 SELECCIONAR VISITANTE")
	fmt.Println(strings.Repeat("-", 50))
	fmt.Println()
	fmt.Println("[1] Listar visitantes recientes")
	fmt.Println("[2] Ingresar ID manualmente")

	// Si hay un último visitor_id, mostrarlo
	if ds.stateManager.GetLastVisitorID() > 0 {
		fmt.Printf("[3] Usar último seleccionado (ID: %d)\n", ds.stateManager.GetLastVisitorID())
	}

	fmt.Println("[0] Cancelar")

	fmt.Print("\n➤ Opción: ")
	input, _ := reader.ReadString('\n')
	input = strings.TrimSpace(input)

	switch input {
	case "0":
		return 0, fmt.Errorf("operación cancelada")

	case "1":
		// Listar visitantes
		visitors, err := ds.dbPort.ListVisitorsFromDB(ctx)
		if err != nil {
			return 0, fmt.Errorf("error listando visitantes: %w", err)
		}

		if len(visitors) == 0 {
			fmt.Println("\n⚠️  No hay visitantes registrados")
			return 0, fmt.Errorf("no hay visitantes")
		}

		fmt.Println()
		fmt.Printf("%-4s %-15s %-30s %-15s\n", "#", "DNI", "Nombre", "Teléfono")
		fmt.Println(strings.Repeat("-", 70))

		for i, v := range visitors {
			fmt.Printf("%-4d %-15s %-30s %-15s\n", i+1, v.DNI, truncate(v.FullName, 28), v.Phone)
		}

		fmt.Print("\n➤ Seleccione número (1-", len(visitors), "): ")
		selInput, _ := reader.ReadString('\n')
		sel, err := strconv.Atoi(strings.TrimSpace(selInput))
		if err != nil || sel < 1 || sel > len(visitors) {
			return 0, fmt.Errorf("selección inválida")
		}

		selected := visitors[sel-1]
		ds.stateManager.SetLastVisitorID(selected.ID)
		fmt.Printf("\n✓ Visitante seleccionado: %s (ID: %d)\n", selected.FullName, selected.ID)
		return selected.ID, nil

	case "2":
		fmt.Print("Ingrese Visitor ID: ")
		idInput, _ := reader.ReadString('\n')
		id, err := strconv.ParseUint(strings.TrimSpace(idInput), 10, 32)
		if err != nil {
			return 0, fmt.Errorf("ID inválido")
		}
		ds.stateManager.SetLastVisitorID(uint(id))
		return uint(id), nil

	case "3":
		if ds.stateManager.GetLastVisitorID() > 0 {
			return ds.stateManager.GetLastVisitorID(), nil
		}
		return 0, fmt.Errorf("opción inválida")

	default:
		return 0, fmt.Errorf("opción inválida")
	}
}

// SelectPropertyUnit permite seleccionar una property unit
func (ds *DataSelector) SelectPropertyUnit() (uint, error) {
	reader := bufio.NewReader(os.Stdin)
	ctx := context.Background()

	fmt.Println("\n" + strings.Repeat("-", 50))
	fmt.Println("🏠 SELECCIONAR UNIDAD/APARTAMENTO")
	fmt.Println(strings.Repeat("-", 50))
	fmt.Println()
	fmt.Println("[1] Listar unidades")
	fmt.Println("[2] Ingresar ID manualmente")

	if ds.stateManager.GetLastPropertyUnitID() > 0 {
		fmt.Printf("[3] Usar última seleccionada (ID: %d)\n", ds.stateManager.GetLastPropertyUnitID())
	}

	fmt.Println("[0] Cancelar")

	fmt.Print("\n➤ Opción: ")
	input, _ := reader.ReadString('\n')
	input = strings.TrimSpace(input)

	switch input {
	case "0":
		return 0, fmt.Errorf("operación cancelada")

	case "1":
		// Listar property units desde BD
		units, err := ds.dbPort.ListPropertyUnitsFromDB(ctx, ds.stateManager.GetBusinessID())
		if err != nil {
			return 0, fmt.Errorf("error listando unidades: %w", err)
		}

		if len(units) == 0 {
			fmt.Println("\n⚠️  No hay unidades registradas")
			return 0, fmt.Errorf("no hay unidades")
		}

		fmt.Println()
		fmt.Printf("%-4s %-20s %-15s %-20s\n", "#", "Identificador", "Bloque/Torre", "Tipo")
		fmt.Println(strings.Repeat("-", 65))

		for i, u := range units {
			fmt.Printf("%-4d %-20s %-15s %-20s\n", i+1, u.Identifier, u.Block, u.UnitType)
		}

		fmt.Print("\n➤ Seleccione número (1-", len(units), "): ")
		selInput, _ := reader.ReadString('\n')
		sel, err := strconv.Atoi(strings.TrimSpace(selInput))
		if err != nil || sel < 1 || sel > len(units) {
			return 0, fmt.Errorf("selección inválida")
		}

		selected := units[sel-1]
		ds.stateManager.SetLastPropertyUnitID(selected.ID)
		fmt.Printf("\n✓ Unidad seleccionada: %s (ID: %d)\n", selected.Identifier, selected.ID)
		return selected.ID, nil

	case "2":
		fmt.Print("Ingrese Property Unit ID: ")
		idInput, _ := reader.ReadString('\n')
		id, err := strconv.ParseUint(strings.TrimSpace(idInput), 10, 32)
		if err != nil {
			return 0, fmt.Errorf("ID inválido")
		}
		ds.stateManager.SetLastPropertyUnitID(uint(id))
		return uint(id), nil

	case "3":
		if ds.stateManager.GetLastPropertyUnitID() > 0 {
			return ds.stateManager.GetLastPropertyUnitID(), nil
		}
		return 0, fmt.Errorf("opción inválida")

	default:
		return 0, fmt.Errorf("opción inválida")
	}
}

// SelectVisit permite seleccionar una visita existente
func (ds *DataSelector) SelectVisit() (uint, error) {
	reader := bufio.NewReader(os.Stdin)
	ctx := context.Background()

	fmt.Println("\n" + strings.Repeat("-", 50))
	fmt.Println("📋 SELECCIONAR VISITA")
	fmt.Println(strings.Repeat("-", 50))
	fmt.Println()
	fmt.Println("[1] Listar visitas recientes")
	fmt.Println("[2] Ingresar ID manualmente")

	if ds.stateManager.GetLastVisitID() > 0 {
		fmt.Printf("[3] Usar última seleccionada (ID: %d)\n", ds.stateManager.GetLastVisitID())
	}

	fmt.Println("[0] Cancelar")

	fmt.Print("\n➤ Opción: ")
	input, _ := reader.ReadString('\n')
	input = strings.TrimSpace(input)

	switch input {
	case "0":
		return 0, fmt.Errorf("operación cancelada")

	case "1":
		visits, err := ds.dbPort.ListVisitsFromDB(ctx, ds.stateManager.GetBusinessID())
		if err != nil {
			return 0, fmt.Errorf("error listando visitas: %w", err)
		}

		if len(visits) == 0 {
			fmt.Println("\n⚠️  No hay visitas registradas")
			return 0, fmt.Errorf("no hay visitas")
		}

		fmt.Println()
		fmt.Printf("%-4s %-8s %-10s %-10s %-20s\n", "#", "ID", "Visitor", "Unit", "Propósito")
		fmt.Println(strings.Repeat("-", 60))

		for i, v := range visits {
			fmt.Printf("%-4d %-8d %-10d %-10d %-20s\n", i+1, v.ID, v.VisitorID, v.PropertyUnitID, truncate(v.Purpose, 18))
		}

		fmt.Print("\n➤ Seleccione número (1-", len(visits), "): ")
		selInput, _ := reader.ReadString('\n')
		sel, err := strconv.Atoi(strings.TrimSpace(selInput))
		if err != nil || sel < 1 || sel > len(visits) {
			return 0, fmt.Errorf("selección inválida")
		}

		selected := visits[sel-1]
		ds.stateManager.SetLastVisitID(selected.ID)
		fmt.Printf("\n✓ Visita seleccionada: ID %d\n", selected.ID)
		return selected.ID, nil

	case "2":
		fmt.Print("Ingrese Visit ID: ")
		idInput, _ := reader.ReadString('\n')
		id, err := strconv.ParseUint(strings.TrimSpace(idInput), 10, 32)
		if err != nil {
			return 0, fmt.Errorf("ID inválido")
		}
		ds.stateManager.SetLastVisitID(uint(id))
		return uint(id), nil

	case "3":
		if ds.stateManager.GetLastVisitID() > 0 {
			return ds.stateManager.GetLastVisitID(), nil
		}
		return 0, fmt.Errorf("opción inválida")

	default:
		return 0, fmt.Errorf("opción inválida")
	}
}

// SelectVisitType permite seleccionar un tipo de visita
func (ds *DataSelector) SelectVisitType() (uint, error) {
	reader := bufio.NewReader(os.Stdin)
	ctx := context.Background()

	fmt.Println("\n" + strings.Repeat("-", 50))
	fmt.Println("📝 SELECCIONAR TIPO DE VISITA")
	fmt.Println(strings.Repeat("-", 50))

	types, err := ds.dbPort.ListVisitTypesFromDB(ctx)
	if err != nil {
		return 0, fmt.Errorf("error listando tipos: %w", err)
	}

	if len(types) == 0 {
		fmt.Println("\n⚠️  No hay tipos de visita registrados")
		return 0, fmt.Errorf("no hay tipos de visita")
	}

	fmt.Println()
	for i, t := range types {
		fmt.Printf("[%d] %s\n", i+1, t.Name)
	}
	fmt.Println("[0] Cancelar")

	fmt.Print("\n➤ Seleccione tipo: ")
	selInput, _ := reader.ReadString('\n')
	sel, err := strconv.Atoi(strings.TrimSpace(selInput))
	if err != nil || sel < 0 || sel > len(types) {
		return 0, fmt.Errorf("selección inválida")
	}

	if sel == 0 {
		return 0, fmt.Errorf("operación cancelada")
	}

	selected := types[sel-1]
	fmt.Printf("\n✓ Tipo seleccionado: %s\n", selected.Name)
	return selected.ID, nil
}

// truncate trunca un string a una longitud máxima
func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen-2] + ".."
}

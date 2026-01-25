package cli

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

// MenuHandlers agrupa todos los handlers y maneja los menús interactivos
type MenuHandlers struct {
	visitor  *VisitorHandlers
	visit    *VisitHandlers
	catalog  *CatalogHandlers
	database *DatabaseHandlers
	state    *StateManager
}

// NewMenuHandlers crea una nueva instancia de MenuHandlers
func NewMenuHandlers(
	visitor *VisitorHandlers,
	visit *VisitHandlers,
	catalog *CatalogHandlers,
	database *DatabaseHandlers,
	state *StateManager,
) *MenuHandlers {
	return &MenuHandlers{
		visitor:  visitor,
		visit:    visit,
		catalog:  catalog,
		database: database,
		state:    state,
	}
}

// ShowMainMenu muestra el menú principal
func (m *MenuHandlers) ShowMainMenu() {
	reader := bufio.NewReader(os.Stdin)

	for {
		fmt.Println("\n" + strings.Repeat("=", 60))
		fmt.Println("🚪 MENÚ PRINCIPAL - MÓDULO VISIT")
		fmt.Println(strings.Repeat("=", 60))
		fmt.Println()
		fmt.Println("[1] Gestión de Visitantes")
		fmt.Println("[2] Gestión de Visitas")
		fmt.Println("[3] Registro de Entradas/Salidas")
		fmt.Println("[4] Acompañantes y Activos")
		fmt.Println("[5] Catálogos (Tipos, Estados)")
		fmt.Println("[6] Flujo Completo de Visita")
		fmt.Println("[7] Consultas a Base de Datos")
		fmt.Println("[8] Ver Estado Actual")
		fmt.Println("[0] Salir")

		fmt.Print("\n➤ Seleccione una opción: ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)

		switch input {
		case "0":
			fmt.Println("\n👋 Saliendo del módulo visit...")
			return
		case "1":
			m.showVisitorMenu(reader)
		case "2":
			m.showVisitMenu(reader)
		case "3":
			m.showEntryExitMenu(reader)
		case "4":
			m.showCompanionAssetMenu(reader)
		case "5":
			m.showCatalogMenu(reader)
		case "6":
			m.runCompleteVisitFlow()
		case "7":
			m.showDatabaseMenu(reader)
		case "8":
			m.showCurrentState()
		default:
			fmt.Println("\n❌ Opción inválida")
		}
	}
}

func (m *MenuHandlers) showVisitorMenu(reader *bufio.Reader) {
	for {
		fmt.Println("\n" + strings.Repeat("-", 60))
		fmt.Println("👤 GESTIÓN DE VISITANTES")
		fmt.Println(strings.Repeat("-", 60))
		fmt.Println()
		fmt.Println("[1] Crear Visitante")
		fmt.Println("[2] Buscar Visitante por DNI")
		fmt.Println("[0] Volver")

		fmt.Print("\n➤ Seleccione una opción: ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)

		switch input {
		case "0":
			return
		case "1":
			if err := m.visitor.CreateVisitor(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "2":
			if err := m.visitor.SearchVisitor(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		default:
			fmt.Println("\n❌ Opción inválida")
		}
	}
}

func (m *MenuHandlers) showVisitMenu(reader *bufio.Reader) {
	for {
		fmt.Println("\n" + strings.Repeat("-", 60))
		fmt.Println("📝 GESTIÓN DE VISITAS")
		fmt.Println(strings.Repeat("-", 60))
		fmt.Println()
		fmt.Println("[1] Crear Visita")
		fmt.Println("[2] Listar Visitas")
		fmt.Println("[3] Obtener Visita por ID")
		fmt.Println("[4] Buscar Visita por QR")
		fmt.Println("[0] Volver")

		fmt.Print("\n➤ Seleccione una opción: ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)

		switch input {
		case "0":
			return
		case "1":
			if err := m.visit.CreateVisit(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "2":
			if err := m.visit.ListVisits(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "3":
			if err := m.visit.GetVisitByID(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "4":
			if err := m.visit.GetVisitByQR(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		default:
			fmt.Println("\n❌ Opción inválida")
		}
	}
}

func (m *MenuHandlers) showEntryExitMenu(reader *bufio.Reader) {
	for {
		fmt.Println("\n" + strings.Repeat("-", 60))
		fmt.Println("🚦 REGISTRO DE ENTRADAS/SALIDAS")
		fmt.Println(strings.Repeat("-", 60))
		fmt.Println()
		fmt.Println("[1] Registrar Entrada")
		fmt.Println("[2] Registrar Salida")
		fmt.Println("[0] Volver")

		fmt.Print("\n➤ Seleccione una opción: ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)

		switch input {
		case "0":
			return
		case "1":
			if err := m.visit.RegisterEntry(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "2":
			if err := m.visit.RegisterExit(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		default:
			fmt.Println("\n❌ Opción inválida")
		}
	}
}

func (m *MenuHandlers) showCompanionAssetMenu(reader *bufio.Reader) {
	for {
		fmt.Println("\n" + strings.Repeat("-", 60))
		fmt.Println("👥 ACOMPAÑANTES Y ACTIVOS")
		fmt.Println(strings.Repeat("-", 60))
		fmt.Println()
		fmt.Println("[1] Listar Acompañantes")
		fmt.Println("[2] Crear Acompañante")
		fmt.Println("[3] Registrar Activos")
		fmt.Println("[0] Volver")

		fmt.Print("\n➤ Seleccione una opción: ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)

		switch input {
		case "0":
			return
		case "1":
			if err := m.visit.ListCompanions(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "2":
			if err := m.visit.CreateCompanion(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "3":
			if err := m.visit.RegisterAssets(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		default:
			fmt.Println("\n❌ Opción inválida")
		}
	}
}

func (m *MenuHandlers) showCatalogMenu(reader *bufio.Reader) {
	for {
		fmt.Println("\n" + strings.Repeat("-", 60))
		fmt.Println("📊 CATÁLOGOS")
		fmt.Println(strings.Repeat("-", 60))
		fmt.Println()
		fmt.Println("[1] Listar Tipos de Visita")
		fmt.Println("[2] Listar Estados de Visita")
		fmt.Println("[0] Volver")

		fmt.Print("\n➤ Seleccione una opción: ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)

		switch input {
		case "0":
			return
		case "1":
			if err := m.catalog.ListVisitTypes(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "2":
			if err := m.catalog.ListVisitStatuses(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		default:
			fmt.Println("\n❌ Opción inválida")
		}
	}
}

func (m *MenuHandlers) runCompleteVisitFlow() {
	fmt.Println("\n" + strings.Repeat("=", 60))
	fmt.Println("🔄 FLUJO COMPLETO DE VISITA")
	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("\nEste flujo ejecutará:")
	fmt.Println("1. Buscar/Crear visitante")
	fmt.Println("2. Crear visita")
	fmt.Println("3. Registrar entrada")
	fmt.Println("4. Registrar salida")
	fmt.Println()

	reader := bufio.NewReader(os.Stdin)
	fmt.Print("¿Desea continuar? (s/n): ")
	input, _ := reader.ReadString('\n')
	input = strings.TrimSpace(strings.ToLower(input))

	if input != "s" && input != "y" {
		fmt.Println("Flujo cancelado")
		return
	}

	// Paso 1: Crear visitante
	fmt.Println("\n--- Paso 1/4: Crear Visitante ---")
	if err := m.visitor.CreateVisitor(); err != nil {
		fmt.Printf("❌ Error creando visitante: %v\n", err)
		return
	}

	// Paso 2: Crear visita
	fmt.Println("\n--- Paso 2/4: Crear Visita ---")
	if err := m.visit.CreateVisit(); err != nil {
		fmt.Printf("❌ Error creando visita: %v\n", err)
		return
	}

	// Paso 3: Registrar entrada
	fmt.Println("\n--- Paso 3/4: Registrar Entrada ---")
	if err := m.visit.RegisterEntry(); err != nil {
		fmt.Printf("❌ Error registrando entrada: %v\n", err)
		return
	}

	// Paso 4: Registrar salida
	fmt.Println("\n--- Paso 4/4: Registrar Salida ---")
	fmt.Print("Presione ENTER para continuar con la salida...")
	reader.ReadString('\n')

	if err := m.visit.RegisterExit(); err != nil {
		fmt.Printf("❌ Error registrando salida: %v\n", err)
		return
	}

	fmt.Println("\n✅ ¡Flujo completo ejecutado exitosamente!")
}

func (m *MenuHandlers) showDatabaseMenu(reader *bufio.Reader) {
	if m.database == nil {
		fmt.Println("\n❌ Conexión a base de datos no disponible")
		fmt.Println("   Asegúrate de que las variables DB_* estén configuradas en .env")
		return
	}

	for {
		fmt.Println("\n" + strings.Repeat("-", 60))
		fmt.Println("💾 CONSULTAS A BASE DE DATOS")
		fmt.Println(strings.Repeat("-", 60))
		fmt.Println()
		fmt.Println("[1] Listar Visitantes (Tabla visitor)")
		fmt.Println("[2] Listar Visitas (Tabla visit)")
		fmt.Println("[3] Consulta SQL Personalizada")
		fmt.Println("[4] Estadísticas de Visitas")
		fmt.Println("[5] Verificar Conexión a BD")
		fmt.Println("[0] Volver")

		fmt.Print("\n➤ Seleccione una opción: ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)

		switch input {
		case "0":
			return
		case "1":
			if err := m.database.ListVisitorsFromDB(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "2":
			if err := m.database.ListVisitsFromDB(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "3":
			if err := m.database.ExecuteCustomQuery(reader); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "4":
			if err := m.database.ShowVisitStatistics(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "5":
			if err := m.database.CheckDatabaseConnection(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		default:
			fmt.Println("\n❌ Opción inválida")
		}
	}
}

func (m *MenuHandlers) showCurrentState() {
	fmt.Println("\n" + strings.Repeat("=", 60))
	fmt.Println("📊 ESTADO ACTUAL")
	fmt.Println(strings.Repeat("=", 60))
	fmt.Printf("\nBusiness ID: %d\n", m.state.GetBusinessID())
	fmt.Printf("Último Visitor ID: %d\n", m.state.GetLastVisitorID())
	fmt.Printf("Última Visit ID: %d\n", m.state.GetLastVisitID())
	fmt.Printf("Última Property Unit ID: %d\n", m.state.GetLastPropertyUnitID())
	fmt.Println()
}

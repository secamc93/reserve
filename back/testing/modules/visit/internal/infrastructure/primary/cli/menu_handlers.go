package cli

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

// Colores ANSI para métodos HTTP
const (
	colorReset  = "\033[0m"
	colorGreen  = "\033[32m" // GET
	colorYellow = "\033[33m" // POST
	colorBlue   = "\033[34m" // PUT
	colorRed    = "\033[31m" // DELETE
	colorCyan   = "\033[36m" // PATCH
	colorGray   = "\033[90m" // Descripción
)

// MenuHandlers agrupa todos los handlers y maneja los menús interactivos
type MenuHandlers struct {
	autoTester *AutoTester
	flowRunner *FlowRunner
	catalog    *CatalogHandlers
	state      *StateManager
}

// NewMenuHandlers crea una nueva instancia de MenuHandlers
func NewMenuHandlers(
	autoTester *AutoTester,
	flowRunner *FlowRunner,
	catalog *CatalogHandlers,
	state *StateManager,
) *MenuHandlers {
	return &MenuHandlers{
		autoTester: autoTester,
		flowRunner: flowRunner,
		catalog:    catalog,
		state:      state,
	}
}

// ShowMainMenu muestra el menú principal
func (m *MenuHandlers) ShowMainMenu() {
	reader := bufio.NewReader(os.Stdin)

	for {
		fmt.Println("\n" + strings.Repeat("=", 60))
		fmt.Println("🚪 MÓDULO VISIT - PRUEBAS AUTOMÁTICAS")
		fmt.Println(strings.Repeat("=", 60))
		fmt.Println()
		fmt.Println("[1] APIs / Endpoints (pruebas individuales)")
		fmt.Println("[2] 🚀 Flujo Automatizado Completo")
		fmt.Println("[0] Salir")

		fmt.Print("\n➤ Seleccione una opción: ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)

		switch input {
		case "0":
			fmt.Println("\n👋 Saliendo del módulo visit...")
			return
		case "1":
			m.showEndpointsMenu(reader)
		case "2":
			m.flowRunner.RunCompleteFlow()
		default:
			fmt.Println("\n❌ Opción inválida")
		}
	}
}

func (m *MenuHandlers) showEndpointsMenu(reader *bufio.Reader) {
	for {
		fmt.Println("\n" + strings.Repeat("=", 60))
		fmt.Println("🌐 APIs / ENDPOINTS - MODO AUTOMÁTICO")
		fmt.Println(strings.Repeat("=", 60))
		fmt.Println()
		fmt.Println("── VISITANTES ──")
		fmt.Printf("[1]  %sPOST%s   /visitors                    %sCrear visitante%s\n", colorYellow, colorReset, colorGray, colorReset)
		fmt.Printf("[2]  %sGET%s    /search-visitor?dni=         %sBuscar por DNI%s\n", colorGreen, colorReset, colorGray, colorReset)
		fmt.Println()
		fmt.Println("── VISITAS ──")
		fmt.Printf("[3]  %sPOST%s   /visits                      %sCrear visita%s\n", colorYellow, colorReset, colorGray, colorReset)
		fmt.Printf("[4]  %sGET%s    /visits                      %sListar visitas%s\n", colorGreen, colorReset, colorGray, colorReset)
		fmt.Printf("[5]  %sGET%s    /visits/{id}                 %sObtener por ID%s\n", colorGreen, colorReset, colorGray, colorReset)
		fmt.Printf("[6]  %sPUT%s    /visits/{id}                 %sActualizar visita%s\n", colorBlue, colorReset, colorGray, colorReset)
		fmt.Printf("[7]  %sDELETE%s /visits/{id}                 %sEliminar visita%s\n", colorRed, colorReset, colorGray, colorReset)
		fmt.Printf("[8]  %sGET%s    /visits/qr/{qrCode}          %sObtener por QR%s\n", colorGreen, colorReset, colorGray, colorReset)
		fmt.Println()
		fmt.Println("── ENTRADA / SALIDA ──")
		fmt.Printf("[9]  %sPOST%s   /visits/{id}/register-entry  %sRegistrar entrada%s\n", colorYellow, colorReset, colorGray, colorReset)
		fmt.Printf("[10] %sPOST%s   /visits/{id}/register-exit   %sRegistrar salida%s\n", colorYellow, colorReset, colorGray, colorReset)
		fmt.Println()
		fmt.Println("── ACOMPAÑANTES ──")
		fmt.Printf("[11] %sGET%s    /visits/{id}/companions      %sListar acompañantes%s\n", colorGreen, colorReset, colorGray, colorReset)
		fmt.Printf("[12] %sPOST%s   /visits/{id}/companions      %sCrear acompañante%s\n", colorYellow, colorReset, colorGray, colorReset)
		fmt.Printf("[13] %sDELETE%s /visits/{id}/companions/{id} %sEliminar acompañante%s\n", colorRed, colorReset, colorGray, colorReset)
		fmt.Println()
		fmt.Println("── ACTIVOS ──")
		fmt.Printf("[14] %sPOST%s   /visits/{id}/assets          %sRegistrar activos%s\n", colorYellow, colorReset, colorGray, colorReset)
		fmt.Println()
		fmt.Println("── CATÁLOGOS ──")
		fmt.Printf("[15] %sGET%s    /visits/types                %sTipos de visita%s\n", colorGreen, colorReset, colorGray, colorReset)
		fmt.Printf("[16] %sGET%s    /visits/statuses             %sEstados de visita%s\n", colorGreen, colorReset, colorGray, colorReset)
		fmt.Println()
		fmt.Println("[0]  Volver")

		fmt.Print("\n➤ Seleccione un endpoint: ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)

		switch input {
		case "0":
			return
		case "1":
			if err := m.autoTester.TestCreateVisitor(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "2":
			if err := m.autoTester.TestSearchVisitor(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "3":
			if err := m.autoTester.TestCreateVisit(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "4":
			if err := m.autoTester.TestListVisits(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "5":
			if err := m.autoTester.TestGetVisitByID(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "6":
			if err := m.autoTester.TestUpdateVisit(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "7":
			if err := m.autoTester.TestDeleteVisit(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "8":
			if err := m.autoTester.TestGetVisitByQR(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "9":
			if err := m.autoTester.TestRegisterEntry(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "10":
			if err := m.autoTester.TestRegisterExit(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "11":
			if err := m.autoTester.TestListCompanions(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "12":
			if err := m.autoTester.TestCreateCompanion(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "13":
			if err := m.autoTester.TestDeleteCompanion(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "14":
			if err := m.autoTester.TestRegisterAssets(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "15":
			if err := m.catalog.ListVisitTypes(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		case "16":
			if err := m.catalog.ListVisitStatuses(); err != nil {
				fmt.Printf("❌ Error: %v\n", err)
			}
		default:
			fmt.Println("\n❌ Opción inválida")
		}
	}
}

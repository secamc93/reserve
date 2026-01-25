package main

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
	"reserve/testing/modules/residents"
	"reserve/testing/modules/unit"
	"reserve/testing/modules/visit"
)

func main() {
	// Parse flags para configuración de tests
	verbose := flag.Bool("v", false, "Modo verbose")
	module := flag.String("module", "all", "Módulo a ejecutar (all, unit, residents, visit)")
	useGoTest := flag.Bool("go-test", false, "Usar go test en lugar de ejecutar directamente")
	flag.Parse()

	fmt.Println("🧪 Iniciando Testing Suite")
	fmt.Println("==========================")

	if *useGoTest {
		runWithGoTest(*module, *verbose)
		return
	}

	// Ejecutar tests según el módulo seleccionado
	switch *module {
	case "all":
		runAllTests(*verbose)
	case "unit":
		runUnitTests(*verbose)
	case "residents":
		runResidentsTests(*verbose)
	case "visit":
		runVisitTests(*verbose)
	default:
		fmt.Printf("Módulo desconocido: %s\n", *module)
		os.Exit(1)
	}

	fmt.Println("\n✅ Testing completado exitosamente")
}

func runWithGoTest(module string, verbose bool) {
	var path string
	switch module {
	case "all":
		path = "./..."
	case "unit":
		path = "./modules/unit"
	case "residents":
		path = "./modules/residents"
	case "visit":
		path = "./modules/visit"
	default:
		fmt.Printf("Módulo desconocido: %s\n", module)
		os.Exit(1)
	}

	args := []string{"test", path}
	if verbose {
		args = append(args, "-v")
	}

	cmd := exec.Command("go", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		fmt.Printf("\n❌ Error ejecutando tests: %v\n", err)
		os.Exit(1)
	}
}

func runAllTests(verbose bool) {
	fmt.Println("\n📦 Ejecutando todos los módulos de testing...")
	runUnitTests(verbose)
	runResidentsTests(verbose)
	runVisitTests(verbose)
}

func runUnitTests(verbose bool) {
	fmt.Println("\n🔬 Módulo: Unit Tests")
	bundle := unit.NewBundle()

	// Ejecutar el bundle
	bundle.Execute()

	if verbose {
		fmt.Printf("  ✓ Bundle: %s completado\n", bundle.GetName())
	}
}

func runResidentsTests(verbose bool) {
	fmt.Println("\n👥 Módulo: Residents Tests")
	bundle := residents.NewBundle()

	// Ejecutar el bundle
	bundle.Execute()

	if verbose {
		fmt.Printf("  ✓ Bundle: %s completado\n", bundle.GetName())
	}
}

func runVisitTests(verbose bool) {
	fmt.Println("\n🚪 Módulo: Visit Tests")
	bundle := visit.NewBundle()

	// Ejecutar el bundle
	bundle.Execute()

	if verbose {
		fmt.Printf("  ✓ Bundle: %s completado\n", bundle.GetName())
	}
}

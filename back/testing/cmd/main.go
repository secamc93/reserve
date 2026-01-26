package main

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"reserve/testing/shared/orchestrator"
)

var orch *orchestrator.Orchestrator

func main() {
	// Crear orquestador
	orch = orchestrator.New()

	// Inicializar (env, logger, db, client)
	if err := orch.Initialize(); err != nil {
		fmt.Printf("\n❌ Error inicializando: %v\n", err)
		os.Exit(1)
	}
	defer orch.Close()

	// Autenticar (login + selección de business)
	if err := orch.Authenticate(); err != nil {
		fmt.Printf("\n❌ Error: %v\n", err)
		os.Exit(1)
	}

	// Menú de módulos
	scanner := bufio.NewScanner(os.Stdin)

	for {
		showModulesMenu()
		choice := readInput(scanner)

		switch choice {
		case "1":
			runModule("visit", scanner)
		case "2":
			runModule("residents", scanner)
		case "3":
			runModule("unit", scanner)
		case "0":
			fmt.Println("\n👋 ¡Hasta luego!")
			return
		default:
			fmt.Println("\n❌ Opción inválida")
		}
		fmt.Println()
	}
}

func showModulesMenu() {
	fmt.Println("\n" + strings.Repeat("═", 60))
	fmt.Println("📦 MÓDULOS DISPONIBLES")
	fmt.Println(strings.Repeat("═", 60))
	fmt.Println()
	fmt.Println("[1] Visit - Gestión de Visitas")
	fmt.Println("[2] Residents - Gestión de Residentes")
	fmt.Println("[3] Unit - Gestión de Unidades")
	fmt.Println()
	fmt.Println("[0] Salir")
	fmt.Print("\n➤ Seleccione módulo: ")
}

func readInput(scanner *bufio.Scanner) string {
	scanner.Scan()
	return strings.TrimSpace(scanner.Text())
}

func runModule(moduleName string, scanner *bufio.Scanner) {
	// Obtener directorio raíz (donde está go.mod)
	testingRoot, err := getTestingRoot()
	if err != nil {
		fmt.Printf("❌ Error obteniendo directorio raíz: %v\n", err)
		return
	}

	// Ruta relativa al main.go del módulo (desde testingRoot)
	moduleMainPath := filepath.Join("modules", moduleName, "cmd", "main.go")
	fullMainPath := filepath.Join(testingRoot, moduleMainPath)

	// Verificar que el módulo existe
	if _, err := os.Stat(fullMainPath); os.IsNotExist(err) {
		fmt.Printf("❌ Módulo '%s' no encontrado en %s\n", moduleName, fullMainPath)
		return
	}

	ctx := orch.GetContext()

	// Ejecutar módulo como proceso separado desde el directorio raíz
	// Esto es necesario porque go.mod está en testingRoot
	cmd := exec.Command("go", "run", moduleMainPath)
	cmd.Dir = testingRoot
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Pasar contexto como variables de entorno
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("TESTING_BUSINESS_ID=%d", ctx.BusinessID),
		fmt.Sprintf("TESTING_TOKEN=%s", ctx.Token),
	)

	if err := cmd.Run(); err != nil {
		fmt.Printf("\n❌ Error ejecutando módulo: %v\n", err)
	}
}

func getTestingRoot() (string, error) {
	// Obtener directorio actual del ejecutable
	executable, err := os.Executable()
	if err != nil {
		// Fallback: usar directorio de trabajo
		return os.Getwd()
	}

	dir := filepath.Dir(executable)

	// Si estamos en cmd/, subir un nivel
	if filepath.Base(dir) == "cmd" {
		return filepath.Dir(dir), nil
	}

	// Buscar hacia arriba hasta encontrar go.mod
	current := dir
	for i := 0; i < 5; i++ {
		if _, err := os.Stat(filepath.Join(current, "go.mod")); err == nil {
			return current, nil
		}
		current = filepath.Dir(current)
	}

	return os.Getwd()
}

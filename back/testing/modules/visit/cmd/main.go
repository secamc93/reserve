package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	visit "reserve/testing/modules/visit"
	"reserve/testing/shared/client"
	"reserve/testing/shared/db"
	"reserve/testing/shared/env"
	"reserve/testing/shared/log"

	"github.com/joho/godotenv"
)

func main() {
	// Cargar .env
	if err := loadEnv(); err != nil {
		fmt.Printf("⚠️  Advertencia: No se pudo cargar .env: %v\n", err)
	}

	// Obtener contexto desde variables de entorno
	businessIDStr := os.Getenv("TESTING_BUSINESS_ID")
	token := os.Getenv("TESTING_TOKEN")

	if businessIDStr == "" || token == "" {
		fmt.Println("❌ Error: Variables de entorno TESTING_BUSINESS_ID y TESTING_TOKEN requeridas")
		fmt.Println("   Este módulo debe ser ejecutado desde el menú principal de testing")
		os.Exit(1)
	}

	businessID, err := strconv.ParseUint(businessIDStr, 10, 32)
	if err != nil {
		fmt.Printf("❌ Error: TESTING_BUSINESS_ID inválido: %v\n", err)
		os.Exit(1)
	}

	// Inicializar dependencias compartidas
	logger := log.New()
	config := env.New(logger)
	database := db.New(logger, config)
	defer database.Close()

	// Crear cliente HTTP con token
	httpClient := client.New()
	httpClient.SetToken(token)
	httpClient.EnablePrettyPrint()

	// Crear y ejecutar bundle del módulo visit
	bundle := visit.NewBundle(httpClient, database, uint(businessID))
	bundle.Execute()
}

func loadEnv() error {
	// Intentar cargar desde directorio actual
	if err := godotenv.Load(".env"); err == nil {
		return nil
	}

	// Buscar .env en directorios padre
	cwd, _ := os.Getwd()
	for i := 0; i < 5; i++ {
		envPath := filepath.Join(cwd, ".env")
		if _, err := os.Stat(envPath); err == nil {
			return godotenv.Load(envPath)
		}
		cwd = filepath.Dir(cwd)
	}

	return fmt.Errorf("archivo .env no encontrado")
}

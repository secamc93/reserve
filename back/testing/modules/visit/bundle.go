package visit

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"reserve/testing/modules/visit/internal/application/usecases"
	"reserve/testing/modules/visit/internal/infrastructure/adapters/primary/cli"
	"reserve/testing/modules/visit/internal/infrastructure/adapters/secondary"
	"reserve/testing/shared"
	"strings"

	"github.com/joho/godotenv"
)

// Bundle orquesta la ejecución del módulo de visitas con arquitectura hexagonal
type Bundle struct {
	name   string
	client *shared.HTTPClient
	db     *shared.TestDatabase
	logger *shared.Logger

	// Casos de uso
	visitorUC  *usecases.VisitorUseCases
	visitUC    *usecases.VisitUseCases
	catalogUC  *usecases.CatalogUseCases
	authUC     *usecases.AuthUseCases
	databaseUC *usecases.DatabaseUseCases

	// Handlers CLI
	menuHandlers *cli.MenuHandlers
	stateManager *cli.StateManager

	// Tokens
	mainToken string
	bizToken  string
}

// NewBundle crea una nueva instancia de Bundle
func NewBundle() *Bundle {
	return &Bundle{
		name:         "visit",
		stateManager: cli.NewStateManager(),
	}
}

// Execute ejecuta el módulo de visitas
func (b *Bundle) Execute() {
	fmt.Println("\n🚪 Módulo: Visit Tests (Arquitectura Hexagonal)")
	fmt.Println(strings.Repeat("=", 60))

	// 0. Cargar variables de entorno
	if err := b.loadEnv(); err != nil {
		fmt.Printf("⚠️  Advertencia: No se pudo cargar .env: %v\n", err)
		fmt.Println("   Usando variables de entorno del sistema")
	}

	// 1. Inicializar logger
	b.logger = shared.NewLogger()
	b.logger.Info().Msg("Iniciando módulo de testing de visitas (Hexagonal)")

	// 2. Conectar a la base de datos (opcional)
	db, err := shared.NewTestDatabase(b.logger)
	if err != nil {
		fmt.Printf("⚠️  Advertencia: No se pudo conectar a la BD: %v\n", err)
		fmt.Println("   El módulo funcionará en modo API únicamente")
	} else {
		b.db = db
		b.logger.Info().Msg("Conexión a base de datos establecida")
		defer b.db.Close()
	}

	// 3. Crear cliente HTTP
	b.client = shared.NewHTTPClient()

	// 4. Inicializar adaptadores secundarios (infraestructura)
	visitAPIAdapter := secondary.NewVisitAPIAdapter(b.client)
	authAdapter := secondary.NewAuthAdapter(b.client)
	var databaseAdapter *secondary.DatabaseAdapter
	if b.db != nil {
		databaseAdapter = secondary.NewDatabaseAdapter(b.db)
	}

	// 5. Inicializar casos de uso (aplicación)
	b.visitorUC = usecases.NewVisitorUseCases(visitAPIAdapter)
	b.visitUC = usecases.NewVisitUseCases(visitAPIAdapter)
	b.catalogUC = usecases.NewCatalogUseCases(visitAPIAdapter)
	b.authUC = usecases.NewAuthUseCases(authAdapter)
	if databaseAdapter != nil {
		b.databaseUC = usecases.NewDatabaseUseCases(databaseAdapter)
	}

	// 6. Inicializar handlers CLI (adaptadores primarios)
	visitorHandlers := cli.NewVisitorHandlers(b.visitorUC, b.stateManager)
	visitHandlers := cli.NewVisitHandlers(b.visitUC, b.stateManager)
	catalogHandlers := cli.NewCatalogHandlers(b.catalogUC)
	var databaseHandlers *cli.DatabaseHandlers
	if b.databaseUC != nil {
		databaseHandlers = cli.NewDatabaseHandlers(b.databaseUC, b.stateManager)
	}

	b.menuHandlers = cli.NewMenuHandlers(
		visitorHandlers,
		visitHandlers,
		catalogHandlers,
		databaseHandlers,
		b.stateManager,
	)

	// 7. Listar usuarios y permitir selección
	users := shared.GetAvailableUsers()
	if len(users) == 0 {
		fmt.Println("\n❌ No hay usuarios configurados en .env")
		fmt.Println("   Por favor configura al menos un usuario en el archivo .env:")
		fmt.Println("   TEST_USER1_EMAIL=tu@email.com")
		fmt.Println("   TEST_USER1_PASSWORD=tupassword")
		fmt.Println("   TEST_USER1_NAME=Tu Nombre")
		return
	}

	// 8. Mostrar usuarios disponibles y seleccionar
	userConfig, err := b.selectUserInteractive(users)
	if err != nil {
		fmt.Printf("❌ Error en selección de usuario: %v\n", err)
		return
	}

	// 9. Intentar login con el usuario seleccionado
	if err := b.performLogin(userConfig); err != nil {
		fmt.Printf("\n❌ Error en autenticación: %v\n", err)
		fmt.Printf("   Usuario: %s\n", userConfig.Email)
		fmt.Println("\nPosibles causas:")
		fmt.Println("  • Las credenciales son incorrectas")
		fmt.Println("  • El usuario no existe en la base de datos")
		fmt.Println("  • La API no está disponible (verifique API_BASE_URL en .env)")
		fmt.Printf("  • API actual: %s\n", os.Getenv("API_BASE_URL"))
		return
	}

	// 10. Seleccionar propiedad horizontal
	if err := b.selectHorizontalProperty(); err != nil {
		fmt.Printf("\n❌ Error seleccionando propiedad: %v\n", err)
		fmt.Println("\nPosibles causas:")
		fmt.Println("  • El usuario no tiene acceso a ningún negocio")
		fmt.Println("  • No hay propiedades horizontales asignadas")
		fmt.Printf("  • Business Type ID incorrecto: %s\n", os.Getenv("HORIZONTAL_PROPERTY_BUSINESS_TYPE_ID"))
		return
	}

	// 11. Mostrar menú interactivo
	b.menuHandlers.ShowMainMenu()
}

// GetName devuelve el nombre del módulo
func (b *Bundle) GetName() string {
	return b.name
}

// loadEnv carga el archivo .env buscando en múltiples ubicaciones
func (b *Bundle) loadEnv() error {
	if err := godotenv.Load(".env"); err == nil {
		return nil
	}

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

// selectUserInteractive muestra la lista de usuarios y permite seleccionar
func (b *Bundle) selectUserInteractive(users []shared.UserConfig) (*shared.UserConfig, error) {
	fmt.Println("\n" + strings.Repeat("═", 60))
	fmt.Println("👤 USUARIOS DISPONIBLES")
	fmt.Println(strings.Repeat("═", 60))
	fmt.Println()

	for _, user := range users {
		displayName := user.Name
		if displayName == "" {
			displayName = user.Email
		}
		fmt.Printf("  [%d] %s\n", user.Number, displayName)
		fmt.Printf("      Email: %s\n", user.Email)
		fmt.Println()
	}

	fmt.Print("➤ Seleccione un usuario (1-3) o 0 para salir: ")
	var selection int
	fmt.Scanf("%d", &selection)

	if selection == 0 {
		return nil, fmt.Errorf("operación cancelada por el usuario")
	}

	if selection < 1 || selection > len(users) {
		return nil, fmt.Errorf("selección inválida: %d (debe ser entre 1 y %d)", selection, len(users))
	}

	return &users[selection-1], nil
}

// performLogin realiza el login usando el caso de uso de autenticación
func (b *Bundle) performLogin(userConfig *shared.UserConfig) error {
	fmt.Println("\n" + strings.Repeat("═", 60))
	fmt.Println("🔐 AUTENTICACIÓN")
	fmt.Println(strings.Repeat("═", 60))
	fmt.Printf("\nIntentando autenticar como: %s\n", userConfig.Email)
	fmt.Println("Esperando respuesta del servidor...")

	ctx := context.Background()
	mainToken, err := b.authUC.Login(ctx, userConfig.Email, userConfig.Password)
	if err != nil {
		return err
	}

	b.mainToken = mainToken
	b.client.SetToken(mainToken)

	fmt.Println("\n✅ Autenticación exitosa")
	fmt.Printf("   Usuario: %s\n", userConfig.Email)
	if userConfig.Name != "" {
		fmt.Printf("   Nombre: %s\n", userConfig.Name)
	}

	return nil
}

// selectHorizontalProperty selecciona una propiedad horizontal
func (b *Bundle) selectHorizontalProperty() error {
	ctx := context.Background()

	// 1. Listar businesses disponibles
	businesses, err := b.authUC.ListBusinesses(ctx, b.mainToken)
	if err != nil {
		return fmt.Errorf("error listando businesses: %w", err)
	}

	// 2. Filtrar por business_type_id de propiedad horizontal
	businessTypeID, _ := shared.GetHorizontalPropertyBusinessTypeID()
	hpBusinesses := []struct {
		ID   uint
		Name string
	}{}

	for _, biz := range businesses {
		if biz.BusinessTypeID == businessTypeID {
			hpBusinesses = append(hpBusinesses, struct {
				ID   uint
				Name string
			}{
				ID:   biz.ID,
				Name: biz.Name,
			})
		}
	}

	if len(hpBusinesses) == 0 {
		return fmt.Errorf("no hay propiedades horizontales disponibles")
	}

	// 3. Selección interactiva
	selectedBusiness, err := b.selectBusiness(hpBusinesses)
	if err != nil {
		return err
	}

	// 4. Generar business token
	bizToken, err := b.authUC.GetBusinessToken(ctx, b.mainToken, selectedBusiness.ID)
	if err != nil {
		return fmt.Errorf("error obteniendo business token: %w", err)
	}

	b.bizToken = bizToken
	b.client.SetToken(bizToken)
	b.stateManager.SetBusinessID(selectedBusiness.ID)

	fmt.Printf("✓ Propiedad seleccionada: %s (ID: %d)\n", selectedBusiness.Name, selectedBusiness.ID)
	return nil
}

func (b *Bundle) selectBusiness(businesses []struct {
	ID   uint
	Name string
}) (*struct {
	ID   uint
	Name string
}, error) {
	fmt.Println("\n🏢 Propiedades Horizontales disponibles:")
	fmt.Println(strings.Repeat("=", 60))

	for i, biz := range businesses {
		fmt.Printf("%d. %s (ID: %d)\n", i+1, biz.Name, biz.ID)
	}

	fmt.Print("\nSeleccione propiedad (1-N): ")
	var selection int
	fmt.Scanf("%d", &selection)

	if selection < 1 || selection > len(businesses) {
		return nil, fmt.Errorf("selección inválida")
	}

	return &businesses[selection-1], nil
}

package visit

import (
	"reserve/testing/modules/visit/internal/application/usecases"
	"reserve/testing/modules/visit/internal/infrastructure/primary/cli"
	"reserve/testing/modules/visit/internal/infrastructure/secondary/httpclient"
	"reserve/testing/modules/visit/internal/infrastructure/secondary/repository"
	sharedclient "reserve/testing/shared/client"
	"reserve/testing/shared/db"
)

// Bundle orquesta la ejecución del módulo de visitas
type Bundle struct {
	name   string
	client *sharedclient.Client
	db     db.IDatabase

	// Casos de uso
	visitorUC *usecases.VisitorUseCases
	visitUC   *usecases.VisitUseCases
	catalogUC *usecases.CatalogUseCases

	// Handlers CLI
	menuHandlers *cli.MenuHandlers
	stateManager *cli.StateManager
}

// NewBundle crea una nueva instancia de Bundle con el contexto autenticado
func NewBundle(client *sharedclient.Client, database db.IDatabase, businessID uint) *Bundle {
	b := &Bundle{
		name:         "visit",
		client:       client,
		db:           database,
		stateManager: cli.NewStateManager(),
	}

	// Guardar business_id en el state
	b.stateManager.SetBusinessID(businessID)

	return b
}

// Execute ejecuta el módulo de visitas
func (b *Bundle) Execute() {
	// 1. Inicializar infraestructura secundaria
	visitAPI := httpclient.New(b.client)
	visitRepo := repository.New(b.db)

	// 2. Inicializar casos de uso
	b.visitorUC = usecases.NewVisitorUseCases(visitAPI)
	b.visitUC = usecases.NewVisitUseCases(visitAPI)
	b.catalogUC = usecases.NewCatalogUseCases(visitAPI)

	// 3. Crear AutoTester para pruebas automáticas
	autoTester := cli.NewAutoTester(b.visitorUC, b.visitUC, visitRepo, b.stateManager)

	// 4. Crear FlowRunner para flujos automatizados
	flowRunner := cli.NewFlowRunner(b.visitorUC, b.visitUC, b.catalogUC, visitRepo, b.stateManager)

	// 5. Inicializar handlers CLI
	catalogHandlers := cli.NewCatalogHandlers(b.catalogUC)

	b.menuHandlers = cli.NewMenuHandlers(
		autoTester,
		flowRunner,
		catalogHandlers,
		b.stateManager,
	)

	// 6. Mostrar menú
	b.menuHandlers.ShowMainMenu()
}

// GetName devuelve el nombre del módulo
func (b *Bundle) GetName() string {
	return b.name
}

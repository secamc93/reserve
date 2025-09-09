package tablehandler

import (
	"central_reserve/services/tables/internal/app/usecasetables"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ITableHandler define la interfaz para el handler de Table
type ITableHandler interface {
	CreateTableHandler(c *gin.Context)
	GetTablesHandler(c *gin.Context)
	GetTableByIDHandler(c *gin.Context)
	UpdateTableHandler(c *gin.Context)
	DeleteTableHandler(c *gin.Context)
}

type TableHandler struct {
	usecase usecasetables.IUseCaseTable
	logger  log.ILogger
}

// New crea una nueva instancia del handler de Table
func New(usecase usecasetables.IUseCaseTable, logger log.ILogger) ITableHandler {
	return &TableHandler{
		usecase: usecase,
		logger:  logger,
	}
}

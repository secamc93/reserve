package domain

import (
	"context"
	"io"
)

// ILogsRepository define las operaciones del repositorio de logs
type ILogsRepository interface {
	// StreamLogs retorna un stream de logs en tiempo real
	StreamLogs(ctx context.Context, filter LogFilter) (io.ReadCloser, error)
}

// ILogsUseCase define los casos de uso de logs
type ILogsUseCase interface {
	// StreamLogs retorna un stream de logs en tiempo real
	StreamLogs(ctx context.Context, filter LogFilter) (io.ReadCloser, error)
}

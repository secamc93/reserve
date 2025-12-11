package app

import (
	"central_reserve/services/auth/logs/internal/domain"
	"context"
	"io"
)

// StreamLogs obtiene un stream de logs en tiempo real
func (uc *LogsUseCase) StreamLogs(ctx context.Context, filter domain.LogFilter) (io.ReadCloser, error) {
	uc.log.Info().
		Interface("filter", filter).
		Msg("Iniciando caso de uso: stream de logs en tiempo real")

	stream, err := uc.repository.StreamLogs(ctx, filter)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al obtener stream de logs")
		return nil, err
	}

	uc.log.Info().Msg("Stream de logs iniciado exitosamente")
	return stream, nil
}

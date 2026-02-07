package mocks

import (
	"context"

	"central_reserve/shared/log"

	"github.com/rs/zerolog"
)

// LoggerMock es un mock del logger que implementa log.ILogger
type LoggerMock struct {
	logger zerolog.Logger
}

// NewLoggerMock crea una nueva instancia del mock de logger
func NewLoggerMock() *LoggerMock {
	return &LoggerMock{
		logger: zerolog.Nop(),
	}
}

// Info retorna un evento de nivel info
func (l *LoggerMock) Info(ctx ...context.Context) *zerolog.Event {
	return l.logger.Info()
}

// Error retorna un evento de nivel error
func (l *LoggerMock) Error(ctx ...context.Context) *zerolog.Event {
	return l.logger.Error()
}

// Warn retorna un evento de nivel warning
func (l *LoggerMock) Warn(ctx ...context.Context) *zerolog.Event {
	return l.logger.Warn()
}

// Debug retorna un evento de nivel debug
func (l *LoggerMock) Debug(ctx ...context.Context) *zerolog.Event {
	return l.logger.Debug()
}

// Fatal retorna un evento de nivel fatal
func (l *LoggerMock) Fatal(ctx ...context.Context) *zerolog.Event {
	return l.logger.Fatal()
}

// Panic retorna un evento de nivel panic
func (l *LoggerMock) Panic(ctx ...context.Context) *zerolog.Event {
	return l.logger.Panic()
}

// With retorna el contexto del logger
func (l *LoggerMock) With() zerolog.Context {
	return l.logger.With()
}

// WithService retorna un logger con el servicio configurado
func (l *LoggerMock) WithService(service string) log.ILogger {
	return l
}

// WithModule retorna un logger con el módulo configurado
func (l *LoggerMock) WithModule(module string) log.ILogger {
	return l
}

// WithBusinessID retorna un logger con el business ID configurado
func (l *LoggerMock) WithBusinessID(businessID uint) log.ILogger {
	return l
}

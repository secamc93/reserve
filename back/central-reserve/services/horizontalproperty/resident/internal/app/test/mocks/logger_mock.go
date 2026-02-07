package mocks

import (
	"central_reserve/shared/log"
	"context"

	"github.com/rs/zerolog"
)

// MockLogger - Mock del logger para testing
type MockLogger struct {
	noop zerolog.Logger
}

// NewMockLogger crea una nueva instancia del mock logger
func NewMockLogger() log.ILogger {
	noop := zerolog.Nop()
	return &MockLogger{noop: noop}
}

// Info retorna un evento de log de nivel Info
func (m *MockLogger) Info(ctx ...context.Context) *zerolog.Event {
	return m.noop.Info()
}

// Error retorna un evento de log de nivel Error
func (m *MockLogger) Error(ctx ...context.Context) *zerolog.Event {
	return m.noop.Error()
}

// Warn retorna un evento de log de nivel Warn
func (m *MockLogger) Warn(ctx ...context.Context) *zerolog.Event {
	return m.noop.Warn()
}

// Debug retorna un evento de log de nivel Debug
func (m *MockLogger) Debug(ctx ...context.Context) *zerolog.Event {
	return m.noop.Debug()
}

// Fatal retorna un evento de log de nivel Fatal
func (m *MockLogger) Fatal(ctx ...context.Context) *zerolog.Event {
	return m.noop.Fatal()
}

// Panic retorna un evento de log de nivel Panic
func (m *MockLogger) Panic(ctx ...context.Context) *zerolog.Event {
	return m.noop.Panic()
}

// With retorna el contexto de zerolog para agregar campos
func (m *MockLogger) With() zerolog.Context {
	return m.noop.With()
}

// WithService retorna un nuevo logger con el campo service
func (m *MockLogger) WithService(service string) log.ILogger {
	return m
}

// WithModule retorna un nuevo logger con el campo module
func (m *MockLogger) WithModule(module string) log.ILogger {
	return m
}

// WithBusinessID retorna un nuevo logger con el campo business_id
func (m *MockLogger) WithBusinessID(businessID uint) log.ILogger {
	return m
}

package mocks

import (
	"context"

	"central_reserve/shared/log"

	"github.com/rs/zerolog"
)

// LoggerMock - Mock del logger
type LoggerMock struct {
	logger zerolog.Logger
}

// NewLoggerMock crea un logger mock usando zerolog.Nop()
func NewLoggerMock() log.ILogger {
	return &LoggerMock{
		logger: zerolog.Nop(),
	}
}

func (m *LoggerMock) Info(ctx ...context.Context) *zerolog.Event {
	return m.logger.Info()
}

func (m *LoggerMock) Error(ctx ...context.Context) *zerolog.Event {
	return m.logger.Error()
}

func (m *LoggerMock) Warn(ctx ...context.Context) *zerolog.Event {
	return m.logger.Warn()
}

func (m *LoggerMock) Debug(ctx ...context.Context) *zerolog.Event {
	return m.logger.Debug()
}

func (m *LoggerMock) Fatal(ctx ...context.Context) *zerolog.Event {
	return m.logger.Fatal()
}

func (m *LoggerMock) Panic(ctx ...context.Context) *zerolog.Event {
	return m.logger.Panic()
}

func (m *LoggerMock) With() zerolog.Context {
	return m.logger.With()
}

func (m *LoggerMock) WithService(service string) log.ILogger {
	return m
}

func (m *LoggerMock) WithModule(module string) log.ILogger {
	return m
}

func (m *LoggerMock) WithBusinessID(businessID uint) log.ILogger {
	return m
}

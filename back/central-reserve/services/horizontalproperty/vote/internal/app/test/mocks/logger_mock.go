package mocks

import (
	"context"

	"central_reserve/shared/log"

	"github.com/rs/zerolog"
)

// MockLogger - Mock del logger para testing
type MockLogger struct {
	InfoFunc  func(ctx ...context.Context) *zerolog.Event
	ErrorFunc func(ctx ...context.Context) *zerolog.Event
	WarnFunc  func(ctx ...context.Context) *zerolog.Event
	DebugFunc func(ctx ...context.Context) *zerolog.Event
	FatalFunc func(ctx ...context.Context) *zerolog.Event
	PanicFunc func(ctx ...context.Context) *zerolog.Event
}

// NewMockLogger crea una nueva instancia del mock del logger
func NewMockLogger() *MockLogger {
	logger := zerolog.Nop()
	return &MockLogger{
		InfoFunc:  func(ctx ...context.Context) *zerolog.Event { return logger.Info() },
		ErrorFunc: func(ctx ...context.Context) *zerolog.Event { return logger.Error() },
		WarnFunc:  func(ctx ...context.Context) *zerolog.Event { return logger.Warn() },
		DebugFunc: func(ctx ...context.Context) *zerolog.Event { return logger.Debug() },
		FatalFunc: func(ctx ...context.Context) *zerolog.Event { return logger.Fatal() },
		PanicFunc: func(ctx ...context.Context) *zerolog.Event { return logger.Panic() },
	}
}

func (m *MockLogger) Info(ctx ...context.Context) *zerolog.Event {
	if m.InfoFunc != nil {
		return m.InfoFunc(ctx...)
	}
	logger := zerolog.Nop()
	return logger.Info()
}

func (m *MockLogger) Error(ctx ...context.Context) *zerolog.Event {
	if m.ErrorFunc != nil {
		return m.ErrorFunc(ctx...)
	}
	logger := zerolog.Nop()
	return logger.Error()
}

func (m *MockLogger) Warn(ctx ...context.Context) *zerolog.Event {
	if m.WarnFunc != nil {
		return m.WarnFunc(ctx...)
	}
	logger := zerolog.Nop()
	return logger.Warn()
}

func (m *MockLogger) Debug(ctx ...context.Context) *zerolog.Event {
	if m.DebugFunc != nil {
		return m.DebugFunc(ctx...)
	}
	logger := zerolog.Nop()
	return logger.Debug()
}

func (m *MockLogger) Fatal(ctx ...context.Context) *zerolog.Event {
	if m.FatalFunc != nil {
		return m.FatalFunc(ctx...)
	}
	logger := zerolog.Nop()
	return logger.Fatal()
}

func (m *MockLogger) Panic(ctx ...context.Context) *zerolog.Event {
	if m.PanicFunc != nil {
		return m.PanicFunc(ctx...)
	}
	logger := zerolog.Nop()
	return logger.Panic()
}

func (m *MockLogger) With() zerolog.Context {
	return zerolog.Nop().With()
}

func (m *MockLogger) WithService(service string) log.ILogger {
	return m
}

func (m *MockLogger) WithModule(module string) log.ILogger {
	return m
}

func (m *MockLogger) WithBusinessID(businessID uint) log.ILogger {
	return m
}

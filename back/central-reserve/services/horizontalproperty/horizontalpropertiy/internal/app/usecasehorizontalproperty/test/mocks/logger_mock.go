package mocks

import (
	"context"

	"central_reserve/shared/log"

	"github.com/rs/zerolog"
)

// MockLogger - Mock del logger para tests
type MockLogger struct {
	InfoFunc        func(ctx ...context.Context) *zerolog.Event
	ErrorFunc       func(ctx ...context.Context) *zerolog.Event
	WarnFunc        func(ctx ...context.Context) *zerolog.Event
	DebugFunc       func(ctx ...context.Context) *zerolog.Event
	FatalFunc       func(ctx ...context.Context) *zerolog.Event
	PanicFunc       func(ctx ...context.Context) *zerolog.Event
	WithFunc        func() zerolog.Context
	WithServiceFunc func(service string) log.ILogger
	WithModuleFunc  func(module string) log.ILogger
}

// NewMockLogger - Crea un nuevo mock de logger
func NewMockLogger() *MockLogger {
	nopLogger := zerolog.Nop()
	return &MockLogger{
		InfoFunc:  func(ctx ...context.Context) *zerolog.Event { return nopLogger.Info() },
		ErrorFunc: func(ctx ...context.Context) *zerolog.Event { return nopLogger.Error() },
		WarnFunc:  func(ctx ...context.Context) *zerolog.Event { return nopLogger.Warn() },
		DebugFunc: func(ctx ...context.Context) *zerolog.Event { return nopLogger.Debug() },
		FatalFunc: func(ctx ...context.Context) *zerolog.Event { return nopLogger.WithLevel(zerolog.FatalLevel) },
		PanicFunc: func(ctx ...context.Context) *zerolog.Event { return nopLogger.WithLevel(zerolog.PanicLevel) },
		WithFunc:  func() zerolog.Context { return nopLogger.With() },
		WithServiceFunc: func(service string) log.ILogger {
			return NewMockLogger()
		},
		WithModuleFunc: func(module string) log.ILogger {
			return NewMockLogger()
		},
	}
}

func (m *MockLogger) Info(ctx ...context.Context) *zerolog.Event {
	if m.InfoFunc != nil {
		return m.InfoFunc(ctx...)
	}
	nop := zerolog.Nop()
	return nop.Info()
}

func (m *MockLogger) Error(ctx ...context.Context) *zerolog.Event {
	if m.ErrorFunc != nil {
		return m.ErrorFunc(ctx...)
	}
	nop := zerolog.Nop()
	return nop.Error()
}

func (m *MockLogger) Warn(ctx ...context.Context) *zerolog.Event {
	if m.WarnFunc != nil {
		return m.WarnFunc(ctx...)
	}
	nop := zerolog.Nop()
	return nop.Warn()
}

func (m *MockLogger) Debug(ctx ...context.Context) *zerolog.Event {
	if m.DebugFunc != nil {
		return m.DebugFunc(ctx...)
	}
	nop := zerolog.Nop()
	return nop.Debug()
}

func (m *MockLogger) Fatal(ctx ...context.Context) *zerolog.Event {
	if m.FatalFunc != nil {
		return m.FatalFunc(ctx...)
	}
	nop := zerolog.Nop()
	return nop.WithLevel(zerolog.FatalLevel)
}

func (m *MockLogger) Panic(ctx ...context.Context) *zerolog.Event {
	if m.PanicFunc != nil {
		return m.PanicFunc(ctx...)
	}
	nop := zerolog.Nop()
	return nop.WithLevel(zerolog.PanicLevel)
}

func (m *MockLogger) With() zerolog.Context {
	if m.WithFunc != nil {
		return m.WithFunc()
	}
	nop := zerolog.Nop()
	return nop.With()
}

func (m *MockLogger) WithService(service string) log.ILogger {
	if m.WithServiceFunc != nil {
		return m.WithServiceFunc(service)
	}
	return m
}

func (m *MockLogger) WithModule(module string) log.ILogger {
	if m.WithModuleFunc != nil {
		return m.WithModuleFunc(module)
	}
	return m
}

func (m *MockLogger) WithBusinessID(businessID uint) log.ILogger {
	return m
}

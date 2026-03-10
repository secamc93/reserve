package mocks

import (
	"context"

	"central_reserve/shared/log"

	"github.com/rs/zerolog"
)

// MockLogger - Mock del logger para tests
type MockLogger struct {
	InfoFunc  func(ctx ...context.Context) *zerolog.Event
	ErrorFunc func(ctx ...context.Context) *zerolog.Event
	WarnFunc  func(ctx ...context.Context) *zerolog.Event
	DebugFunc func(ctx ...context.Context) *zerolog.Event
	FatalFunc func(ctx ...context.Context) *zerolog.Event
	PanicFunc func(ctx ...context.Context) *zerolog.Event
	WithFunc  func() zerolog.Context
}

// NewMockLogger crea un nuevo mock del logger
func NewMockLogger() log.ILogger {
	noop := zerolog.Nop()
	return &MockLogger{
		InfoFunc:  func(ctx ...context.Context) *zerolog.Event { return noop.Info() },
		ErrorFunc: func(ctx ...context.Context) *zerolog.Event { return noop.Error() },
		WarnFunc:  func(ctx ...context.Context) *zerolog.Event { return noop.Warn() },
		DebugFunc: func(ctx ...context.Context) *zerolog.Event { return noop.Debug() },
		FatalFunc: func(ctx ...context.Context) *zerolog.Event { return noop.Fatal() },
		PanicFunc: func(ctx ...context.Context) *zerolog.Event { return noop.Panic() },
		WithFunc:  func() zerolog.Context { return noop.With() },
	}
}

func (m *MockLogger) Info(ctx ...context.Context) *zerolog.Event {
	if m.InfoFunc != nil {
		return m.InfoFunc(ctx...)
	}
	noop := zerolog.Nop()
	return noop.Info()
}

func (m *MockLogger) Error(ctx ...context.Context) *zerolog.Event {
	if m.ErrorFunc != nil {
		return m.ErrorFunc(ctx...)
	}
	noop := zerolog.Nop()
	return noop.Error()
}

func (m *MockLogger) Warn(ctx ...context.Context) *zerolog.Event {
	if m.WarnFunc != nil {
		return m.WarnFunc(ctx...)
	}
	noop := zerolog.Nop()
	return noop.Warn()
}

func (m *MockLogger) Debug(ctx ...context.Context) *zerolog.Event {
	if m.DebugFunc != nil {
		return m.DebugFunc(ctx...)
	}
	noop := zerolog.Nop()
	return noop.Debug()
}

func (m *MockLogger) Fatal(ctx ...context.Context) *zerolog.Event {
	if m.FatalFunc != nil {
		return m.FatalFunc(ctx...)
	}
	noop := zerolog.Nop()
	return noop.Fatal()
}

func (m *MockLogger) Panic(ctx ...context.Context) *zerolog.Event {
	if m.PanicFunc != nil {
		return m.PanicFunc(ctx...)
	}
	noop := zerolog.Nop()
	return noop.Panic()
}

func (m *MockLogger) With() zerolog.Context {
	if m.WithFunc != nil {
		return m.WithFunc()
	}
	return zerolog.Nop().With()
}

func (m *MockLogger) WithService(service string) log.ILogger {
	return NewMockLogger()
}

func (m *MockLogger) WithModule(module string) log.ILogger {
	return NewMockLogger()
}

func (m *MockLogger) WithBusinessID(businessID uint) log.ILogger {
	return NewMockLogger()
}

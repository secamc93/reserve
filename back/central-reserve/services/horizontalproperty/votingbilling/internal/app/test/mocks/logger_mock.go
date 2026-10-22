package mocks

import (
	"context"

	"central_reserve/shared/log"

	"github.com/rs/zerolog"
)

// MockLogger implementa log.ILogger sin escribir nada.
type MockLogger struct{}

var nop = zerolog.Nop()

func (m *MockLogger) Info(ctx ...context.Context) *zerolog.Event  { return nop.Info() }
func (m *MockLogger) Error(ctx ...context.Context) *zerolog.Event { return nop.Error() }
func (m *MockLogger) Warn(ctx ...context.Context) *zerolog.Event  { return nop.Warn() }
func (m *MockLogger) Debug(ctx ...context.Context) *zerolog.Event { return nop.Debug() }
func (m *MockLogger) Fatal(ctx ...context.Context) *zerolog.Event { return nop.Fatal() }
func (m *MockLogger) Panic(ctx ...context.Context) *zerolog.Event { return nop.Panic() }
func (m *MockLogger) With() zerolog.Context                       { return nop.With() }
func (m *MockLogger) WithService(string) log.ILogger               { return m }
func (m *MockLogger) WithModule(string) log.ILogger                { return m }
func (m *MockLogger) WithBusinessID(uint) log.ILogger              { return m }

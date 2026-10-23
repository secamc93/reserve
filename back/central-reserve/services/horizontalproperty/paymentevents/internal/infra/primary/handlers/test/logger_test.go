package handlers_test

import (
	"context"

	"central_reserve/shared/log"

	"github.com/rs/zerolog"
)

var nop = zerolog.Nop()

type nopLogger struct{}

func (nopLogger) Info(...context.Context) *zerolog.Event  { return nop.Info() }
func (nopLogger) Error(...context.Context) *zerolog.Event { return nop.Error() }
func (nopLogger) Warn(...context.Context) *zerolog.Event  { return nop.Warn() }
func (nopLogger) Debug(...context.Context) *zerolog.Event { return nop.Debug() }
func (nopLogger) Fatal(...context.Context) *zerolog.Event { return nop.Fatal() }
func (nopLogger) Panic(...context.Context) *zerolog.Event { return nop.Panic() }
func (nopLogger) With() zerolog.Context                   { return nop.With() }
func (l nopLogger) WithService(string) log.ILogger        { return l }
func (l nopLogger) WithModule(string) log.ILogger         { return l }
func (l nopLogger) WithBusinessID(uint) log.ILogger       { return l }

package log

import (
	"context"
	"os"

	"github.com/rs/zerolog"
)

type ILogger interface {
	Info(ctx ...context.Context) *zerolog.Event
	Error(ctx ...context.Context) *zerolog.Event
	Warn(ctx ...context.Context) *zerolog.Event
	Debug(ctx ...context.Context) *zerolog.Event
	Fatal(ctx ...context.Context) *zerolog.Event
	Panic(ctx ...context.Context) *zerolog.Event
	With() zerolog.Context
}

type logger struct {
	log zerolog.Logger
}

var defaultLogger *logger

func New() ILogger {
	if defaultLogger == nil {
		// Configurar el logger con formato de consola bonito
		consoleWriter := zerolog.ConsoleWriter{
			Out:        os.Stdout, // Cambiar a stdout para que se vea en consola
			TimeFormat: "2006-01-02 15:04:05",
		}

		defaultLogger = &logger{
			log: zerolog.New(consoleWriter).
				With().
				Timestamp().
				Logger().
				Hook(&tracingHook{}),
		}

		// Configurar el nivel de log desde variable de entorno
		level := os.Getenv("LOG_LEVEL")
		switch level {
		case "debug":
			defaultLogger.log = defaultLogger.log.Level(zerolog.DebugLevel)
		case "warn":
			defaultLogger.log = defaultLogger.log.Level(zerolog.WarnLevel)
		case "error":
			defaultLogger.log = defaultLogger.log.Level(zerolog.ErrorLevel)
		default:
			defaultLogger.log = defaultLogger.log.Level(zerolog.InfoLevel)
		}

		// Forzar el logger por defecto del contexto
		zerolog.DefaultContextLogger = &defaultLogger.log
	}
	return defaultLogger
}

func (l *logger) Info(ctx ...context.Context) *zerolog.Event {
	if len(ctx) > 0 {
		return zerolog.Ctx(ctx[0]).Info().Ctx(ctx[0])
	}
	return l.log.Info()
}

func (l *logger) Error(ctx ...context.Context) *zerolog.Event {
	if len(ctx) > 0 {
		return zerolog.Ctx(ctx[0]).Error().Ctx(ctx[0])
	}
	return l.log.Error()
}

func (l *logger) Warn(ctx ...context.Context) *zerolog.Event {
	if len(ctx) > 0 {
		return zerolog.Ctx(ctx[0]).Warn().Ctx(ctx[0])
	}
	return l.log.Warn()
}

func (l *logger) Debug(ctx ...context.Context) *zerolog.Event {
	if len(ctx) > 0 {
		return zerolog.Ctx(ctx[0]).Debug().Ctx(ctx[0])
	}
	return l.log.Debug()
}

func (l *logger) Fatal(ctx ...context.Context) *zerolog.Event {
	if len(ctx) > 0 {
		return zerolog.Ctx(ctx[0]).Fatal()
	}
	return l.log.WithLevel(zerolog.FatalLevel)
}

func (l *logger) Panic(ctx ...context.Context) *zerolog.Event {
	if len(ctx) > 0 {
		return zerolog.Ctx(ctx[0]).Panic().Ctx(ctx[0])
	}
	return l.log.WithLevel(zerolog.PanicLevel)
}

func (l *logger) With() zerolog.Context {
	return l.log.With()
}

func Init() {
	New()
}

type tracingHook struct{}

func (h *tracingHook) Run(e *zerolog.Event, level zerolog.Level, msg string) {
	ctx := e.GetCtx()
	reqId, ok := ReqId(ctx)
	if ok {
		e.Str("req_id", reqId)
	}
}

type reqIdKey struct{}

var reqId reqIdKey

func ReqId(ctx context.Context) (string, bool) {
	id, ok := ctx.Value(reqId).(string)
	return id, ok
}

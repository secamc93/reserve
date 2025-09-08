package log

import (
	"context"
	"os"
	"runtime"
	"strings"

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

// getFunctionName obtiene el nombre de la función que está ejecutando el log
func getFunctionName() string {
	// Obtener el stack trace
	pc := make([]uintptr, 10)
	n := runtime.Callers(0, pc)
	if n == 0 {
		return "unknown"
	}

	// Buscar la función que no sea del paquete log o runtime
	for i := 0; i < n; i++ {
		fn := runtime.FuncForPC(pc[i])
		if fn == nil {
			continue
		}

		funcName := fn.Name()
		// Filtrar funciones del logger y runtime
		if !strings.Contains(funcName, "log.") &&
			!strings.Contains(funcName, "runtime.") &&
			!strings.Contains(funcName, "zerolog.") {
			// Extraer solo el nombre de la función sin el paquete completo
			parts := strings.Split(funcName, ".")
			if len(parts) > 0 {
				return parts[len(parts)-1]
			}
			return funcName
		}
	}
	return "unknown"
}

type tracingHook struct{}

func (h *tracingHook) Run(e *zerolog.Event, level zerolog.Level, msg string) {
	// Si el mensaje es solo espacios o vacío, no agregar metadatos
	if strings.TrimSpace(msg) == "" {
		return
	}

	ctx := e.GetCtx()
	reqId, ok := ReqId(ctx)
	if ok {
		e.Str("req_id", reqId)
	}

	// Eliminado: no agregar el nombre de la función para mantener los logs limpios
}

type reqIdKey struct{}

var reqId reqIdKey

func ReqId(ctx context.Context) (string, bool) {
	id, ok := ctx.Value(reqId).(string)
	return id, ok
}

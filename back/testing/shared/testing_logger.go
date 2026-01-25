package shared

import (
	"io"
	"os"

	"github.com/rs/zerolog"
)

type Logger struct {
	log zerolog.Logger
}

func NewLogger() *Logger {
	// Configurar el logger con formato de consola bonito
	consoleWriter := zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: "15:04:05",
	}

	var writer io.Writer = consoleWriter
	logLevel := os.Getenv("LOG_LEVEL")

	logger := zerolog.New(writer).
		With().
		Timestamp().
		Logger()

	// Configurar el nivel de log
	switch logLevel {
	case "debug":
		logger = logger.Level(zerolog.DebugLevel)
	case "warn":
		logger = logger.Level(zerolog.WarnLevel)
	case "error":
		logger = logger.Level(zerolog.ErrorLevel)
	default:
		logger = logger.Level(zerolog.InfoLevel)
	}

	return &Logger{log: logger}
}

func (l *Logger) Info() *zerolog.Event {
	return l.log.Info()
}

func (l *Logger) Error() *zerolog.Event {
	return l.log.Error()
}

func (l *Logger) Warn() *zerolog.Event {
	return l.log.Warn()
}

func (l *Logger) Debug() *zerolog.Event {
	return l.log.Debug()
}

func (l *Logger) Fatal() *zerolog.Event {
	return l.log.Fatal()
}

func (l *Logger) With() zerolog.Context {
	return l.log.With()
}

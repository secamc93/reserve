//go:build integration

// Package testkit contiene utilidades para pruebas de integración del back contra
// PostgreSQL REAL (la BD local del checkout o del worktree).
//
// Solo compila con el tag `integration` (`make test-integration`), así que `go test ./...`
// del CI no lo incluye. Lee la configuración de BD de las mismas variables del `.env` del
// back: DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME y PGSSLMODE.
package testkit

import (
	"context"
	"fmt"
	"math/rand"
	"os"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/rs/zerolog"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// requiredEnv son las variables de BD sin las que no se puede correr una prueba de integración.
var requiredEnv = []string{"DB_HOST", "DB_PORT", "DB_USER", "DB_PASS", "DB_NAME"}

// config implementa env.IConfig con un mapa fijo (no lee .env por su cuenta).
type config map[string]string

func (c config) Get(key string) string { return c[key] }

// DB abre una conexión real a la BD configurada en el entorno y la cierra al terminar la
// prueba. Si faltan variables o la BD no responde, la prueba falla (t.Fatal) con un mensaje
// que dice qué hacer: nunca se salta.
func DB(t *testing.T) db.IDatabase {
	t.Helper()

	cfg := config{}
	var missing []string
	for _, k := range requiredEnv {
		v := os.Getenv(k)
		if v == "" {
			missing = append(missing, k)
		}
		cfg[k] = v
	}
	if len(missing) > 0 {
		t.Fatalf("pruebas de integración: faltan variables de entorno %s. "+
			"Córrelas con `make test-integration` desde la raíz del checkout (carga back/central-reserve/.env) "+
			"o exporta las variables de la BD local antes de `go test -tags=integration`",
			strings.Join(missing, ", "))
	}
	cfg["PGSSLMODE"] = os.Getenv("PGSSLMODE")
	if cfg["PGSSLMODE"] == "" {
		cfg["PGSSLMODE"] = "disable"
	}
	// Por defecto solo errores de SQL; INTEGRATION_DB_LOG_LEVEL=debug muestra todas las consultas.
	cfg["DB_LOG_LEVEL"] = os.Getenv("INTEGRATION_DB_LOG_LEVEL")
	if cfg["DB_LOG_LEVEL"] == "" {
		cfg["DB_LOG_LEVEL"] = "error"
	}

	// db.New termina el proceso si no conecta; se verifica antes para fallar con un mensaje claro.
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
		cfg["DB_HOST"], cfg["DB_USER"], cfg["DB_PASS"], cfg["DB_NAME"], cfg["DB_PORT"], cfg["PGSSLMODE"])
	probe, err := gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: logger.Discard})
	if err != nil {
		t.Fatalf("pruebas de integración: no se pudo conectar a %s:%s/%s: %v "+
			"(¿está arriba `./scripts/dev-services.sh start infra` y migrada la BD con `make run-migrations`?)",
			cfg["DB_HOST"], cfg["DB_PORT"], cfg["DB_NAME"], err)
	}
	if sqlDB, err := probe.DB(); err == nil {
		_ = sqlDB.Close()
	}

	database := db.New(Logger(t), cfg)
	t.Cleanup(func() { _ = database.Close() })
	return database
}

// Logger devuelve un log.ILogger que escribe en la salida de la prueba (solo warn/error),
// sin crear archivos de log en el directorio del paquete.
func Logger(t *testing.T) log.ILogger {
	t.Helper()
	zl := zerolog.New(zerolog.NewTestWriter(t)).Level(zerolog.WarnLevel).With().Timestamp().Logger()
	return &testLogger{log: zl}
}

var counter atomic.Uint64

// Suffix devuelve un sufijo único por corrida y llamada, para que los datos de prueba no
// choquen con otras corridas, otros paquetes ni otros worktrees.
func Suffix() string {
	n := counter.Add(1)
	return fmt.Sprintf("%d%03d%d", time.Now().UnixMilli()%1_000_000_000, rand.Intn(1000), n)
}

// Ctx devuelve un contexto con timeout que se cancela al terminar la prueba.
func Ctx(t *testing.T) context.Context {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	t.Cleanup(cancel)
	return ctx
}

// testLogger implementa log.ILogger sobre zerolog.
type testLogger struct {
	log zerolog.Logger
}

func (l *testLogger) Info(ctx ...context.Context) *zerolog.Event  { return l.log.Info() }
func (l *testLogger) Error(ctx ...context.Context) *zerolog.Event { return l.log.Error() }
func (l *testLogger) Warn(ctx ...context.Context) *zerolog.Event  { return l.log.Warn() }
func (l *testLogger) Debug(ctx ...context.Context) *zerolog.Event { return l.log.Debug() }
func (l *testLogger) Fatal(ctx ...context.Context) *zerolog.Event { return l.log.Error() }
func (l *testLogger) Panic(ctx ...context.Context) *zerolog.Event { return l.log.Error() }
func (l *testLogger) With() zerolog.Context                       { return l.log.With() }
func (l *testLogger) WithService(service string) log.ILogger {
	return &testLogger{log: l.log.With().Str("service", service).Logger()}
}
func (l *testLogger) WithModule(module string) log.ILogger {
	return &testLogger{log: l.log.With().Str("module", module).Logger()}
}
func (l *testLogger) WithBusinessID(businessID uint) log.ILogger {
	return &testLogger{log: l.log.With().Uint("business_id", businessID).Logger()}
}

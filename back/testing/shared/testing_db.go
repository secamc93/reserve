package shared

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/rs/zerolog"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

// TestDatabase representa la conexión a la base de datos para testing
type TestDatabase struct {
	conn   *gorm.DB
	logger *Logger
}

// NewTestDatabase crea una nueva conexión a la base de datos para testing
func NewTestDatabase(log *Logger) (*TestDatabase, error) {
	db := &TestDatabase{
		logger: log,
	}

	if err := db.Connect(); err != nil {
		return nil, err
	}

	return db, nil
}

// Connect establece la conexión con la base de datos
func (d *TestDatabase) Connect() error {
	sslmode := os.Getenv("PGSSLMODE")
	if sslmode == "" {
		sslmode = "disable" // Para testing local
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASS"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
		sslmode,
	)

	// Crear logger para GORM
	gormLogger := &testDBLogger{
		logger: d.logger.With().Str("component", "database").Logger(),
		level:  getDBLogLevel(),
	}

	var err error
	d.conn, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt:              false,
		DisableNestedTransaction: true,
		Logger:                   gormLogger,
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
	})
	if err != nil {
		return fmt.Errorf("error conectando a la base de datos: %w", err)
	}

	d.conn = d.conn.Omit(clause.Associations).Session(&gorm.Session{
		FullSaveAssociations: false,
	})

	sqlDB, err := d.conn.DB()
	if err != nil {
		return err
	}

	// Configuración de pool
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	return nil
}

// Close cierra la conexión con la base de datos
func (d *TestDatabase) Close() error {
	if d.conn != nil {
		sqlDB, err := d.conn.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}

// Conn retorna la conexión actual
func (d *TestDatabase) Conn() *gorm.DB {
	return d.conn
}

// WithContext retorna una nueva instancia de la conexión con contexto
func (d *TestDatabase) WithContext(ctx context.Context) *gorm.DB {
	return d.conn.WithContext(ctx)
}

// DebugConn retorna una conexión con debug habilitado
func (d *TestDatabase) DebugConn() *gorm.DB {
	return d.conn.Session(&gorm.Session{
		Logger: d.conn.Logger.LogMode(logger.Info),
	})
}

// testDBLogger implementa el logger de GORM
type testDBLogger struct {
	logger        zerolog.Logger
	level         logger.LogLevel
	slowThreshold time.Duration
}

func (l *testDBLogger) LogMode(level logger.LogLevel) logger.Interface {
	newlogger := *l
	newlogger.level = level
	return &newlogger
}

func (l *testDBLogger) Info(ctx context.Context, msg string, data ...any) {
	if l.level >= logger.Info {
		l.logger.Info().Msgf(msg, data...)
	}
}

func (l *testDBLogger) Warn(ctx context.Context, msg string, data ...any) {
	if l.level >= logger.Warn {
		l.logger.Warn().Msgf(msg, data...)
	}
}

func (l *testDBLogger) Error(ctx context.Context, msg string, data ...any) {
	if l.level >= logger.Error {
		l.logger.Error().Msgf(msg, data...)
	}
}

func (l *testDBLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	if l.level <= logger.Silent {
		return
	}

	elapsed := time.Since(begin)

	switch {
	case err != nil && l.level >= logger.Error && !errors.Is(err, gorm.ErrRecordNotFound):
		sql, rows := fc()
		l.logger.Error().
			Err(err).
			Dur("duration", elapsed).
			Str("sql", sql).
			Int64("rows", rows).
			Msg("query failed")
	case elapsed > l.slowThreshold && l.slowThreshold != 0 && l.level >= logger.Warn:
		sql, rows := fc()
		l.logger.Warn().
			Dur("duration", elapsed).
			Str("sql", sql).
			Int64("rows", rows).
			Msg("slow query")
	case l.level >= logger.Info:
		sql, rows := fc()
		l.logger.Info().
			Dur("duration", elapsed).
			Str("sql", sql).
			Int64("rows", rows).
			Msg("SQL Query")
	}
}

func getDBLogLevel() logger.LogLevel {
	level := os.Getenv("DB_LOG_LEVEL")
	switch level {
	case "debug", "info":
		return logger.Info
	case "warn":
		return logger.Warn
	case "error":
		return logger.Error
	case "silent":
		return logger.Silent
	default:
		return logger.Info
	}
}

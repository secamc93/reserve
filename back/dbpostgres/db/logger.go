package db

import (
	"context"
	"errors"
	"time"

	"github.com/rs/zerolog"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DBLogger interface {
	LogMode(level logger.LogLevel) logger.Interface
	Info(ctx context.Context, msg string, data ...any)
	Warn(ctx context.Context, msg string, data ...any)
	Error(ctx context.Context, msg string, data ...any)
	Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error)
}

type dbLogger struct {
	level         logger.LogLevel
	slowThreshold time.Duration
	logger        zerolog.Logger
}

func NewDBLogger(log zerolog.Logger) DBLogger {
	return &dbLogger{
		level:         logger.Error,
		slowThreshold: 200 * time.Millisecond,
		logger:        log,
	}
}

func (l *dbLogger) LogMode(level logger.LogLevel) logger.Interface {
	newlogger := *l
	newlogger.level = level
	return &newlogger
}

func (l *dbLogger) Info(ctx context.Context, msg string, data ...any) {
	if l.level >= logger.Info {
		l.logger.Info().Msgf(msg, data...)
	}
}

func (l *dbLogger) Warn(ctx context.Context, msg string, data ...any) {
	if l.level >= logger.Warn {
		l.logger.Warn().Msgf(msg, data...)
	}
}

func (l *dbLogger) Error(ctx context.Context, msg string, data ...any) {
	if l.level >= logger.Error {
		l.logger.Error().Msgf(msg, data...)
	}
}

func (l *dbLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
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
	case l.level == logger.Info:
		sql, rows := fc()
		l.logger.Info().
			Dur("duration", elapsed).
			Str("sql", sql).
			Int64("rows", rows).
			Msg("query executed")
	}
}

package env

import (
	"context"
	"os"
	"path/filepath"
	"reflect"
	"reserve/testing/shared/log"

	"github.com/joho/godotenv"
)

type IConfig interface {
	Get(key string) string
}

type config struct {
	values map[string]string
	logger log.ILogger
}

func loadDotEnv(logger log.ILogger) {
	// Intentar cargar .env desde el directorio actual
	_ = godotenv.Load(".env")

	// Si aún faltan claves, buscar hacia arriba hasta 6 niveles
	cwd, _ := os.Getwd()
	maxLevels := 6
	for i := 0; i < maxLevels; i++ {
		candidate := filepath.Join(cwd, ".env")
		if _, err := os.Stat(candidate); err == nil {
			_ = godotenv.Overload(candidate)
			// quitado: log de archivo .env cargado para evitar ruido en consola
			return
		}
		cwd = filepath.Dir(cwd)
	}
	// Si no se encontró, intentar rutas relativas comunes
	_ = godotenv.Overload("../.env", "../../.env", "../../../.env", "../../../../.env")
}

func New(logger log.ILogger) IConfig {
	loadDotEnv(logger)

	cfg := &Config{}
	missing := []string{}
	values := make(map[string]string)

	v := reflect.ValueOf(cfg).Elem()
	t := v.Type()

	for i := 0; i < v.NumField(); i++ {
		field := t.Field(i)
		tag := field.Tag.Get("env")
		if tag == "" {
			continue
		}
		parts := splitTag(tag)
		key := parts[0]
		required := len(parts) > 1 && parts[1] == "required"
		val := os.Getenv(key)
		if val == "" && required {
			missing = append(missing, key)
		}
		values[key] = val
	}

	if len(missing) > 0 {
		if os.Getenv("RELAX_ENV") == "1" {
			logger.Warn(context.Background()).
				Strs("missing_env_vars", missing).
				Msg("Faltan variables de entorno obligatorias - modo relajado activo (RELAX_ENV=1)")
		} else {
			logger.Fatal(context.Background()).
				Strs("missing_env_vars", missing).
				Msg("Faltan variables de entorno obligatorias - la aplicación no puede continuar")
			// El panic se ejecutará automáticamente después del log fatal
		}
	}

	return &config{values: values, logger: logger}
}

// Get retorna el valor de una variable de entorno cargada
func (c *config) Get(key string) string {
	return c.values[key]
}

// Config solo se usa internamente para reflexión
// No debe ser accedido directamente fuera de este paquete

type Config struct {
	// API
	APIBaseURL string `env:"API_BASE_URL,required"`

	// Database
	DbHost     string `env:"DB_HOST,required"`
	DbUser     string `env:"DB_USER,required"`
	DbPass     string `env:"DB_PASS,required"`
	DbPort     string `env:"DB_PORT,required"`
	DbName     string `env:"DB_NAME,required"`
	DbLogLevel string `env:"DB_LOG_LEVEL"`
	PgSSLMode  string `env:"PGSSLMODE"`

	// Logging
	LogLevel    string `env:"LOG_LEVEL"`
	VerboseMode string `env:"VERBOSE_MODE"`

	// Business
	HorizontalPropertyBusinessTypeID string `env:"HORIZONTAL_PROPERTY_BUSINESS_TYPE_ID"`

	// HTTP
	HTTPTimeout string `env:"HTTP_TIMEOUT"`
}

func splitTag(tag string) []string {
	// Usamos SplitN para dividir solo en la primera coma
	parts := make([]string, 0, 2)
	for i, c := range tag {
		if c == ',' {
			parts = append(parts, tag[:i], tag[i+1:])
			return parts
		}
	}
	return []string{tag}
}

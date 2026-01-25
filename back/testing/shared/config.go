package shared

import (
	"fmt"
	"os"
	"strconv"
)

type UserConfig struct {
	Number   int
	Email    string
	Password string
	Name     string
}

// GetAvailableUsers retorna los 3 usuarios configurados en .env
func GetAvailableUsers() []UserConfig {
	users := []UserConfig{}

	for i := 1; i <= 3; i++ {
		email := os.Getenv(fmt.Sprintf("TEST_USER%d_EMAIL", i))
		password := os.Getenv(fmt.Sprintf("TEST_USER%d_PASSWORD", i))
		name := os.Getenv(fmt.Sprintf("TEST_USER%d_NAME", i))

		if email != "" && password != "" {
			users = append(users, UserConfig{
				Number:   i,
				Email:    email,
				Password: password,
				Name:     name,
			})
		}
	}

	return users
}

func GetHorizontalPropertyBusinessTypeID() (uint, error) {
	idStr := os.Getenv("HORIZONTAL_PROPERTY_BUSINESS_TYPE_ID")
	if idStr == "" {
		return 2, nil // Valor por defecto
	}

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return 0, fmt.Errorf("HORIZONTAL_PROPERTY_BUSINESS_TYPE_ID inválido: %w", err)
	}

	return uint(id), nil
}

func IsVerboseMode() bool {
	return os.Getenv("VERBOSE_MODE") == "true"
}

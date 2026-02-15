package mocks

// MockEnvConfig - Mock para configuración de entorno
type MockEnvConfig struct {
	Values map[string]string
}

// NewMockEnvConfig - Crea un nuevo mock de env config
func NewMockEnvConfig() *MockEnvConfig {
	return &MockEnvConfig{
		Values: make(map[string]string),
	}
}

// Get retorna el valor de la variable de entorno
func (m *MockEnvConfig) Get(key string) string {
	if m.Values == nil {
		return ""
	}
	return m.Values[key]
}

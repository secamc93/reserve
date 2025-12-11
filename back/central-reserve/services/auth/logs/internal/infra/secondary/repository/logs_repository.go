package repository

import (
	"bufio"
	"central_reserve/services/auth/logs/internal/domain"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os/exec"
	"strings"
	"time"
)

// StreamLogs obtiene un stream de logs en tiempo real usando docker logs -f
func (r *Repository) StreamLogs(ctx context.Context, filter domain.LogFilter) (io.ReadCloser, error) {
	// Obtener nombre del contenedor desde configuración
	containerName := r.env.Get("CONTAINER_NAME")
	if containerName == "" {
		// Intentar detectar el contenedor automáticamente
		containerName = r.detectContainerName()
		// Si no se detecta, usar el nombre por defecto de producción
		if containerName == "" {
			containerName = "central_reserve_prod"
		}
	}

	if containerName == "" {
		// En desarrollo local sin Docker, retornar un stream vacío con mensaje informativo
		pr, pw := io.Pipe()
		go func() {
			defer pw.Close()
			// Enviar un mensaje informativo
			infoMsg := map[string]interface{}{
				"level":   "info",
				"message": "⚠️ Modo desarrollo: Los logs solo están disponibles cuando el backend se ejecuta en Docker. Para ver logs en tiempo real, ejecuta el backend con Docker Compose o configura CONTAINER_NAME.",
				"service": "logs",
				"module":  "repository",
			}
			jsonData, _ := json.Marshal(infoMsg)
			pw.Write(jsonData)
			pw.Write([]byte("\n"))
		}()
		return pr, nil
	}

	// Verificar que el contenedor existe
	checkCmd := exec.CommandContext(ctx, "docker", "ps", "--filter", fmt.Sprintf("name=%s", containerName), "--format", "{{.Names}}")
	output, err := checkCmd.Output()
	if err != nil || strings.TrimSpace(string(output)) != containerName {
		// Si el contenedor no existe, retornar un stream con mensaje informativo
		pr, pw := io.Pipe()
		go func() {
			defer pw.Close()
			availableContainers := r.listAvailableContainers()
			infoMsg := map[string]interface{}{
				"level":   "warn",
				"message": fmt.Sprintf("⚠️ Contenedor '%s' no está corriendo. Contenedores disponibles: %s. Para ver logs, ejecuta el backend en Docker o configura CONTAINER_NAME correctamente.", containerName, availableContainers),
				"service": "logs",
				"module":  "repository",
			}
			jsonData, _ := json.Marshal(infoMsg)
			pw.Write(jsonData)
			pw.Write([]byte("\n"))
		}()
		return pr, nil
	}

	// Ejecutar docker logs -f para obtener logs en tiempo real
	cmd := exec.CommandContext(ctx, "docker", "logs", "-f", "--tail", "100", containerName)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("error creando pipe de stdout: %w", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		stdout.Close()
		return nil, fmt.Errorf("error creando pipe de stderr: %w", err)
	}

	// Iniciar el comando
	if err := cmd.Start(); err != nil {
		stdout.Close()
		stderr.Close()
		return nil, fmt.Errorf("error iniciando docker logs: %w", err)
	}

	// Crear un reader combinado que lea de stdout y stderr
	reader := io.MultiReader(stdout, stderr)

	// Crear un pipe para filtrar los logs
	pr, pw := io.Pipe()

	// Goroutine para leer y filtrar logs
	go func() {
		defer pw.Close()
		defer stdout.Close()
		defer stderr.Close()

		scanner := bufio.NewScanner(reader)
		for scanner.Scan() {
			select {
			case <-ctx.Done():
				return
			default:
				line := scanner.Text()
				logEntry := r.parseLogLine(line)

				// Filtrar solo logs de este proyecto (central_reserve o auth)
				if !r.isFromThisProject(logEntry) {
					continue
				}

				// Aplicar filtros
				if r.matchesFilter(logEntry, filter) {
					// Convertir a JSON y escribir al pipe
					jsonData, err := json.Marshal(logEntry)
					if err == nil {
						pw.Write(jsonData)
						pw.Write([]byte("\n"))
					}
				}
			}
		}

		// Esperar a que termine el comando
		cmd.Wait()
	}()

	return pr, nil
}

// parseLogLine parsea una línea de log de Docker
func (r *Repository) parseLogLine(line string) domain.LogEntry {
	entry := domain.LogEntry{
		Timestamp: time.Now(),
		Level:     "info",
		Fields:    make(map[string]interface{}),
		Message:   line,
	}

	// Intentar parsear como JSON (formato json-file de Docker)
	var jsonData map[string]interface{}
	if err := json.Unmarshal([]byte(line), &jsonData); err == nil {
		// Es JSON, extraer campos del formato Docker json-file
		// Formato: {"log":"mensaje\n","stream":"stdout","time":"..."}
		if logMsg, ok := jsonData["log"].(string); ok {
			entry.Message = strings.TrimSpace(logMsg)

			// Intentar parsear el mensaje como JSON de zerolog
			var logContent map[string]interface{}
			if err := json.Unmarshal([]byte(entry.Message), &logContent); err == nil {
				// El mensaje es JSON estructurado de zerolog
				if level, ok := logContent["level"].(string); ok {
					entry.Level = strings.ToLower(level)
				}
				if message, ok := logContent["message"].(string); ok {
					entry.Message = message
				}
				if service, ok := logContent["service"].(string); ok {
					entry.Service = service
				}
				if module, ok := logContent["module"].(string); ok {
					entry.Module = module
				}
				if function, ok := logContent["function"].(string); ok {
					entry.Function = function
				}
				if businessID, ok := logContent["business_id"].(float64); ok {
					id := uint(businessID)
					entry.BusinessID = &id
				}
				if userID, ok := logContent["user_id"].(float64); ok {
					id := uint(userID)
					entry.UserID = &id
				}

				// Copiar otros campos
				for k, v := range logContent {
					if k != "level" && k != "message" && k != "service" &&
						k != "module" && k != "function" && k != "business_id" && k != "user_id" {
						entry.Fields[k] = v
					}
				}
			}
		}

		// Extraer timestamp del formato Docker
		if timeStr, ok := jsonData["time"].(string); ok {
			if t, err := time.Parse(time.RFC3339Nano, timeStr); err == nil {
				entry.Timestamp = t
			}
		}
	} else {
		// No es JSON, intentar parsear formato de texto
		entry = r.parseTextLog(line)
	}

	return entry
}

// parseTextLog parsea un log en formato texto
func (r *Repository) parseTextLog(line string) domain.LogEntry {
	entry := domain.LogEntry{
		Timestamp: time.Now(),
		Level:     "info",
		Fields:    make(map[string]interface{}),
		Message:   line,
	}

	// Intentar extraer información del formato de zerolog console
	parts := strings.Fields(line)
	if len(parts) > 0 {
		// Buscar nivel
		for _, part := range parts {
			partUpper := strings.ToUpper(part)
			if partUpper == "ERR" || partUpper == "ERROR" {
				entry.Level = "error"
				break
			} else if partUpper == "WARN" {
				entry.Level = "warn"
				break
			} else if partUpper == "INFO" {
				entry.Level = "info"
				break
			} else if partUpper == "DEBUG" {
				entry.Level = "debug"
				break
			}
		}
	}

	return entry
}

// matchesFilter verifica si un log cumple con los filtros
func (r *Repository) matchesFilter(entry domain.LogEntry, filter domain.LogFilter) bool {
	if filter.Level != nil && strings.ToLower(entry.Level) != strings.ToLower(*filter.Level) {
		return false
	}

	if filter.Service != nil && entry.Service != *filter.Service {
		return false
	}

	if filter.Module != nil && entry.Module != *filter.Module {
		return false
	}

	if filter.Function != nil && entry.Function != *filter.Function {
		return false
	}

	if filter.BusinessID != nil && (entry.BusinessID == nil || *entry.BusinessID != *filter.BusinessID) {
		return false
	}

	if filter.UserID != nil && (entry.UserID == nil || *entry.UserID != *filter.UserID) {
		return false
	}

	if filter.Search != nil && !strings.Contains(strings.ToLower(entry.Message), strings.ToLower(*filter.Search)) {
		return false
	}

	return true
}

// detectContainerName intenta detectar automáticamente el nombre del contenedor
func (r *Repository) detectContainerName() string {
	// Prioridad: buscar primero el contenedor de producción
	variants := []string{
		"central_reserve_prod", // Nombre en docker-compose de producción
		"central_reserve",      // Nombre en docker-compose de desarrollo
		"central-reserve-prod",
		"central-reserve",
	}

	for _, variant := range variants {
		checkCmd := exec.Command("docker", "ps", "--filter", fmt.Sprintf("name=^%s$", variant), "--format", "{{.Names}}")
		output, err := checkCmd.Output()
		if err == nil && strings.TrimSpace(string(output)) == variant {
			return variant
		}
	}

	// Si no se encuentra con nombre exacto, buscar contenedores que contengan "central_reserve"
	cmd := exec.Command("docker", "ps", "--filter", "name=central_reserve", "--format", "{{.Names}}")
	output, err := cmd.Output()
	if err == nil {
		names := strings.TrimSpace(string(output))
		if names != "" {
			// Tomar el primer contenedor encontrado
			lines := strings.Split(names, "\n")
			if len(lines) > 0 && lines[0] != "" {
				return lines[0]
			}
		}
	}

	return ""
}

// isFromThisProject verifica si un log pertenece a este proyecto
func (r *Repository) isFromThisProject(entry domain.LogEntry) bool {
	// Si tiene campo service, verificar que sea de este proyecto
	if entry.Service != "" {
		serviceLower := strings.ToLower(entry.Service)
		// Aceptar servicios relacionados con central_reserve o auth
		if strings.Contains(serviceLower, "central") ||
			strings.Contains(serviceLower, "reserve") ||
			strings.Contains(serviceLower, "auth") {
			return true
		}
		// Rechazar servicios de otros proyectos
		if strings.Contains(serviceLower, "probability") {
			return false
		}
	}

	// Si el mensaje contiene referencias a otros proyectos, rechazarlo
	msgLower := strings.ToLower(entry.Message)
	if strings.Contains(msgLower, "probability-back-central") ||
		strings.Contains(msgLower, "probability_back_central") {
		return false
	}

	// Si no tiene service pero el mensaje no es de otro proyecto, aceptarlo
	// (puede ser un log de texto plano de este proyecto)
	return true
}

// listAvailableContainers lista los contenedores disponibles para debugging
func (r *Repository) listAvailableContainers() string {
	cmd := exec.Command("docker", "ps", "--format", "{{.Names}}")
	output, err := cmd.Output()
	if err != nil {
		return "error al listar contenedores"
	}
	return strings.TrimSpace(string(output))
}

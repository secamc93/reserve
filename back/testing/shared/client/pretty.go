package client

import (
	"encoding/json"
	"fmt"
	"strings"
)

// Colores ANSI
const (
	Reset      = "\033[0m"
	Bold       = "\033[1m"
	Dim        = "\033[2m"

	// Colores de texto
	Red        = "\033[31m"
	Green      = "\033[32m"
	Yellow     = "\033[33m"
	Blue       = "\033[34m"
	Magenta    = "\033[35m"
	Cyan       = "\033[36m"
	White      = "\033[37m"
	Gray       = "\033[90m"

	// Colores brillantes
	BrightRed     = "\033[91m"
	BrightGreen   = "\033[92m"
	BrightYellow  = "\033[93m"
	BrightBlue    = "\033[94m"
	BrightMagenta = "\033[95m"
	BrightCyan    = "\033[96m"
)

// PrettyPrinter maneja el formateo visual de peticiones HTTP
type PrettyPrinter struct {
	enabled bool
}

// NewPrettyPrinter crea un nuevo printer
func NewPrettyPrinter() *PrettyPrinter {
	return &PrettyPrinter{enabled: true}
}

// Enable activa el pretty printing
func (p *PrettyPrinter) Enable() {
	p.enabled = true
}

// Disable desactiva el pretty printing
func (p *PrettyPrinter) Disable() {
	p.enabled = false
}

// IsEnabled retorna si está habilitado
func (p *PrettyPrinter) IsEnabled() bool {
	return p.enabled
}

// PrintRequest imprime una petición HTTP de forma visual
func (p *PrettyPrinter) PrintRequest(method, path string, body interface{}) {
	p.PrintRequestWithURL(method, "", path, body)
}

// PrintRequestWithURL imprime una petición HTTP con la URL completa
func (p *PrettyPrinter) PrintRequestWithURL(method, baseURL, path string, body interface{}) {
	if !p.enabled {
		return
	}

	methodColor := p.getMethodColor(method)
	fullURL := path
	if baseURL != "" {
		fullURL = baseURL + path
	}

	fmt.Println()
	fmt.Printf("%s┌─ REQUEST ─────────────────────────────────────────────────────────%s\n", Cyan, Reset)
	fmt.Printf("%s│%s %s%s%s %s%s%s\n", Cyan, Reset, methodColor, Bold, method, Reset+BrightCyan, fullURL, Reset)

	if body != nil {
		jsonBody, err := json.MarshalIndent(body, "│ ", "  ")
		if err == nil && string(jsonBody) != "null" {
			fmt.Printf("%s│%s\n", Cyan, Reset)
			fmt.Printf("%s│%s %sBody:%s\n", Cyan, Reset, Dim, Reset)
			lines := strings.Split(string(jsonBody), "\n")
			for _, line := range lines {
				fmt.Printf("%s│%s %s%s%s\n", Cyan, Reset, Yellow, line, Reset)
			}
		}
	}

	fmt.Printf("%s└──────────────────────────────────────────────────────────────────────%s\n", Cyan, Reset)
}

// PrintResponse imprime una respuesta HTTP de forma visual
func (p *PrettyPrinter) PrintResponse(statusCode int, body []byte) {
	p.PrintResponseWithHeaders(statusCode, body, nil)
}

// PrintResponseWithHeaders imprime una respuesta HTTP con headers
func (p *PrettyPrinter) PrintResponseWithHeaders(statusCode int, body []byte, headers map[string][]string) {
	if !p.enabled {
		return
	}

	statusColor := p.getStatusColor(statusCode)

	fmt.Println()
	fmt.Printf("%s┌─ RESPONSE ────────────────────────────────────────────────────────%s\n", Green, Reset)
	fmt.Printf("%s│%s %sStatus:%s %s%d%s\n", Green, Reset, Dim, Reset, statusColor+Bold, statusCode, Reset)

	// Imprimir headers si existen
	if len(headers) > 0 {
		fmt.Printf("%s│%s\n", Green, Reset)
		fmt.Printf("%s│%s %sHeaders:%s\n", Green, Reset, Dim, Reset)
		for key, values := range headers {
			// Mostrar solo headers relevantes
			if p.isRelevantHeader(key) {
				for _, value := range values {
					fmt.Printf("%s│%s   %s%s:%s %s\n", Green, Reset, Cyan, key, Reset, value)
				}
			}
		}
	}

	if len(body) > 0 {
		fmt.Printf("%s│%s\n", Green, Reset)
		fmt.Printf("%s│%s %sBody:%s\n", Green, Reset, Dim, Reset)
		// Intentar formatear como JSON
		var jsonData interface{}
		if err := json.Unmarshal(body, &jsonData); err == nil {
			prettyJSON, _ := json.MarshalIndent(jsonData, "", "  ")
			p.printColoredJSON(string(prettyJSON))
		} else {
			// Si no es JSON, imprimir como texto
			fmt.Printf("%s│%s %s\n", Green, Reset, string(body))
		}
	}

	fmt.Printf("%s└──────────────────────────────────────────────────────────────────────%s\n", Green, Reset)
	fmt.Println()
}

// isRelevantHeader determina si un header es relevante para mostrar
func (p *PrettyPrinter) isRelevantHeader(key string) bool {
	relevantHeaders := map[string]bool{
		"Content-Type":           true,
		"Content-Length":         true,
		"Authorization":          true,
		"X-Request-Id":           true,
		"X-Response-Time":        true,
		"Set-Cookie":             true,
		"Cache-Control":          true,
		"X-Rate-Limit-Remaining": true,
		"X-Rate-Limit-Limit":     true,
	}
	return relevantHeaders[key]
}

// PrintError imprime un error de forma visual
func (p *PrettyPrinter) PrintError(err error) {
	if !p.enabled {
		return
	}

	fmt.Println()
	fmt.Printf("%s┌─ ERROR ───────────────────────────────────────────────────────────%s\n", Red, Reset)
	fmt.Printf("%s│%s %s%s%s\n", Red, Reset, BrightRed, err.Error(), Reset)
	fmt.Printf("%s└──────────────────────────────────────────────────────────────────────%s\n", Red, Reset)
	fmt.Println()
}

// getMethodColor retorna el color según el método HTTP
func (p *PrettyPrinter) getMethodColor(method string) string {
	switch method {
	case "GET":
		return BrightGreen
	case "POST":
		return BrightYellow
	case "PUT":
		return BrightBlue
	case "PATCH":
		return BrightMagenta
	case "DELETE":
		return BrightRed
	default:
		return White
	}
}

// getStatusColor retorna el color según el código de estado
func (p *PrettyPrinter) getStatusColor(code int) string {
	switch {
	case code >= 200 && code < 300:
		return BrightGreen
	case code >= 300 && code < 400:
		return BrightYellow
	case code >= 400 && code < 500:
		return BrightRed
	case code >= 500:
		return Red + Bold
	default:
		return White
	}
}

// printColoredJSON imprime JSON con colores
func (p *PrettyPrinter) printColoredJSON(jsonStr string) {
	lines := strings.Split(jsonStr, "\n")

	for _, line := range lines {
		coloredLine := p.colorizeJSONLine(line)
		fmt.Printf("%s│%s %s\n", Green, Reset, coloredLine)
	}
}

// colorizeJSONLine colorea una línea de JSON
func (p *PrettyPrinter) colorizeJSONLine(line string) string {
	result := line

	// Colorear claves (texto antes de ":")
	if colonIdx := strings.Index(line, ":"); colonIdx > 0 {
		keyPart := line[:colonIdx]
		valuePart := line[colonIdx:]

		// La clave está entre comillas
		if strings.Contains(keyPart, "\"") {
			keyPart = strings.Replace(keyPart, "\"", Cyan+"\"", 1)
			keyPart = strings.Replace(keyPart, "\"", "\""+Reset, 1)
		}

		// Colorear valores
		valuePart = p.colorizeValue(valuePart)

		result = keyPart + valuePart
	} else {
		// Líneas sin ":" (brackets, etc.)
		result = Gray + line + Reset
	}

	return result
}

// colorizeValue colorea un valor JSON
func (p *PrettyPrinter) colorizeValue(value string) string {
	trimmed := strings.TrimSpace(strings.TrimPrefix(value, ":"))
	trimmed = strings.TrimSuffix(trimmed, ",")

	// Strings
	if strings.HasPrefix(trimmed, "\"") {
		return strings.Replace(value, trimmed, Yellow+trimmed+Reset, 1)
	}

	// Números
	if _, err := fmt.Sscanf(trimmed, "%f", new(float64)); err == nil {
		return strings.Replace(value, trimmed, Magenta+trimmed+Reset, 1)
	}

	// Booleanos
	if trimmed == "true" {
		return strings.Replace(value, "true", BrightGreen+"true"+Reset, 1)
	}
	if trimmed == "false" {
		return strings.Replace(value, "false", BrightRed+"false"+Reset, 1)
	}

	// Null
	if trimmed == "null" {
		return strings.Replace(value, "null", Dim+"null"+Reset, 1)
	}

	return value
}

// Separador visual
func (p *PrettyPrinter) PrintSeparator(title string) {
	if !p.enabled {
		return
	}

	fmt.Println()
	fmt.Printf("%s═══════════════════════════════════════════════════════════════%s\n", Cyan, Reset)
	fmt.Printf("  %s%s%s\n", Bold+White, title, Reset)
	fmt.Printf("%s═══════════════════════════════════════════════════════════════%s\n", Cyan, Reset)
}

// Box imprime texto en un cuadro
func (p *PrettyPrinter) PrintBox(title string) {
	if !p.enabled {
		return
	}

	width := 64
	padding := (width - len(title) - 4) / 2

	fmt.Println()
	fmt.Printf("%s╔%s╗%s\n", Cyan, strings.Repeat("═", width-2), Reset)
	fmt.Printf("%s║%s%s%s%s%s║%s\n",
		Cyan,
		strings.Repeat(" ", padding),
		Bold + White + title + Reset,
		strings.Repeat(" ", width-len(title)-padding-4),
		Cyan,
		Reset)
	fmt.Printf("%s╚%s╝%s\n", Cyan, strings.Repeat("═", width-2), Reset)
}

// Info imprime mensaje informativo
func (p *PrettyPrinter) PrintInfo(message string) {
	if !p.enabled {
		return
	}
	fmt.Printf("%s✓%s %s\n", BrightGreen, Reset, message)
}

// Warning imprime advertencia
func (p *PrettyPrinter) PrintWarning(message string) {
	if !p.enabled {
		return
	}
	fmt.Printf("%s⚠%s %s\n", BrightYellow, Reset, message)
}

// PrintStep imprime un paso de proceso
func (p *PrettyPrinter) PrintStep(message string) {
	if !p.enabled {
		return
	}
	fmt.Printf("  %s→%s %s\n", Cyan, Reset, message)
}

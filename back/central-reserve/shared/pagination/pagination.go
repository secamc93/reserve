// Package pagination concentra la regla de paginación de todas las listas del API:
// page por defecto 1 (mínimo 1) y page_size por defecto 10 (mínimo 1, máximo 200).
//
// No depende de ningún framework: los handlers le pasan los valores ya leídos del query
// (Resolve / ParseQuery) y los casos de uso o repositorios lo usan como defensa (Normalize).
package pagination

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
)

const (
	// DefaultPage es la página que se usa cuando no se envía page (o se envía 0).
	DefaultPage = 1
	// DefaultPageSize es el tamaño que se usa cuando no se envía page_size (o se envía 0).
	DefaultPageSize = 10
	// MaxPageSize es el máximo de registros por página que acepta cualquier lista.
	MaxPageSize = 200
)

var (
	// ErrInvalidPage se devuelve cuando page no es un entero mayor o igual a 1.
	ErrInvalidPage = errors.New("page debe ser un número entero mayor o igual a 1")
	// ErrInvalidPageSize se devuelve cuando page_size no es un entero entre 1 y MaxPageSize.
	ErrInvalidPageSize = fmt.Errorf("page_size debe ser un número entero entre 1 y %d", MaxPageSize)
)

// Resolve valida page y page_size recibidos por HTTP (ya convertidos a entero) y aplica
// los valores por defecto. Un 0 significa "no enviado": page=0 → 1 y page_size=0 → 10.
// Un valor negativo o un page_size mayor a MaxPageSize devuelve error (el handler responde 400).
func Resolve(page, pageSize int) (int, int, error) {
	if page < 0 {
		return 0, 0, ErrInvalidPage
	}
	if pageSize < 0 || pageSize > MaxPageSize {
		return 0, 0, ErrInvalidPageSize
	}
	if page == 0 {
		page = DefaultPage
	}
	if pageSize == 0 {
		pageSize = DefaultPageSize
	}
	return page, pageSize, nil
}

// ParseQuery convierte los textos de los query params page y page_size y los valida con
// Resolve. Un texto vacío equivale a no enviado. Un texto no numérico devuelve error.
func ParseQuery(pageStr, pageSizeStr string) (int, int, error) {
	page, err := parseInt(pageStr)
	if err != nil {
		return 0, 0, ErrInvalidPage
	}
	pageSize, err := parseInt(pageSizeStr)
	if err != nil {
		return 0, 0, ErrInvalidPageSize
	}
	return Resolve(page, pageSize)
}

// Normalize ajusta page y page_size sin devolver error. Es la defensa de los casos de uso y
// repositorios: page < 1 → 1, page_size < 1 → 10 y page_size > MaxPageSize → MaxPageSize.
func Normalize(page, pageSize int) (int, int) {
	if page < 1 {
		page = DefaultPage
	}
	if pageSize < 1 {
		pageSize = DefaultPageSize
	}
	if pageSize > MaxPageSize {
		pageSize = MaxPageSize
	}
	return page, pageSize
}

func parseInt(s string) (int, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return 0, nil
	}
	return strconv.Atoi(s)
}

package pagination_test

import (
	"errors"
	"testing"

	"central_reserve/shared/pagination"
)

func TestConstants(t *testing.T) {
	if pagination.DefaultPage != 1 || pagination.DefaultPageSize != 10 || pagination.MaxPageSize != 200 {
		t.Fatalf("regla de paginación cambiada: page=%d page_size=%d max=%d",
			pagination.DefaultPage, pagination.DefaultPageSize, pagination.MaxPageSize)
	}
}

func TestResolve(t *testing.T) {
	tests := []struct {
		name       string
		page, size int
		wantPage   int
		wantSize   int
		wantErr    error
	}{
		{"ausentes (0) usan valores por defecto", 0, 0, 1, 10, nil},
		{"page_size mínimo 1", 1, 1, 1, 1, nil},
		{"page_size por defecto explícito", 4, 10, 4, 10, nil},
		{"page_size máximo 200", 2, 200, 2, 200, nil},
		{"page_size 201 se rechaza", 1, 201, 0, 0, pagination.ErrInvalidPageSize},
		{"page_size negativo se rechaza", 1, -5, 0, 0, pagination.ErrInvalidPageSize},
		{"page negativa se rechaza", -1, 10, 0, 0, pagination.ErrInvalidPage},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			page, size, err := pagination.Resolve(tt.page, tt.size)
			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("error: esperaba %v, obtuvo %v", tt.wantErr, err)
			}
			if page != tt.wantPage || size != tt.wantSize {
				t.Fatalf("esperaba page=%d page_size=%d, obtuvo page=%d page_size=%d", tt.wantPage, tt.wantSize, page, size)
			}
		})
	}
}

func TestParseQuery(t *testing.T) {
	tests := []struct {
		name               string
		pageStr, sizeStr   string
		wantPage, wantSize int
		wantErr            error
	}{
		{"vacíos usan valores por defecto", "", "", 1, 10, nil},
		{"ceros usan valores por defecto", "0", "0", 1, 10, nil},
		{"espacios se ignoran", " 3 ", " 25 ", 3, 25, nil},
		{"page_size 200 se acepta", "1", "200", 1, 200, nil},
		{"page_size 201 se rechaza", "1", "201", 0, 0, pagination.ErrInvalidPageSize},
		{"page_size no numérico se rechaza", "1", "abc", 0, 0, pagination.ErrInvalidPageSize},
		{"page no numérica se rechaza", "x", "10", 0, 0, pagination.ErrInvalidPage},
		{"page negativa se rechaza", "-2", "10", 0, 0, pagination.ErrInvalidPage},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			page, size, err := pagination.ParseQuery(tt.pageStr, tt.sizeStr)
			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("error: esperaba %v, obtuvo %v", tt.wantErr, err)
			}
			if page != tt.wantPage || size != tt.wantSize {
				t.Fatalf("esperaba page=%d page_size=%d, obtuvo page=%d page_size=%d", tt.wantPage, tt.wantSize, page, size)
			}
		})
	}
}

func TestNormalize(t *testing.T) {
	tests := []struct {
		name               string
		page, size         int
		wantPage, wantSize int
	}{
		{"ceros usan valores por defecto", 0, 0, 1, 10},
		{"negativos usan valores por defecto", -3, -1, 1, 10},
		{"mínimo 1 se respeta", 1, 1, 1, 1},
		{"200 se respeta", 5, 200, 5, 200},
		{"201 se ajusta a 200", 1, 201, 1, 200},
		{"1000 se ajusta a 200", 1, 1000, 1, 200},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			page, size := pagination.Normalize(tt.page, tt.size)
			if page != tt.wantPage || size != tt.wantSize {
				t.Fatalf("esperaba page=%d page_size=%d, obtuvo page=%d page_size=%d", tt.wantPage, tt.wantSize, page, size)
			}
		})
	}
}

func TestErrorMessages(t *testing.T) {
	if got := pagination.ErrInvalidPageSize.Error(); got != "page_size debe ser un número entero entre 1 y 200" {
		t.Fatalf("mensaje de page_size inesperado: %q", got)
	}
	if got := pagination.ErrInvalidPage.Error(); got != "page debe ser un número entero mayor o igual a 1" {
		t.Fatalf("mensaje de page inesperado: %q", got)
	}
}

package handlers_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/unit/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/unit/internal/domain"
	"central_reserve/services/horizontalproperty/unit/internal/infra/primary/handlers"

	"github.com/gin-gonic/gin"
)

// fakeListUseCase implementa solo ListPropertyUnits y guarda los filtros que recibe.
type fakeListUseCase struct {
	domain.PropertyUnitUseCase
	called bool
	got    domain.PropertyUnitFiltersDTO
}

func (f *fakeListUseCase) ListPropertyUnits(_ context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
	f.called = true
	f.got = filters
	return &domain.PaginatedPropertyUnitsDTO{
		Units:      []domain.PropertyUnitListDTO{},
		Total:      450,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: int((450 + int64(filters.PageSize) - 1) / int64(filters.PageSize)),
	}, nil
}

// doList simula un usuario normal del business 3 (business_id del token) listando unidades.
func doList(t *testing.T, query string) (*httptest.ResponseRecorder, *fakeListUseCase) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	uc := &fakeListUseCase{}
	h := handlers.New(uc, mocks.NewMockLogger())

	r := gin.New()
	r.GET("/units", func(c *gin.Context) {
		c.Set("business_id", uint(3))
		c.Set("auth_info", &middleware.AuthInfo{UserID: 1, BusinessID: 3})
		h.ListPropertyUnits(c)
	})
	req := httptest.NewRequest(http.MethodGet, "/units"+query, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w, uc
}

type listBody struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Data    struct {
		Total      int64 `json:"total"`
		Page       int   `json:"page"`
		PageSize   int   `json:"page_size"`
		TotalPages int   `json:"total_pages"`
	} `json:"data"`
}

func decode(t *testing.T, w *httptest.ResponseRecorder) listBody {
	t.Helper()
	var b listBody
	if err := json.Unmarshal(w.Body.Bytes(), &b); err != nil {
		t.Fatalf("respuesta no es JSON: %v (%s)", err, w.Body.String())
	}
	return b
}

func TestListPropertyUnitsHandler_Pagination(t *testing.T) {
	t.Run("sin page ni page_size usa page=1 y page_size=10", func(t *testing.T) {
		w, uc := doList(t, "")
		if w.Code != http.StatusOK {
			t.Fatalf("esperaba 200, obtuvo %d: %s", w.Code, w.Body.String())
		}
		if uc.got.Page != 1 || uc.got.PageSize != 10 {
			t.Fatalf("esperaba page=1 page_size=10, el caso de uso recibió page=%d page_size=%d", uc.got.Page, uc.got.PageSize)
		}
		b := decode(t, w)
		if b.Data.Page != 1 || b.Data.PageSize != 10 || b.Data.Total != 450 || b.Data.TotalPages != 45 {
			t.Fatalf("metadatos de paginación inesperados: %+v", b.Data)
		}
	})

	t.Run("page_size=0 equivale a no enviado (10)", func(t *testing.T) {
		w, uc := doList(t, "?page=0&page_size=0")
		if w.Code != http.StatusOK {
			t.Fatalf("esperaba 200, obtuvo %d: %s", w.Code, w.Body.String())
		}
		if uc.got.Page != 1 || uc.got.PageSize != 10 {
			t.Fatalf("esperaba page=1 page_size=10, recibió page=%d page_size=%d", uc.got.Page, uc.got.PageSize)
		}
	})

	t.Run("page_size=1 (mínimo) se acepta", func(t *testing.T) {
		w, uc := doList(t, "?page=3&page_size=1")
		if w.Code != http.StatusOK || uc.got.Page != 3 || uc.got.PageSize != 1 {
			t.Fatalf("esperaba 200 con page=3 page_size=1, obtuvo %d page=%d page_size=%d", w.Code, uc.got.Page, uc.got.PageSize)
		}
	})

	t.Run("page_size=200 (máximo) se acepta y llega intacto", func(t *testing.T) {
		w, uc := doList(t, "?page=2&page_size=200")
		if w.Code != http.StatusOK {
			t.Fatalf("esperaba 200, obtuvo %d: %s", w.Code, w.Body.String())
		}
		if uc.got.Page != 2 || uc.got.PageSize != 200 {
			t.Fatalf("esperaba page=2 page_size=200, recibió page=%d page_size=%d", uc.got.Page, uc.got.PageSize)
		}
		b := decode(t, w)
		if b.Data.PageSize != 200 || b.Data.TotalPages != 3 {
			t.Fatalf("esperaba page_size=200 total_pages=3 en la respuesta, obtuvo %+v", b.Data)
		}
	})

	t.Run("page_size=201 se rechaza con 400 y mensaje claro", func(t *testing.T) {
		w, uc := doList(t, "?page_size=201")
		if w.Code != http.StatusBadRequest {
			t.Fatalf("esperaba 400, obtuvo %d: %s", w.Code, w.Body.String())
		}
		if uc.called {
			t.Fatal("no debe llamar al caso de uso con page_size inválido")
		}
		b := decode(t, w)
		if b.Success || b.Error != "page_size debe ser un número entero entre 1 y 200" {
			t.Fatalf("mensaje de error inesperado: %s", w.Body.String())
		}
	})

	t.Run("valores negativos o no numéricos se rechazan con 400", func(t *testing.T) {
		for _, q := range []string{"?page_size=-1", "?page=-1", "?page_size=abc", "?page=abc"} {
			w, uc := doList(t, q)
			if w.Code != http.StatusBadRequest || uc.called {
				t.Fatalf("%s: esperaba 400 sin llamar al caso de uso, obtuvo %d (llamó=%v)", q, w.Code, uc.called)
			}
		}
	})
}

package handlers_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/unit/internal/app"
	"central_reserve/services/horizontalproperty/unit/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/unit/internal/domain"
	"central_reserve/services/horizontalproperty/unit/internal/infra/primary/handlers"

	"github.com/gin-gonic/gin"
)

// doSummary simula una petición al resumen con el business_id del token indicado (0 = super admin).
func doSummary(t *testing.T, tokenBusinessID uint, query string) (*httptest.ResponseRecorder, *uint) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	var got *uint
	repo := &mocks.MockPropertyUnitRepository{
		GetPropertyUnitsSummaryFunc: func(ctx context.Context, businessID uint) (*domain.PropertyUnitsSummaryDTO, error) {
			id := businessID
			got = &id
			return &domain.PropertyUnitsSummaryDTO{
				Total: 2, Active: 1, WithResidents: 1, CoefficientSum: 1.5,
				Blocks: []domain.PropertyUnitBlockSummaryDTO{{Block: "Casa", Total: 2, Active: 1, CoefficientSum: 1.5}},
			}, nil
		},
	}
	h := handlers.New(app.New(repo, mocks.NewMockLogger()), mocks.NewMockLogger())
	r := gin.New()
	r.GET("/summary", func(c *gin.Context) {
		c.Set("business_id", tokenBusinessID)
		c.Set("auth_info", &middleware.AuthInfo{UserID: 1, BusinessID: tokenBusinessID})
		h.GetPropertyUnitsSummary(c)
	})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/summary"+query, nil))
	return w, got
}

func TestGetPropertyUnitsSummaryHandler(t *testing.T) {
	t.Run("usuario normal: usa el business_id del token", func(t *testing.T) {
		w, got := doSummary(t, 3, "")
		if w.Code != http.StatusOK {
			t.Fatalf("esperaba 200, obtuvo %d: %s", w.Code, w.Body.String())
		}
		if got == nil || *got != 3 {
			t.Fatalf("esperaba consultar business 3, obtuvo %v", got)
		}
		var body struct {
			Data struct {
				Total          int64   `json:"total"`
				WithResidents  int64   `json:"with_residents"`
				CoefficientSum float64 `json:"coefficient_sum"`
				Blocks         []struct {
					Block          string  `json:"block"`
					Total          int64   `json:"total"`
					CoefficientSum float64 `json:"coefficient_sum"`
				} `json:"blocks"`
			} `json:"data"`
		}
		if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
			t.Fatalf("respuesta no es JSON: %v", err)
		}
		if body.Data.Total != 2 || body.Data.WithResidents != 1 || len(body.Data.Blocks) != 1 || body.Data.Blocks[0].Block != "Casa" {
			t.Fatalf("payload inesperado: %s", w.Body.String())
		}
	})

	t.Run("usuario normal no puede ver el resumen de otro business", func(t *testing.T) {
		w, got := doSummary(t, 3, "?business_id=9")
		if w.Code != http.StatusForbidden {
			t.Fatalf("esperaba 403, obtuvo %d", w.Code)
		}
		if got != nil {
			t.Fatal("no debía consultar el repositorio")
		}
	})

	t.Run("super admin con business_id consulta esa propiedad", func(t *testing.T) {
		w, got := doSummary(t, 0, "?business_id=9")
		if w.Code != http.StatusOK || got == nil || *got != 9 {
			t.Fatalf("esperaba 200 sobre business 9, obtuvo %d / %v", w.Code, got)
		}
	})

	t.Run("super admin sin business_id recibe 400", func(t *testing.T) {
		w, _ := doSummary(t, 0, "")
		if w.Code != http.StatusBadRequest {
			t.Fatalf("esperaba 400, obtuvo %d", w.Code)
		}
	})

	t.Run("business_id no numérico recibe 400", func(t *testing.T) {
		w, _ := doSummary(t, 0, "?business_id=abc")
		if w.Code != http.StatusBadRequest {
			t.Fatalf("esperaba 400, obtuvo %d", w.Code)
		}
	})
}

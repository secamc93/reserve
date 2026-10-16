package handlers_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/resident/internal/app"
	"central_reserve/services/horizontalproperty/resident/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/services/horizontalproperty/resident/internal/infra/primary/handlers"

	"github.com/gin-gonic/gin"
)

func doResidentsSummary(t *testing.T, tokenBusinessID uint, query string) (*httptest.ResponseRecorder, *uint) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	var got *uint
	repo := &mocks.MockResidentRepository{
		GetResidentsSummaryFunc: func(ctx context.Context, businessID uint) (*domain.ResidentsSummaryDTO, error) {
			id := businessID
			got = &id
			return &domain.ResidentsSummaryDTO{Total: 2, Active: 2, Main: 1, Types: []domain.ResidentTypeCountDTO{
				{ResidentTypeID: 1, Name: "Propietario", Code: "owner", Total: 2},
			}}, nil
		},
	}
	h := handlers.New(app.New(repo, mocks.NewMockLogger()), mocks.NewMockLogger())
	r := gin.New()
	r.GET("/summary", func(c *gin.Context) {
		c.Set("business_id", tokenBusinessID)
		c.Set("auth_info", &middleware.AuthInfo{UserID: 1, BusinessID: tokenBusinessID})
		h.GetResidentsSummary(c)
	})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/summary"+query, nil))
	return w, got
}

func TestGetResidentsSummaryHandler(t *testing.T) {
	t.Run("usuario normal usa el business del token", func(t *testing.T) {
		w, got := doResidentsSummary(t, 3, "")
		if w.Code != http.StatusOK || got == nil || *got != 3 {
			t.Fatalf("esperaba 200 sobre business 3; code=%d got=%v", w.Code, got)
		}
		var body struct {
			Data struct {
				Total int64 `json:"total"`
				Types []struct {
					ResidentTypeID uint   `json:"resident_type_id"`
					Name           string `json:"name"`
					Total          int64  `json:"total"`
				} `json:"types"`
			} `json:"data"`
		}
		if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
			t.Fatalf("respuesta no es JSON: %v", err)
		}
		if body.Data.Total != 2 || len(body.Data.Types) != 1 || body.Data.Types[0].Name != "Propietario" {
			t.Fatalf("payload inesperado: %s", w.Body.String())
		}
	})

	t.Run("usuario normal no ve el resumen de otro business", func(t *testing.T) {
		w, got := doResidentsSummary(t, 3, "?business_id=8")
		if w.Code != http.StatusForbidden || got != nil {
			t.Fatalf("esperaba 403 sin consulta; code=%d got=%v", w.Code, got)
		}
	})

	t.Run("super admin con business_id", func(t *testing.T) {
		w, got := doResidentsSummary(t, 0, "?business_id=8")
		if w.Code != http.StatusOK || got == nil || *got != 8 {
			t.Fatalf("esperaba 200 sobre business 8; code=%d got=%v", w.Code, got)
		}
	})

	t.Run("super admin sin business_id recibe 400", func(t *testing.T) {
		if w, _ := doResidentsSummary(t, 0, ""); w.Code != http.StatusBadRequest {
			t.Fatalf("esperaba 400, obtuvo %d", w.Code)
		}
	})
}

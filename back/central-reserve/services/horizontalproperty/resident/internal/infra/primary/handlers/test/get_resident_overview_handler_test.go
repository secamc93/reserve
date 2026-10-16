package handlers_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/resident/internal/app"
	"central_reserve/services/horizontalproperty/resident/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/services/horizontalproperty/resident/internal/infra/primary/handlers"

	"github.com/gin-gonic/gin"
)

// El residente 5 pertenece al business 3.
func doOverview(t *testing.T, tokenBusinessID uint, path string) *httptest.ResponseRecorder {
	t.Helper()
	gin.SetMode(gin.TestMode)
	repo := &mocks.MockResidentRepository{
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			if id != 5 {
				return nil, domain.ErrResidentNotFound
			}
			return &domain.ResidentDetailDTO{ID: 5, BusinessID: 3}, nil
		},
		GetResidentOverviewFunc: func(ctx context.Context, businessID, residentID uint, now time.Time) (*domain.ResidentOverviewDTO, error) {
			return &domain.ResidentOverviewDTO{}, nil
		},
	}
	h := handlers.New(app.New(repo, mocks.NewMockLogger()), mocks.NewMockLogger())
	r := gin.New()
	r.GET("/residents/:resident_id/overview", func(c *gin.Context) {
		c.Set("business_id", tokenBusinessID)
		c.Set("auth_info", &middleware.AuthInfo{UserID: 1, BusinessID: tokenBusinessID})
		h.GetResidentOverview(c)
	})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, path, nil))
	return w
}

func TestGetResidentOverviewHandler(t *testing.T) {
	cases := []struct {
		name  string
		token uint
		path  string
		want  int
	}{
		{"usuario de la propiedad", 3, "/residents/5/overview", http.StatusOK},
		{"usuario de otra propiedad no ve al residente", 8, "/residents/5/overview", http.StatusNotFound},
		{"usuario que pide otro business_id", 3, "/residents/5/overview?business_id=8", http.StatusForbidden},
		{"super admin con business_id", 0, "/residents/5/overview?business_id=3", http.StatusOK},
		{"super admin sin business_id", 0, "/residents/5/overview", http.StatusBadRequest},
		{"id inválido", 3, "/residents/abc/overview", http.StatusBadRequest},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if w := doOverview(t, tc.token, tc.path); w.Code != tc.want {
				t.Fatalf("esperaba %d, obtuvo %d: %s", tc.want, w.Code, w.Body.String())
			}
		})
	}
}

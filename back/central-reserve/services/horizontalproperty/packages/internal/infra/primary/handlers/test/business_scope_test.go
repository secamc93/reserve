package handlers_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/packages/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers"

	"github.com/gin-gonic/gin"
)

// useCaseSpy registra el negocio con el que el handler consulta.
type useCaseSpy struct {
	domain.PackageUseCase
	listBusinessID    uint
	summaryBusinessID uint
}

func (s *useCaseSpy) ListPackages(ctx context.Context, f domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
	s.listBusinessID = f.BusinessID
	return &domain.PaginatedPackagesDTO{Page: 1, PageSize: 10}, nil
}

func (s *useCaseSpy) GetPackagesSummary(ctx context.Context, businessID uint, now time.Time) (*domain.PackagesSummaryDTO, error) {
	s.summaryBusinessID = businessID
	return &domain.PackagesSummaryDTO{}, nil
}

func call(t *testing.T, tokenBusinessID uint, path string, run func(h *handlers.PackageHandler, c *gin.Context)) *useCaseSpy {
	t.Helper()
	gin.SetMode(gin.TestMode)
	spy := &useCaseSpy{}
	h := handlers.New(spy, mocks.NewLoggerMock())
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, path, nil)
	c.Set("auth_info", &middleware.AuthInfo{BusinessID: tokenBusinessID})
	c.Set("business_id", tokenBusinessID)
	run(h, c)
	if w.Code != http.StatusOK {
		t.Fatalf("status %d: %s", w.Code, w.Body.String())
	}
	return spy
}

func TestListPackages_UsuarioNormalNoPuedeConsultarOtroNegocio(t *testing.T) {
	spy := call(t, 7, "/horizontal-properties/packages?business_id=99", func(h *handlers.PackageHandler, c *gin.Context) { h.ListPackages(c) })
	if spy.listBusinessID != 7 {
		t.Fatalf("consultó el negocio %d; un usuario normal solo ve el de su token (7)", spy.listBusinessID)
	}
}

func TestListPackages_SuperAdminEligeNegocioPorQuery(t *testing.T) {
	spy := call(t, 0, "/horizontal-properties/packages?business_id=99", func(h *handlers.PackageHandler, c *gin.Context) { h.ListPackages(c) })
	if spy.listBusinessID != 99 {
		t.Fatalf("consultó el negocio %d, se esperaba 99", spy.listBusinessID)
	}
}

func TestPackagesSummary_UsuarioNormalNoPuedeConsultarOtroNegocio(t *testing.T) {
	spy := call(t, 7, "/horizontal-properties/packages/summary?business_id=99", func(h *handlers.PackageHandler, c *gin.Context) { h.GetPackagesSummary(c) })
	if spy.summaryBusinessID != 7 {
		t.Fatalf("contó el negocio %d; un usuario normal solo ve el de su token (7)", spy.summaryBusinessID)
	}
}

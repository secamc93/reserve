package handlers_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/visit/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers"

	"github.com/gin-gonic/gin"
)

// useCaseSpy registra con qué filtros consulta el handler.
type useCaseSpy struct {
	domain.VisitUseCase
	filters      domain.VisitFiltersDTO
	summaryBizID uint
	summaryDay   time.Time
}

func (s *useCaseSpy) ListVisits(ctx context.Context, f domain.VisitFiltersDTO) (*domain.PaginatedVisitsDTO, error) {
	s.filters = f
	return &domain.PaginatedVisitsDTO{Page: 1, PageSize: 10}, nil
}

func (s *useCaseSpy) GetVisitsSummary(ctx context.Context, businessID uint, day time.Time) (*domain.VisitsSummaryDTO, error) {
	s.summaryBizID = businessID
	s.summaryDay = day
	return &domain.VisitsSummaryDTO{}, nil
}

func call(t *testing.T, tokenBusinessID uint, path string, run func(h *handlers.VisitHandler, c *gin.Context)) *useCaseSpy {
	t.Helper()
	gin.SetMode(gin.TestMode)
	spy := &useCaseSpy{}
	h := handlers.New(spy, mocks.NewMockLogger())
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

func list(h *handlers.VisitHandler, c *gin.Context)    { h.ListVisits(c) }
func summary(h *handlers.VisitHandler, c *gin.Context) { h.GetVisitsSummary(c) }

func TestListVisits_UsuarioNormalNoPuedeConsultarOtroNegocio(t *testing.T) {
	spy := call(t, 7, "/horizontal-properties/visits?business_id=99", list)
	if spy.filters.BusinessID != 7 {
		t.Fatalf("consultó el negocio %d; un usuario normal solo ve el de su token (7)", spy.filters.BusinessID)
	}
}

func TestListVisits_SuperAdminEligeNegocioPorQuery(t *testing.T) {
	spy := call(t, 0, "/horizontal-properties/visits?business_id=99", list)
	if spy.filters.BusinessID != 99 {
		t.Fatalf("consultó el negocio %d, se esperaba 99", spy.filters.BusinessID)
	}
}

// Regresión: el handler ignoraba visit_type_id y visit_status_id (los filtros del front no
// hacían nada) y end_date excluía el propio día.
func TestListVisits_LeeFiltrosYFechaFinInclusiva(t *testing.T) {
	spy := call(t, 7, "/horizontal-properties/visits?visit_type_id=2&visit_status_id=3&state=inside&q=casa&start_date=2026-10-15&end_date=2026-10-15", list)
	f := spy.filters
	if f.VisitTypeID == nil || *f.VisitTypeID != 2 || f.VisitStatusID == nil || *f.VisitStatusID != 3 {
		t.Fatalf("filtros de tipo/estado no leídos: %+v", f)
	}
	if f.State != "inside" || f.Search != "casa" {
		t.Fatalf("state/q no leídos: %+v", f)
	}
	visitDay := time.Date(2026, 10, 15, 0, 0, 0, 0, time.UTC)
	if f.StartDate == nil || f.EndDate == nil || visitDay.Before(*f.StartDate) || visitDay.After(*f.EndDate) {
		t.Fatalf("una visita del 15 debe quedar dentro de [start, end]: %v - %v", f.StartDate, f.EndDate)
	}
	if !f.EndDate.Before(visitDay.Add(24 * time.Hour)) {
		t.Fatalf("end_date no debe incluir el día siguiente: %v", f.EndDate)
	}
}

func TestVisitsSummary_UsuarioNormalNoPuedeConsultarOtroNegocio(t *testing.T) {
	spy := call(t, 7, "/horizontal-properties/visits/summary?business_id=99&date=2026-10-15", summary)
	if spy.summaryBizID != 7 {
		t.Fatalf("contó el negocio %d; un usuario normal solo ve el de su token (7)", spy.summaryBizID)
	}
	if spy.summaryDay.Format("2006-01-02") != "2026-10-15" {
		t.Fatalf("día = %v", spy.summaryDay)
	}
}

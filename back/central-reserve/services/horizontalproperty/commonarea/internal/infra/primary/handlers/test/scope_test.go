package handlers_test

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/commonarea/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	handlers "central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers"

	"github.com/gin-gonic/gin"
)

// fakeUseCase implementa solo lo que usan estas pruebas; el resto entra en pánico si se llama.
type fakeUseCase struct {
	domain.CommonAreaUseCase
	areaBusiness        uint
	reservationBusiness uint
	calls               map[string]int
	listFilters         *domain.CommonAreaFiltersDTO
}

func (f *fakeUseCase) hit(name string) { f.calls[name]++ }

func (f *fakeUseCase) GetCommonAreaByID(ctx context.Context, id uint) (*domain.CommonArea, error) {
	return &domain.CommonArea{ID: id, BusinessID: f.areaBusiness, Name: "Salón", IsActive: true}, nil
}
func (f *fakeUseCase) GetReservationByID(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
	return &domain.CommonAreaReservation{ID: id, BusinessID: f.reservationBusiness}, nil
}
func (f *fakeUseCase) UpdateCommonArea(ctx context.Context, dto domain.UpdateCommonAreaDTO) (*domain.CommonArea, error) {
	f.hit("update")
	return &domain.CommonArea{ID: dto.ID, BusinessID: f.areaBusiness}, nil
}
func (f *fakeUseCase) DeleteCommonArea(ctx context.Context, id uint) error {
	f.hit("delete")
	return nil
}
func (f *fakeUseCase) SetSchedules(ctx context.Context, id uint, s []domain.ScheduleInputDTO) ([]*domain.CommonAreaSchedule, error) {
	f.hit("schedules")
	return nil, nil
}
func (f *fakeUseCase) ApproveReservation(ctx context.Context, id uint, userID uint) (*domain.CommonAreaReservation, error) {
	f.hit("approve")
	return &domain.CommonAreaReservation{ID: id}, nil
}
func (f *fakeUseCase) UpdateReservationPayments(ctx context.Context, id uint, dto domain.UpdatePaymentsDTO) (*domain.CommonAreaReservation, error) {
	f.hit("payments")
	return &domain.CommonAreaReservation{ID: id}, nil
}
func (f *fakeUseCase) ListCommonAreas(ctx context.Context, filters domain.CommonAreaFiltersDTO) (*domain.PaginatedCommonAreasDTO, error) {
	f.hit("list")
	f.listFilters = &filters
	return &domain.PaginatedCommonAreasDTO{Page: filters.Page, PageSize: filters.PageSize}, nil
}

// router arma las rutas como router.go, con una autenticación simulada (business_id del token).
func router(uc domain.CommonAreaUseCase, tokenBusinessID uint) *gin.Engine {
	gin.SetMode(gin.TestMode)
	h := handlers.New(uc, mocks.NewMockLogger())
	r := gin.New()
	auth := func(c *gin.Context) {
		c.Set("auth_info", &middleware.AuthInfo{Type: middleware.AuthTypeJWT, UserID: 7, BusinessID: tokenBusinessID})
		c.Set("user_id", uint(7))
		c.Set("business_id", tokenBusinessID)
		c.Next()
	}
	g := r.Group("/horizontal-properties/common-areas", auth)
	g.GET("", h.ListCommonAreas)
	g.GET("/:id", h.GetCommonAreaByID)
	g.PUT("/:id", h.UpdateCommonArea)
	g.DELETE("/:id", h.DeleteCommonArea)
	g.PUT("/:id/schedules", h.SetSchedules)
	g.POST("/reservations/:id/approve", h.ApproveReservation)
	g.PUT("/reservations/:id/payments", h.UpdateReservationPayments)
	return r
}

func do(r *gin.Engine, method, path, body string) int {
	req := httptest.NewRequest(method, path, bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w.Code
}

const base = "/horizontal-properties/common-areas"

func TestScope_NormalUserCannotTouchOtherBusiness(t *testing.T) {
	uc := &fakeUseCase{areaBusiness: 2, reservationBusiness: 2, calls: map[string]int{}}
	r := router(uc, 1) // usuario de la propiedad 1; los recursos son de la 2

	cases := []struct{ method, path, body string }{
		{http.MethodGet, base + "/5", ""},
		{http.MethodPut, base + "/5", `{"common_area_type_id":1,"name":"X","max_capacity":3}`},
		{http.MethodDelete, base + "/5", ""},
		{http.MethodPut, base + "/5/schedules", `{"schedules":[{"day_of_week":1,"start_time":"08:00","end_time":"10:00","is_active":true}]}`},
		{http.MethodPost, base + "/reservations/9/approve", ""},
		{http.MethodPut, base + "/reservations/9/payments", `{"deposit_paid":true}`},
		// el ?business_id= de un usuario normal se ignora
		{http.MethodGet, base + "/5?business_id=2", ""},
	}
	for _, tc := range cases {
		if code := do(r, tc.method, tc.path, tc.body); code != http.StatusNotFound {
			t.Errorf("%s %s: esperaba 404, obtuvo %d", tc.method, tc.path, code)
		}
	}
	if len(uc.calls) != 0 {
		t.Fatalf("no debe ejecutar casos de uso sobre otra propiedad: %v", uc.calls)
	}
}

func TestScope_NormalUserOwnBusinessIsAllowed(t *testing.T) {
	uc := &fakeUseCase{areaBusiness: 1, reservationBusiness: 1, calls: map[string]int{}}
	r := router(uc, 1)

	if code := do(r, http.MethodPut, base+"/5", `{"common_area_type_id":1,"name":"X","max_capacity":3}`); code != http.StatusOK {
		t.Fatalf("update: %d", code)
	}
	if code := do(r, http.MethodDelete, base+"/5", ""); code != http.StatusOK {
		t.Fatalf("delete: %d", code)
	}
	if code := do(r, http.MethodPost, base+"/reservations/9/approve", ""); code != http.StatusOK {
		t.Fatalf("approve: %d", code)
	}
	if code := do(r, http.MethodPut, base+"/reservations/9/payments", `{"deposit_paid":true}`); code != http.StatusOK {
		t.Fatalf("payments: %d", code)
	}
	if uc.calls["update"] != 1 || uc.calls["delete"] != 1 || uc.calls["approve"] != 1 || uc.calls["payments"] != 1 {
		t.Fatalf("calls=%v", uc.calls)
	}
}

func TestScope_ListUsesTokenBusinessForNormalUser(t *testing.T) {
	uc := &fakeUseCase{calls: map[string]int{}}
	r := router(uc, 1)
	if code := do(r, http.MethodGet, base+"?business_id=2&search=sal", ""); code != http.StatusOK {
		t.Fatalf("list: %d", code)
	}
	if uc.listFilters.BusinessID != 1 || uc.listFilters.Search != "sal" {
		t.Fatalf("filtros: %+v", uc.listFilters)
	}
}

func TestScope_SuperAdminMustSendBusinessID(t *testing.T) {
	uc := &fakeUseCase{areaBusiness: 2, calls: map[string]int{}}
	r := router(uc, 0) // super admin

	if code := do(r, http.MethodGet, base, ""); code != http.StatusBadRequest {
		t.Fatalf("sin business_id: esperaba 400, obtuvo %d", code)
	}
	if code := do(r, http.MethodGet, base+"?business_id=2", ""); code != http.StatusOK {
		t.Fatalf("con business_id: %d", code)
	}
	if uc.listFilters.BusinessID != 2 {
		t.Fatalf("business_id del query no aplicado: %+v", uc.listFilters)
	}
	// super admin apuntando a otra propiedad: la zona (de la 2) no está en su alcance (3)
	if code := do(r, http.MethodDelete, base+"/5?business_id=3", ""); code != http.StatusNotFound {
		t.Fatalf("delete fuera de alcance: %d", code)
	}
	if code := do(r, http.MethodDelete, base+"/5?business_id=2", ""); code != http.StatusOK {
		t.Fatalf("delete en alcance: %d", code)
	}
}

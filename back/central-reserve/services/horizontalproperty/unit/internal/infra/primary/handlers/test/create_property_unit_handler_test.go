package handlers_test

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/unit/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/unit/internal/domain"
	"central_reserve/services/horizontalproperty/unit/internal/infra/primary/handlers"

	"github.com/gin-gonic/gin"
)

// fakeUseCase implementa solo CreatePropertyUnit; el resto del puerto no se usa en estas pruebas.
type fakeUseCase struct {
	domain.PropertyUnitUseCase
	gotBusinessID uint
	called        bool
}

func (f *fakeUseCase) CreatePropertyUnit(_ context.Context, dto domain.CreatePropertyUnitDTO) (*domain.PropertyUnitDetailDTO, error) {
	f.called = true
	f.gotBusinessID = dto.BusinessID
	return &domain.PropertyUnitDetailDTO{ID: 1, BusinessID: dto.BusinessID, Number: dto.Number}, nil
}

// Igual que el middleware JWT: business_id y auth_info en el contexto; el super admin tiene business_id = 0.
func doCreate(t *testing.T, tokenBusinessID uint, query string) (*httptest.ResponseRecorder, *fakeUseCase) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	uc := &fakeUseCase{}
	h := handlers.New(uc, mocks.NewMockLogger())

	r := gin.New()
	r.POST("/units", func(c *gin.Context) {
		c.Set("business_id", tokenBusinessID)
		c.Set("auth_info", &middleware.AuthInfo{UserID: 1, BusinessID: tokenBusinessID})
		h.CreatePropertyUnit(c)
	})
	body := bytes.NewBufferString(`{"number":"T1-101","unit_type":"apartment","participation_coefficient":0.2}`)
	req := httptest.NewRequest(http.MethodPost, "/units"+query, body)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w, uc
}

func TestCreatePropertyUnitHandler_BusinessID(t *testing.T) {
	t.Run("super admin crea unidad con ?business_id (su token trae business_id 0)", func(t *testing.T) {
		w, uc := doCreate(t, 0, "?business_id=7")
		if w.Code != http.StatusCreated {
			t.Fatalf("esperaba 201, obtuvo %d: %s", w.Code, w.Body.String())
		}
		if uc.gotBusinessID != 7 {
			t.Fatalf("la unidad debe crearse en el business 7, se creó en %d", uc.gotBusinessID)
		}
	})

	t.Run("super admin sin ?business_id recibe 400 y no crea nada", func(t *testing.T) {
		w, uc := doCreate(t, 0, "")
		if w.Code != http.StatusBadRequest {
			t.Fatalf("esperaba 400, obtuvo %d", w.Code)
		}
		if uc.called {
			t.Fatal("no debe llamar al caso de uso sin business_id")
		}
	})

	t.Run("super admin con ?business_id inválido recibe 400", func(t *testing.T) {
		for _, q := range []string{"?business_id=0", "?business_id=abc"} {
			w, uc := doCreate(t, 0, q)
			if w.Code != http.StatusBadRequest || uc.called {
				t.Fatalf("%s: esperaba 400 sin crear, obtuvo %d (llamó=%v)", q, w.Code, uc.called)
			}
		}
	})

	t.Run("usuario normal usa el business_id del token e ignora ?business_id", func(t *testing.T) {
		w, uc := doCreate(t, 3, "?business_id=7")
		if w.Code != http.StatusCreated {
			t.Fatalf("esperaba 201, obtuvo %d: %s", w.Code, w.Body.String())
		}
		if uc.gotBusinessID != 3 {
			t.Fatalf("aislamiento multi-tenant: debe crear en el business del token (3), creó en %d", uc.gotBusinessID)
		}
	})
}

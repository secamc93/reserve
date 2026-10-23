package handlers_test

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"central_reserve/services/horizontalproperty/paymentevents/contract"
	"central_reserve/services/horizontalproperty/paymentevents/internal/infra/primary/handlers"
	"central_reserve/shared/payments/wompi"

	"github.com/gin-gonic/gin"
)

const secret = "test_events_x"

type fakeApplier struct {
	got []wompi.Transaction
	err error
}

func (f *fakeApplier) ApplyGatewayTransaction(_ context.Context, tx wompi.Transaction) error {
	f.got = append(f.got, tx)
	return f.err
}

// event arma un transaction.updated firmado como Wompi (o con otro secreto si se pide).
func event(reference, signWith string) string {
	sum := sha256.Sum256([]byte(fmt.Sprintf("tx-1APPROVED5000000%d%s", 1700000000, signWith)))
	return fmt.Sprintf(`{"event":"transaction.updated","data":{"transaction":{"id":"tx-1","status":"APPROVED","amount_in_cents":5000000,"reference":%q,"currency":"COP","payment_method_type":"PSE"}},"signature":{"properties":["transaction.id","transaction.status","transaction.amount_in_cents"],"checksum":%q},"timestamp":1700000000}`,
		reference, hex.EncodeToString(sum[:]))
}

func serve(t *testing.T, appliers map[string]contract.Applier, body string) int {
	t.Helper()
	gin.SetMode(gin.TestMode)
	r := gin.New()
	client := wompi.New(wompi.Config{PublicKey: "pub_test_x", IntegritySecret: "i", EventsSecret: secret})
	handlers.New(client, appliers, nopLogger{}).RegisterRoutes(r.Group("/api/v1"))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodPost, "/api/v1/payments/wompi/events", strings.NewReader(body)))
	return w.Code
}

func TestWompiEvents_DespachaPorPrefijoDeReferencia(t *testing.T) {
	days, memb := &fakeApplier{}, &fakeApplier{}
	appliers := map[string]contract.Applier{"DIA-": days, "MEMB-": memb}

	if code := serve(t, appliers, event("MEMB-7-1", secret)); code != http.StatusOK {
		t.Fatalf("código = %d, se esperaba 200", code)
	}
	if len(memb.got) != 1 || len(days.got) != 0 || memb.got[0].Reference != "MEMB-7-1" || memb.got[0].AmountInCents != 5000000 {
		t.Fatalf("membresía recibió %+v, días %+v", memb.got, days.got)
	}
}

func TestWompiEvents_FirmaInvalidaNoLlegaANingunModulo(t *testing.T) {
	days := &fakeApplier{}
	if code := serve(t, map[string]contract.Applier{"DIA-": days}, event("DIA-1-1", "otro")); code != http.StatusUnauthorized {
		t.Fatalf("código = %d, se esperaba 401", code)
	}
	if len(days.got) != 0 {
		t.Fatal("un evento con firma inválida no debía aplicarse")
	}
}

func TestWompiEvents_ReferenciaDesconocidaYNoAplicableResponden200(t *testing.T) {
	days := &fakeApplier{err: fmt.Errorf("monto distinto: %w", contract.ErrNotApplicable)}
	appliers := map[string]contract.Applier{"DIA-": days}
	if code := serve(t, appliers, event("OTRA-1", secret)); code != http.StatusOK {
		t.Fatalf("referencia desconocida: código = %d, se esperaba 200", code)
	}
	if code := serve(t, appliers, event("DIA-1-1", secret)); code != http.StatusOK {
		t.Fatalf("no aplicable: código = %d, se esperaba 200", code)
	}
}

func TestWompiEvents_ErrorInternoPideReintento(t *testing.T) {
	days := &fakeApplier{err: errors.New("base caída")}
	if code := serve(t, map[string]contract.Applier{"DIA-": days}, event("DIA-1-1", secret)); code != http.StatusInternalServerError {
		t.Fatalf("código = %d, se esperaba 500 (Wompi reintenta)", code)
	}
}

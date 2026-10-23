package wompi_test

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"central_reserve/shared/payments/wompi"
)

// Ejemplo oficial de la documentación de Wompi (Widget & Checkout Web).
func TestIntegritySignature_EjemploDeLaDocumentacion(t *testing.T) {
	got := wompi.IntegritySignature("sk8-438k4-xmxm392-sn2m", "2490000", "COP", "prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6")
	if got != "37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5" {
		t.Fatalf("firma = %s", got)
	}
}

func TestCheckoutURL_LlevaLosParametrosYLaFirma(t *testing.T) {
	gw := wompi.New(wompi.Config{PublicKey: "pub_test_abc", IntegritySecret: "test_integrity_x"})
	raw, err := gw.CheckoutURL("RUPU-42-1", 5000000, "COP", "http://localhost:3005/v")
	if err != nil {
		t.Fatalf("CheckoutURL: %v", err)
	}
	u, err := url.Parse(raw)
	if err != nil || u.Host != "checkout.wompi.co" || u.Path != "/p/" {
		t.Fatalf("url = %s", raw)
	}
	q := u.Query()
	want := map[string]string{
		"public-key":          "pub_test_abc",
		"currency":            "COP",
		"amount-in-cents":     "5000000",
		"reference":           "RUPU-42-1",
		"redirect-url":        "http://localhost:3005/v",
		"signature:integrity": wompi.IntegritySignature("RUPU-42-1", "5000000", "COP", "test_integrity_x"),
	}
	for k, v := range want {
		if q.Get(k) != v {
			t.Errorf("%s = %q, se esperaba %q", k, q.Get(k), v)
		}
	}
	if strings.Contains(raw, "test_integrity_x") {
		t.Fatal("el secreto de integridad no puede ir en la URL")
	}
}

func TestEnabled_RequiereLlavePublicaYSecretoDeIntegridad(t *testing.T) {
	if wompi.New(wompi.Config{PublicKey: "pub_test_abc"}).Enabled() {
		t.Fatal("sin secreto de integridad no puede estar habilitada")
	}
	if !wompi.New(wompi.Config{PublicKey: "pub_test_abc", IntegritySecret: "s"}).Enabled() {
		t.Fatal("con ambas llaves debe estar habilitada")
	}
}

const eventsSecret = "test_events_secret"

// signedEvent arma un transaction.updated firmado como lo hace Wompi: SHA-256 de los valores de
// signature.properties en orden + timestamp + secreto de eventos (documentación "Eventos").
func signedEvent(status string, amount int64, secret string) []byte {
	sum := sha256.Sum256([]byte(fmt.Sprintf("tx-1%s%d1530291411%s", status, amount, secret)))
	checksum := strings.ToUpper(hex.EncodeToString(sum[:])) // la documentación lo muestra en mayúsculas
	return []byte(fmt.Sprintf(`{"event":"transaction.updated","data":{"transaction":{"id":"tx-1","amount_in_cents":%d,
		"reference":"RUPU-42-1","currency":"COP","payment_method_type":"NEQUI","status":"%s","shipping_address":null}},
		"environment":"test","signature":{"properties":["transaction.id","transaction.status","transaction.amount_in_cents"],
		"checksum":"%s"},"timestamp":1530291411,"sent_at":"2026-10-22T16:45:05.000Z"}`, amount, status, checksum))
}

func TestParseEvent_FirmaValidaDevuelveLaTransaccion(t *testing.T) {
	gw := wompi.New(wompi.Config{PublicKey: "pub_test_abc", IntegritySecret: "s", EventsSecret: eventsSecret})
	tx, err := gw.ParseEvent(signedEvent("APPROVED", 5000000, eventsSecret))
	if err != nil {
		t.Fatalf("ParseEvent: %v", err)
	}
	if tx.ID != "tx-1" || tx.Reference != "RUPU-42-1" || tx.Status != "APPROVED" || tx.AmountInCents != 5000000 || tx.Currency != "COP" || tx.PaymentMethodType != "NEQUI" {
		t.Fatalf("transacción = %+v", tx)
	}
}

func TestParseEvent_FirmaConOtroSecretoSeRechaza(t *testing.T) {
	gw := wompi.New(wompi.Config{PublicKey: "pub_test_abc", IntegritySecret: "s", EventsSecret: eventsSecret})
	if _, err := gw.ParseEvent(signedEvent("APPROVED", 5000000, "otro")); !errors.Is(err, wompi.ErrInvalidSignature) {
		t.Fatalf("err = %v, se esperaba firma inválida", err)
	}
}

func TestParseEvent_CuerpoAlteradoSeRechaza(t *testing.T) {
	gw := wompi.New(wompi.Config{PublicKey: "pub_test_abc", IntegritySecret: "s", EventsSecret: eventsSecret})
	body := strings.Replace(string(signedEvent("DECLINED", 5000000, eventsSecret)), `"status":"DECLINED"`, `"status":"APPROVED"`, 1)
	if _, err := gw.ParseEvent([]byte(body)); !errors.Is(err, wompi.ErrInvalidSignature) {
		t.Fatalf("err = %v, se esperaba firma inválida", err)
	}
}

func TestGetTransaction_LeeLaRespuestaDeLaAPI(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/transactions/tx-9" || r.Header.Get("Authorization") != "Bearer pub_test_abc" {
			http.Error(w, "ruta o llave inesperada", http.StatusBadRequest)
			return
		}
		fmt.Fprint(w, `{"data":{"id":"tx-9","reference":"RUPU-42-1","status":"APPROVED","amount_in_cents":5000000,"currency":"COP","payment_method_type":"PSE"}}`)
	}))
	defer srv.Close()

	gw := wompi.New(wompi.Config{PublicKey: "pub_test_abc", IntegritySecret: "s", APIURL: srv.URL})
	tx, err := gw.GetTransaction(context.Background(), "tx-9")
	if err != nil {
		t.Fatalf("GetTransaction: %v", err)
	}
	if tx.ID != "tx-9" || tx.Status != "APPROVED" || tx.AmountInCents != 5000000 || tx.PaymentMethodType != "PSE" {
		t.Fatalf("transacción = %+v", tx)
	}
}

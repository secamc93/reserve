// Package wompi es el cliente de la pasarela Wompi que comparten los módulos que cobran (días de
// votación y membresías). Cada módulo lo envuelve con su propio puerto; el webhook único lo usa para
// validar la firma de los eventos.
package wompi

import (
	"errors"
	"net/http"
	"strings"
	"time"
)

const (
	sandboxAPIURL    = "https://sandbox.wompi.co/v1"
	productionAPIURL = "https://production.wompi.co/v1"
	checkoutBaseURL  = "https://checkout.wompi.co/p/"
)

var (
	// ErrNotConfigured: faltan llaves; la pasarela queda deshabilitada.
	ErrNotConfigured = errors.New("la pasarela de pagos no está configurada")
	// ErrInvalidSignature: el evento no está firmado con el secreto de eventos.
	ErrInvalidSignature = errors.New("firma del evento de la pasarela inválida")
)

// Config son las llaves de Wompi. Sin llave pública o sin secreto de integridad no se puede cobrar.
type Config struct {
	PublicKey       string
	IntegritySecret string
	EventsSecret    string
	// APIURL es opcional: si falta, sandbox con llaves de prueba (pub_test_…) y producción con las demás.
	APIURL string
}

// Transaction es una transacción tal como la reporta Wompi.
type Transaction struct {
	ID                string
	Reference         string
	Status            string
	AmountInCents     int64
	Currency          string
	PaymentMethodType string
}

// Client habla con Wompi.
type Client struct {
	cfg        Config
	apiURL     string
	httpClient *http.Client
}

// New crea el cliente de Wompi.
func New(cfg Config) *Client {
	apiURL := strings.TrimRight(cfg.APIURL, "/")
	if apiURL == "" {
		apiURL = productionAPIURL
		if strings.HasPrefix(cfg.PublicKey, "pub_test_") {
			apiURL = sandboxAPIURL
		}
	}
	return &Client{cfg: cfg, apiURL: apiURL, httpClient: &http.Client{Timeout: 10 * time.Second}}
}

// Enabled dice si se puede cobrar en línea.
func (c *Client) Enabled() bool {
	return c.cfg.PublicKey != "" && c.cfg.IntegritySecret != ""
}

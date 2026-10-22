package wompi

import (
	"net/http"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/ports"
)

const (
	sandboxAPIURL    = "https://sandbox.wompi.co/v1"
	productionAPIURL = "https://production.wompi.co/v1"
	checkoutBaseURL  = "https://checkout.wompi.co/p/"
)

// Config son las llaves de Wompi. Sin llave pública o sin secreto de integridad la pasarela queda
// deshabilitada (el resto del módulo funciona).
type Config struct {
	PublicKey       string
	IntegritySecret string
	EventsSecret    string
	// APIURL es opcional: si falta, se usa sandbox con llaves de prueba (pub_test_…) y producción
	// con las demás.
	APIURL string
}

type gateway struct {
	cfg        Config
	apiURL     string
	httpClient *http.Client
}

// New crea el adaptador de Wompi.
func New(cfg Config) ports.IPaymentGateway {
	apiURL := strings.TrimRight(cfg.APIURL, "/")
	if apiURL == "" {
		apiURL = productionAPIURL
		if strings.HasPrefix(cfg.PublicKey, "pub_test_") {
			apiURL = sandboxAPIURL
		}
	}
	return &gateway{cfg: cfg, apiURL: apiURL, httpClient: &http.Client{Timeout: 10 * time.Second}}
}

func (g *gateway) Enabled() bool {
	return g.cfg.PublicKey != "" && g.cfg.IntegritySecret != ""
}

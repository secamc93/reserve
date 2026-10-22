package wompi

import (
	"crypto/sha256"
	"encoding/hex"
	"net/url"
	"strconv"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
)

// CheckoutURL arma el enlace del Web Checkout de Wompi con la firma de integridad, que se calcula
// aquí para que el secreto nunca llegue al navegador.
func (g *gateway) CheckoutURL(p dtos.CheckoutParams) (string, error) {
	if !g.Enabled() {
		return "", domainerrors.ErrGatewayNotConfigured
	}
	amount := strconv.FormatInt(p.AmountInCents, 10)
	q := url.Values{}
	q.Set("public-key", g.cfg.PublicKey)
	q.Set("currency", p.Currency)
	q.Set("amount-in-cents", amount)
	q.Set("reference", p.Reference)
	q.Set("signature:integrity", IntegritySignature(p.Reference, amount, p.Currency, g.cfg.IntegritySecret))
	q.Set("redirect-url", p.RedirectURL)
	return checkoutBaseURL + "?" + q.Encode(), nil
}

// IntegritySignature es SHA-256(referencia + monto en centavos + moneda + secreto de integridad).
func IntegritySignature(reference, amountInCents, currency, secret string) string {
	sum := sha256.Sum256([]byte(reference + amountInCents + currency + secret))
	return hex.EncodeToString(sum[:])
}

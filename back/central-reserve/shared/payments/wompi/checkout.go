package wompi

import (
	"crypto/sha256"
	"encoding/hex"
	"net/url"
	"strconv"
)

// CheckoutURL arma el enlace del Web Checkout de Wompi con la firma de integridad, que se calcula
// aquí para que el secreto nunca llegue al navegador. Wompi bloquea (403) los redirect-url con
// "localhost" o "127.0.0.1": en local usar rupu.localhost.
func (c *Client) CheckoutURL(reference string, amountInCents int64, currency, redirectURL string) (string, error) {
	if !c.Enabled() {
		return "", ErrNotConfigured
	}
	amount := strconv.FormatInt(amountInCents, 10)
	q := url.Values{}
	q.Set("public-key", c.cfg.PublicKey)
	q.Set("currency", currency)
	q.Set("amount-in-cents", amount)
	q.Set("reference", reference)
	q.Set("signature:integrity", IntegritySignature(reference, amount, currency, c.cfg.IntegritySecret))
	q.Set("redirect-url", redirectURL)
	return checkoutBaseURL + "?" + q.Encode(), nil
}

// IntegritySignature es SHA-256(referencia + monto en centavos + moneda + secreto de integridad).
func IntegritySignature(reference, amountInCents, currency, secret string) string {
	sum := sha256.Sum256([]byte(reference + amountInCents + currency + secret))
	return hex.EncodeToString(sum[:])
}

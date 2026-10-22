package wompi

import (
	"bytes"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
)

type event struct {
	Event     string         `json:"event"`
	Data      map[string]any `json:"data"`
	Signature struct {
		Properties []string `json:"properties"`
		Checksum   string   `json:"checksum"`
	} `json:"signature"`
	Timestamp json.Number `json:"timestamp"`
}

// ParseEvent valida la firma de un evento de Wompi y devuelve su transacción. La firma es
// SHA-256(valores de signature.properties en orden + timestamp + secreto de eventos). Devuelve
// (nil, nil) para eventos que no son de transacciones.
func (g *gateway) ParseEvent(body []byte) (*entities.Transaction, error) {
	if g.cfg.EventsSecret == "" {
		return nil, domainerrors.ErrGatewayNotConfigured
	}
	dec := json.NewDecoder(bytes.NewReader(body))
	dec.UseNumber()
	var ev event
	if err := dec.Decode(&ev); err != nil {
		return nil, fmt.Errorf("%w: cuerpo inválido", domainerrors.ErrInvalidEventSignature)
	}
	if len(ev.Signature.Properties) == 0 || ev.Signature.Checksum == "" {
		return nil, domainerrors.ErrInvalidEventSignature
	}

	var b strings.Builder
	for _, prop := range ev.Signature.Properties {
		val, ok := lookup(ev.Data, prop)
		if !ok {
			return nil, domainerrors.ErrInvalidEventSignature
		}
		b.WriteString(val)
	}
	b.WriteString(ev.Timestamp.String())
	b.WriteString(g.cfg.EventsSecret)
	sum := sha256.Sum256([]byte(b.String()))
	expected := hex.EncodeToString(sum[:])
	if subtle.ConstantTimeCompare([]byte(expected), []byte(strings.ToLower(ev.Signature.Checksum))) != 1 {
		return nil, domainerrors.ErrInvalidEventSignature
	}

	if ev.Event != "transaction.updated" {
		return nil, nil
	}
	raw, ok := ev.Data["transaction"].(map[string]any)
	if !ok {
		return nil, fmt.Errorf("%w: evento sin transacción", domainerrors.ErrInvalidEventSignature)
	}
	return transactionFromMap(raw)
}

// lookup busca un valor por ruta con puntos ("transaction.amount_in_cents") y lo devuelve como
// texto, igual que lo concatena Wompi.
func lookup(data map[string]any, path string) (string, bool) {
	var cur any = data
	for _, key := range strings.Split(path, ".") {
		m, ok := cur.(map[string]any)
		if !ok {
			return "", false
		}
		cur, ok = m[key]
		if !ok {
			return "", false
		}
	}
	switch v := cur.(type) {
	case string:
		return v, true
	case json.Number:
		return v.String(), true
	case bool:
		return fmt.Sprint(v), true
	case nil:
		return "", true
	default:
		return "", false
	}
}

func transactionFromMap(m map[string]any) (*entities.Transaction, error) {
	str := func(k string) string { s, _ := m[k].(string); return s }
	amount, err := toInt64(m["amount_in_cents"])
	if err != nil {
		return nil, fmt.Errorf("monto de la transacción inválido: %w", err)
	}
	return &entities.Transaction{
		ID:                str("id"),
		Reference:         str("reference"),
		Status:            str("status"),
		AmountInCents:     amount,
		Currency:          str("currency"),
		PaymentMethodType: str("payment_method_type"),
	}, nil
}

func toInt64(v any) (int64, error) {
	switch n := v.(type) {
	case json.Number:
		return n.Int64()
	case float64:
		return int64(n), nil
	default:
		return 0, fmt.Errorf("tipo %T", v)
	}
}

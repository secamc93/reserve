package wompi

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

// GetTransaction consulta una transacción en la API de Wompi.
func (c *Client) GetTransaction(ctx context.Context, transactionID string) (*Transaction, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.apiURL+"/transactions/"+url.PathEscape(transactionID), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+c.cfg.PublicKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error consultando la transacción en Wompi: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("wompi respondió %d al consultar la transacción", resp.StatusCode)
	}

	var body struct {
		Data map[string]any `json:"data"`
	}
	dec := json.NewDecoder(resp.Body)
	dec.UseNumber()
	if err := dec.Decode(&body); err != nil {
		return nil, fmt.Errorf("respuesta de Wompi inválida: %w", err)
	}
	return transactionFromMap(body.Data)
}

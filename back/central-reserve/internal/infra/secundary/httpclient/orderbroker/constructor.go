package orderbroker

import (
	"bytes"
	"central_reserve/internal/infra/secundary/httpclient"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/log"
	"context"
	"encoding/json"

	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"
)

type Client struct {
	http    *http.Client
	baseURL string
	Logger  log.ILogger
}

func NewClient(env env.IConfig, logger log.ILogger) *Client {
	httpClient := httpclient.NewHTTPClient(httpclient.HTTPClientConfig{
		Timeout:            15 * time.Second,
		MaxIdleConns:       100,
		IdleConnTimeout:    90 * time.Second,
		DisableCompression: false,
	})
	return &Client{
		http:    httpClient,
		baseURL: env.Get("ORDER_BROKER_URL"),
	}
}

func (c *Client) postJSON(ctx context.Context, path string, body any, res any) error {
	buf := new(bytes.Buffer)
	if err := json.NewEncoder(buf).Encode(body); err != nil {
		return fmt.Errorf("encoding json: %w", err)
	}
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, buf)
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	return c.doRequest(httpReq, res)
}

func (c *Client) doRequest(req *http.Request, res any) error {
	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("sending request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("order broker request failed [%d]: %s - %s", resp.StatusCode, resp.Status, string(body))
	}

	if res != nil {
		if err := json.NewDecoder(resp.Body).Decode(res); err != nil {
			return fmt.Errorf("decoding response: %w", err)
		}
	}

	return nil
}

func addFile(writer *multipart.Writer, fieldName, filename string, reader io.Reader) error {
	part, err := writer.CreateFormFile(fieldName, filename)
	if err != nil {
		return fmt.Errorf("creating form file: %w", err)
	}
	if _, err := io.Copy(part, reader); err != nil {
		return fmt.Errorf("copying file: %w", err)
	}
	return nil
}

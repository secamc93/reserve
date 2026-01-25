package shared

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// HTTPClient maneja las peticiones HTTP a la API
type HTTPClient struct {
	BaseURL string
	Token   string
	Client  *http.Client
}

// NewHTTPClient crea un nuevo cliente HTTP
func NewHTTPClient() *HTTPClient {
	baseURL := os.Getenv("API_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8081/api/v1" // URL por defecto
	}

	return &HTTPClient{
		BaseURL: baseURL,
		Client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// SetToken establece el token JWT para autenticación
func (c *HTTPClient) SetToken(token string) {
	c.Token = token
}

// Request representa una petición HTTP genérica
type Request struct {
	Method  string
	Path    string
	Body    interface{}
	Headers map[string]string
}

// Response representa una respuesta HTTP genérica
type Response struct {
	StatusCode int
	Body       []byte
	Headers    http.Header
}

// Do ejecuta una petición HTTP
func (c *HTTPClient) Do(req Request) (*Response, error) {
	var bodyReader io.Reader
	if req.Body != nil {
		bodyBytes, err := json.Marshal(req.Body)
		if err != nil {
			return nil, fmt.Errorf("error marshalling request body: %w", err)
		}
		bodyReader = bytes.NewBuffer(bodyBytes)
	}

	httpReq, err := http.NewRequest(req.Method, c.BaseURL+req.Path, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	// Headers por defecto
	httpReq.Header.Set("Content-Type", "application/json")
	if c.Token != "" {
		httpReq.Header.Set("Authorization", "Bearer "+c.Token)
	}

	// Headers personalizados
	for key, value := range req.Headers {
		httpReq.Header.Set(key, value)
	}

	// Ejecutar petición
	httpResp, err := c.Client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("error executing request: %w", err)
	}
	defer httpResp.Body.Close()

	// Leer respuesta
	respBody, err := io.ReadAll(httpResp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %w", err)
	}

	return &Response{
		StatusCode: httpResp.StatusCode,
		Body:       respBody,
		Headers:    httpResp.Header,
	}, nil
}

// ParseJSON parsea el body de la respuesta como JSON
func (r *Response) ParseJSON(v interface{}) error {
	return json.Unmarshal(r.Body, v)
}

// GET ejecuta una petición GET
func (c *HTTPClient) GET(path string) (*Response, error) {
	return c.Do(Request{Method: "GET", Path: path})
}

// POST ejecuta una petición POST
func (c *HTTPClient) POST(path string, body interface{}) (*Response, error) {
	return c.Do(Request{Method: "POST", Path: path, Body: body})
}

// PUT ejecuta una petición PUT
func (c *HTTPClient) PUT(path string, body interface{}) (*Response, error) {
	return c.Do(Request{Method: "PUT", Path: path, Body: body})
}

// DELETE ejecuta una petición DELETE
func (c *HTTPClient) DELETE(path string) (*Response, error) {
	return c.Do(Request{Method: "DELETE", Path: path})
}

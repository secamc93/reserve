package client

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/go-resty/resty/v2"
	"reserve/testing/shared/log"
)

// IClient define la interfaz del cliente HTTP
type IClient interface {
	GET(path string) (IResponse, error)
	POST(path string, body interface{}) (IResponse, error)
	PUT(path string, body interface{}) (IResponse, error)
	PATCH(path string, body interface{}) (IResponse, error)
	DELETE(path string) (IResponse, error)
	SetToken(token string)
	GetToken() string
}

// IResponse define la interfaz de una respuesta HTTP
type IResponse interface {
	GetStatusCode() int
	GetBody() []byte
	ParseJSON(v interface{}) error
}

// Config configuración del cliente HTTP
type Config struct {
	BaseURL      string
	Timeout      time.Duration
	RetryCount   int
	RetryWait    time.Duration
	Debug        bool
	PrettyPrint  bool // Habilita el pretty print de request/response
}

// Client maneja las peticiones HTTP usando resty
type Client struct {
	rest    *resty.Client
	logger  log.ILogger
	token   string
	pretty  *PrettyPrinter
	baseURL string
}

// Response representa una respuesta HTTP
type Response struct {
	StatusCode int
	Body       []byte
	Headers    http.Header
}

// New crea un nuevo cliente HTTP con configuración por defecto
func New() *Client {
	return NewWithConfig(Config{})
}

// NewWithConfig crea un nuevo cliente HTTP con configuración personalizada
func NewWithConfig(cfg Config) *Client {
	logger := log.New()

	baseURL := cfg.BaseURL
	if baseURL == "" {
		baseURL = os.Getenv("API_BASE_URL")
		if baseURL == "" {
			baseURL = "http://localhost:3050/api/v1"
		}
	}

	timeout := cfg.Timeout
	if timeout == 0 {
		timeout = 10 * time.Second
	}

	retryCount := cfg.RetryCount
	if retryCount == 0 {
		retryCount = 0 // Sin reintentos por defecto
	}

	retryWait := cfg.RetryWait
	if retryWait == 0 {
		retryWait = 100 * time.Millisecond
	}

	restyClient := resty.New().
		SetBaseURL(baseURL).
		SetTimeout(timeout).
		SetRetryCount(retryCount).
		SetRetryWaitTime(retryWait).
		SetHeader("Content-Type", "application/json").
		SetHeader("Accept", "application/json")

	if cfg.Debug {
		restyClient.SetDebug(true)
	}

	// Crear pretty printer
	pretty := NewPrettyPrinter()
	if !cfg.PrettyPrint {
		pretty.Disable()
	}

	return &Client{
		rest:    restyClient,
		logger:  logger,
		pretty:  pretty,
		baseURL: baseURL,
	}
}

// NewWithLogger crea un nuevo cliente HTTP con logger personalizado
func NewWithLogger(cfg Config, logger log.ILogger) *Client {
	client := NewWithConfig(cfg)
	client.logger = logger
	return client
}

// SetToken establece el token JWT para autenticación
func (c *Client) SetToken(token string) {
	c.token = token
	c.rest.SetAuthToken(token)
}

// GetToken obtiene el token JWT actual
func (c *Client) GetToken() string {
	return c.token
}

// SetDebug activa o desactiva el modo debug de resty
func (c *Client) SetDebug(debug bool) *Client {
	c.rest.SetDebug(debug)
	return c
}

// EnablePrettyPrint activa el pretty print visual
func (c *Client) EnablePrettyPrint() *Client {
	c.pretty.Enable()
	return c
}

// DisablePrettyPrint desactiva el pretty print visual
func (c *Client) DisablePrettyPrint() *Client {
	c.pretty.Disable()
	return c
}

// GetPrettyPrinter devuelve el pretty printer para uso directo
func (c *Client) GetPrettyPrinter() *PrettyPrinter {
	return c.pretty
}

// SetBaseURL cambia la URL base
func (c *Client) SetBaseURL(url string) *Client {
	c.baseURL = url
	c.rest.SetBaseURL(url)
	return c
}

// GetBaseURL devuelve la URL base actual
func (c *Client) GetBaseURL() string {
	return c.baseURL
}

// SetTimeout cambia el timeout
func (c *Client) SetTimeout(timeout time.Duration) *Client {
	c.rest.SetTimeout(timeout)
	return c
}

// SetHeader establece un header personalizado
func (c *Client) SetHeader(key, value string) *Client {
	c.rest.SetHeader(key, value)
	return c
}

// SetHeaders establece múltiples headers
func (c *Client) SetHeaders(headers map[string]string) *Client {
	c.rest.SetHeaders(headers)
	return c
}

// GetRestyClient devuelve el cliente resty subyacente para configuraciones avanzadas
func (c *Client) GetRestyClient() *resty.Client {
	return c.rest
}

// R crea una nueva request de resty
func (c *Client) R() *resty.Request {
	return c.rest.R()
}

// toResponse convierte una respuesta de resty a nuestra estructura Response
func toResponse(resp *resty.Response) *Response {
	return &Response{
		StatusCode: resp.StatusCode(),
		Body:       resp.Body(),
		Headers:    resp.Header(),
	}
}

// GET ejecuta una petición GET
func (c *Client) GET(path string) (IResponse, error) {
	c.pretty.PrintRequestWithURL("GET", c.baseURL, path, nil)

	resp, err := c.rest.R().Get(path)
	if err != nil {
		c.pretty.PrintError(err)
		return nil, err
	}

	response := toResponse(resp)
	c.pretty.PrintResponseWithHeaders(response.StatusCode, response.Body, response.Headers)

	return response, nil
}

// POST ejecuta una petición POST
func (c *Client) POST(path string, body interface{}) (IResponse, error) {
	c.pretty.PrintRequestWithURL("POST", c.baseURL, path, body)

	resp, err := c.rest.R().SetBody(body).Post(path)
	if err != nil {
		c.pretty.PrintError(err)
		return nil, err
	}

	response := toResponse(resp)
	c.pretty.PrintResponseWithHeaders(response.StatusCode, response.Body, response.Headers)

	return response, nil
}

// PUT ejecuta una petición PUT
func (c *Client) PUT(path string, body interface{}) (IResponse, error) {
	c.pretty.PrintRequestWithURL("PUT", c.baseURL, path, body)

	resp, err := c.rest.R().SetBody(body).Put(path)
	if err != nil {
		c.pretty.PrintError(err)
		return nil, err
	}

	response := toResponse(resp)
	c.pretty.PrintResponseWithHeaders(response.StatusCode, response.Body, response.Headers)

	return response, nil
}

// PATCH ejecuta una petición PATCH
func (c *Client) PATCH(path string, body interface{}) (IResponse, error) {
	c.pretty.PrintRequestWithURL("PATCH", c.baseURL, path, body)

	resp, err := c.rest.R().SetBody(body).Patch(path)
	if err != nil {
		c.pretty.PrintError(err)
		return nil, err
	}

	response := toResponse(resp)
	c.pretty.PrintResponseWithHeaders(response.StatusCode, response.Body, response.Headers)

	return response, nil
}

// DELETE ejecuta una petición DELETE
func (c *Client) DELETE(path string) (IResponse, error) {
	c.pretty.PrintRequestWithURL("DELETE", c.baseURL, path, nil)

	resp, err := c.rest.R().Delete(path)
	if err != nil {
		c.pretty.PrintError(err)
		return nil, err
	}

	response := toResponse(resp)
	c.pretty.PrintResponseWithHeaders(response.StatusCode, response.Body, response.Headers)

	return response, nil
}

// GetStatusCode devuelve el código de estado HTTP
func (r *Response) GetStatusCode() int {
	return r.StatusCode
}

// GetBody devuelve el cuerpo de la respuesta
func (r *Response) GetBody() []byte {
	return r.Body
}

// ParseJSON parsea el body de la respuesta como JSON
func (r *Response) ParseJSON(v interface{}) error {
	return json.Unmarshal(r.Body, v)
}

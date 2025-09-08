package routes

import (
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// RegisterAll registra los prefijos de rutas y los proxifica a cada servicio
func RegisterAll(r *gin.Engine, env env.IConfig, logger log.ILogger) {
	// URLs de servicios desde variables de entorno
	authURL := env.Get("AUTH_SERVICE_URL")
	reserveURL := env.Get("RESERVE_SERVICE_URL")
	businessURL := env.Get("BUSINESS_SERVICE_URL")
	customerURL := env.Get("CUSTOMER_SERVICE_URL")
	roomsURL := env.Get("ROOMS_SERVICE_URL")
	tablesURL := env.Get("TABLES_SERVICE_URL")

	// Registrar grupos
	registerProxyGroup(r, "/api/v1/auth", authURL, logger)
	registerProxyGroup(r, "/api/v1/reserves", reserveURL, logger)
	registerProxyGroup(r, "/api/v1/business", businessURL, logger)
	registerProxyGroup(r, "/api/v1/customers", customerURL, logger)
	registerProxyGroup(r, "/api/v1/rooms", roomsURL, logger)
	registerProxyGroup(r, "/api/v1/tables", tablesURL, logger)
}

func registerProxyGroup(r *gin.Engine, prefix string, target string, logger log.ILogger) {
	if target == "" {
		logger.Warn().Str("prefix", prefix).Msg("No target URL configurado; saltando grupo")
		return
	}
	u, err := url.Parse(target)
	if err != nil {
		logger.Error().Str("target", target).Err(err).Msg("URL inválida para proxy")
		return
	}
	proxy := httputil.NewSingleHostReverseProxy(u)

	// Timeouts y manejo de errores para evitar cuelgues silenciosos
	proxy.Transport = &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		DialContext: (&net.Dialer{
			Timeout:   5 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		TLSHandshakeTimeout:   5 * time.Second,
		ResponseHeaderTimeout: 10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}
	proxy.ErrorHandler = func(w http.ResponseWriter, req *http.Request, err error) {
		logger.Error().Err(err).Str("target", target).Str("path", req.URL.Path).Msg("Error en proxy")
		w.WriteHeader(http.StatusBadGateway)
		_, _ = w.Write([]byte("bad gateway"))
	}

	h := func(c *gin.Context) {
		// Preservar el segmento del recurso: quitar solo el prefijo base "/api/v1"
		newPath := strings.TrimPrefix(c.Request.URL.Path, "/api/v1")
		if newPath == "" {
			newPath = "/"
		}
		c.Request.URL.Path = newPath
		proxy.ServeHTTP(c.Writer, c.Request)
		c.Abort()
	}

	group := r.Group(prefix)
	group.Any("/*path", h)
}

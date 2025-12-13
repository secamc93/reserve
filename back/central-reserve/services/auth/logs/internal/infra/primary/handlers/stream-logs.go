package handlers

import (
	"bufio"
	"central_reserve/services/auth/logs/internal/domain"
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// StreamLogsHandler maneja la solicitud de stream de logs en tiempo real
//
//	@Summary		Stream de logs en tiempo real
//	@Description	Obtiene un stream de logs del sistema en tiempo real usando Server-Sent Events (SSE)
//	@Tags			Logs
//	@Accept			json
//	@Produce		text/event-stream
//	@Security		BearerAuth
//	@Param			level		query		string	false	"Nivel de log (error, warn, info, debug)"
//	@Param			service		query		string	false	"Filtrar por servicio"
//	@Param			module		query		string	false	"Filtrar por módulo"
//	@Param			function	query		string	false	"Filtrar por función"
//	@Param			business_id	query		int		false	"Filtrar por business_id"
//	@Param			user_id		query		int		false	"Filtrar por user_id"
//	@Param			search		query		string	false	"Buscar en mensaje"
//	@Success		200			{string}	string	"Stream de logs en formato SSE"
//	@Failure		401			{object}	object	"Token de acceso requerido"
//	@Failure		403			{object}	object	"Solo super administradores pueden ver logs"
//	@Failure		500			{object}	object	"Error interno del servidor"
//	@Router			/logs/stream [get]
func (h *handlers) StreamLogsHandler(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "StreamLogsHandler")

	// Solo super admin puede ver logs
	if !middleware.IsSuperAdmin(c) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"error":   "Solo super administradores pueden ver logs",
		})
		return
	}

	// Parsear filtros
	filter := domain.LogFilter{}

	// Parsear nivel
	if level := c.Query("level"); level != "" {
		filter.Level = &level
	}

	// Parsear servicio
	if service := c.Query("service"); service != "" {
		filter.Service = &service
	}

	// Parsear módulo
	if module := c.Query("module"); module != "" {
		filter.Module = &module
	}

	// Parsear función
	if function := c.Query("function"); function != "" {
		filter.Function = &function
	}

	// Parsear business_id
	if businessIDStr := c.Query("business_id"); businessIDStr != "" {
		if id, err := strconv.ParseUint(businessIDStr, 10, 32); err == nil {
			val := uint(id)
			filter.BusinessID = &val
		}
	}

	// Parsear user_id
	if userIDStr := c.Query("user_id"); userIDStr != "" {
		if id, err := strconv.ParseUint(userIDStr, 10, 32); err == nil {
			val := uint(id)
			filter.UserID = &val
		}
	}

	// Parsear búsqueda
	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}

	// Configurar headers para Server-Sent Events (SSE)
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no") // Deshabilitar buffering de nginx

	// Obtener stream de logs
	stream, err := h.usecase.StreamLogs(ctx, filter)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error al obtener stream de logs")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Error al iniciar stream de logs",
		})
		return
	}
	defer stream.Close()

	// Enviar evento inicial
	c.SSEvent("connected", gin.H{"message": "Stream de logs iniciado"})
	c.Writer.Flush()

	// Crear un canal para el heartbeat
	heartbeatTicker := time.NewTicker(30 * time.Second)
	defer heartbeatTicker.Stop()

	// Canal para señalar cuando terminar
	done := make(chan bool, 1)

	// Goroutine para heartbeat (keep-alive)
	go func() {
		for {
			select {
			case <-heartbeatTicker.C:
				// Enviar comentario SSE para mantener la conexión viva
				// Los comentarios SSE no se procesan por el cliente pero mantienen la conexión activa
				if _, err := c.Writer.WriteString(": heartbeat\n\n"); err != nil {
					done <- true
					return
				}
				c.Writer.Flush()
			case <-ctx.Done():
				done <- true
				return
			case <-c.Request.Context().Done():
				done <- true
				return
			case <-done:
				return
			}
		}
	}()

	// Leer del stream y enviar como SSE
	scanner := bufio.NewScanner(stream)
	for scanner.Scan() {
		select {
		case <-ctx.Done():
			done <- true
			return
		case <-c.Request.Context().Done():
			done <- true
			return
		case <-done:
			return
		default:
			line := scanner.Text()
			if line != "" {
				// Enviar como evento SSE
				c.SSEvent("log", line)
				c.Writer.Flush()
			}
		}
	}

	// Señalar que terminó el scanner
	done <- true

	if err := scanner.Err(); err != nil && err != io.EOF {
		h.logger.Error(ctx).Err(err).Msg("Error leyendo stream de logs")
	}
}

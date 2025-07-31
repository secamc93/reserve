package email

import (
	"bytes"
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/log"
	"context"
	"crypto/tls"
	"fmt"
	"net/smtp"
	"strings"
	"text/template"
	"time"
)

type EmailService struct {
	config env.IConfig
	logger log.ILogger
}

func New(config env.IConfig, logger log.ILogger) ports.IEmailService {
	return &EmailService{
		config: config,
		logger: logger,
	}
}

func (e *EmailService) SendReservationConfirmation(ctx context.Context, email, name string, reservation entities.Reservation) error {
	subject := "Confirmación de Reserva - Trattoria La Bella"

	// Crear el contenido del email
	content, err := e.generateReservationConfirmationEmail(name, reservation)
	if err != nil {
		e.logger.Error(ctx).Err(err).Msg("Error generando contenido del email de confirmación")
		return err
	}

	return e.sendEmail(ctx, email, subject, content)
}

func (e *EmailService) SendReservationCancellation(ctx context.Context, email, name string, reservation entities.Reservation) error {
	subject := "Cancelación de Reserva - Trattoria La Bella"

	// Crear el contenido del email
	content, err := e.generateReservationCancellationEmail(name, reservation)
	if err != nil {
		e.logger.Error(ctx).Err(err).Msg("Error generando contenido del email de cancelación")
		return err
	}

	return e.sendEmail(ctx, email, subject, content)
}

func (e *EmailService) sendEmail(ctx context.Context, to, subject, body string) error {
	// Configuración SMTP
	smtpHost := e.config.Get("SMTP_HOST")
	smtpPort := e.config.Get("SMTP_PORT")
	smtpUser := e.config.Get("SMTP_USER")
	smtpPass := e.config.Get("SMTP_PASS")
	fromEmail := e.config.Get("FROM_EMAIL")
	useTLS := e.config.Get("SMTP_USE_TLS") == "true"
	useSTARTTLS := e.config.Get("SMTP_USE_STARTTLS") == "true"

	// Log temporal para debug
	e.logger.Info(ctx).
		Str("smtp_host", smtpHost).
		Str("smtp_port", smtpPort).
		Str("smtp_user", smtpUser).
		Str("smtp_pass_set", fmt.Sprintf("%t", smtpPass != "")).
		Str("from_email", fromEmail).
		Str("use_starttls", fmt.Sprintf("%t", useSTARTTLS)).
		Str("use_tls", fmt.Sprintf("%t", useTLS)).
		Msg("Configuración SMTP actual")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		e.logger.Warn(ctx).Msg("Configuración SMTP incompleta, saltando envío de email")
		return nil
	}

	// Crear el mensaje
	message := fmt.Sprintf("From: %s\r\n", fromEmail)
	message += fmt.Sprintf("To: %s\r\n", to)
	message += fmt.Sprintf("Subject: %s\r\n", subject)
	message += "MIME-Version: 1.0\r\n"
	message += "Content-Type: text/html; charset=UTF-8\r\n"
	message += "\r\n"
	message += body

	// Autenticación
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	// Enviar email con configuración de seguridad
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	var err error

	if useTLS {
		// Usar TLS directo (puerto 465)
		err = e.sendEmailWithTLS(ctx, addr, auth, fromEmail, []string{to}, []byte(message))
	} else if useSTARTTLS {
		// Usar STARTTLS (puerto 587)
		err = e.sendEmailWithSTARTTLS(ctx, addr, auth, fromEmail, []string{to}, []byte(message))
	} else {
		// Envío sin cifrado (no recomendado para producción)
		err = smtp.SendMail(addr, auth, fromEmail, []string{to}, []byte(message))
	}

	if err != nil {
		e.logger.Error(ctx).Err(err).Str("to", to).Str("method", e.getSecurityMethod(useTLS, useSTARTTLS)).Msg("Error enviando email")
		return err
	}

	e.logger.Info(ctx).Str("to", to).Str("subject", subject).Str("security", e.getSecurityMethod(useTLS, useSTARTTLS)).Msg("Email enviado exitosamente")
	return nil
}

func (e *EmailService) sendEmailWithTLS(ctx context.Context, addr string, auth smtp.Auth, from string, to []string, msg []byte) error {
	// Configuración TLS
	tlsConfig := &tls.Config{
		ServerName:         strings.Split(addr, ":")[0],
		InsecureSkipVerify: false, // Verificar certificados SSL
	}

	// Conectar con TLS
	conn, err := tls.Dial("tcp", addr, tlsConfig)
	if err != nil {
		return fmt.Errorf("error conectando con TLS: %w", err)
	}
	defer conn.Close()

	// Crear cliente SMTP
	client, err := smtp.NewClient(conn, strings.Split(addr, ":")[0])
	if err != nil {
		return fmt.Errorf("error creando cliente SMTP: %w", err)
	}
	defer client.Close()

	// Autenticación
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("error en autenticación: %w", err)
	}

	// Enviar email
	if err = client.Mail(from); err != nil {
		return fmt.Errorf("error estableciendo remitente: %w", err)
	}

	for _, addr := range to {
		if err = client.Rcpt(addr); err != nil {
			return fmt.Errorf("error estableciendo destinatario %s: %w", addr, err)
		}
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("error iniciando envío de datos: %w", err)
	}

	_, err = w.Write(msg)
	if err != nil {
		return fmt.Errorf("error escribiendo mensaje: %w", err)
	}

	err = w.Close()
	if err != nil {
		return fmt.Errorf("error cerrando conexión de datos: %w", err)
	}

	return nil
}

func (e *EmailService) sendEmailWithSTARTTLS(ctx context.Context, addr string, auth smtp.Auth, from string, to []string, msg []byte) error {
	// Conectar sin TLS inicialmente
	client, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("error conectando al servidor SMTP: %w", err)
	}
	defer client.Close()

	// Iniciar STARTTLS
	if err = client.StartTLS(&tls.Config{
		ServerName:         strings.Split(addr, ":")[0],
		InsecureSkipVerify: false, // Verificar certificados SSL
	}); err != nil {
		return fmt.Errorf("error iniciando STARTTLS: %w", err)
	}

	// Autenticación después de STARTTLS
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("error en autenticación: %w", err)
	}

	// Enviar email
	if err = client.Mail(from); err != nil {
		return fmt.Errorf("error estableciendo remitente: %w", err)
	}

	for _, addr := range to {
		if err = client.Rcpt(addr); err != nil {
			return fmt.Errorf("error estableciendo destinatario %s: %w", addr, err)
		}
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("error iniciando envío de datos: %w", err)
	}

	_, err = w.Write(msg)
	if err != nil {
		return fmt.Errorf("error escribiendo mensaje: %w", err)
	}

	err = w.Close()
	if err != nil {
		return fmt.Errorf("error cerrando conexión de datos: %w", err)
	}

	return nil
}

func (e *EmailService) getSecurityMethod(useTLS, useSTARTTLS bool) string {
	if useTLS {
		return "TLS"
	} else if useSTARTTLS {
		return "STARTTLS"
	}
	return "PLAIN"
}

func (e *EmailService) generateReservationConfirmationEmail(name string, reservation entities.Reservation) (string, error) {
	const emailTemplate = `...

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Confirmación de Reserva</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .reservation-details { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #8B4513; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .highlight { color: #8B4513; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍝 Trattoria La Bella</h1>
            <h2>Confirmación de Reserva</h2>
        </div>
        
        <div class="content">
            <p>Estimado/a <span class="highlight">{{.Name}}</span>,</p>
            
            <p>Su reserva ha sido confirmada exitosamente. A continuación encontrará los detalles:</p>
            
            <div class="reservation-details">
                <h3>📋 Detalles de la Reserva</h3>
                <p><strong>Fecha:</strong> {{.Date}}</p>
                <p><strong>Hora:</strong> {{.Time}}</p>
                <p><strong>Número de personas:</strong> {{.NumberOfGuests}}</p>
                <p><strong>Estado:</strong> <span class="highlight">Confirmada</span></p>
            </div>
            
            <p>Por favor, llegue 10 minutos antes de su hora de reserva.</p>
            
            <p>Si necesita modificar o cancelar su reserva, puede hacerlo contactándonos directamente.</p>
            
            <p>¡Esperamos su visita!</p>
            
            <p>Saludos cordiales,<br>
            <strong>Equipo de Trattoria La Bella</strong></p>
        </div>
        
        <div class="footer">
            <p>Este es un email automático, por favor no responda a este mensaje.</p>
            <p>Para consultas, contacte directamente con el restaurante.</p>
        </div>
    </div>
</body>
</html>`

	tmpl, err := template.New("confirmation").Parse(emailTemplate)
	if err != nil {
		return "", err
	}

	location, err := time.LoadLocation("America/Bogota")
	if err != nil {
		return "", fmt.Errorf("error cargando zona horaria: %w", err)
	}
	startAtLocal := reservation.StartAt.In(location)

	data := struct {
		Name           string
		Date           string
		Time           string
		NumberOfGuests int
	}{
		Name:           name,
		Date:           startAtLocal.Format("02/01/2006"),
		Time:           startAtLocal.Format("15:04"),
		NumberOfGuests: reservation.NumberOfGuests,
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

func (e *EmailService) generateReservationCancellationEmail(name string, reservation entities.Reservation) (string, error) {
	const emailTemplate = `...

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cancelación de Reserva</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #DC143C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .reservation-details { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #DC143C; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .highlight { color: #DC143C; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍝 Trattoria La Bella</h1>
            <h2>Cancelación de Reserva</h2>
        </div>
        
        <div class="content">
            <p>Estimado/a <span class="highlight">{{.Name}}</span>,</p>
            
            <p>Su reserva ha sido cancelada exitosamente. A continuación encontrará los detalles de la reserva cancelada:</p>
            
            <div class="reservation-details">
                <h3>📋 Reserva Cancelada</h3>
                <p><strong>Fecha:</strong> {{.Date}}</p>
                <p><strong>Hora:</strong> {{.Time}}</p>
                <p><strong>Número de personas:</strong> {{.NumberOfGuests}}</p>
                <p><strong>Estado:</strong> <span class="highlight">Cancelada</span></p>
            </div>
            
            <p>Si desea realizar una nueva reserva, no dude en contactarnos.</p>
            
            <p>Gracias por su comprensión.</p>
            
            <p>Saludos cordiales,<br>
            <strong>Equipo de Trattoria La Bella</strong></p>
        </div>
        
        <div class="footer">
            <p>Este es un email automático, por favor no responda a este mensaje.</p>
            <p>Para consultas, contacte directamente con el restaurante.</p>
        </div>
    </div>
</body>
</html>`
	tmpl, err := template.New("cancellation").Parse(emailTemplate)
	if err != nil {
		return "", err
	}
	startAtLocal := reservation.StartAt.Add(-5 * time.Hour)

	data := struct {
		Name           string
		Date           string
		Time           string
		NumberOfGuests int
	}{
		Name:           name,
		Date:           startAtLocal.Format("02/01/2006"),
		Time:           startAtLocal.Format("15:04"),
		NumberOfGuests: reservation.NumberOfGuests,
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

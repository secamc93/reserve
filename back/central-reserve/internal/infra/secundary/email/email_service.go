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
	const emailTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Reserva - Trattoria La Bella</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #f7dc6f 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 10px;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .restaurant-name {
            font-size: 28px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 5px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        
        .header-subtitle {
            font-size: 18px;
            color: #34495e;
            font-weight: 500;
        }
        
        .content {
            padding: 40px 30px;
            background: #ffffff;
        }
        
        .greeting {
            font-size: 20px;
            color: #2c3e50;
            margin-bottom: 25px;
            font-weight: 600;
        }
        
        .message {
            font-size: 16px;
            color: #5a6c7d;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        
        .reservation-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            border-left: 5px solid #d4af37;
            position: relative;
            overflow: hidden;
        }
        
        .reservation-card::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: linear-gradient(45deg, transparent 30%, rgba(212, 175, 55, 0.1) 30%, rgba(212, 175, 55, 0.1) 70%, transparent 70%);
            border-radius: 50%;
            transform: translate(30px, -30px);
        }
        
        .card-title {
            font-size: 22px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .card-title::before {
            content: '📋';
            font-size: 24px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-weight: 600;
            color: #34495e;
            font-size: 15px;
        }
        
        .detail-value {
            font-weight: 700;
            color: #d4af37;
            font-size: 15px;
        }
        
        .status-badge {
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-box {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #2196f3;
        }
        
        .info-box p {
            color: #1565c0;
            font-weight: 500;
            margin: 0;
        }
        
        .cta-section {
            text-align: center;
            margin: 35px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
            color: #2c3e50;
            padding: 15px 30px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(212, 175, 55, 0.4);
        }
        
        .signature {
            margin-top: 30px;
            padding-top: 25px;
            border-top: 2px solid #ecf0f1;
        }
        
        .signature p {
            color: #7f8c8d;
            font-style: italic;
            margin-bottom: 5px;
        }
        
        .team-name {
            color: #d4af37;
            font-weight: 700;
            font-size: 16px;
        }
        
        .footer {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: #bdc3c7;
            padding: 30px;
            text-align: center;
            font-size: 13px;
            line-height: 1.6;
        }
        
        .footer p {
            margin-bottom: 8px;
        }
        
        .footer a {
            color: #d4af37;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-container {
                border-radius: 15px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .reservation-card {
                padding: 20px;
            }
            
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-content">
                <div class="logo">🍝</div>
                <h1 class="restaurant-name">Trattoria La Bella</h1>
                <p class="header-subtitle">Confirmación de Reserva</p>
            </div>
        </div>
        
        <div class="content">
            <p class="greeting">¡Hola {{.Name}}!</p>
            
            <p class="message">
                Nos complace informarle que su reserva ha sido <strong>confirmada exitosamente</strong>. 
                A continuación encontrará todos los detalles de su reservación.
            </p>
            
            <div class="reservation-card">
                <h3 class="card-title">Detalles de la Reserva</h3>
                
                <div class="detail-row">
                    <span class="detail-label">📅 Fecha:</span>
                    <span class="detail-value">{{.Date}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">🕐 Hora:</span>
                    <span class="detail-value">{{.Time}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">👥 Número de personas:</span>
                    <span class="detail-value">{{.NumberOfGuests}} {{if eq .NumberOfGuests 1}}persona{{else}}personas{{end}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Estado:</span>
                    <span class="status-badge">✅ Confirmada</span>
                </div>
            </div>
            
            <div class="info-box">
                <p>⏰ <strong>Importante:</strong> Le recomendamos llegar 10 minutos antes de su hora de reserva para una mejor experiencia.</p>
            </div>
            
            <div class="cta-section">
                <p class="message">
                    Si necesita modificar o cancelar su reserva, puede hacerlo contactándonos directamente.
                </p>
            </div>
            
            <div class="signature">
                <p>¡Esperamos su visita con gran entusiasmo!</p>
                <p class="team-name">— Equipo de Trattoria La Bella</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Este es un email automático, por favor no responda a este mensaje.</p>
            <p>Para consultas, contacte directamente con el restaurante.</p>
            <p>📍 Dirección del restaurante • 📞 Teléfono • 🌐 Sitio web</p>
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
	const emailTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cancelación de Reserva - Trattoria La Bella</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 50%, #a93226 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 10px;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .restaurant-name {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 5px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        
        .header-subtitle {
            font-size: 18px;
            color: #f8f9fa;
            font-weight: 500;
        }
        
        .content {
            padding: 40px 30px;
            background: #ffffff;
        }
        
        .greeting {
            font-size: 20px;
            color: #2c3e50;
            margin-bottom: 25px;
            font-weight: 600;
        }
        
        .message {
            font-size: 16px;
            color: #5a6c7d;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        
        .reservation-card {
            background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            border-left: 5px solid #e74c3c;
            position: relative;
            overflow: hidden;
        }
        
        .reservation-card::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: linear-gradient(45deg, transparent 30%, rgba(231, 76, 60, 0.1) 30%, rgba(231, 76, 60, 0.1) 70%, transparent 70%);
            border-radius: 50%;
            transform: translate(30px, -30px);
        }
        
        .card-title {
            font-size: 22px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .card-title::before {
            content: '❌';
            font-size: 24px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(231, 76, 60, 0.2);
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-weight: 600;
            color: #34495e;
            font-size: 15px;
        }
        
        .detail-value {
            font-weight: 700;
            color: #e74c3c;
            font-size: 15px;
        }
        
        .status-badge {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-box {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #f39c12;
        }
        
        .info-box p {
            color: #856404;
            font-weight: 500;
            margin: 0;
        }
        
        .cta-section {
            text-align: center;
            margin: 35px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: #ffffff;
            padding: 15px 30px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 8px 20px rgba(231, 76, 60, 0.3);
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(231, 76, 60, 0.4);
        }
        
        .signature {
            margin-top: 30px;
            padding-top: 25px;
            border-top: 2px solid #ecf0f1;
        }
        
        .signature p {
            color: #7f8c8d;
            font-style: italic;
            margin-bottom: 5px;
        }
        
        .team-name {
            color: #e74c3c;
            font-weight: 700;
            font-size: 16px;
        }
        
        .footer {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: #bdc3c7;
            padding: 30px;
            text-align: center;
            font-size: 13px;
            line-height: 1.6;
        }
        
        .footer p {
            margin-bottom: 8px;
        }
        
        .footer a {
            color: #e74c3c;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-container {
                border-radius: 15px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .reservation-card {
                padding: 20px;
            }
            
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-content">
                <div class="logo">🍝</div>
                <h1 class="restaurant-name">Trattoria La Bella</h1>
                <p class="header-subtitle">Cancelación de Reserva</p>
            </div>
        </div>
        
        <div class="content">
            <p class="greeting">Estimado/a {{.Name}},</p>
            
            <p class="message">
                Le informamos que su reserva ha sido <strong>cancelada exitosamente</strong>. 
                A continuación encontrará los detalles de la reserva cancelada.
            </p>
            
            <div class="reservation-card">
                <h3 class="card-title">Reserva Cancelada</h3>
                
                <div class="detail-row">
                    <span class="detail-label">📅 Fecha:</span>
                    <span class="detail-value">{{.Date}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">🕐 Hora:</span>
                    <span class="detail-value">{{.Time}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">👥 Número de personas:</span>
                    <span class="detail-value">{{.NumberOfGuests}} {{if eq .NumberOfGuests 1}}persona{{else}}personas{{end}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Estado:</span>
                    <span class="status-badge">❌ Cancelada</span>
                </div>
            </div>
            
            <div class="info-box">
                <p>🔄 <strong>¿Desea realizar una nueva reserva?</strong> No dude en contactarnos, estaremos encantados de ayudarle.</p>
            </div>
            
            <div class="cta-section">
                <p class="message">
                    Gracias por su comprensión. Esperamos poder servirle en una próxima ocasión.
                </p>
            </div>
            
            <div class="signature">
                <p>Atentamente,</p>
                <p class="team-name">— Equipo de Trattoria La Bella</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Este es un email automático, por favor no responda a este mensaje.</p>
            <p>Para consultas, contacte directamente con el restaurante.</p>
            <p>📍 Dirección del restaurante • 📞 Teléfono • 🌐 Sitio web</p>
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

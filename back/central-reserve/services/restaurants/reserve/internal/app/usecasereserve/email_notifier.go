package usecasereserve

import (
	"context"
	"fmt"

	"central_reserve/services/reserve/internal/domain"
)

func (n *ReserveUseCase) SendReservationConfirmation(ctx context.Context, email, name string, reservation domain.Reservation) error {
	subject := "Confirmación de Reserva - Trattoria La Bella"

	html := fmt.Sprintf(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Reserva</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #8B4513; color: white; text-align: center; padding: 30px; }
        .content { padding: 40px 30px; }
        .details { background-color: #f8f9fa; border-left: 4px solid #8B4513; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #8B4513; margin-bottom: 15px; }
        p { line-height: 1.6; margin-bottom: 15px; }
        .highlight { background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍝 Trattoria La Bella</h1>
            <p>¡Tu reserva ha sido confirmada!</p>
        </div>
        <div class="content">
            <h2>Estimado/a %s</h2>
            <p>Nos complace confirmar tu reserva en Trattoria La Bella.</p>
            
            <div class="details">
                <h3>📋 Detalles de tu reserva:</h3>
                <p><strong>Reserva #:</strong> %d</p>
                <p><strong>Fecha y hora:</strong> %s</p>
                <p><strong>Duración:</strong> %s - %s</p>
                <p><strong>Número de invitados:</strong> %d personas</p>
            </div>
            
            <div class="highlight">
                <p><strong>¡Importante!</strong> Por favor, llega puntualmente. Tenemos una tolerancia de 15 minutos.</p>
            </div>
            
            <p>Si necesitas modificar o cancelar tu reserva, contáctanos con al menos 2 horas de anticipación.</p>
            
            <p>¡Esperamos verte pronto!</p>
            
            <p>Atentamente,<br>
            <strong>El equipo de Trattoria La Bella</strong></p>
        </div>
        <div class="footer">
            <p>Trattoria La Bella | Calle Principal 123 | Tel: (123) 456-7890</p>
            <p>Este es un correo automático, por favor no responder.</p>
        </div>
    </div>
</body>
</html>`,
		name,
		reservation.ID,
		reservation.StartAt.Format("02 Jan 2006"),
		reservation.StartAt.Format("15:04"),
		reservation.EndAt.Format("15:04"),
		reservation.NumberOfGuests,
	)

	return n.sender.SendHTML(ctx, email, subject, html)
}

func (n *ReserveUseCase) SendReservationCancellation(ctx context.Context, email, name string, reservation domain.Reservation) error {
	subject := "Cancelación de Reserva - Trattoria La Bella"

	html := fmt.Sprintf(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cancelación de Reserva</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #dc3545; color: white; text-align: center; padding: 30px; }
        .content { padding: 40px 30px; }
        .details { background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #dc3545; margin-bottom: 15px; }
        p { line-height: 1.6; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍝 Trattoria La Bella</h1>
            <p>Cancelación de Reserva</p>
        </div>
        <div class="content">
            <h2>Estimado/a %s</h2>
            <p>Lamentamos informarte que tu reserva ha sido <strong>cancelada</strong>.</p>
            
            <div class="details">
                <h3>📋 Detalles de la reserva cancelada:</h3>
                <p><strong>Reserva #:</strong> %d</p>
                <p><strong>Fecha y hora:</strong> %s</p>
                <p><strong>Número de invitados:</strong> %d personas</p>
            </div>
            
            <p>Si tienes alguna pregunta o deseas hacer una nueva reserva, no dudes en contactarnos.</p>
            
            <p>Gracias por tu comprensión.</p>
            
            <p>Atentamente,<br>
            <strong>El equipo de Trattoria La Bella</strong></p>
        </div>
        <div class="footer">
            <p>Trattoria La Bella | Calle Principal 123 | Tel: (123) 456-7890</p>
        </div>
    </div>
</body>
</html>`,
		name,
		reservation.ID,
		reservation.StartAt.Format("02 Jan 2006 15:04"),
		reservation.NumberOfGuests,
	)

	return n.sender.SendHTML(ctx, email, subject, html)
}

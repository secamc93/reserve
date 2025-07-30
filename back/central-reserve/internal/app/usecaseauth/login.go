package usecaseauth

import (
	"central_reserve/internal/domain/dtos"
	"context"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// Login maneja la lógica de autenticación del usuario (simplificado)
func (uc *AuthUseCase) Login(ctx context.Context, request dtos.LoginRequest) (*dtos.LoginResponse, error) {
	uc.log.Info().Str("email", request.Email).Msg("Iniciando proceso de login")

	// Validar que el email y contraseña no estén vacíos
	if request.Email == "" || request.Password == "" {
		uc.log.Error().Msg("Email o contraseña vacíos")
		return nil, fmt.Errorf("email y contraseña son requeridos")
	}

	// Obtener usuario por email
	userAuth, err := uc.repository.GetUserByEmail(ctx, request.Email)
	if err != nil {
		uc.log.Error().Err(err).Str("email", request.Email).Msg("Error al obtener usuario por email")
		return nil, fmt.Errorf("credenciales inválidas")
	}

	if userAuth == nil {
		uc.log.Error().Str("email", request.Email).Msg("Usuario no encontrado")
		return nil, fmt.Errorf("credenciales inválidas")
	}

	// Verificar que el usuario esté activo
	if !userAuth.IsActive {
		uc.log.Error().Str("email", request.Email).Msg("Usuario inactivo")
		return nil, fmt.Errorf("usuario inactivo")
	}

	// Validar contraseña
	uc.log.Debug().
		Str("email", request.Email).
		Str("stored_password_length", fmt.Sprintf("%d", len(userAuth.Password))).
		Str("input_password_length", fmt.Sprintf("%d", len(request.Password))).
		Str("stored_password_preview", userAuth.Password[:func() int {
			if len(userAuth.Password) < 10 {
				return len(userAuth.Password)
			}
			return 10
		}()]).
		Str("stored_password_starts_with_bcrypt", fmt.Sprintf("%t", len(userAuth.Password) >= 7 && userAuth.Password[:7] == "$2a$")).
		Str("stored_password_first_7_chars", userAuth.Password[:func() int {
			if len(userAuth.Password) < 7 {
				return len(userAuth.Password)
			}
			return 7
		}()]).
		Msg("Comparando contraseñas")

		// Verificar contraseña
	uc.log.Debug().
		Str("email", request.Email).
		Str("input_password", request.Password).
		Str("stored_password_hash", userAuth.Password).
		Msg("Comparando contraseñas")

	if err := bcrypt.CompareHashAndPassword([]byte(userAuth.Password), []byte(request.Password)); err != nil {
		uc.log.Error().
			Err(err).
			Str("email", request.Email).
			Str("input_password", request.Password).
			Str("stored_password_hash", userAuth.Password).
			Msg("Contraseña inválida")
		return nil, fmt.Errorf("credenciales inválidas")
	}

	// Obtener roles del usuario para el token
	roles, err := uc.repository.GetUserRoles(ctx, userAuth.ID)
	if err != nil {
		uc.log.Error().Err(err).Uint("user_id", userAuth.ID).Msg("Error al obtener roles del usuario")
		return nil, fmt.Errorf("error interno del servidor")
	}

	// Obtener businesses del usuario
	businesses, err := uc.repository.GetUserBusinesses(ctx, userAuth.ID)
	if err != nil {
		uc.log.Error().Err(err).Uint("user_id", userAuth.ID).Msg("Error al obtener businesses del usuario")
		// No retornamos error aquí porque el login puede continuar sin businesses
	}

	// Generar token JWT
	roleCodes := make([]string, len(roles))
	for i, role := range roles {
		roleCodes[i] = role.Code
	}

	token, err := uc.jwtService.GenerateToken(userAuth.ID, userAuth.Email, roleCodes)
	if err != nil {
		uc.log.Error().Err(err).Uint("user_id", userAuth.ID).Msg("Error al generar token JWT")
		return nil, fmt.Errorf("error interno del servidor")
	}

	// Verificar si es el primer login (LastLoginAt es nil)
	isFirstLogin := userAuth.LastLoginAt == nil

	if isFirstLogin {
		uc.log.Info().
			Str("email", userAuth.Email).
			Uint("user_id", userAuth.ID).
			Msg("Primer login detectado - se requiere cambio de contraseña")
	}

	// Actualizar último login (siempre, excepto en el primer login real)
	if err := uc.repository.UpdateLastLogin(ctx, userAuth.ID); err != nil {
		uc.log.Warn().Err(err).Uint("user_id", userAuth.ID).Msg("Error al actualizar último login")
		// No retornamos error aquí porque el login ya fue exitoso
	} else {
		uc.log.Info().Uint("user_id", userAuth.ID).Msg("Último login actualizado")
	}

	// Preparar información del business (tomar el primero si hay múltiples)
	var businessesList []dtos.BusinessInfo

	if len(businesses) > 0 {
		// Convertir todos los businesses a DTOs
		businessesList = make([]dtos.BusinessInfo, len(businesses))
		for i, business := range businesses {
			businessesList[i] = dtos.BusinessInfo{
				ID:             business.ID,
				Name:           business.Name,
				Code:           business.Code,
				BusinessTypeID: business.BusinessTypeID,
				BusinessType: dtos.BusinessTypeInfo{
					ID:          business.BusinessTypeID,
					Name:        business.BusinessTypeName,
					Code:        business.BusinessTypeCode,
					Description: "", // No tenemos descripción en BusinessInfo
					Icon:        "", // No tenemos icono en BusinessInfo
				},
				Timezone:           business.Timezone,
				Address:            business.Address,
				Description:        business.Description,
				LogoURL:            business.LogoURL,
				PrimaryColor:       business.PrimaryColor,
				SecondaryColor:     business.SecondaryColor,
				CustomDomain:       business.CustomDomain,
				IsActive:           business.IsActive,
				EnableDelivery:     business.EnableDelivery,
				EnablePickup:       business.EnablePickup,
				EnableReservations: business.EnableReservations,
			}
		}

		uc.log.Info().
			Uint("user_id", userAuth.ID).
			Int("businesses_count", len(businesses)).
			Msg("Businesses asignados al usuario")
	} else {
		uc.log.Info().
			Uint("user_id", userAuth.ID).
			Msg("Usuario sin businesses asignados")
	}

	// Construir respuesta simplificada
	response := &dtos.LoginResponse{
		User: dtos.UserInfo{
			ID:          userAuth.ID,
			Name:        userAuth.Name,
			Email:       userAuth.Email,
			Phone:       userAuth.Phone,
			AvatarURL:   userAuth.AvatarURL,
			IsActive:    userAuth.IsActive,
			LastLoginAt: userAuth.LastLoginAt, // Mantiene el valor original (nil para primer login)
		},
		Token:                 token,
		RequirePasswordChange: isFirstLogin,
		Businesses:            businessesList,
	}

	uc.log.Info().
		Str("email", userAuth.Email).
		Uint("user_id", userAuth.ID).
		Bool("require_password_change", isFirstLogin).
		Msg("Login exitoso")

	return response, nil
}

package usecaseauth

import (
	"central_reserve/services/auth/internal/domain"
	"context"
	"fmt"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// Login maneja la lógica de autenticación del usuario (simplificado)
func (uc *AuthUseCase) Login(ctx context.Context, request domain.LoginRequest) (*domain.LoginResponse, error) {
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

	// Completar URL de avatar si es relativa
	avatarURL := userAuth.AvatarURL
	if avatarURL != "" && !strings.HasPrefix(avatarURL, "http") {
		base := strings.TrimRight(uc.env.Get("URL_BASE_DOMAIN_S3"), "/")
		if base != "" {
			avatarURL = fmt.Sprintf("%s/%s", base, strings.TrimLeft(avatarURL, "/"))
		}
	}

	// Log detallado de businesses
	uc.log.Info().
		Uint("user_id", userAuth.ID).
		Int("businesses_count", len(businesses)).
		Msg("Businesses obtenidos del usuario")

	if len(businesses) > 0 {
		for i, business := range businesses {
			// Completar URL del logo del business si es relativa
			businessLogoURL := business.LogoURL
			if businessLogoURL != "" && !strings.HasPrefix(businessLogoURL, "http") {
				base := strings.TrimRight(uc.env.Get("URL_BASE_DOMAIN_S3"), "/")
				if base != "" {
					businessLogoURL = fmt.Sprintf("%s/%s", base, strings.TrimLeft(businessLogoURL, "/"))
				}
			}
			// Completar URL de imagen de navbar si es relativa
			businessNavbarURL := business.NavbarImageURL
			if businessNavbarURL != "" && !strings.HasPrefix(businessNavbarURL, "http") {
				base := strings.TrimRight(uc.env.Get("URL_BASE_DOMAIN_S3"), "/")
				if base != "" {
					businessNavbarURL = fmt.Sprintf("%s/%s", base, strings.TrimLeft(businessNavbarURL, "/"))
				}
			}

			uc.log.Info().
				Uint("user_id", userAuth.ID).
				Int("business_index", i).
				Uint("business_id", business.ID).
				Str("business_name", business.Name).
				Str("business_code", business.Code).
				Msg("Business encontrado")
		}
	} else {
		uc.log.Warn().
			Uint("user_id", userAuth.ID).
			Msg("Usuario sin businesses asociados")
	}

	// Log de roles del usuario
	uc.log.Info().
		Uint("user_id", userAuth.ID).
		Int("roles_count", len(roles)).
		Msg("Roles obtenidos del usuario")

	for i, role := range roles {
		uc.log.Info().
			Uint("user_id", userAuth.ID).
			Int("role_index", i).
			Uint("role_id", role.ID).
			Str("role_name", role.Name).
			Msg("Rol encontrado")
	}

	// Verificar si es super admin
	if isSuperAdmin(roles) {
		uc.log.Info().
			Uint("user_id", userAuth.ID).
			Msg("Usuario identificado como SUPER ADMIN")
	} else {
		uc.log.Info().
			Uint("user_id", userAuth.ID).
			Msg("Usuario NO es super admin")
	}

	// Log detallado de verificación de super admin
	for i, role := range roles {
		isSuper := role.ScopeCode == "platform"
		uc.log.Info().
			Uint("user_id", userAuth.ID).
			Int("role_index", i).
			Uint("role_id", role.ID).
			Str("role_name", role.Name).
			Str("role_scope_code", role.ScopeCode).
			Str("role_scope_name", role.ScopeName).
			Bool("is_super_admin", isSuper).
			Msg("Verificación de rol super admin por scope")
	}

	// Generar token JWT
	roleNames := make([]string, len(roles))
	for i, role := range roles {
		roleNames[i] = role.Name
	}

	// Usar el primer business para el token (si existe)
	var businessID uint
	if len(businesses) > 0 {
		businessID = businesses[0].ID
		uc.log.Info().
			Uint("user_id", userAuth.ID).
			Uint("business_id", businessID).
			Msg("Usando primer business para token JWT")
	} else {
		// Verificar si el usuario es super admin
		if isSuperAdmin(roles) {
			businessID = 1 // Super admin siempre tiene business_id = 1
			uc.log.Info().
				Uint("user_id", userAuth.ID).
				Uint("business_id", businessID).
				Msg("Usuario super admin - asignando business_id = 1")
		} else {
			uc.log.Warn().
				Uint("user_id", userAuth.ID).
				Msg("Usuario sin businesses y no es super admin - usando business_id = 0")
		}
	}

	token, err := uc.jwtService.GenerateToken(userAuth.ID, userAuth.Email, roleNames, businessID)
	if err != nil {
		uc.log.Error().Err(err).Uint("user_id", userAuth.ID).Msg("Error al generar token JWT")
		return nil, fmt.Errorf("error interno del servidor")
	}

	// Log del token generado
	uc.log.Info().
		Uint("user_id", userAuth.ID).
		Uint("token_business_id", businessID).
		Str("user_email", userAuth.Email).
		Strs("user_roles", roleNames).
		Msg("Token JWT generado exitosamente")

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
	var businessesList []domain.BusinessInfo

	if len(businesses) > 0 {
		// Convertir todos los businesses a DTOs
		businessesList = make([]domain.BusinessInfo, len(businesses))
		for i, business := range businesses {
			// Completar URL del logo del business si es relativa
			businessLogoURL := business.LogoURL
			if businessLogoURL != "" && !strings.HasPrefix(businessLogoURL, "http") {
				base := strings.TrimRight(uc.env.Get("URL_BASE_DOMAIN_S3"), "/")
				if base != "" {
					businessLogoURL = fmt.Sprintf("%s/%s", base, strings.TrimLeft(businessLogoURL, "/"))
				}
			}
			// Completar URL de imagen de navbar si es relativa
			businessNavbarURL := business.NavbarImageURL
			if businessNavbarURL != "" && !strings.HasPrefix(businessNavbarURL, "http") {
				base := strings.TrimRight(uc.env.Get("URL_BASE_DOMAIN_S3"), "/")
				if base != "" {
					businessNavbarURL = fmt.Sprintf("%s/%s", base, strings.TrimLeft(businessNavbarURL, "/"))
				}
			}

			businessesList[i] = domain.BusinessInfo{
				ID:             business.ID,
				Name:           business.Name,
				Code:           business.Code,
				BusinessTypeID: business.BusinessTypeID,
				BusinessType: domain.BusinessTypeInfo{
					ID:          business.BusinessTypeID,
					Name:        business.BusinessTypeName,
					Code:        business.BusinessTypeCode,
					Description: "",
					Icon:        "",
				},
				Timezone:           business.Timezone,
				Address:            business.Address,
				Description:        business.Description,
				LogoURL:            businessLogoURL,
				PrimaryColor:       business.PrimaryColor,
				SecondaryColor:     business.SecondaryColor,
				TertiaryColor:      business.TertiaryColor,
				QuaternaryColor:    business.QuaternaryColor,
				NavbarImageURL:     businessNavbarURL,
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
	response := &domain.LoginResponse{
		User: domain.UserInfo{
			ID:          userAuth.ID,
			Name:        userAuth.Name,
			Email:       userAuth.Email,
			Phone:       userAuth.Phone,
			AvatarURL:   avatarURL,
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

// isSuperAdmin verifica si el usuario tiene el rol de super administrador
func isSuperAdmin(roles []domain.Role) bool {
	for _, role := range roles {
		// Validar por scope del rol (super admin tiene scope de plataforma)
		if role.ScopeCode == "platform" {
			return true
		}
	}
	return false
}

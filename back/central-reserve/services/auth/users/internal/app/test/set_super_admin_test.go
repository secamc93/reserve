package app_test

import (
	"central_reserve/services/auth/users/internal/app"
	"central_reserve/services/auth/users/internal/app/test/mocks"
	"central_reserve/services/auth/users/internal/domain"
	"context"
	"errors"
	"testing"
)

type setCall struct {
	userID, roleID uint
	enabled        bool
}

func newRepo(calls *[]setCall) *mocks.MockRepository {
	return &mocks.MockRepository{
		GetUserByIDFunc: func(ctx context.Context, userID uint) (*domain.UserAuthInfo, error) {
			return &domain.UserAuthInfo{ID: userID}, nil
		},
		GetPlatformRoleIDFunc: func(ctx context.Context) (uint, error) { return 1, nil },
		SetPlatformRoleFunc: func(ctx context.Context, userID uint, roleID uint, enabled bool) error {
			*calls = append(*calls, setCall{userID, roleID, enabled})
			return nil
		},
	}
}

func TestSetSuperAdmin_DaYQuitaElRolDePlataforma(t *testing.T) {
	var calls []setCall
	uc := app.New(newRepo(&calls), mocks.NewMockLogger(), nil, nil)

	if err := uc.SetSuperAdmin(context.Background(), 7, 20, true); err != nil {
		t.Fatalf("dar super admin: %v", err)
	}
	if err := uc.SetSuperAdmin(context.Background(), 7, 20, false); err != nil {
		t.Fatalf("quitar super admin: %v", err)
	}
	want := []setCall{{20, 1, true}, {20, 1, false}}
	if len(calls) != 2 || calls[0] != want[0] || calls[1] != want[1] {
		t.Fatalf("llamadas = %+v, quería %+v", calls, want)
	}
}

func TestSetSuperAdmin_NadiePuedeQuitarseElRolASiMismo(t *testing.T) {
	var calls []setCall
	uc := app.New(newRepo(&calls), mocks.NewMockLogger(), nil, nil)

	err := uc.SetSuperAdmin(context.Background(), 7, 7, false)
	if !errors.Is(err, domain.ErrCannotRevokeOwnSuperAdmin) {
		t.Fatalf("err = %v, quería ErrCannotRevokeOwnSuperAdmin", err)
	}
	if len(calls) != 0 {
		t.Fatalf("no debía tocar business_staff: %+v", calls)
	}
	// Darse el rol a sí mismo (ya lo tiene) no es un error.
	if err := uc.SetSuperAdmin(context.Background(), 7, 7, true); err != nil {
		t.Fatalf("darse el rol a sí mismo: %v", err)
	}
}

func TestSetSuperAdmin_UsuarioInexistente(t *testing.T) {
	var calls []setCall
	repo := newRepo(&calls)
	repo.GetUserByIDFunc = func(ctx context.Context, userID uint) (*domain.UserAuthInfo, error) { return nil, nil }
	uc := app.New(repo, mocks.NewMockLogger(), nil, nil)

	if err := uc.SetSuperAdmin(context.Background(), 7, 99, true); !errors.Is(err, domain.ErrUserNotFound) {
		t.Fatalf("err = %v, quería ErrUserNotFound", err)
	}
	if len(calls) != 0 {
		t.Fatalf("no debía asignar rol: %+v", calls)
	}
}

func TestSetSuperAdmin_SinRolDePlataforma(t *testing.T) {
	var calls []setCall
	repo := newRepo(&calls)
	repo.GetPlatformRoleIDFunc = func(ctx context.Context) (uint, error) { return 0, nil }
	uc := app.New(repo, mocks.NewMockLogger(), nil, nil)

	if err := uc.SetSuperAdmin(context.Background(), 7, 20, true); !errors.Is(err, domain.ErrPlatformRoleNotFound) {
		t.Fatalf("err = %v, quería ErrPlatformRoleNotFound", err)
	}
}

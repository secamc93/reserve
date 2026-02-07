package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/domain"
)

// MockHPRepository - Mock del repositorio de propiedades horizontales
type MockHPRepository struct {
	CreateHorizontalPropertyFunc              func(ctx context.Context, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error)
	GetHorizontalPropertyByIDFunc             func(ctx context.Context, id uint) (*domain.HorizontalProperty, error)
	UpdateHorizontalPropertyFunc              func(ctx context.Context, id uint, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error)
	DeleteHorizontalPropertyFunc              func(ctx context.Context, id uint) error
	ListHorizontalPropertiesFunc              func(ctx context.Context, filters domain.HorizontalPropertyFiltersDTO) (*domain.PaginatedHorizontalPropertyDTO, error)
	ExistsHorizontalPropertyByCodeFunc        func(ctx context.Context, code string, excludeID *uint) (bool, error)
	ExistsCustomDomainFunc                    func(ctx context.Context, customDomain string, excludeID *uint) (bool, error)
	ParentBusinessExistsFunc                  func(ctx context.Context, parentBusinessID uint) (bool, error)
	GetBusinessTypeByIDFunc                   func(ctx context.Context, id uint) (*domain.BusinessType, error)
	GetHorizontalPropertyTypeFunc             func(ctx context.Context) (*domain.BusinessType, error)
	CreatePropertyUnitsFunc                   func(ctx context.Context, businessID uint, units []domain.PropertyUnitCreate) error
	CreateRequiredCommitteesFunc              func(ctx context.Context, businessID uint) error
	GetRequiredCommitteeTypesFunc             func(ctx context.Context) ([]domain.CommitteeTypeInfo, error)
}

// NewMockHPRepository - Crea un nuevo mock del repositorio
func NewMockHPRepository() *MockHPRepository {
	return &MockHPRepository{
		CreateHorizontalPropertyFunc: func(ctx context.Context, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
			property.ID = 1
			return property, nil
		},
		GetHorizontalPropertyByIDFunc: func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
			return &domain.HorizontalProperty{ID: id}, nil
		},
		UpdateHorizontalPropertyFunc: func(ctx context.Context, id uint, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
			property.ID = id
			return property, nil
		},
		DeleteHorizontalPropertyFunc: func(ctx context.Context, id uint) error {
			return nil
		},
		ListHorizontalPropertiesFunc: func(ctx context.Context, filters domain.HorizontalPropertyFiltersDTO) (*domain.PaginatedHorizontalPropertyDTO, error) {
			return &domain.PaginatedHorizontalPropertyDTO{
				Data:       []domain.HorizontalPropertyListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
		ExistsHorizontalPropertyByCodeFunc: func(ctx context.Context, code string, excludeID *uint) (bool, error) {
			return false, nil
		},
		ExistsCustomDomainFunc: func(ctx context.Context, customDomain string, excludeID *uint) (bool, error) {
			return false, nil
		},
		ParentBusinessExistsFunc: func(ctx context.Context, parentBusinessID uint) (bool, error) {
			return true, nil
		},
		GetBusinessTypeByIDFunc: func(ctx context.Context, id uint) (*domain.BusinessType, error) {
			return &domain.BusinessType{
				ID:   id,
				Name: "Propiedad Horizontal",
				Code: "horizontal_property",
			}, nil
		},
		GetHorizontalPropertyTypeFunc: func(ctx context.Context) (*domain.BusinessType, error) {
			return &domain.BusinessType{
				ID:   1,
				Name: "Propiedad Horizontal",
				Code: "horizontal_property",
			}, nil
		},
		CreatePropertyUnitsFunc: func(ctx context.Context, businessID uint, units []domain.PropertyUnitCreate) error {
			return nil
		},
		CreateRequiredCommitteesFunc: func(ctx context.Context, businessID uint) error {
			return nil
		},
		GetRequiredCommitteeTypesFunc: func(ctx context.Context) ([]domain.CommitteeTypeInfo, error) {
			return []domain.CommitteeTypeInfo{}, nil
		},
	}
}

func (m *MockHPRepository) CreateHorizontalProperty(ctx context.Context, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
	if m.CreateHorizontalPropertyFunc != nil {
		return m.CreateHorizontalPropertyFunc(ctx, property)
	}
	property.ID = 1
	return property, nil
}

func (m *MockHPRepository) GetHorizontalPropertyByID(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
	if m.GetHorizontalPropertyByIDFunc != nil {
		return m.GetHorizontalPropertyByIDFunc(ctx, id)
	}
	return &domain.HorizontalProperty{ID: id}, nil
}

func (m *MockHPRepository) UpdateHorizontalProperty(ctx context.Context, id uint, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
	if m.UpdateHorizontalPropertyFunc != nil {
		return m.UpdateHorizontalPropertyFunc(ctx, id, property)
	}
	property.ID = id
	return property, nil
}

func (m *MockHPRepository) DeleteHorizontalProperty(ctx context.Context, id uint) error {
	if m.DeleteHorizontalPropertyFunc != nil {
		return m.DeleteHorizontalPropertyFunc(ctx, id)
	}
	return nil
}

func (m *MockHPRepository) ListHorizontalProperties(ctx context.Context, filters domain.HorizontalPropertyFiltersDTO) (*domain.PaginatedHorizontalPropertyDTO, error) {
	if m.ListHorizontalPropertiesFunc != nil {
		return m.ListHorizontalPropertiesFunc(ctx, filters)
	}
	return &domain.PaginatedHorizontalPropertyDTO{
		Data:       []domain.HorizontalPropertyListDTO{},
		Total:      0,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: 0,
	}, nil
}

func (m *MockHPRepository) ExistsHorizontalPropertyByCode(ctx context.Context, code string, excludeID *uint) (bool, error) {
	if m.ExistsHorizontalPropertyByCodeFunc != nil {
		return m.ExistsHorizontalPropertyByCodeFunc(ctx, code, excludeID)
	}
	return false, nil
}

func (m *MockHPRepository) ExistsCustomDomain(ctx context.Context, customDomain string, excludeID *uint) (bool, error) {
	if m.ExistsCustomDomainFunc != nil {
		return m.ExistsCustomDomainFunc(ctx, customDomain, excludeID)
	}
	return false, nil
}

func (m *MockHPRepository) ParentBusinessExists(ctx context.Context, parentBusinessID uint) (bool, error) {
	if m.ParentBusinessExistsFunc != nil {
		return m.ParentBusinessExistsFunc(ctx, parentBusinessID)
	}
	return true, nil
}

func (m *MockHPRepository) GetBusinessTypeByID(ctx context.Context, id uint) (*domain.BusinessType, error) {
	if m.GetBusinessTypeByIDFunc != nil {
		return m.GetBusinessTypeByIDFunc(ctx, id)
	}
	return &domain.BusinessType{
		ID:   id,
		Name: "Propiedad Horizontal",
		Code: "horizontal_property",
	}, nil
}

func (m *MockHPRepository) GetHorizontalPropertyType(ctx context.Context) (*domain.BusinessType, error) {
	if m.GetHorizontalPropertyTypeFunc != nil {
		return m.GetHorizontalPropertyTypeFunc(ctx)
	}
	return &domain.BusinessType{
		ID:   1,
		Name: "Propiedad Horizontal",
		Code: "horizontal_property",
	}, nil
}

func (m *MockHPRepository) CreatePropertyUnits(ctx context.Context, businessID uint, units []domain.PropertyUnitCreate) error {
	if m.CreatePropertyUnitsFunc != nil {
		return m.CreatePropertyUnitsFunc(ctx, businessID, units)
	}
	return nil
}

func (m *MockHPRepository) CreateRequiredCommittees(ctx context.Context, businessID uint) error {
	if m.CreateRequiredCommitteesFunc != nil {
		return m.CreateRequiredCommitteesFunc(ctx, businessID)
	}
	return nil
}

func (m *MockHPRepository) GetRequiredCommitteeTypes(ctx context.Context) ([]domain.CommitteeTypeInfo, error) {
	if m.GetRequiredCommitteeTypesFunc != nil {
		return m.GetRequiredCommitteeTypesFunc(ctx)
	}
	return []domain.CommitteeTypeInfo{}, nil
}

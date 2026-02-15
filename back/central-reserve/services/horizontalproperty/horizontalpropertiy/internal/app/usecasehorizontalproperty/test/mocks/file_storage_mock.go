package mocks

import (
	"context"

	"central_reserve/shared/types"
)

// MockFileStorage - Mock para el puerto de almacenamiento de archivos
type MockFileStorage struct {
	UploadImageFunc   func(ctx context.Context, file *types.FileUpload, folder string) (string, error)
	DeleteImageFunc   func(ctx context.Context, filename string) error
	GetImageURLFunc   func(filename string) string
	ImageExistsFunc   func(ctx context.Context, filename string) (bool, error)
}

// NewMockFileStorage - Crea un nuevo mock de file storage
func NewMockFileStorage() *MockFileStorage {
	return &MockFileStorage{
		UploadImageFunc: func(ctx context.Context, file *types.FileUpload, folder string) (string, error) {
			return "path/to/uploaded/file.jpg", nil
		},
		DeleteImageFunc: func(ctx context.Context, filename string) error {
			return nil
		},
		GetImageURLFunc: func(filename string) string {
			return "https://s3.example.com/" + filename
		},
		ImageExistsFunc: func(ctx context.Context, filename string) (bool, error) {
			return true, nil
		},
	}
}

func (m *MockFileStorage) UploadImage(ctx context.Context, file *types.FileUpload, folder string) (string, error) {
	if m.UploadImageFunc != nil {
		return m.UploadImageFunc(ctx, file, folder)
	}
	return "path/to/uploaded/file.jpg", nil
}

func (m *MockFileStorage) DeleteImage(ctx context.Context, filename string) error {
	if m.DeleteImageFunc != nil {
		return m.DeleteImageFunc(ctx, filename)
	}
	return nil
}

func (m *MockFileStorage) GetImageURL(filename string) string {
	if m.GetImageURLFunc != nil {
		return m.GetImageURLFunc(filename)
	}
	return "https://s3.example.com/" + filename
}

func (m *MockFileStorage) ImageExists(ctx context.Context, filename string) (bool, error) {
	if m.ImageExistsFunc != nil {
		return m.ImageExistsFunc(ctx, filename)
	}
	return true, nil
}

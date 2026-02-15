package mappers

import (
	"mime/multipart"

	"central_reserve/shared/types"
)

// MultipartToFileUpload convierte un multipart.FileHeader a types.FileUpload
func MultipartToFileUpload(fileHeader *multipart.FileHeader) (*types.FileUpload, error) {
	if fileHeader == nil {
		return nil, nil
	}

	// Abrir el archivo para obtener su contenido
	file, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}

	return &types.FileUpload{
		Filename:    fileHeader.Filename,
		Size:        fileHeader.Size,
		ContentType: fileHeader.Header.Get("Content-Type"),
		Content:     file,
	}, nil
}

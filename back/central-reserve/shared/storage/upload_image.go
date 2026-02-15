package storage

import (
	"context"
	"fmt"
	"strings"
	"time"

	"central_reserve/shared/errs"
	"central_reserve/shared/types"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	s3types "github.com/aws/aws-sdk-go-v2/service/s3/types"
)

// UploadImage sube una imagen con validaciones y optimizaciones específicas
// Retorna el path relativo del archivo (ej: "avatars/1234567890_imagen.jpg")
func (s *S3Uploader) UploadImage(ctx context.Context, file *types.FileUpload, folder string) (string, error) {
	// Validar archivo
	if file == nil {
		return "", errs.New("archivo es nulo")
	}

	// Validar tamaño
	if file.Size > maxFileSize {
		return "", errs.New("archivo demasiado grande, máximo 10MB")
	}

	// Validar tipo de archivo
	if !allowedImageTypes[file.ContentType] {
		return "", errs.New("tipo de archivo no permitido, solo imágenes (jpeg, jpg, png, gif, webp)")
	}

	// Generar nombre único para el archivo
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%s/%d_%s", folder, timestamp, file.Filename)

	// Limpiar nombre de archivo
	filename = strings.ReplaceAll(filename, " ", "_")
	filename = strings.ToLower(filename)

	// Subir a S3
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:               aws.String(s.bucket),
		Key:                  aws.String(filename),
		Body:                 file.Content,
		ContentType:          aws.String(file.ContentType),
		ContentDisposition:   aws.String("inline"),
		ServerSideEncryption: s3types.ServerSideEncryptionAes256,
		StorageClass:         s3types.StorageClassStandard,           // Mejor para acceso frecuente
		CacheControl:         aws.String("public, max-age=31536000"), // Cache por 1 año
	})
	if err != nil {
		s.log.Error(ctx).Err(err).Msg("error subiendo imagen a S3")
		return "", err
	}

	// Retornar solo el path relativo, no la URL completa
	s.log.Info(ctx).Str("filename", filename).Msg("imagen subida exitosamente")
	return filename, nil
}

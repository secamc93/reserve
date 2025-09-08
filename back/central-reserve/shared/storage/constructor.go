package storage

import (
	"context"

	"central_reserve/shared/env"
	"central_reserve/shared/log"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// Tipos de archivo permitidos para imágenes
var allowedImageTypes = map[string]bool{
	"image/jpeg": true,
	"image/jpg":  true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
}

// Tamaño máximo de archivo (10MB)
const maxFileSize = 10 * 1024 * 1024

// S3Uploader estructura principal para operaciones S3
// Implementa la interfaz IS3Service del dominio
type S3Uploader struct {
	client *s3.Client
	bucket string
	log    log.ILogger
}

// IS3Service define las operaciones de S3
type IS3Service interface {
	GetImageURL(filename string) string
	DeleteImage(ctx context.Context, filename string) error
	ImageExists(ctx context.Context, filename string) (bool, error)
}

// New crea una nueva instancia de S3Uploader y retorna la interfaz IS3Service
func New(env env.IConfig, logger log.ILogger) IS3Service {
	s3Key := env.Get("S3_KEY")
	s3Secret := env.Get("S3_SECRET")
	s3Region := env.Get("S3_REGION")
	s3Bucket := env.Get("S3_BUCKET")

	logger.Info(context.Background()).
		Str("bucket", s3Bucket).
		Str("region", s3Region).
		Msg("🔧 Intentando conectar a S3...")

	// Intentar conectar a S3
	awsCfg, err := config.LoadDefaultConfig(context.Background(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(s3Key, s3Secret, "")),
	)
	if err != nil {
		logger.Fatal(context.Background()).
			Err(err).
			Msg("❌ No se pudo conectar a S3 - verifica las credenciales")
		panic("Error conectando a S3: " + err.Error())
	}

	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.Region = s3Region
	})

	// Probar la conexión
	_, err = s3Client.HeadBucket(context.Background(), &s3.HeadBucketInput{
		Bucket: &s3Bucket,
	})
	if err != nil {
		logger.Fatal(context.Background()).
			Err(err).
			Msg("❌ No se pudo conectar a S3 - verifica credenciales y permisos")
		panic("Error conectando a S3: " + err.Error())
	}

	logger.Info(context.Background()).
		Str("bucket", s3Bucket).
		Str("region", s3Region).
		Msg("✅ Conexión S3 exitosa")

	return &S3Uploader{
		client: s3Client,
		bucket: s3Bucket,
		log:    logger,
	}
}

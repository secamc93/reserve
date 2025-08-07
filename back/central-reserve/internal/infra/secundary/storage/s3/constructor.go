package s3

import (
	"context"

	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/log"

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

// New crea una nueva instancia de S3Uploader y retorna la interfaz IS3Service
func New(env env.IConfig, logger log.ILogger) ports.IS3Service {
	awsCfg, err := config.LoadDefaultConfig(context.Background(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(env.Get("S3_ACCESS_KEY"), env.Get("S3_SECRET_KEY"), "")),
	)
	if err != nil {
		logger.Panic(context.Background()).Err(err).Msg("error cargando configuración de AWS para S3")
		panic("No se pudo cargar la configuración de AWS para S3")
	}

	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.Region = env.Get("S3_REGION")
	})

	return &S3Uploader{
		client: s3Client,
		bucket: env.Get("S3_BUCKET"),
		log:    logger,
	}
}

package s3

import (
	"context"
	"fmt"
	"io"

	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/errs"
	"central_reserve/internal/pkg/log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type IS3 interface {
	UploadFile(ctx context.Context, file io.ReadSeeker, filename string) (string, error)
}

type S3Uploader struct {
	client *s3.Client
	bucket string
	log    log.ILogger
}

func New(env env.IConfig, logger log.ILogger) (*S3Uploader, error) {
	awsCfg, err := config.LoadDefaultConfig(context.Background(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(env.Get("S3_ACCESS_KEY"), env.Get("S3_SECRET_KEY"), "")),
	)
	if err != nil {
		logger.Error(context.Background()).Err(err).Msg("error loading AWS config")
		return nil, err
	}

	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.Region = env.Get("S3_REGION")
	})

	return &S3Uploader{
		client: s3Client,
		bucket: env.Get("S3_BUCKET"),
		log:    logger,
	}, nil
}

func (s *S3Uploader) UploadFile(ctx context.Context, file io.ReadSeeker, filename string) (string, error) {
	if file == nil {
		return "", errs.New("file is nil")
	}

	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:               aws.String(s.bucket),
		Key:                  aws.String(filename),
		Body:                 file,
		ACL:                  types.ObjectCannedACLPublicRead,
		ContentDisposition:   aws.String("inline"),
		ServerSideEncryption: types.ServerSideEncryptionAes256,
		StorageClass:         types.StorageClassIntelligentTiering,
	})
	if err != nil {
		s.log.Error(ctx).Err(err).Msg("error uploading to S3")
		return "", err
	}

	url := fmt.Sprintf("https://%s.s3.amazonaws.com/%s", s.bucket, filename)
	return url, nil
}

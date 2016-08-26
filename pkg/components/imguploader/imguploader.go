package imguploader

import (
	"fmt"

	"github.com/grafana/grafana/pkg/setting"
)

type ImageUploader interface {
	Upload(path string) (string, error)
}

func NewImageUploader() (ImageUploader, error) {

	switch setting.ImageUploadProvider {
	case "s3":
		s3sec, err := setting.Cfg.GetSection("external_image_storage.s3")
		if err != nil {
			return nil, err
		}

		bucket := s3sec.Key("secret_key").String()
		accessKey := s3sec.Key("access_key").String()
		secretKey := s3sec.Key("secret_key").String()

		if bucket == "" {
			return nil, fmt.Errorf("Could not find bucket setting for image.uploader.s3")
		}

		if accessKey == "" {
			return nil, fmt.Errorf("Could not find accessKey setting for image.uploader.s3")
		}

		if secretKey == "" {
			return nil, fmt.Errorf("Could not find secretKey setting for image.uploader.s3")
		}

		return NewS3Uploader(bucket, accessKey, secretKey), nil
	case "webdav":
		webdavSec, err := setting.Cfg.GetSection("external_image_storage.webdav")
		if err != nil {
			return nil, err
		}

		url := webdavSec.Key("url").String()
		if url == "" {
			return nil, fmt.Errorf("Could not find url key for image.uploader.webdav")
		}

		username := webdavSec.Key("username").String()
		password := webdavSec.Key("password").String()

		return NewWebdavImageUploader(url, username, password)
	}

	return nil, fmt.Errorf("could not find specified provider")
}

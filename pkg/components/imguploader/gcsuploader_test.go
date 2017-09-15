package imguploader

import (
	"testing"

	"github.com/grafana/grafana/pkg/setting"
	. "github.com/smartystreets/goconvey/convey"
)

func TestUploadToGCS(t *testing.T) {
	SkipConvey("[Integration test] for external_image_store.gcs", t, func() {
		setting.NewConfigContext(&setting.CommandLineArgs{
			HomePath: "../../../",
		})

		gcsUploader, _ := NewImageUploader()

		path, err := gcsUploader.Upload("../../../public/img/logo_transparent_400x.png")

		So(err, ShouldBeNil)
		So(path, ShouldNotEqual, "")
	})
}

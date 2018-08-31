import coreModule from 'app/core/core_module';

const template = `
<input type="file" id="dashupload" name="dashupload" class="hide"/>
<label class="btn btn-success" for="dashupload">
  <i class="fa fa-upload"></i>
  Upload .json File
</label>
`;

/** @ngInject */
function uploadDashboardDirective(timer, alertSrv, $location) {
  return {
    restrict: 'E',
    template: template,
    scope: {
      onUpload: '&',
    },
    link: function(scope) {
      function file_selected(evt) {
        const files = evt.target.files; // FileList object
        const readerOnload = function() {
          return function(e) {
            let dash;
            try {
              dash = JSON.parse(e.target.result);
            } catch (err) {
              console.log(err);
              scope.appEvent('alert-error', ['Import failed', 'JSON -> JS Serialization failed: ' + err.message]);
              return;
            }

            scope.$apply(function() {
              scope.onUpload({ dash: dash });
            });
          };
        };

        for (let i = 0, f; (f = files[i]); i++) {
          const reader = new FileReader();
          reader.onload = readerOnload();
          reader.readAsText(f);
        }
      }

      const wnd: any = window;
      // Check for the various File API support.
      if (wnd.File && wnd.FileReader && wnd.FileList && wnd.Blob) {
        // Something
        document.getElementById('dashupload').addEventListener('change', file_selected, false);
      } else {
        alertSrv.set('Oops', 'Sorry, the HTML5 File APIs are not fully supported in this browser.', 'error');
      }
    },
  };
}

coreModule.directive('dashUpload', uploadDashboardDirective);

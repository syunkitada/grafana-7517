define([
  'angular'
],
function (angular) {
  'use strict';

  var module = angular.module('grafana.directives');

  module.directive('dashUpload', function(timer, alertSrv) {
    return {
      restrict: 'A',
      link: function(scope) {
        function file_selected(evt) {
          var files = evt.target.files; // FileList object
          var readerOnload = function() {
            return function(e) {
              var dashboard = JSON.parse(e.target.result);
              scope.$apply(function() {
                scope.emitAppEvent('setup-dashboard', dashboard);
              });
            };
          };
          for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.onload = (readerOnload)(f);
            reader.readAsText(f);
          }
        }
        // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob) {
          // Something
          document.getElementById('dashupload').addEventListener('change', file_selected, false);
        } else {
          alertSrv.set('Oops','Sorry, the HTML5 File APIs are not fully supported in this browser.','error');
        }
      }
    };
  });
});

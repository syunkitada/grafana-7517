define([
  'angular',
  'underscore',
  'moment'
],
function (angular, _, moment) {
  'use strict';

  var module = angular.module('kibana.controllers');

  module.controller('dashLoader', function($scope, $rootScope, $http, alertSrv, $location, playlistSrv, elastic) {

    $scope.init = function() {
      $scope.gist_pattern = /(^\d{5,}$)|(^[a-z0-9]{10,}$)|(gist.github.com(\/*.*)\/[a-z0-9]{5,}\/*$)/;
      $scope.gist = $scope.gist || {};
      $scope.elasticsearch = $scope.elasticsearch || {};

      $rootScope.$on('save-dashboard', function() {
        $scope.elasticsearch_save('dashboard', false);
      });

      $rootScope.$on('zoom-out', function() {
        $scope.zoom(2);
      });

    };

    $scope.exitFullscreen = function() {
      $rootScope.$emit('panel-fullscreen-exit');
    };

    $scope.showDropdown = function(type) {
      if(_.isUndefined($scope.dashboard)) {
        return true;
      }

      var _l = $scope.dashboard.loader;
      if(type === 'load') {
        return (_l.load_elasticsearch || _l.load_gist || _l.load_local);
      }
      if(type === 'save') {
        return (_l.save_elasticsearch || _l.save_gist || _l.save_local || _l.save_default);
      }
      if(type === 'share') {
        return (_l.save_temp);
      }
      return false;
    };

    $scope.set_default = function() {
      if($scope.dashboard.set_default($location.path())) {
        alertSrv.set('Home Set','This page has been set as your default dashboard','success',5000);
      } else {
        alertSrv.set('Incompatible Browser','Sorry, your browser is too old for this feature','error',5000);
      }
    };

    $scope.purge_default = function() {
      if($scope.dashboard.purge_default()) {
        alertSrv.set('Local Default Clear','Your default dashboard has been reset to the default',
          'success',5000);
      } else {
        alertSrv.set('Incompatible Browser','Sorry, your browser is too old for this feature','error',5000);
      }
    };

    $scope.elasticsearch_save = function(type, ttl) {
      elastic.saveDashboard($scope.dashboard, $scope.dashboard.title)
        .then(function(result) {
          alertSrv.set('Dashboard Saved', 'Dashboard has been saved to Elasticsearch as "' + result.title + '"','success', 5000);

          if(type === 'temp') {
            $scope.share = $scope.dashboard.share_link($scope.dashboard.title, 'temp', result.title);
          }
          else {
            $location.path(result.url);
          }

          $rootScope.$emit('dashboard-saved', $scope.dashboard);

        }, function(err) {
          alertSrv.set('Save failed', err, 'error',5000);
        });
    };

    $scope.elasticsearch_delete = function(id) {
      if (!confirm('Are you sure you want to delete dashboard?')) {
        return;
      }

      $scope.dashboard.elasticsearch_delete(id).then(
        function(result) {
          if(!_.isUndefined(result)) {
            if(result.found) {
              alertSrv.set('Dashboard Deleted',id+' has been deleted','success',5000);
              // Find the deleted dashboard in the cached list and remove it
              var toDelete = _.where($scope.elasticsearch.dashboards,{_id:id})[0];
              $scope.elasticsearch.dashboards = _.without($scope.elasticsearch.dashboards,toDelete);
            } else {
              alertSrv.set('Dashboard Not Found','Could not find '+id+' in Elasticsearch','warning',5000);
            }
          } else {
            alertSrv.set('Dashboard Not Deleted','An error occurred deleting the dashboard','error',5000);
          }
        }
      );
    };

    $scope.save_gist = function() {
      $scope.dashboard.save_gist($scope.gist.title).then(function(link) {
        if (!_.isUndefined(link)) {
          $scope.gist.last = link;
          alertSrv.set('Gist saved','You will be able to access your exported dashboard file at '+
          '<a href="'+link+'">'+link+'</a> in a moment','success');
        } else {
          alertSrv.set('Save failed','Gist could not be saved','error',5000);
        }
      });
    };

    $scope.gist_dblist = function(id) {
      $scope.dashboard.gist_list(id).then(function(files) {
        if (files && files.length > 0) {
          $scope.gist.files = files;
        } else {
          alertSrv.set('Gist Failed','Could not retrieve dashboard list from gist','error',5000);
        }
      });
    };

    // function $scope.zoom
    // factor :: Zoom factor, so 0.5 = cuts timespan in half, 2 doubles timespan
    $scope.zoom = function(factor) {
      var _range = $scope.filter.timeRange();
      var _timespan = (_range.to.valueOf() - _range.from.valueOf());
      var _center = _range.to.valueOf() - _timespan/2;

      var _to = (_center + (_timespan*factor)/2);
      var _from = (_center - (_timespan*factor)/2);

      // If we're not already looking into the future, don't.
      if(_to > Date.now() && _range.to < Date.now()) {
        var _offset = _to - Date.now();
        _from = _from - _offset;
        _to = Date.now();
      }

      $scope.filter.setTime({
        from:moment.utc(_from).toDate(),
        to:moment.utc(_to).toDate(),
      });
    };

    $scope.openSaveDropdown = function() {
      $scope.isFavorite = playlistSrv.isCurrentFavorite($scope.dashboard);
    };

    $scope.markAsFavorite = function() {
      playlistSrv.markAsFavorite($scope.dashboard);
      $scope.isFavorite = true;
    };

    $scope.removeAsFavorite = function() {
      playlistSrv.removeAsFavorite($scope.dashboard);
      $scope.isFavorite = false;
    };

    $scope.stopPlaylist = function() {
      playlistSrv.stop(1);
    };

  });

});

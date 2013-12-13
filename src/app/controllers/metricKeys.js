define([
  'angular',
  'underscore',
  'config'
],
function (angular, _, config) {
  'use strict';

  var module = angular.module('kibana.controllers');

  module.controller('MetricKeysCtrl', function($scope, $http, $q) {
    var elasticSearchUrlForMetricIndex = config.elasticsearch + '/' + config.grafana_index + '/';
    var loadingDefered;

    $scope.init = function () {
      $scope.metricPath = "prod.apps.api.boobarella.*";
      $scope.metricCounter = 0;
    };

    function deleteIndex()
    {
      var deferred = $q.defer();
      $http.delete(elasticSearchUrlForMetricIndex)
        .success(function() {
          deferred.resolve('ok');
        })
        .error(function(data, status) {
          if (status === 404) {
            deferred.resolve('ok');
          }
          else {
            deferred.reject('elastic search returned unexpected error');
          }
        });

      return deferred.promise;
    }

    function createIndex()
    {
      return $http.put(elasticSearchUrlForMetricIndex, {
        settings: {
          analysis: {
            analyzer: {
              metric_path_ngram : { tokenizer : "my_ngram_tokenizer" }
            },
            tokenizer: {
              my_ngram_tokenizer : {
                type : "nGram",
                min_gram : "3",
                max_gram : "8",
                token_chars: [ "letter", "digit", "punctuation", "symbol"]
              }
            }
          }
        },
        mappings: {
          metricKey: {
            properties: {
              metricPath: {
/*                type: "string",
                index: "analyzed",
                index_analyzer: "metric_path_ngram"
*/
                type: "multi_field",
                fields: {
                  "metricPath": { type: "string", index: "analyzed", index_analyzer: "standard" },
                  "metricPath_ng": { type: "string", index: "analyzed", index_analyzer: "metric_path_ngram" }
                }
              }
            }
          }
        }
      });
    }

    $scope.createIndex = function () {
      $scope.errorText = null;
      $scope.infoText = null;

      deleteIndex()
        .then(createIndex)
        .then(function () {
          $scope.infoText = "Index created!";
        })
        .then(null, function (err) {
          $scope.errorText = angular.toJson(err);
        });
    };

    $scope.loadMetricsFromPath = function () {
      $scope.errorText = null;
      $scope.infoText = null;
      $scope.metricCounter = 0;

      return loadMetricsRecursive($scope.metricPath)
        .then(function() {
          $scope.infoText = "Indexing completed!";
        }, function(err) {
          $scope.errorText = "Error: " + err;
        });
    };

    function receiveMetric(result) {
      var data = result.data;
      if (!data || data.length == 0) {
        console.log('no data');
        return;
      }

      var funcs = _.map(data, function(metric) {
        if (metric.expandable) {
          return loadMetricsRecursive(metric.id + ".*");
        }
        if (metric.leaf) {
          return saveMetricKey(metric.id);
        }
      });

      return $q.all(funcs);
    }

    function saveMetricKey(metricId) {

      // Create request with id as title. Rethink this.
      var request = ejs.Document(config.grafana_index, 'metricKey', metricId).source({
        metricPath: metricId
      });

      return request.doIndex(
        // Success
        function(result) {
          $scope.infoText = "Indexing " + metricId;
          $scope.metricCounter = $scope.metricCounter + 1;
        },
        function(error) {
          $scope.errorText = "failed to save metric " + metricId;
        }
      );
    }

    function metricLoadError(data, status, headers, config)
    {
        $scope.errorText = "failed to get metric";
    }

    function loadMetricsRecursive(metricPath)
    {
      return $http({ method: 'GET', url: config.graphiteUrl + '/metrics/find/?query=' + metricPath} )
              .then(receiveMetric);
    }

  });

});
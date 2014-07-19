define([
  'angular',
  'underscore',
  'moment'
], function (angular, _, moment) {
  'use strict';

  var module = angular.module('kibana.services');

  module.service('annotationsSrv', function(datasourceSrv, $q, alertSrv, $rootScope) {
    var promiseCached;
    var annotationPanel;
    var list = [];

    this.init = function() {
      $rootScope.$on('refresh', this.clearCache);
    };

    this.clearCache = function() {
      promiseCached = null;
      list = [];
    };

    this.getAnnotations = function(filterSrv, rangeUnparsed, dashboard) {
      annotationPanel = _.findWhere(dashboard.pulldowns, { type: 'annotations' });
      if (!annotationPanel.enable) {
        return $q.when(null);
      }

      if (promiseCached) {
        return promiseCached;
      }

      var annotations = _.where(annotationPanel.annotations, { enable: true });

      var promises  = _.map(annotations, function(annotation) {
        var datasource = datasourceSrv.get(annotation.datasource);
        return datasource.annotationQuery(annotation, filterSrv, rangeUnparsed)
          .then(this.receiveAnnotationResults)
          .then(null, errorHandler);
      }, this);

      promiseCached = $q.all(promises)
        .then(function() {
          return list;
        });

      return promiseCached;
    };

    this.receiveAnnotationResults = function(results) {
      for (var i = 0; i < results.length; i++) {
        addAnnotation(results[i]);
      }
    };

    function errorHandler(err) {
      console.log('Annotation error: ', err);
      alertSrv.set('Annotations','Could not fetch annotations','error');
    }

    function addAnnotation(options) {
      var tooltip = "<small><b>" + options.title + "</b><br/>";
      if (options.tags) {
        tooltip += (options.tags || '') + '<br/>';
      }

      tooltip += '<i>' + moment(options.time).format('YYYY-MM-DD HH:mm:ss') + '</i><br/>';

      if (options.text) {
        tooltip += options.text.replace(/\n/g, '<br/>');
      }

      tooltip += "</small>";

      list.push({
        annotation: options.annotation,
        min: options.time,
        max: options.time,
        eventType: options.annotation.name,
        title: null,
        description: tooltip,
        score: 1
      });
    }

    // Now init
    this.init();
  });

});

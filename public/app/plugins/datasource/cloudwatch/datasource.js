define([
  'angular',
  'lodash',
  'moment',
  './query_ctrl',
  './directives',
],
function (angular, _) {
  'use strict';

  var module = angular.module('grafana.services');

  module.factory('CloudWatchDatasource', function($q, $http, templateSrv) {

    function CloudWatchDatasource(datasource) {
      this.type = 'cloudwatch';
      this.name = datasource.name;
      this.supportMetrics = true;
      this.proxyUrl = datasource.url;
      this.defaultRegion = datasource.jsonData.defaultRegion;

      /* jshint -W101 */
      this.supportedRegion = [
        'us-east-1', 'us-west-2', 'us-west-1', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'sa-east-1'
      ];

      this.supportedMetrics = {
        'AWS/AutoScaling': [
          'GroupMinSize', 'GroupMaxSize', 'GroupDesiredCapacity', 'GroupInServiceInstances', 'GroupPendingInstances', 'GroupStandbyInstances', 'GroupTerminatingInstances', 'GroupTotalInstances'
        ],
        'AWS/Billing': [
          'EstimatedCharges'
        ],
        'AWS/CloudFront': [
          'Requests', 'BytesDownloaded', 'BytesUploaded', 'TotalErrorRate', '4xxErrorRate', '5xxErrorRate'
        ],
        'AWS/CloudSearch': [
          'SuccessfulRequests', 'SearchableDocuments', 'IndexUtilization', 'Partitions'
        ],
        'AWS/DynamoDB': [
          'ConditionalCheckFailedRequests', 'ConsumedReadCapacityUnits', 'ConsumedWriteCapacityUnits', 'OnlineIndexConsumedWriteCapacity', 'OnlineIndexPercentageProgress', 'OnlineIndexThrottleEvents', 'ProvisionedReadCapacityUnits', 'ProvisionedWriteCapacityUnits', 'ReadThrottleEvents', 'ReturnedItemCount', 'SuccessfulRequestLatency', 'SystemErrors', 'ThrottledRequests', 'UserErrors', 'WriteThrottleEvents'
        ],
        'AWS/ElastiCache': [
          'CPUUtilization', 'SwapUsage', 'FreeableMemory', 'NetworkBytesIn', 'NetworkBytesOut',
          'BytesUsedForCacheItems', 'BytesReadIntoMemcached', 'BytesWrittenOutFromMemcached', 'CasBadval', 'CasHits', 'CasMisses', 'CmdFlush', 'CmdGet', 'CmdSet', 'CurrConnections', 'CurrItems', 'DecrHits', 'DecrMisses', 'DeleteHits', 'DeleteMisses', 'Evictions', 'GetHits', 'GetMisses', 'IncrHits', 'IncrMisses', 'Reclaimed',
          'CurrConnections', 'Evictions', 'Reclaimed', 'NewConnections', 'BytesUsedForCache', 'CacheHits', 'CacheMisses', 'ReplicationLag', 'GetTypeCmds', 'SetTypeCmds', 'KeyBasedCmds', 'StringBasedCmds', 'HashBasedCmds', 'ListBasedCmds', 'SetBasedCmds', 'SortedSetBasedCmds', 'CurrItems'
        ],
        'AWS/EBS': [
          'VolumeReadBytes', 'VolumeWriteBytes', 'VolumeReadOps', 'VolumeWriteOps', 'VolumeTotalReadTime', 'VolumeTotalWriteTime', 'VolumeIdleTime', 'VolumeQueueLength', 'VolumeThroughputPercentage', 'VolumeConsumedReadWriteOps'
        ],
        'AWS/EC2': [
          'CPUCreditUsage', 'CPUCreditBalance', 'CPUUtilization', 'DiskReadOps', 'DiskWriteOps', 'DiskReadBytes', 'DiskWriteBytes', 'NetworkIn', 'NetworkOut', 'StatusCheckFailed', 'StatusCheckFailed_Instance', 'StatusCheckFailed_System'
        ],
        'AWS/ELB': [
          'HealthyHostCount', 'UnHealthyHostCount', 'RequestCount', 'Latency', 'HTTPCode_ELB_4XX', 'HTTPCode_ELB_5XX', 'HTTPCode_Backend_2XX', 'HTTPCode_Backend_3XX', 'HTTPCode_Backend_4XX', 'HTTPCode_Backend_5XX', 'BackendConnectionErrors', 'SurgeQueueLength', 'SpilloverCount'
        ],
        'AWS/ElasticMapReduce': [
          'CoreNodesPending', 'CoreNodesRunning', 'HBaseBackupFailed', 'HBaseMostRecentBackupDuration', 'HBaseTimeSinceLastSuccessfulBackup', 'HDFSBytesRead', 'HDFSBytesWritten', 'HDFSUtilization', 'IsIdle', 'JobsFailed', 'JobsRunning', 'LiveDataNodes', 'LiveTaskTrackers', 'MapSlotsOpen', 'MissingBlocks', 'ReduceSlotsOpen', 'RemainingMapTasks', 'RemainingMapTasksPerSlot', 'RemainingReduceTasks', 'RunningMapTasks', 'RunningReduceTasks', 'S3BytesRead', 'S3BytesWritten', 'TaskNodesPending', 'TaskNodesRunning', 'TotalLoad'
        ],
        'AWS/Kinesis': [
          'PutRecord.Bytes', 'PutRecord.Latency', 'PutRecord.Success', 'PutRecords.Bytes', 'PutRecords.Latency', 'PutRecords.Records', 'PutRecords.Success', 'IncomingBytes', 'IncomingRecords', 'GetRecords.Bytes', 'GetRecords.IteratorAgeMilliseconds', 'GetRecords.Latency', 'GetRecords.Success'
        ],
        'AWS/ML': [
          'PredictCount', 'PredictFailureCount'
        ],
        'AWS/OpsWorks': [
          'cpu_idle', 'cpu_nice', 'cpu_system', 'cpu_user', 'cpu_waitio', 'load_1', 'load_5', 'load_15', 'memory_buffers', 'memory_cached', 'memory_free', 'memory_swap', 'memory_total', 'memory_used', 'procs'
        ],
        'AWS/Redshift': [
          'CPUUtilization', 'DatabaseConnections', 'HealthStatus', 'MaintenanceMode', 'NetworkReceiveThroughput', 'NetworkTransmitThroughput', 'PercentageDiskSpaceUsed', 'ReadIOPS', 'ReadLatency', 'ReadThroughput', 'WriteIOPS', 'WriteLatency', 'WriteThroughput'
        ],
        'AWS/RDS': [
          'BinLogDiskUsage', 'CPUUtilization', 'DatabaseConnections', 'DiskQueueDepth', 'FreeableMemory', 'FreeStorageSpace', 'ReplicaLag', 'SwapUsage', 'ReadIOPS', 'WriteIOPS', 'ReadLatency', 'WriteLatency', 'ReadThroughput', 'WriteThroughput', 'NetworkReceiveThroughput', 'NetworkTransmitThroughput'
        ],
        'AWS/Route53': [
          'HealthCheckStatus', 'HealthCheckPercentageHealthy'
        ],
        'AWS/SNS': [
          'NumberOfMessagesPublished', 'PublishSize', 'NumberOfNotificationsDelivered', 'NumberOfNotificationsFailed'
        ],
        'AWS/SQS': [
          'NumberOfMessagesSent', 'SentMessageSize', 'NumberOfMessagesReceived', 'NumberOfEmptyReceives', 'NumberOfMessagesDeleted', 'ApproximateNumberOfMessagesDelayed', 'ApproximateNumberOfMessagesVisible', 'ApproximateNumberOfMessagesNotVisible'
        ],
        'AWS/S3': [
          'BucketSizeBytes', 'NumberOfObjects'
        ],
        'AWS/SWF': [
          'DecisionTaskScheduleToStartTime', 'DecisionTaskStartToCloseTime', 'DecisionTasksCompleted', 'StartedDecisionTasksTimedOutOnClose', 'WorkflowStartToCloseTime', 'WorkflowsCanceled', 'WorkflowsCompleted', 'WorkflowsContinuedAsNew', 'WorkflowsFailed', 'WorkflowsTerminated', 'WorkflowsTimedOut'
        ],
        'AWS/StorageGateway': [
          'CacheHitPercent', 'CachePercentUsed', 'CachePercentDirty', 'CloudBytesDownloaded', 'CloudDownloadLatency', 'CloudBytesUploaded', 'UploadBufferFree', 'UploadBufferPercentUsed', 'UploadBufferUsed', 'QueuedWrites', 'ReadBytes', 'ReadTime', 'TotalCacheSize', 'WriteBytes', 'WriteTime', 'WorkingStorageFree', 'WorkingStoragePercentUsed', 'WorkingStorageUsed', 'CacheHitPercent', 'CachePercentUsed', 'CachePercentDirty', 'ReadBytes', 'ReadTime', 'WriteBytes', 'WriteTime', 'QueuedWrites'
        ],
        'AWS/WorkSpaces': [
          'Available', 'Unhealthy', 'ConnectionAttempt', 'ConnectionSuccess', 'ConnectionFailure', 'SessionLaunchTime', 'InSessionLatency', 'SessionDisconnect'
        ],
      };

      this.supportedDimensions = {
        'AWS/AutoScaling': [
          'AutoScalingGroupName'
        ],
        'AWS/Billing': [
          'ServiceName', 'LinkedAccount', 'Currency'
        ],
        'AWS/CloudFront': [
          'DistributionId', 'Region'
        ],
        'AWS/CloudSearch': [

        ],
        'AWS/DynamoDB': [
          'TableName', 'GlobalSecondaryIndexName', 'Operation'
        ],
        'AWS/ElastiCache': [
          'CacheClusterId', 'CacheNodeId'
        ],
        'AWS/EBS': [
          'VolumeId'
        ],
        'AWS/EC2': [
          'AutoScalingGroupName', 'ImageId', 'InstanceId', 'InstanceType'
        ],
        'AWS/ELB': [
          'LoadBalancerName', 'AvailabilityZone'
        ],
        'AWS/ElasticMapReduce': [
          'ClusterId', 'JobId'
        ],
        'AWS/Kinesis': [
          'StreamName'
        ],
        'AWS/ML': [
          'MLModelId', 'RequestMode'
        ],
        'AWS/OpsWorks': [
          'StackId', 'LayerId', 'InstanceId'
        ],
        'AWS/Redshift': [
          'NodeID', 'ClusterIdentifier'
        ],
        'AWS/RDS': [
          'DBInstanceIdentifier', 'DatabaseClass', 'EngineName'
        ],
        'AWS/Route53': [
          'HealthCheckId'
        ],
        'AWS/SNS': [
          'Application', 'Platform', 'TopicName'
        ],
        'AWS/SQS': [
          'QueueName'
        ],
        'AWS/S3': [
          'BucketName', 'StorageType'
        ],
        'AWS/SWF': [
          'Domain', 'ActivityTypeName', 'ActivityTypeVersion'
        ],
        'AWS/StorageGateway': [
          'GatewayId', 'GatewayName', 'VolumeId'
        ],
        'AWS/WorkSpaces': [
          'DirectoryId', 'WorkspaceId'
        ],
      };
      /* jshint +W101 */

      /* load custom metrics definitions */
      var self = this;
      $q.all(
        _.chain(datasource.jsonData.customMetricsAttributes)
        .reject(function(u) {
          return _.isEmpty(u);
        })
        .map(function(u) {
          return $http({ method: 'GET', url: u });
        })
      )
      .then(function(allResponse) {
        _.chain(allResponse)
        .map(function(d) {
          return d.data.Metrics;
        })
        .flatten()
        .reject(function(metric) {
          return metric.Namespace.indexOf('AWS/') === 0;
        })
        .map(function(metric) {
          metric.Dimensions = _.chain(metric.Dimensions)
          .map(function(d) {
            return d.Name;
          })
          .value().sort();
          return metric;
        })
        .uniq(function(metric) {
          return metric.Namespace + metric.MetricName + metric.Dimensions.join('');
        })
        .each(function(metric) {
          if (!_.has(self.supportedMetrics, metric.Namespace)) {
            self.supportedMetrics[metric.Namespace] = [];
          }
          self.supportedMetrics[metric.Namespace].push(metric.MetricName);

          if (!_.has(self.supportedDimensions, metric.Namespace)) {
            self.supportedDimensions[metric.Namespace] = [];
          }

          self.supportedDimensions[metric.Namespace] = _.union(self.supportedDimensions[metric.Namespace], metric.Dimensions);
        });
      });
    }

    // Called once per panel (graph)
    CloudWatchDatasource.prototype.query = function(options) {
      var start = convertToCloudWatchTime(options.range.from);
      var end = convertToCloudWatchTime(options.range.to);

      var queries = [];
      _.each(options.targets, _.bind(function(target) {
        if (!target.namespace || !target.metricName || _.isEmpty(target.statistics)) {
          return;
        }

        var query = {};
        query.region = templateSrv.replace(target.region, options.scopedVars);
        query.namespace = templateSrv.replace(target.namespace, options.scopedVars);
        query.metricName = templateSrv.replace(target.metricName, options.scopedVars);
        query.dimensions = convertDimensionFormat(target.dimensions);
        query.statistics = getActivatedStatistics(target.statistics);
        query.period = parseInt(target.period, 10);

        var range = end - start;
        // CloudWatch limit datapoints up to 1440
        if (range / query.period >= 1440) {
          query.period = Math.floor(range / 1440 / 60) * 60;
        }

        queries.push(query);
      }, this));

      // No valid targets, return the empty result to save a round trip.
      if (_.isEmpty(queries)) {
        var d = $q.defer();
        d.resolve({ data: [] });
        return d.promise;
      }

      var allQueryPromise = _.map(queries, function(query) {
        return this.performTimeSeriesQuery(query, start, end);
      }, this);

      return $q.all(allQueryPromise).then(function(allResponse) {
        var result = [];

        _.each(allResponse, function(response, index) {
          var metrics = transformMetricData(response.data, options.targets[index]);
          result = result.concat(metrics);
        });

        return { data: result };
      });
    };

    CloudWatchDatasource.prototype.performTimeSeriesQuery = function(query, start, end) {
      var cloudwatch = this.getAwsClient(query.region, 'CloudWatch');

      var params = {
        Namespace: query.namespace,
        MetricName: query.metricName,
        Dimensions: query.dimensions,
        Statistics: query.statistics,
        StartTime: start,
        EndTime: end,
        Period: query.period
      };

      return cloudwatch.getMetricStatistics(params);
    };

    CloudWatchDatasource.prototype.getRegions = function() {
      return $q.when(this.supportedRegion);
    };

    CloudWatchDatasource.prototype.getNamespaces = function() {
      return $q.when(_.keys(this.supportedMetrics));
    };

    CloudWatchDatasource.prototype.getMetrics = function(namespace) {
      namespace = templateSrv.replace(namespace);
      return $q.when(this.supportedMetrics[namespace] || []);
    };

    CloudWatchDatasource.prototype.getDimensionKeys = function(namespace) {
      namespace = templateSrv.replace(namespace);
      return $q.when(this.supportedDimensions[namespace] || []);
    };

    CloudWatchDatasource.prototype.getDimensionValues = function(region, namespace, metricName, dimensions) {
      region = templateSrv.replace(region);
      namespace = templateSrv.replace(namespace);
      metricName = templateSrv.replace(metricName);

      var cloudwatch = this.getAwsClient(region, 'CloudWatch');
      var params = {Namespace: namespace, MetricName: metricName};

      if (!_.isEmpty(dimensions)) {
        params.Dimensions = convertDimensionFormat(dimensions);
      }

      return cloudwatch.listMetrics(params).then(function(result) {
        return _.chain(result.data.Metrics).map(function(metric) {
          return metric.Dimensions;
        }).reject(function(metric) {
          return _.isEmpty(metric);
        }).value();
      });
    };

    CloudWatchDatasource.prototype.performEC2DescribeInstances = function(region, filters, instanceIds) {
      var ec2 = this.getAwsClient(region, 'EC2');

      var params = {};
      if (filters.length > 0) {
        params.Filters = filters;
      }
      if (instanceIds.length > 0) {
        params.InstanceIds = instanceIds;
      }

      return ec2.describeInstances(params);
    };

    CloudWatchDatasource.prototype.metricFindQuery = function(query) {
      var region;
      var namespace;
      var metricName;

      var transformSuggestData = function(suggestData) {
        return _.map(suggestData, function(v) {
          return { text: v };
        });
      };

      var regionQuery = query.match(/^region\(\)/);
      if (regionQuery) {
        return this.getRegions().then(transformSuggestData);
      }

      var namespaceQuery = query.match(/^namespace\(\)/);
      if (namespaceQuery) {
        return this.getNamespaces().then(transformSuggestData);
      }

      var metricNameQuery = query.match(/^metrics\(([^\)]+?)\)/);
      if (metricNameQuery) {
        namespace = templateSrv.replace(metricNameQuery[1]);
        return this.getMetrics(namespace).then(transformSuggestData);
      }

      var dimensionKeysQuery = query.match(/^dimension_keys\(([^\)]+?)\)/);
      if (dimensionKeysQuery) {
        namespace = templateSrv.replace(dimensionKeysQuery[1]);
        return this.getDimensionKeys(namespace).then(transformSuggestData);
      }

      var dimensionValuesQuery = query.match(/^dimension_values\(([^,]+?),\s?([^,]+?),\s?([^,]+?)(,\s?([^)]*))?\)/);
      if (dimensionValuesQuery) {
        region = templateSrv.replace(dimensionValuesQuery[1]);
        namespace = templateSrv.replace(dimensionValuesQuery[2]);
        metricName = templateSrv.replace(dimensionValuesQuery[3]);
        var dimensionPart = templateSrv.replace(dimensionValuesQuery[5]);

        var dimensions = {};
        if (!_.isEmpty(dimensionPart)) {
          _.each(dimensionPart.split(','), function(v) {
            var t = v.split('=');
            if (t.length !== 2) {
              throw new Error('Invalid query format');
            }
            dimensions[t[0]] = t[1];
          });
        }

        return this.getDimensionValues(region, namespace, metricName, dimensions)
        .then(function(suggestData) {
          return _.map(suggestData, function(dimensions) {
            var result = _.chain(dimensions)
            .sortBy(function(dimension) {
              return dimension.Name;
            })
            .map(function(dimension) {
              return dimension.Name + '=' + dimension.Value;
            })
            .value().join(',');

            return { text: result };
          });
        });
      }

      var ebsVolumeIdsQuery = query.match(/^ebs_volume_ids\(([^,]+?),\s?([^,]+?)\)/);
      if (ebsVolumeIdsQuery) {
        region = templateSrv.replace(ebsVolumeIdsQuery[1]);
        var instanceId = templateSrv.replace(ebsVolumeIdsQuery[2]);
        var instanceIds = [
          instanceId
        ];

        return this.performEC2DescribeInstances(region, [], instanceIds).then(function(result) {
          var volumeIds = _.map(result.Reservations[0].Instances[0].BlockDeviceMappings, function(mapping) {
            return mapping.EBS.VolumeID;
          });

          return transformSuggestData(volumeIds);
        });
      }

      return $q.when([]);
    };

    CloudWatchDatasource.prototype.testDatasource = function() {
      /* use billing metrics for test */
      var region = 'us-east-1';
      var namespace = 'AWS/Billing';
      var metricName = 'EstimatedCharges';
      var dimensions = {};

      return this.performSuggestDimensionValues(region, namespace, metricName, dimensions).then(function () {
        return { status: 'success', message: 'Data source is working', title: 'Success' };
      });
    };

    CloudWatchDatasource.prototype.getAwsClient = function(region, service) {
      var self = this;
      var generateRequestProxy = function(service, action) {
        return function(params) {
          var data = {
            region: region,
            service: service,
            action: action,
            parameters: params
          };

          var options = {
            method: 'POST',
            url: self.proxyUrl,
            data: data
          };

          return $http(options);
        };
      };

      switch (service) {
        case 'CloudWatch': {
          return {
            getMetricStatistics: generateRequestProxy('CloudWatch', 'GetMetricStatistics'),
            listMetrics: generateRequestProxy('CloudWatch', 'ListMetrics')
          };
        }
        case 'EC2': {
          return {
            describeInstances: generateRequestProxy('EC2', 'DescribeInstances')
          };
        }
      }
    };

    CloudWatchDatasource.prototype.getDefaultRegion = function() {
      return this.defaultRegion;
    };

    function transformMetricData(md, options) {
      var result = [];

      var dimensionPart = templateSrv.replace(JSON.stringify(options.dimensions));
      _.each(getActivatedStatistics(options.statistics), function(s) {
        var originalSettings = _.templateSettings;
        _.templateSettings = {
          interpolate: /\{\{(.+?)\}\}/g
        };
        var template = _.template(options.legendFormat);

        var metricLabel;
        if (_.isEmpty(options.legendFormat)) {
          metricLabel = md.Label + '_' + s + dimensionPart;
        } else {
          var d = convertDimensionFormat(options.dimensions);
          metricLabel = template({
            Region: templateSrv.replace(options.region),
            Namespace: templateSrv.replace(options.namespace),
            MetricName: templateSrv.replace(options.metricName),
            Dimensions: d,
            Statistics: s
          });
        }

        _.templateSettings = originalSettings;

        var dps = _.map(md.Datapoints, function(value) {
          return [value[s], new Date(value.Timestamp).getTime()];
        });
        dps = _.sortBy(dps, function(dp) { return dp[1]; });

        result.push({ target: metricLabel, datapoints: dps });
      });

      return result;
    }

    function getActivatedStatistics(statistics) {
      var activatedStatistics = [];
      _.each(statistics, function(v, k) {
        if (v) {
          activatedStatistics.push(k);
        }
      });
      return activatedStatistics;
    }

    function convertToCloudWatchTime(date) {
      return Math.round(date.valueOf() / 1000);
    }

    function convertDimensionFormat(dimensions) {
      return _.map(_.keys(dimensions), function(key) {
        return {
          Name: templateSrv.replace(key),
          Value: templateSrv.replace(dimensions[key])
        };
      });
    }

    return CloudWatchDatasource;
  });

});

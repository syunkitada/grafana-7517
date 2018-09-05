/** @ngInject */
export default class StackdriverDatasource {
  url: string;
  baseUrl: string;

  constructor(instanceSettings, private backendSrv) {
    this.baseUrl = `/stackdriver/`;
    this.url = instanceSettings.url;
  }

  testDatasource() {
    const path = `v3/projects/raintank-production/metricDescriptors`;
    return this.doRequest(`${this.baseUrl}${path}`)
      .then(response => {
        if (response.status === 200) {
          return {
            status: 'success',
            message: 'Successfully queried the Azure Monitor service.',
            title: 'Success',
          };
        }
      })
      .catch(error => {
        let message = 'Stackdriver: ';
        message += error.statusText ? error.statusText + ': ' : '';

        if (error.data && error.data.error && error.data.error.code) {
          // 400, 401
          message += error.data.error.code + '. ' + error.data.error.message;
        } else {
          message += 'Cannot connect to Stackdriver API';
        }
        return {
          status: 'error',
          message: message,
        };
      });
  }

  doRequest(url, maxRetries = 1) {
    return this.backendSrv
      .datasourceRequest({
        url: this.url + url,
        method: 'GET',
      })
      .catch(error => {
        if (maxRetries > 0) {
          return this.doRequest(url, maxRetries - 1);
        }

        throw error;
      });
  }
}

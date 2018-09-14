import StackdriverDataSource from '../datasource';
import { metricDescriptors } from './testData';

describe('StackdriverDataSource', () => {
  describe('when performing testDataSource', () => {
    describe('and call to stackdriver api succeeds', () => {
      let ds;
      let result;
      beforeEach(async () => {
        const backendSrv = {
          async datasourceRequest() {
            return Promise.resolve({ status: 200 });
          },
        };
        ds = new StackdriverDataSource({}, backendSrv);
        result = await ds.testDatasource();
      });
      it('should return successfully', () => {
        expect(result.status).toBe('success');
      });
    });

    describe('and a list of metricDescriptors are returned', () => {
      let ds;
      let result;
      beforeEach(async () => {
        const backendSrv = {
          datasourceRequest: async () => Promise.resolve({ status: 200, data: metricDescriptors }),
        };
        ds = new StackdriverDataSource({}, backendSrv);
        result = await ds.testDatasource();
      });
      it('should return status success', () => {
        expect(result.status).toBe('success');
      });
    });

    describe('and call to stackdriver api fails with 400 error', () => {
      let ds;
      let result;
      beforeEach(async () => {
        const backendSrv = {
          datasourceRequest: async () =>
            Promise.reject({
              statusText: 'Bad Request',
              data: { error: { code: 400, message: 'Field interval.endTime had an invalid value' } },
            }),
        };
        ds = new StackdriverDataSource({}, backendSrv);
        result = await ds.testDatasource();
      });

      it('should return error status and a detailed error message', () => {
        expect(result.status).toEqual('error');
        expect(result.message).toBe('Stackdriver: Bad Request: 400. Field interval.endTime had an invalid value');
      });
    });
  });

  describe('when performing getProjects', () => {
    describe('and call to resource manager api succeeds', () => {
      let ds;
      let result;
      beforeEach(async () => {
        const response = {
          projects: [
            {
              projectNumber: '853996325002',
              projectId: 'test-project',
              lifecycleState: 'ACTIVE',
              name: 'Test Project',
              createTime: '2015-06-02T14:16:08.520Z',
              parent: {
                type: 'organization',
                id: '853996325002',
              },
            },
          ],
        };
        const backendSrv = {
          async datasourceRequest() {
            return Promise.resolve({ status: 200, data: response });
          },
        };
        ds = new StackdriverDataSource({}, backendSrv);
        result = await ds.getProjects();
      });

      it('should return successfully', () => {
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('test-project');
        expect(result[0].name).toBe('Test Project');
      });
    });
  });
});

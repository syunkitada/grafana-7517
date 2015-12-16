import { describe, fdescribe, xdescribe, it, fit, xit, beforeEach, afterEach, beforeEachProviders, inject } from 'angular2/testing';
import { provide } from 'angular2/core';
var db;
class MyService {
}
class MyMockService {
}
// #docregion describeIt
describe('some component', () => {
    it('does something', () => {
        // This is a test.
    });
});
// #enddocregion
// #docregion fdescribe
fdescribe('some component', () => {
    it('has a test', () => {
        // This test will run.
    });
});
describe('another component', () => { it('also has a test', () => { throw 'This test will not run.'; }); });
// #enddocregion
// #docregion xdescribe
xdescribe('some component', () => { it('has a test', () => { throw 'This test will not run.'; }); });
describe('another component', () => {
    it('also has a test', () => {
        // This test will run.
    });
});
// #enddocregion
// #docregion fit
describe('some component', () => {
    fit('has a test', () => {
        // This test will run.
    });
    it('has another test', () => { throw 'This test will not run.'; });
});
// #enddocregion
// #docregion xit
describe('some component', () => {
    xit('has a test', () => { throw 'This test will not run.'; });
    it('has another test', () => {
        // This test will run.
    });
});
// #enddocregion
// #docregion beforeEach
describe('some component', () => {
    beforeEach(() => { db.connect(); });
    it('uses the db', () => {
        // Database is connected.
    });
});
// #enddocregion
// #docregion beforeEachProviders
describe('some component', () => {
    beforeEachProviders(() => [provide(MyService, { useClass: MyMockService })]);
    it('uses MyService', inject([MyService], (service) => {
        // service is an instance of MyMockService.
    }));
});
// #enddocregion
// #docregion afterEach
describe('some component', () => {
    afterEach((done) => { db.reset().then((_) => done()); });
    it('uses the db', () => {
        // This test can leave the database in a dirty state.
        // The afterEach will ensure it gets reset.
    });
});
// #enddocregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL3Rlc3RpbmcvdHMvdGVzdGluZy50cyJdLCJuYW1lcyI6WyJNeVNlcnZpY2UiLCJNeU1vY2tTZXJ2aWNlIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUNMLFFBQVEsRUFDUixTQUFTLEVBQ1QsU0FBUyxFQUNULEVBQUUsRUFDRixHQUFHLEVBQ0gsR0FBRyxFQUNILFVBQVUsRUFDVixTQUFTLEVBQ1QsbUJBQW1CLEVBQ25CLE1BQU0sRUFDUCxNQUFNLGtCQUFrQjtPQUNsQixFQUFDLE9BQU8sRUFBQyxNQUFNLGVBQWU7QUFFckMsSUFBSSxFQUFPLENBQUM7QUFDWjtBQUFpQkEsQ0FBQ0E7QUFDbEI7QUFBMENDLENBQUNBO0FBRTNDLHdCQUF3QjtBQUN4QixRQUFRLENBQUMsZ0JBQWdCLEVBQUU7SUFDekIsRUFBRSxDQUFDLGdCQUFnQixFQUFFO1FBQ0ksa0JBQWtCO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0FBQzFCLENBQUMsQ0FBQyxDQUFDO0FBQ0gsZ0JBQWdCO0FBRWhCLHVCQUF1QjtBQUN2QixTQUFTLENBQUMsZ0JBQWdCLEVBQUU7SUFDMUIsRUFBRSxDQUFDLFlBQVksRUFBRTtRQUNJLHNCQUFzQjtJQUMxQixDQUFDLENBQUMsQ0FBQztBQUN0QixDQUFDLENBQUMsQ0FBQztBQUNILFFBQVEsQ0FBQyxtQkFBbUIsRUFDbkIsUUFBUSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxNQUFNLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RixnQkFBZ0I7QUFFaEIsdUJBQXVCO0FBQ3ZCLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsUUFBTyxNQUFNLHlCQUF5QixDQUFBLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRyxRQUFRLENBQUMsbUJBQW1CLEVBQUU7SUFDNUIsRUFBRSxDQUFDLGlCQUFpQixFQUFFO1FBQ0ksc0JBQXNCO0lBQzFCLENBQUMsQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQyxDQUFDO0FBQ0gsZ0JBQWdCO0FBRWhCLGlCQUFpQjtBQUNqQixRQUFRLENBQUMsZ0JBQWdCLEVBQUU7SUFDekIsR0FBRyxDQUFDLFlBQVksRUFBRTtRQUNJLHNCQUFzQjtJQUMxQixDQUFDLENBQUMsQ0FBQztJQUNyQixFQUFFLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxNQUFNLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckUsQ0FBQyxDQUFDLENBQUM7QUFDSCxnQkFBZ0I7QUFFaEIsaUJBQWlCO0FBQ2pCLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtJQUN6QixHQUFHLENBQUMsWUFBWSxFQUFFLFFBQVEsTUFBTSx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELEVBQUUsQ0FBQyxrQkFBa0IsRUFBRTtRQUNJLHNCQUFzQjtJQUMxQixDQUFDLENBQUMsQ0FBQztBQUM1QixDQUFDLENBQUMsQ0FBQztBQUNILGdCQUFnQjtBQUVoQix3QkFBd0I7QUFDeEIsUUFBUSxDQUFDLGdCQUFnQixFQUFFO0lBQ3pCLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxhQUFhLEVBQUU7UUFDSSx5QkFBeUI7SUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFDdkIsQ0FBQyxDQUFDLENBQUM7QUFDSCxnQkFBZ0I7QUFFaEIsaUNBQWlDO0FBQ2pDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtJQUN6QixtQkFBbUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzRSxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPO1FBQ0osMkNBQTJDO0lBQy9DLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0MsQ0FBQyxDQUFDLENBQUM7QUFDSCxnQkFBZ0I7QUFFaEIsdUJBQXVCO0FBQ3ZCLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtJQUN6QixTQUFTLENBQUMsQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekQsRUFBRSxDQUFDLGFBQWEsRUFBRTtRQUNJLHFEQUFxRDtRQUNyRCwyQ0FBMkM7SUFDL0MsQ0FBQyxDQUFDLENBQUM7QUFDdkIsQ0FBQyxDQUFDLENBQUM7QUFDSCxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBkZXNjcmliZSxcbiAgZmRlc2NyaWJlLFxuICB4ZGVzY3JpYmUsXG4gIGl0LFxuICBmaXQsXG4gIHhpdCxcbiAgYmVmb3JlRWFjaCxcbiAgYWZ0ZXJFYWNoLFxuICBiZWZvcmVFYWNoUHJvdmlkZXJzLFxuICBpbmplY3Rcbn0gZnJvbSAnYW5ndWxhcjIvdGVzdGluZyc7XG5pbXBvcnQge3Byb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG52YXIgZGI6IGFueTtcbmNsYXNzIE15U2VydmljZSB7fVxuY2xhc3MgTXlNb2NrU2VydmljZSBpbXBsZW1lbnRzIE15U2VydmljZSB7fVxuXG4vLyAjZG9jcmVnaW9uIGRlc2NyaWJlSXRcbmRlc2NyaWJlKCdzb21lIGNvbXBvbmVudCcsICgpID0+IHtcbiAgaXQoJ2RvZXMgc29tZXRoaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIHRlc3QuXG4gICAgICAgICAgICAgICAgICAgICAgIH0pO1xufSk7XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gZmRlc2NyaWJlXG5mZGVzY3JpYmUoJ3NvbWUgY29tcG9uZW50JywgKCkgPT4ge1xuICBpdCgnaGFzIGEgdGVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyB0ZXN0IHdpbGwgcnVuLlxuICAgICAgICAgICAgICAgICAgIH0pO1xufSk7XG5kZXNjcmliZSgnYW5vdGhlciBjb21wb25lbnQnLFxuICAgICAgICAgKCkgPT4geyBpdCgnYWxzbyBoYXMgYSB0ZXN0JywgKCkgPT4geyB0aHJvdyAnVGhpcyB0ZXN0IHdpbGwgbm90IHJ1bi4nOyB9KTsgfSk7XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24geGRlc2NyaWJlXG54ZGVzY3JpYmUoJ3NvbWUgY29tcG9uZW50JywgKCkgPT4geyBpdCgnaGFzIGEgdGVzdCcsICgpID0+IHt0aHJvdyAnVGhpcyB0ZXN0IHdpbGwgbm90IHJ1bi4nfSk7IH0pO1xuZGVzY3JpYmUoJ2Fub3RoZXIgY29tcG9uZW50JywgKCkgPT4ge1xuICBpdCgnYWxzbyBoYXMgYSB0ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgdGVzdCB3aWxsIHJ1bi5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xufSk7XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gZml0XG5kZXNjcmliZSgnc29tZSBjb21wb25lbnQnLCAoKSA9PiB7XG4gIGZpdCgnaGFzIGEgdGVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgdGVzdCB3aWxsIHJ1bi5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gIGl0KCdoYXMgYW5vdGhlciB0ZXN0JywgKCkgPT4geyB0aHJvdyAnVGhpcyB0ZXN0IHdpbGwgbm90IHJ1bi4nOyB9KTtcbn0pO1xuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIHhpdFxuZGVzY3JpYmUoJ3NvbWUgY29tcG9uZW50JywgKCkgPT4ge1xuICB4aXQoJ2hhcyBhIHRlc3QnLCAoKSA9PiB7IHRocm93ICdUaGlzIHRlc3Qgd2lsbCBub3QgcnVuLic7IH0pO1xuICBpdCgnaGFzIGFub3RoZXIgdGVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyB0ZXN0IHdpbGwgcnVuLlxuICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xufSk7XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gYmVmb3JlRWFjaFxuZGVzY3JpYmUoJ3NvbWUgY29tcG9uZW50JywgKCkgPT4ge1xuICBiZWZvcmVFYWNoKCgpID0+IHsgZGIuY29ubmVjdCgpOyB9KTtcbiAgaXQoJ3VzZXMgdGhlIGRiJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGF0YWJhc2UgaXMgY29ubmVjdGVkLlxuICAgICAgICAgICAgICAgICAgICB9KTtcbn0pO1xuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIGJlZm9yZUVhY2hQcm92aWRlcnNcbmRlc2NyaWJlKCdzb21lIGNvbXBvbmVudCcsICgpID0+IHtcbiAgYmVmb3JlRWFjaFByb3ZpZGVycygoKSA9PiBbcHJvdmlkZShNeVNlcnZpY2UsIHt1c2VDbGFzczogTXlNb2NrU2VydmljZX0pXSk7XG4gIGl0KCd1c2VzIE15U2VydmljZScsIGluamVjdChbTXlTZXJ2aWNlXSwgKHNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VydmljZSBpcyBhbiBpbnN0YW5jZSBvZiBNeU1vY2tTZXJ2aWNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbn0pO1xuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIGFmdGVyRWFjaFxuZGVzY3JpYmUoJ3NvbWUgY29tcG9uZW50JywgKCkgPT4ge1xuICBhZnRlckVhY2goKGRvbmUpID0+IHsgZGIucmVzZXQoKS50aGVuKChfKSA9PiBkb25lKCkpOyB9KTtcbiAgaXQoJ3VzZXMgdGhlIGRiJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyB0ZXN0IGNhbiBsZWF2ZSB0aGUgZGF0YWJhc2UgaW4gYSBkaXJ0eSBzdGF0ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBhZnRlckVhY2ggd2lsbCBlbnN1cmUgaXQgZ2V0cyByZXNldC5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG59KTtcbi8vICNlbmRkb2NyZWdpb25cbiJdfQ==
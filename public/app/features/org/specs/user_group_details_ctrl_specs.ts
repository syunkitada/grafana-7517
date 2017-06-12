import '../user_group_details_ctrl';
import {describe, beforeEach, it, expect, sinon, angularMocks} from 'test/lib/common';
import UserGroupDetailsCtrl from '../user_group_details_ctrl';

describe('UserGroupDetailsCtrl', () => {
var ctx: any = {};
var backendSrv = {
  searchUsers: sinon.stub().returns(Promise.resolve([])),
  get: sinon.stub().returns(Promise.resolve([])),
  post: sinon.stub().returns(Promise.resolve([]))
};

  beforeEach(angularMocks.module('grafana.core'));
  beforeEach(angularMocks.module('grafana.controllers'));

  beforeEach(angularMocks.inject(($rootScope, $controller, $q) => {
    ctx.$q = $q;
    ctx.scope = $rootScope.$new();
    ctx.ctrl = $controller(UserGroupDetailsCtrl, {
      $scope: ctx.scope,
      backendSrv: backendSrv,
      $routeParams: {id: 1}
    });
    ctx.ctrl.user = {name: 'login - user@email.com'};
  }));

  describe('when user is chosen to be added to user group', () => {
    beforeEach(() => {
      ctx.scope.addMemberForm = {$valid: true};
      ctx.ctrl.usersSearchCache = [{id: 1, login: 'login'}, {id: 2, login: 'login2'}];
      ctx.ctrl.addMember();
    });

    it('should parse the result and save to db', () => {
      expect(backendSrv.post.getCall(0).args[0]).to.eql('/api/user-groups/1/members');
    });

    it('should refresh the list after saving.', () => {
      expect(backendSrv.get.getCall(0).args[0]).to.eql('/api/user-groups/1');
      expect(backendSrv.get.getCall(1).args[0]).to.eql('/api/user-groups/1/members');
    });
  });
});

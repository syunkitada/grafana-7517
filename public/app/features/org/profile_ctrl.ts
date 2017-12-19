import config from "app/core/config";
import { coreModule } from "app/core/core";

export class ProfileCtrl {
  user: any;
  old_theme: any;
  orgs: any = [];
  userForm: any;
  showOrgsList = false;
  readonlyLoginFields = config.disableLoginForm;
  navModel: any;

  /** @ngInject **/
  constructor(
    private backendSrv,
    private contextSrv,
    private $location,
    navModelSrv
  ) {
    this.getUser();
    this.getUserOrgs();
    this.navModel = navModelSrv.getNav("profile", "profile-settings", 0);
  }

  getUser() {
    this.backendSrv.get("/api/user").then(user => {
      this.user = user;
      this.user.theme = user.theme || "dark";
    });
  }

  getUserOrgs() {
    this.backendSrv.get("/api/user/orgs").then(orgs => {
      this.orgs = orgs;
      this.showOrgsList = orgs.length > 1;
    });
  }

  setUsingOrg(org) {
    this.backendSrv.post("/api/user/using/" + org.orgId).then(() => {
      window.location.href = config.appSubUrl + "/profile";
    });
  }

  update() {
    if (!this.userForm.$valid) {
      return;
    }

    this.backendSrv.put("/api/user/", this.user).then(() => {
      this.contextSrv.user.name = this.user.name || this.user.login;
      if (this.old_theme !== this.user.theme) {
        window.location.href = config.appSubUrl + this.$location.path();
      }
    });
  }
}

coreModule.controller("ProfileCtrl", ProfileCtrl);

///<reference path="../../../headers/common.d.ts" />

import config from 'app/core/config';
import _ from 'lodash';
import $ from 'jquery';
import coreModule from '../../core_module';

export class SideMenuCtrl {
  isSignedIn: boolean;
  user: any;
  mainLinks: any;
  bottomNav: any;
  appSubUrl: string;
  loginUrl: string;
  orgFilter: string;
  orgItems: any;
  orgs: any;
  maxShownOrgs: number;

  /** @ngInject */
  constructor(private $scope, private $rootScope, private $location, private contextSrv, private backendSrv, private $element) {
    this.isSignedIn = contextSrv.isSignedIn;
    this.user = contextSrv.user;
    this.appSubUrl = config.appSubUrl;
    this.maxShownOrgs = 10;
    this.mainLinks = _.filter(config.bootData.navTree, item => !item.hideFromMenu);
    this.bottomNav = _.filter(config.bootData.navTree, item => item.hideFromMenu);
    this.loginUrl = 'login?redirect=' + encodeURIComponent(this.$location.path());

    this.$scope.$on('$routeChangeSuccess', () => {
      if (!this.contextSrv.pinned) {
        this.contextSrv.sidemenu = false;
      }
      this.loginUrl = 'login?redirect=' + encodeURIComponent(this.$location.path());
    });

    this.orgFilter = '';
  }

 getUrl(url) {
   return config.appSubUrl + url;
 }

 search() {
   this.$rootScope.appEvent('show-dash-search');
 }

 openUserDropdown() {

   // if (this.contextSrv.hasRole('Admin')) {
   //   this.orgMenu.push({section: this.user.orgName, cssClass: 'dropdown-menu-title'});
   //   this.orgMenu.push({
   //     text: "Preferences",
   //     url: this.getUrl("/org")
   //   });
   //   this.orgMenu.push({
   //     text: "Users",
   //     url: this.getUrl("/org/users")
   //   });
   //   this.orgMenu.push({
   //     text: "User Groups",
   //     url: this.getUrl("/org/user-groups")
   //   });
   //   this.orgMenu.push({
   //     text: "API Keys",
   //     url: this.getUrl("/org/apikeys")
   //   });
   // }

   // this.orgMenu.push({cssClass: "divider"});
   // this.backendSrv.get('/api/user/orgs').then(orgs => {
   //   this.orgs = orgs;
   //   this.loadOrgsItems();
   // });
 }

 loadOrgsItems(){
   this.orgItems = [];
   this.orgs.forEach(org => {
     if (org.orgId === this.contextSrv.user.orgId) {
       return;
     }

     if (this.orgItems.length === this.maxShownOrgs) {
       return;
     }

     if (this.orgFilter === '' || (org.name.toLowerCase().indexOf(this.orgFilter.toLowerCase()) !== -1)) {
       this.orgItems.push({
         text: "Switch to " + org.name,
         icon: "fa fa-fw fa-random",
         url: this.getUrl('/profile/switch-org/' + org.orgId),
         target: '_self'
       });
     }
   });
   if (config.allowOrgCreate) {
     this.orgItems.push({text: "New organization", icon: "fa fa-fw fa-plus", url: this.getUrl('/org/new')});
   }
 }
}

export function sideMenuDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app/core/components/sidemenu/sidemenu.html',
    controller: SideMenuCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
    link: function(scope, elem) {
      // hack to hide dropdown menu
      elem.on('click.dropdown', '.dropdown-menu a', function(evt) {
        var menu = $(evt.target).parents('.dropdown-menu');
        var parent = menu.parent();
        menu.detach();

        setTimeout(function() {
          parent.append(menu);
        }, 100);
      });

      scope.$on("$destory", function() {
        elem.off('click.dropdown');
      });
    }
  };
}

coreModule.directive('sidemenu', sideMenuDirective);

import appEvents from 'app/core/app_events';

export class CreateFolderCtrl {
  title = '';
  navModel: any;
  titleTouched = false;
  hasValidationError: boolean;
  validationError: any;

  /** @ngInject **/
  constructor(
    private backendSrv,
    private $location,
    private validationSrv,
    navModelSrv
  ) {
    this.navModel = navModelSrv.getNav('dashboards', 'manage-dashboards', 0);
  }

  create() {
    if (this.hasValidationError) {
      return;
    }

    return this.backendSrv.createDashboardFolder(this.title).then(result => {
      appEvents.emit('alert-success', ['Folder Created', 'OK']);

      var folderUrl = `/dashboards/folder/${result.dashboard.id}/${
        result.meta.slug
      }`;
      this.$location.url(folderUrl);
    });
  }

  titleChanged() {
    this.titleTouched = true;

    this.validationSrv
      .validateNewDashboardOrFolderName(this.title)
      .then(() => {
        this.hasValidationError = false;
      })
      .catch(err => {
        this.hasValidationError = true;
        this.validationError = err.message;
      });
  }
}

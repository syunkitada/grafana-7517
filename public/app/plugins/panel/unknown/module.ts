///<reference path="../../../headers/common.d.ts" />

import {PanelCtrl} from '../../../features/panel/panel';

export class UnknownPanelCtrl extends PanelCtrl {
  static templateUrl = 'public/app/plugins/panel/unknown/module.html';

  constructor($scope, $injector) {
    super($scope, $injector);
  }
}




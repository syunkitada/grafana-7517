
import {PanelDirective} from '../../../features/panel/panel';
import {GraphCtrl} from './graph_ctrl';

import './graph';
import './legend';
import './seriesOverridesCtrl';

class GraphPanel extends PanelDirective {
  controller = GraphCtrl;
  templateUrl = 'public/app/plugins/panel/graph/module.html';
}

export {
  GraphPanel,
  GraphPanel as Panel
}

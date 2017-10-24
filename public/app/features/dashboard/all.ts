
import './dashboard_ctrl';
import './alerting_srv';
import './history/history';
import './dashboardLoaderSrv';
import './dashnav/dashnav';
import './submenu/submenu';
import './save_as_modal';
import './save_modal';
import './shareModalCtrl';
import './shareSnapshotCtrl';
import './dashboard_srv';
import './viewStateSrv';
import './time_srv';
import './unsavedChangesSrv';
import './unsaved_changes_modal';
import './timepicker/timepicker';
import './impression_store';
import './upload';
import './import/dash_import';
import './export/export_modal';
import './export_data/export_data_modal';
import './ad_hoc_filters';
import './repeat_option/repeat_option';
import './dashgrid/DashboardGrid';
import './dashgrid/PanelLoader';
import './dashgrid/RowOptions';
import './acl/acl';
import './folder_picker/picker';
import './folder_modal/folder';
import './move_to_folder_modal/move_to_folder';
import coreModule from 'app/core/core_module';

import {DashboardListCtrl} from './dashboard_list_ctrl';

coreModule.controller('DashboardListCtrl', DashboardListCtrl);

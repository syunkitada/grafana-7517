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
import './view_state_srv';
import './time_srv';
import './unsavedChangesSrv';
import './unsaved_changes_modal';
import './timepicker/timepicker';
import './upload';
import './export/export_modal';
import './export_data/export_data_modal';
import './ad_hoc_filters';
import './repeat_option/repeat_option';
import './dashgrid/DashboardGridDirective';
import './dashgrid/PanelLoader';
import './dashgrid/RowOptions';
import './acl/acl';
import './folder_picker/picker';
import './folder_modal/folder';
import './move_to_folder_modal/move_to_folder';
import coreModule from 'app/core/core_module';

import {DashboardListCtrl} from './dashboard_list_ctrl';
import {FolderDashboardsCtrl} from './folder_dashboards_ctrl';
import {FolderPermissionsCtrl} from './folder_permissions_ctrl';
import {DashboardImportCtrl} from './dashboard_import_ctrl';
import {CreateFolderCtrl} from './create_folder_ctrl';

coreModule.controller('DashboardListCtrl', DashboardListCtrl);
coreModule.controller('FolderDashboardsCtrl', FolderDashboardsCtrl);
coreModule.controller('FolderPermissionsCtrl', FolderPermissionsCtrl);
coreModule.controller('DashboardImportCtrl', DashboardImportCtrl);
coreModule.controller('CreateFolderCtrl', CreateFolderCtrl);

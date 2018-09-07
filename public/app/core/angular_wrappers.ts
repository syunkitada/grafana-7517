import { react2AngularDirective } from 'app/core/utils/react2angular';
import { PasswordStrength } from './components/PasswordStrength';
import PageHeader from './components/PageHeader/PageHeader';
import EmptyListCTA from './components/EmptyListCTA/EmptyListCTA';
import { SearchResult } from './components/search/SearchResult';
import { TagFilter } from './components/TagFilter/TagFilter';
import { SideMenu } from './components/sidemenu/SideMenu';
import DashboardPermissions from './components/Permissions/DashboardPermissions';
import { GraphLegend } from 'app/plugins/panel/graph/Legend';

export function registerAngularDirectives() {
  react2AngularDirective('passwordStrength', PasswordStrength, ['password']);
  react2AngularDirective('sidemenu', SideMenu, []);
  react2AngularDirective('pageHeader', PageHeader, ['model', 'noTabs']);
  react2AngularDirective('emptyListCta', EmptyListCTA, ['model']);
  react2AngularDirective('searchResult', SearchResult, []);
  react2AngularDirective('tagFilter', TagFilter, [
    'tags',
    ['onSelect', { watchDepth: 'reference' }],
    ['tagOptions', { watchDepth: 'reference' }],
  ]);
  react2AngularDirective('dashboardPermissions', DashboardPermissions, ['backendSrv', 'dashboardId', 'folder']);
  react2AngularDirective('graphLegendReact', GraphLegend, ['seriesList', 'className']);
}

import { Team, TeamsState, TeamState, TeamGroup, TeamMember } from './teams';
import { AlertRuleDTO, AlertRule, AlertRulesState } from './alerting';
import { LocationState, LocationUpdate, UrlQueryMap, UrlQueryValue } from './location';
import { NavModel, NavModelItem, NavIndex } from './navModel';
import { FolderDTO, FolderState, FolderInfo } from './folder';
import { DashboardAcl, DashboardAclDTO, PermissionLevel, DashboardAclUpdateDTO } from './acl';

export {
  Team,
  TeamsState,
  TeamState,
  TeamGroup,
  TeamMember,
  AlertRuleDTO,
  AlertRule,
  AlertRulesState,
  LocationState,
  LocationUpdate,
  NavModel,
  NavModelItem,
  NavIndex,
  UrlQueryMap,
  UrlQueryValue,
  FolderDTO,
  FolderState,
  FolderInfo,
  DashboardAcl,
  DashboardAclDTO,
  DashboardAclUpdateDTO,
  PermissionLevel,
};

export interface StoreState {
  navIndex: NavIndex;
  location: LocationState;
  alertRules: AlertRulesState;
  teams: TeamsState;
  team: TeamState;
  folder: FolderState;
}

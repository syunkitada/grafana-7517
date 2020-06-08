import { e2e } from '../index';
import { fromBaseUrl } from '../support/url';

export interface DeleteDashboardConfig {
  title: string;
  uid: string;
}

export const deleteDashboard = ({ title, uid }: DeleteDashboardConfig) => {
  e2e().logToConsole('Deleting dashboard with uid:', uid);

  // Avoid dashboard page errors
  e2e.pages.Home.visit();
  e2e().request('DELETE', fromBaseUrl(`/api/dashboards/uid/${uid}`));

  /* https://github.com/cypress-io/cypress/issues/2831
  Flows.openDashboard(title);

  Pages.Dashboard.settings().click();

  Pages.DashboardSettings.deleteDashBoard().click();

  Pages.ConfirmModal.delete().click();

  Flows.assertSuccessNotification();

  Pages.Dashboards.visit();
  Pages.Dashboards.dashboards().each(item => {
    const text = item.text();
    Cypress.log({ message: [text] });
    if (text && text.indexOf(title) !== -1) {
      expect(false).equals(true, `Dashboard ${title} was found although it was deleted.`);
    }
  });
  */

  e2e.getScenarioContext().then(({ addedDashboards }: any) => {
    e2e.setScenarioContext({
      addedDashboards: addedDashboards.filter((dashboard: DeleteDashboardConfig) => {
        return dashboard.title !== title && dashboard.uid !== uid;
      }),
    });
  });
};

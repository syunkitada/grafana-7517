export default class PanelMeta {
  description: any;
  fullscreen: any;
  editIcon: any;
  panelName: any;
  menu: any;
  editorTabs: any;
  extendedMenu: any;

  constructor(options: any) {
    this.description = options.description;
    this.fullscreen = options.fullscreen;
    this.editIcon = options.editIcon;
    this.panelName = options.panelName;
    this.menu = [];
    this.editorTabs = [];
    this.extendedMenu = [];

    if (options.fullscreen) {
      this.addMenuItem('View', 'icon-eye-open', 'ctrl.viewPanel(); dismiss();');
    }

    this.addMenuItem('Edit', 'icon-cog', 'ctrl.editPanel(); dismiss();', 'Editor');
    this.addMenuItem('Duplicate', 'icon-copy', 'ctrl.duplicate()', 'Editor');
    this.addMenuItem('Share', 'icon-share', 'ctrl.share(); dismiss();');

    this.addEditorTab('General', 'app/partials/panelgeneral.html');

    if (options.metricsEditor) {
      this.addEditorTab('Metrics', 'app/partials/metrics.html');
    }

    this.addExtendedMenuItem('Panel JSON', '', 'ctrl.editPanelJson(); dismiss();');
  }

  addMenuItem (text, icon, click, role?) {
    this.menu.push({text: text, icon: icon, click: click, role: role});
  }

  addExtendedMenuItem (text, icon, click, role?) {
    this.extendedMenu.push({text: text, icon: icon, click: click, role: role});
  }

  addEditorTab (title, src) {
    this.editorTabs.push({title: title, src: src});
  }
}


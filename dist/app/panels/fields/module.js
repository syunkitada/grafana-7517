define("panels/fields/module",["angular","app","underscore"],function(e,t,n){var r=e.module("kibana.panels.fields",[]);t.useModule(r),r.controller("fields",["$scope",function(e){e.panelMeta={status:"Deprecated",description:"You should not use this table, it does not work anymore. The table panel nowintegrates a field selector. This module will soon be removed."};var t={style:{},arrange:"vertical",micropanel_position:"right"};n.defaults(e.panel,t),e.init=function(){}}])});
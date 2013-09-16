/*! kibana - v3.0.0m3pre - 2013-09-16
 * Copyright (c) 2013 Rashid Khan; Licensed Apache License */

define("panels/filtering/module",["angular","app","underscore"],function(a,b,c){var d=a.module("kibana.panels.filtering",[]);b.useModule(d),d.controller("filtering",["$scope","filterSrv","$rootScope","dashboard",function(a,b,d,e){a.panelMeta={status:"Beta",description:"A controllable list of all filters currently applied to the dashboard. You almost certainly want one of these on your dashboard somewhere."};var f={};c.defaults(a.panel,f),a.init=function(){a.filterSrv=b},a.remove=function(a){b.remove(a),e.refresh()},a.toggle=function(a){b.list[a].active=!b.list[a].active,e.refresh()},a.refresh=function(){d.$broadcast("refresh")},a.render=function(){d.$broadcast("render")},a.show_key=function(a){return!c.contains(["type","id","alias","mandate","active","editing"],a)},a.isEditable=function(a){var b=["time"];return c.contains(b,a.type)?!1:!0}}])});
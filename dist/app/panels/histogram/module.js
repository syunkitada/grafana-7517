define("panels/histogram/timeSeries",["underscore","kbn"],function(e,t){function r(e){return parseInt(e,10)}function i(e){return Math.floor(e.getTime()/1e3)*1e3}var n={};return n.ZeroFilled=function(n){n=e.defaults(n,{interval:"10m",start_date:null,end_date:null,fill_style:"minimal"}),this.interval_ms=r(t.interval_to_seconds(n.interval))*1e3,this._data={},this.start_time=n.start_date&&i(n.start_date),this.end_time=n.end_date&&i(n.end_date),this.opts=n},n.ZeroFilled.prototype.addValue=function(t,n){t instanceof Date?t=i(t):t=r(t),isNaN(t)||(this._data[t]=e.isUndefined(n)?0:n),this._cached_times=null},n.ZeroFilled.prototype.getOrderedTimes=function(t){var n=e.map(e.keys(this._data),r);return e.isArray(t)&&(n=n.concat(t)),e.uniq(n.sort(),!0)},n.ZeroFilled.prototype.getFlotPairs=function(t){var n=this.getOrderedTimes(t),r,i;return this.opts.fill_style==="all"?r=this._getAllFlotPairs:r=this._getMinFlotPairs,i=e.reduce(n,r,[],this),this.start_time&&(i.length===0||i[0][0]>this.start_time)&&i.unshift
([this.start_time,null]),this.end_time&&(i.length===0||i[i.length-1][0]<this.end_time)&&i.push([this.end_time,null]),i},n.ZeroFilled.prototype._getMinFlotPairs=function(e,t,n,r){var i,s,o,u;return n>0&&(o=r[n-1],u=t-this.interval_ms,o<u&&e.push([u,0])),e.push([t,this._data[t]||0]),r.length>n&&(i=r[n+1],s=t+this.interval_ms,i>s&&e.push([s,0])),e},n.ZeroFilled.prototype._getAllFlotPairs=function(e,t,n,r){var i,s;e.push([r[n],this._data[r[n]]||0]),i=r[n+1],s=r[n]+this.interval_ms;for(;r.length>n&&i>s;s+=this.interval_ms)e.push([s,0]);return e},n}),function(e){function t(t){function s(e){n.active&&(h(e),t.getPlaceholder().trigger("plotselecting",[a()]))}function o(t){if(t.which!=1)return;document.body.focus(),document.onselectstart!==undefined&&r.onselectstart==null&&(r.onselectstart=document.onselectstart,document.onselectstart=function(){return!1}),document.ondrag!==undefined&&r.ondrag==null&&(r.ondrag=document.ondrag,document.ondrag=function(){return!1}),c(n.first,t),n.active=!0,i=function(
e){u(e)},e(document).one("mouseup",i)}function u(e){return i=null,document.onselectstart!==undefined&&(document.onselectstart=r.onselectstart),document.ondrag!==undefined&&(document.ondrag=r.ondrag),n.active=!1,h(e),m()?f():(t.getPlaceholder().trigger("plotunselected",[]),t.getPlaceholder().trigger("plotselecting",[null])),!1}function a(){if(!m())return null;if(!n.show)return null;var r={},i=n.first,s=n.second;return e.each(t.getAxes(),function(e,t){if(t.used){var n=t.c2p(i[t.direction]),o=t.c2p(s[t.direction]);r[e]={from:Math.min(n,o),to:Math.max(n,o)}}}),r}function f(){var e=a();t.getPlaceholder().trigger("plotselected",[e]),e.xaxis&&e.yaxis&&t.getPlaceholder().trigger("selected",[{x1:e.xaxis.from,y1:e.yaxis.from,x2:e.xaxis.to,y2:e.yaxis.to}])}function l(e,t,n){return t<e?e:t>n?n:t}function c(e,r){var i=t.getOptions(),s=t.getPlaceholder().offset(),o=t.getPlotOffset();e.x=l(0,r.pageX-s.left-o.left,t.width()),e.y=l(0,r.pageY-s.top-o.top,t.height()),i.selection.mode=="y"&&(e.x=e==n.first?0
:t.width()),i.selection.mode=="x"&&(e.y=e==n.first?0:t.height())}function h(e){if(e.pageX==null)return;c(n.second,e),m()?(n.show=!0,t.triggerRedrawOverlay()):p(!0)}function p(e){n.show&&(n.show=!1,t.triggerRedrawOverlay(),e||t.getPlaceholder().trigger("plotunselected",[]))}function d(e,n){var r,i,s,o,u=t.getAxes();for(var a in u){r=u[a];if(r.direction==n){o=n+r.n+"axis",!e[o]&&r.n==1&&(o=n+"axis");if(e[o]){i=e[o].from,s=e[o].to;break}}}e[o]||(r=n=="x"?t.getXAxes()[0]:t.getYAxes()[0],i=e[n+"1"],s=e[n+"2"]);if(i!=null&&s!=null&&i>s){var f=i;i=s,s=f}return{from:i,to:s,axis:r}}function v(e,r){var i,s,o=t.getOptions();o.selection.mode=="y"?(n.first.x=0,n.second.x=t.width()):(s=d(e,"x"),n.first.x=s.axis.p2c(s.from),n.second.x=s.axis.p2c(s.to)),o.selection.mode=="x"?(n.first.y=0,n.second.y=t.height()):(s=d(e,"y"),n.first.y=s.axis.p2c(s.from),n.second.y=s.axis.p2c(s.to)),n.show=!0,t.triggerRedrawOverlay(),!r&&m()&&f()}function m(){var e=t.getOptions().selection.minSize;return Math.abs(n.second.
x-n.first.x)>=e&&Math.abs(n.second.y-n.first.y)>=e}var n={first:{x:-1,y:-1},second:{x:-1,y:-1},show:!1,active:!1},r={},i=null;t.clearSelection=p,t.setSelection=v,t.getSelection=a,t.hooks.bindEvents.push(function(e,t){var n=e.getOptions();n.selection.mode!=null&&(t.mousemove(s),t.mousedown(o))}),t.hooks.drawOverlay.push(function(t,r){if(n.show&&m()){var i=t.getPlotOffset(),s=t.getOptions();r.save(),r.translate(i.left,i.top);var o=e.color.parse(s.selection.color);r.strokeStyle=o.scale("a",.8).toString(),r.lineWidth=1,r.lineJoin=s.selection.shape,r.fillStyle=o.scale("a",.4).toString();var u=Math.min(n.first.x,n.second.x)+.5,a=Math.min(n.first.y,n.second.y)+.5,f=Math.abs(n.second.x-n.first.x)-1,l=Math.abs(n.second.y-n.first.y)-1;r.fillRect(u,a,f,l),r.strokeRect(u,a,f,l),r.restore()}}),t.hooks.shutdown.push(function(t,n){n.unbind("mousemove",s),n.unbind("mousedown",o),i&&e(document).unbind("mouseup",i)})}e.plot.plugins.push({init:t,options:{selection:{mode:null,color:"#e8cfac",shape:"round",
minSize:5}},name:"selection",version:"1.1"})}(jQuery),define("jquery.flot.selection",function(){}),function(e){function n(e,t){return t*Math.floor(e/t)}function r(e,t,n,r){if(typeof e.strftime=="function")return e.strftime(t);var i=function(e,t){return e=""+e,t=""+(t==null?"0":t),e.length==1?t+e:e},s=[],o=!1,u=e.getHours(),a=u<12;n==null&&(n=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]),r==null&&(r=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]);var f;u>12?f=u-12:u==0?f=12:f=u;for(var l=0;l<t.length;++l){var c=t.charAt(l);if(o){switch(c){case"a":c=""+r[e.getDay()];break;case"b":c=""+n[e.getMonth()];break;case"d":c=i(e.getDate());break;case"e":c=i(e.getDate()," ");break;case"h":case"H":c=i(u);break;case"I":c=i(f);break;case"l":c=i(f," ");break;case"m":c=i(e.getMonth()+1);break;case"M":c=i(e.getMinutes());break;case"q":c=""+(Math.floor(e.getMonth()/3)+1);break;case"S":c=i(e.getSeconds());break;case"y":c=i(e.getFullYear()%100);break;case"Y":c=""+e.getFullYear();break;
case"p":c=a?"am":"pm";break;case"P":c=a?"AM":"PM";break;case"w":c=""+e.getDay()}s.push(c),o=!1}else c=="%"?o=!0:s.push(c)}return s.join("")}function i(e){function t(e,t,n,r){e[t]=function(){return n[r].apply(n,arguments)}}var n={date:e};e.strftime!=undefined&&t(n,"strftime",e,"strftime"),t(n,"getTime",e,"getTime"),t(n,"setTime",e,"setTime");var r=["Date","Day","FullYear","Hours","Milliseconds","Minutes","Month","Seconds"];for(var i=0;i<r.length;i++)t(n,"get"+r[i],e,"getUTC"+r[i]),t(n,"set"+r[i],e,"setUTC"+r[i]);return n}function s(e,t){if(t.timezone=="browser")return new Date(e);if(!t.timezone||t.timezone=="utc")return i(new Date(e));if(typeof timezoneJS!="undefined"&&typeof timezoneJS.Date!="undefined"){var n=new timezoneJS.Date;return n.setTimezone(t.timezone),n.setTime(e),n}return i(new Date(e))}function l(t){t.hooks.processOptions.push(function(t,i){e.each(t.getAxes(),function(e,t){var i=t.options;i.mode=="time"&&(t.tickGenerator=function(e){var t=[],r=s(e.min,i),u=0,l=i.tickSize&&i
.tickSize[1]==="quarter"||i.minTickSize&&i.minTickSize[1]==="quarter"?f:a;i.minTickSize!=null&&(typeof i.tickSize=="number"?u=i.tickSize:u=i.minTickSize[0]*o[i.minTickSize[1]]);for(var c=0;c<l.length-1;++c)if(e.delta<(l[c][0]*o[l[c][1]]+l[c+1][0]*o[l[c+1][1]])/2&&l[c][0]*o[l[c][1]]>=u)break;var h=l[c][0],p=l[c][1];if(p=="year"){if(i.minTickSize!=null&&i.minTickSize[1]=="year")h=Math.floor(i.minTickSize[0]);else{var d=Math.pow(10,Math.floor(Math.log(e.delta/o.year)/Math.LN10)),v=e.delta/o.year/d;v<1.5?h=1:v<3?h=2:v<7.5?h=5:h=10,h*=d}h<1&&(h=1)}e.tickSize=i.tickSize||[h,p];var m=e.tickSize[0];p=e.tickSize[1];var g=m*o[p];p=="second"?r.setSeconds(n(r.getSeconds(),m)):p=="minute"?r.setMinutes(n(r.getMinutes(),m)):p=="hour"?r.setHours(n(r.getHours(),m)):p=="month"?r.setMonth(n(r.getMonth(),m)):p=="quarter"?r.setMonth(3*n(r.getMonth()/3,m)):p=="year"&&r.setFullYear(n(r.getFullYear(),m)),r.setMilliseconds(0),g>=o.minute&&r.setSeconds(0),g>=o.hour&&r.setMinutes(0),g>=o.day&&r.setHours(0),g>=o.day*4&&
r.setDate(1),g>=o.month*2&&r.setMonth(n(r.getMonth(),3)),g>=o.quarter*2&&r.setMonth(n(r.getMonth(),6)),g>=o.year&&r.setMonth(0);var y=0,b=Number.NaN,w;do{w=b,b=r.getTime(),t.push(b);if(p=="month"||p=="quarter")if(m<1){r.setDate(1);var E=r.getTime();r.setMonth(r.getMonth()+(p=="quarter"?3:1));var S=r.getTime();r.setTime(b+y*o.hour+(S-E)*m),y=r.getHours(),r.setHours(0)}else r.setMonth(r.getMonth()+m*(p=="quarter"?3:1));else p=="year"?r.setFullYear(r.getFullYear()+m):r.setTime(b+g)}while(b<e.max&&b!=w);return t},t.tickFormatter=function(e,t){var n=s(e,t.options);if(i.timeformat!=null)return r(n,i.timeformat,i.monthNames,i.dayNames);var u=t.options.tickSize&&t.options.tickSize[1]=="quarter"||t.options.minTickSize&&t.options.minTickSize[1]=="quarter",a=t.tickSize[0]*o[t.tickSize[1]],f=t.max-t.min,l=i.twelveHourClock?" %p":"",c=i.twelveHourClock?"%I":"%H",h;a<o.minute?h=c+":%M:%S"+l:a<o.day?f<2*o.day?h=c+":%M"+l:h="%b %d "+c+":%M"+l:a<o.month?h="%b %d":u&&a<o.quarter||!u&&a<o.year?f<o.year?h="%b"
:h="%b %Y":u&&a<o.year?f<o.year?h="Q%q":h="Q%q %Y":h="%Y";var p=r(n,h,i.monthNames,i.dayNames);return p})})})}var t={xaxis:{timezone:null,timeformat:null,twelveHourClock:!1,monthNames:null}},o={second:1e3,minute:6e4,hour:36e5,day:864e5,month:2592e6,quarter:7776e6,year:525949.2*60*1e3},u=[[1,"second"],[2,"second"],[5,"second"],[10,"second"],[30,"second"],[1,"minute"],[2,"minute"],[5,"minute"],[10,"minute"],[30,"minute"],[1,"hour"],[2,"hour"],[4,"hour"],[8,"hour"],[12,"hour"],[1,"day"],[2,"day"],[3,"day"],[.25,"month"],[.5,"month"],[1,"month"],[2,"month"]],a=u.concat([[3,"month"],[6,"month"],[1,"year"]]),f=u.concat([[1,"quarter"],[2,"quarter"],[1,"year"]]);e.plot.plugins.push({init:l,options:t,name:"time",version:"1.0"}),e.plot.formatDate=r}(jQuery),define("jquery.flot.time",function(){}),function(e){function n(e){function t(e,t){var n=null;for(var r=0;r<t.length;++r){if(e==t[r])break;t[r].stack==e.stack&&(n=t[r])}return n}function n(e,n,r){if(n.stack==null||n.stack===!1)return;var i=t(n,
e.getData());if(!i)return;var s=r.pointsize,o=r.points,u=i.datapoints.pointsize,a=i.datapoints.points,f=[],l,c,h,p,d,v,m=n.lines.show,g=n.bars.horizontal,y=s>2&&(g?r.format[2].x:r.format[2].y),b=m&&n.lines.steps,w=!0,E=g?1:0,S=g?0:1,x=0,T=0,N,C;for(;;){if(x>=o.length)break;N=f.length;if(o[x]==null){for(C=0;C<s;++C)f.push(o[x+C]);x+=s}else if(T>=a.length){if(!m)for(C=0;C<s;++C)f.push(o[x+C]);x+=s}else if(a[T]==null){for(C=0;C<s;++C)f.push(null);w=!0,T+=u}else{l=o[x+E],c=o[x+S],p=a[T+E],d=a[T+S],v=0;if(l==p){for(C=0;C<s;++C)f.push(o[x+C]);f[N+S]+=d,v=d,x+=s,T+=u}else if(l>p){if(m&&x>0&&o[x-s]!=null){h=c+(o[x-s+S]-c)*(p-l)/(o[x-s+E]-l),f.push(p),f.push(h+d);for(C=2;C<s;++C)f.push(o[x+C]);v=d}T+=u}else{if(w&&m){x+=s;continue}for(C=0;C<s;++C)f.push(o[x+C]);m&&T>0&&a[T-u]!=null&&(v=d+(a[T-u+S]-d)*(l-p)/(a[T-u+E]-p)),f[N+S]+=v,x+=s}w=!1,N!=f.length&&y&&(f[N+2]+=v)}if(b&&N!=f.length&&N>0&&f[N]!=null&&f[N]!=f[N-s]&&f[N+1]!=f[N-s+1]){for(C=0;C<s;++C)f[N+s+C]=f[N+C];f[N+1]=f[N-s+1]}}r.points=f}e.hooks
.processDatapoints.push(n)}var t={series:{stack:null}};e.plot.plugins.push({init:n,options:t,name:"stack",version:"1.2"})}(jQuery),define("jquery.flot.stack",function(){}),define("panels/histogram/module",["angular","app","jquery","underscore","kbn","moment","./timeSeries","jquery.flot","jquery.flot.pie","jquery.flot.selection","jquery.flot.time","jquery.flot.stack"],function(e,t,n,r,i,s,o){var u=e.module("kibana.panels.histogram",[]);t.useModule(u),u.controller("histogram",["$scope","querySrv","dashboard","filterSrv",function(t,n,u,a){t.panelMeta={editorTabs:[{title:"Queries",src:"app/partials/querySelect.html"}],status:"Stable",description:"A bucketed time series chart of the current query or queries. Uses the Elasticsearch date_histogram facet. If using time stamped indices this panel will query them sequentially to attempt to apply the lighest possible load to your Elasticsearch cluster"};var f={mode:"count",time_field:"@timestamp",queries:{mode:"all",ids:[]},value_field:null,auto_int
:!0,resolution:100,interval:"5m",fill:0,linewidth:3,timezone:"browser",spyable:!0,zoomlinks:!0,bars:!0,stack:!0,points:!1,lines:!1,legend:!0,"x-axis":!0,"y-axis":!0,percentage:!1,interactive:!0,tooltip:{value_type:"cumulative",query_as_alias:!1}};r.defaults(t.panel,f),t.init=function(){t.$on("refresh",function(){t.get_data()}),t.get_data()},t.get_time_range=function(){var e=t.range=a.timeRange("min");return e},t.get_interval=function(){var e=t.panel.interval,n;return t.panel.auto_int&&(n=t.get_time_range(),n&&(e=i.secondsToHms(i.calculate_interval(n.from,n.to,t.panel.resolution,0)/1e3))),t.panel.interval=e||"10m",t.panel.interval},t.get_data=function(e,s){r.isUndefined(e)&&(e=0),delete t.panel.error;if(u.indices.length===0)return;var f=t.get_time_range(),l=t.get_interval(f);t.panel.auto_int&&(t.panel.interval=i.secondsToHms(i.calculate_interval(f.from,f.to,t.panel.resolution,0)/1e3)),t.panelMeta.loading=!0;var c=t.ejs.Request().indices(u.indices[e]);t.panel.queries.ids=n.idsByMode(t.panel
.queries),r.each(t.panel.queries.ids,function(e){var i=t.ejs.FilteredQuery(n.getEjsObj(e),a.getBoolFilter(a.ids)),s=t.ejs.DateHistogramFacet(e);if(t.panel.mode==="count")s=s.field(t.panel.time_field);else{if(r.isNull(t.panel.value_field)){t.panel.error="In "+t.panel.mode+" mode a field must be specified";return}s=s.keyField(t.panel.time_field).valueField(t.panel.value_field)}s=s.interval(l).facetFilter(t.ejs.QueryFilter(i)),c=c.facet(s).size(0)}),t.populate_modal(c);var h=c.doSearch();h.then(function(i){t.panelMeta.loading=!1,e===0&&(t.hits=0,t.data=[],s=t.query_id=(new Date).getTime());if(!r.isUndefined(i.error)){t.panel.error=t.parse_error(i.error);return}var a=r.map(r.keys(i.facets),function(e){return parseInt(e,10)});if(t.query_id===s&&r.difference(a,t.panel.queries.ids).length===0){var c=0,h,p;r.each(t.panel.queries.ids,function(s){var u=i.facets[s];r.isUndefined(t.data[c])||e===0?(h=new o.ZeroFilled({interval:l,start_date:f&&f.from,end_date:f&&f.to,fill_style:"minimal"}),p=0):(h=t
.data[c].time_series,p=t.data[c].hits),r.each(u.entries,function(e){h.addValue(e.time,e[t.panel.mode]),p+=e.count,t.hits+=e.count}),t.data[c]={info:n.list[s],time_series:h,hits:p},c++}),t.$emit("render"),e<u.indices.length-1&&t.get_data(e+1,s)}})},t.zoom=function(e){var n=a.timeRange("min"),r=n.to.valueOf()-n.from.valueOf(),i=n.to.valueOf()-r/2,o=i+r*e/2,f=i-r*e/2;if(o>Date.now()&&n.to<Date.now()){var l=o-Date.now();f-=l,o=Date.now()}e>1&&a.removeByType("time"),a.set({type:"time",from:s.utc(f),to:s.utc(o),field:t.panel.time_field}),u.refresh()},t.populate_modal=function(n){t.inspector=e.toJson(JSON.parse(n.toString()),!0)},t.set_refresh=function(e){t.refresh=e},t.close_edit=function(){t.refresh&&t.get_data(),t.refresh=!1,t.$emit("render")}}]),u.directive("histogramChart",["dashboard","filterSrv",function(t,o){return{restrict:"A",template:"<div></div>",link:function(u,a){function f(){a.css({height:u.panel.height||u.row.height});try{r.each(u.data,function(e){e.label=e.info.alias,e.color=e
.info.color})}catch(e){return}var t=i.interval_to_seconds(u.panel.interval)*1e3,s=u.panel.stack?!0:null;try{var o={legend:{show:!1},series:{stack:u.panel.percentage?null:s,lines:{show:u.panel.lines,fill:u.panel.fill/10,lineWidth:u.panel.linewidth,steps:!1},bars:{show:u.panel.bars,fill:1,barWidth:t/1.8,zero:!1,lineWidth:0},points:{show:u.panel.points,fill:1,fillColor:!1,radius:5},shadowSize:1},yaxis:{show:u.panel["y-axis"],min:0,max:u.panel.percentage&&u.panel.stack?100:null},xaxis:{timezone:u.panel.timezone,show:u.panel["x-axis"],mode:"time",min:r.isUndefined(u.range.from)?null:u.range.from.getTime(),max:r.isUndefined(u.range.to)?null:u.range.to.getTime(),timeformat:l(u.panel.interval),label:"Datetime"},grid:{backgroundColor:null,borderWidth:0,hoverable:!0,color:"#c8c8c8"}};u.panel.interactive&&(o.selection={mode:"x",color:"#666"});var f=[];u.data.length>1&&(f=r.uniq(Array.prototype.concat.apply([],r.map(u.data,function(e){return e.time_series.getOrderedTimes()})).sort(),!0));for(var c=0
;c<u.data.length;c++)u.data[c].data=u.data[c].time_series.getFlotPairs(f);u.plot=n.plot(a,u.data,o)}catch(e){a.text(e)}}function l(e){var t=i.interval_to_seconds(e);return t>=2628e3?"%m/%y":t>=86400?"%m/%d/%y":t>=60?"%H:%M<br>%m/%d":"%H:%M:%S"}u.$on("render",function(){f()}),e.element(window).bind("resize",function(){f()});var c=n("<div>");a.bind("plothover",function(e,t,n){var r,o;n?(n.series.info.alias||u.panel.tooltip.query_as_alias?r='<small style="font-size:0.9em;"><i class="icon-circle" style="color:'+n.series.color+';"></i>'+" "+(n.series.info.alias||n.series.info.query)+"</small><br>":r=i.query_color_dot(n.series.color,15)+" ",u.panel.stack&&u.panel.tooltip.value_type==="individual"?o=n.datapoint[1]-n.datapoint[2]:o=n.datapoint[1],c.html(r+o+" @ "+s(n.datapoint[0]).format("MM/DD HH:mm:ss")).place_tt(t.pageX,t.pageY)):c.detach()}),a.bind("plotselected",function(e,n){o.set({type:"time",from:s.utc(n.xaxis.from),to:s.utc(n.xaxis.to),field:u.panel.time_field}),t.refresh()})}}}])});
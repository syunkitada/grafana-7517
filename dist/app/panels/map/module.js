/*! kibana - v3.0.0m3pre - 2013-09-16
 * Copyright (c) 2013 Rashid Khan; Licensed Apache License */

!function(a){var b={set:{colors:1,values:1,backgroundColor:1,scaleColors:1,normalizeFunction:1,focus:1},get:{selectedRegions:1,selectedMarkers:1,mapObject:1,regionName:1}};a.fn.vectorMap=function(a){var c,d,c=this.children(".jvectormap-container").data("mapObject");if("addMap"===a)jvm.WorldMap.maps[arguments[1]]=arguments[2];else{if(("set"===a||"get"===a)&&b[a][arguments[1]])return d=arguments[1].charAt(0).toUpperCase()+arguments[1].substr(1),c[a+d].apply(c,Array.prototype.slice.call(arguments,2));a=a||{},a.container=this,c=new jvm.WorldMap(a)}return this}}(jQuery),function(a){function b(b){var c=b||window.event,d=[].slice.call(arguments,1),e=0,f=0,g=0;return b=a.event.fix(c),b.type="mousewheel",c.wheelDelta&&(e=c.wheelDelta/120),c.detail&&(e=-c.detail/3),g=e,void 0!==c.axis&&c.axis===c.HORIZONTAL_AXIS&&(g=0,f=-1*e),void 0!==c.wheelDeltaY&&(g=c.wheelDeltaY/120),void 0!==c.wheelDeltaX&&(f=-1*c.wheelDeltaX/120),d.unshift(b,e,f,g),(a.event.dispatch||a.event.handle).apply(this,d)}var c=["DOMMouseScroll","mousewheel"];if(a.event.fixHooks)for(var d=c.length;d;)a.event.fixHooks[c[--d]]=a.event.mouseHooks;a.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=c.length;a;)this.addEventListener(c[--a],b,!1);else this.onmousewheel=b},teardown:function(){if(this.removeEventListener)for(var a=c.length;a;)this.removeEventListener(c[--a],b,!1);else this.onmousewheel=null}},a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})}(jQuery);var jvm={inherits:function(a,b){function c(){}c.prototype=b.prototype,a.prototype=new c,a.prototype.constructor=a,a.parentClass=b},mixin:function(a,b){var c;for(c in b.prototype)b.prototype.hasOwnProperty(c)&&(a.prototype[c]=b.prototype[c])},min:function(a){var b,c=Number.MAX_VALUE;if(a instanceof Array)for(b=0;b<a.length;b++)a[b]<c&&(c=a[b]);else for(b in a)a[b]<c&&(c=a[b]);return c},max:function(a){var b,c=Number.MIN_VALUE;if(a instanceof Array)for(b=0;b<a.length;b++)a[b]>c&&(c=a[b]);else for(b in a)a[b]>c&&(c=a[b]);return c},keys:function(a){var b,c=[];for(b in a)c.push(b);return c},values:function(a){var b,c,d=[];for(c=0;c<arguments.length;c++){a=arguments[c];for(b in a)d.push(a[b])}return d}};jvm.$=jQuery,jvm.AbstractElement=function(a,b){this.node=this.createElement(a),this.name=a,this.properties={},b&&this.set(b)},jvm.AbstractElement.prototype.set=function(a,b){var c;if("object"==typeof a)for(c in a)this.properties[c]=a[c],this.applyAttr(c,a[c]);else this.properties[a]=b,this.applyAttr(a,b)},jvm.AbstractElement.prototype.get=function(a){return this.properties[a]},jvm.AbstractElement.prototype.applyAttr=function(a,b){this.node.setAttribute(a,b)},jvm.AbstractElement.prototype.remove=function(){jvm.$(this.node).remove()},jvm.AbstractCanvasElement=function(a,b,c){this.container=a,this.setSize(b,c),this.rootElement=new jvm[this.classPrefix+"GroupElement"],this.node.appendChild(this.rootElement.node),this.container.appendChild(this.node)},jvm.AbstractCanvasElement.prototype.add=function(a,b){b=b||this.rootElement,b.add(a),a.canvas=this},jvm.AbstractCanvasElement.prototype.addPath=function(a,b,c){var d=new jvm[this.classPrefix+"PathElement"](a,b);return this.add(d,c),d},jvm.AbstractCanvasElement.prototype.addCircle=function(a,b,c){var d=new jvm[this.classPrefix+"CircleElement"](a,b);return this.add(d,c),d},jvm.AbstractCanvasElement.prototype.addGroup=function(a){var b=new jvm[this.classPrefix+"GroupElement"];return a?a.node.appendChild(b.node):this.node.appendChild(b.node),b.canvas=this,b},jvm.AbstractShapeElement=function(a,b,c){this.style=c||{},this.style.current={},this.isHovered=!1,this.isSelected=!1,this.updateStyle()},jvm.AbstractShapeElement.prototype.setHovered=function(a){this.isHovered!==a&&(this.isHovered=a,this.updateStyle())},jvm.AbstractShapeElement.prototype.setSelected=function(a){this.isSelected!==a&&(this.isSelected=a,this.updateStyle(),jvm.$(this.node).trigger("selected",[a]))},jvm.AbstractShapeElement.prototype.setStyle=function(a,b){var c={};"object"==typeof a?c=a:c[a]=b,jvm.$.extend(this.style.current,c),this.updateStyle()},jvm.AbstractShapeElement.prototype.updateStyle=function(){var a={};jvm.AbstractShapeElement.mergeStyles(a,this.style.initial),jvm.AbstractShapeElement.mergeStyles(a,this.style.current),this.isHovered&&jvm.AbstractShapeElement.mergeStyles(a,this.style.hover),this.isSelected&&(jvm.AbstractShapeElement.mergeStyles(a,this.style.selected),this.isHovered&&jvm.AbstractShapeElement.mergeStyles(a,this.style.selectedHover)),this.set(a)},jvm.AbstractShapeElement.mergeStyles=function(a,b){var c;b=b||{};for(c in b)null===b[c]?delete a[c]:a[c]=b[c]},jvm.SVGElement=function(){jvm.SVGElement.parentClass.apply(this,arguments)},jvm.inherits(jvm.SVGElement,jvm.AbstractElement),jvm.SVGElement.svgns="http://www.w3.org/2000/svg",jvm.SVGElement.prototype.createElement=function(a){return document.createElementNS(jvm.SVGElement.svgns,a)},jvm.SVGElement.prototype.addClass=function(a){this.node.setAttribute("class",a)},jvm.SVGElement.prototype.getElementCtr=function(a){return jvm["SVG"+a]},jvm.SVGElement.prototype.getBBox=function(){return this.node.getBBox()},jvm.SVGGroupElement=function(){jvm.SVGGroupElement.parentClass.call(this,"g")},jvm.inherits(jvm.SVGGroupElement,jvm.SVGElement),jvm.SVGGroupElement.prototype.add=function(a){this.node.appendChild(a.node)},jvm.SVGCanvasElement=function(){this.classPrefix="SVG",jvm.SVGCanvasElement.parentClass.call(this,"svg"),jvm.AbstractCanvasElement.apply(this,arguments)},jvm.inherits(jvm.SVGCanvasElement,jvm.SVGElement),jvm.mixin(jvm.SVGCanvasElement,jvm.AbstractCanvasElement),jvm.SVGCanvasElement.prototype.setSize=function(a,b){this.width=a,this.height=b,this.node.setAttribute("width",a),this.node.setAttribute("height",b)},jvm.SVGCanvasElement.prototype.applyTransformParams=function(a,b,c){this.scale=a,this.transX=b,this.transY=c,this.rootElement.node.setAttribute("transform","scale("+a+") translate("+b+", "+c+")")},jvm.SVGShapeElement=function(a,b){jvm.SVGShapeElement.parentClass.call(this,a,b),jvm.AbstractShapeElement.apply(this,arguments)},jvm.inherits(jvm.SVGShapeElement,jvm.SVGElement),jvm.mixin(jvm.SVGShapeElement,jvm.AbstractShapeElement),jvm.SVGPathElement=function(a,b){jvm.SVGPathElement.parentClass.call(this,"path",a,b),this.node.setAttribute("fill-rule","evenodd")},jvm.inherits(jvm.SVGPathElement,jvm.SVGShapeElement),jvm.SVGCircleElement=function(a,b){jvm.SVGCircleElement.parentClass.call(this,"circle",a,b)},jvm.inherits(jvm.SVGCircleElement,jvm.SVGShapeElement),jvm.VMLElement=function(){jvm.VMLElement.VMLInitialized||jvm.VMLElement.initializeVML(),jvm.VMLElement.parentClass.apply(this,arguments)},jvm.inherits(jvm.VMLElement,jvm.AbstractElement),jvm.VMLElement.VMLInitialized=!1,jvm.VMLElement.initializeVML=function(){try{document.namespaces.rvml||document.namespaces.add("rvml","urn:schemas-microsoft-com:vml"),jvm.VMLElement.prototype.createElement=function(a){return document.createElement("<rvml:"+a+' class="rvml">')}}catch(a){jvm.VMLElement.prototype.createElement=function(a){return document.createElement("<"+a+' xmlns="urn:schemas-microsoft.com:vml" class="rvml">')}}document.createStyleSheet().addRule(".rvml","behavior:url(#default#VML)"),jvm.VMLElement.VMLInitialized=!0},jvm.VMLElement.prototype.getElementCtr=function(a){return jvm["VML"+a]},jvm.VMLElement.prototype.addClass=function(a){jvm.$(this.node).addClass(a)},jvm.VMLElement.prototype.applyAttr=function(a,b){this.node[a]=b},jvm.VMLElement.prototype.getBBox=function(){var a=jvm.$(this.node);return{x:a.position().left/this.canvas.scale,y:a.position().top/this.canvas.scale,width:a.width()/this.canvas.scale,height:a.height()/this.canvas.scale}},jvm.VMLGroupElement=function(){jvm.VMLGroupElement.parentClass.call(this,"group"),this.node.style.left="0px",this.node.style.top="0px",this.node.coordorigin="0 0"},jvm.inherits(jvm.VMLGroupElement,jvm.VMLElement),jvm.VMLGroupElement.prototype.add=function(a){this.node.appendChild(a.node)},jvm.VMLCanvasElement=function(){this.classPrefix="VML",jvm.VMLCanvasElement.parentClass.call(this,"group"),jvm.AbstractCanvasElement.apply(this,arguments),this.node.style.position="absolute"},jvm.inherits(jvm.VMLCanvasElement,jvm.VMLElement),jvm.mixin(jvm.VMLCanvasElement,jvm.AbstractCanvasElement),jvm.VMLCanvasElement.prototype.setSize=function(a,b){var c,d,e,f;if(this.width=a,this.height=b,this.node.style.width=a+"px",this.node.style.height=b+"px",this.node.coordsize=a+" "+b,this.node.coordorigin="0 0",this.rootElement){for(c=this.rootElement.node.getElementsByTagName("shape"),e=0,f=c.length;f>e;e++)c[e].coordsize=a+" "+b,c[e].style.width=a+"px",c[e].style.height=b+"px";for(d=this.node.getElementsByTagName("group"),e=0,f=d.length;f>e;e++)d[e].coordsize=a+" "+b,d[e].style.width=a+"px",d[e].style.height=b+"px"}},jvm.VMLCanvasElement.prototype.applyTransformParams=function(a,b,c){this.scale=a,this.transX=b,this.transY=c,this.rootElement.node.coordorigin=this.width-b-this.width/100+","+(this.height-c-this.height/100),this.rootElement.node.coordsize=this.width/a+","+this.height/a},jvm.VMLShapeElement=function(a,b){jvm.VMLShapeElement.parentClass.call(this,a,b),this.fillElement=new jvm.VMLElement("fill"),this.strokeElement=new jvm.VMLElement("stroke"),this.node.appendChild(this.fillElement.node),this.node.appendChild(this.strokeElement.node),this.node.stroked=!1,jvm.AbstractShapeElement.apply(this,arguments)},jvm.inherits(jvm.VMLShapeElement,jvm.VMLElement),jvm.mixin(jvm.VMLShapeElement,jvm.AbstractShapeElement),jvm.VMLShapeElement.prototype.applyAttr=function(a,b){switch(a){case"fill":this.node.fillcolor=b;break;case"fill-opacity":this.fillElement.node.opacity=Math.round(100*b)+"%";break;case"stroke":this.node.stroked="none"===b?!1:!0,this.node.strokecolor=b;break;case"stroke-opacity":this.strokeElement.node.opacity=Math.round(100*b)+"%";break;case"stroke-width":this.node.stroked=0===parseInt(b,10)?!1:!0,this.node.strokeweight=b;break;case"d":this.node.path=jvm.VMLPathElement.pathSvgToVml(b);break;default:jvm.VMLShapeElement.parentClass.prototype.applyAttr.apply(this,arguments)}},jvm.VMLPathElement=function(a,b){var c=new jvm.VMLElement("skew");jvm.VMLPathElement.parentClass.call(this,"shape",a,b),this.node.coordorigin="0 0",c.node.on=!0,c.node.matrix="0.01,0,0,0.01,0,0",c.node.offset="0,0",this.node.appendChild(c.node)},jvm.inherits(jvm.VMLPathElement,jvm.VMLShapeElement),jvm.VMLPathElement.prototype.applyAttr=function(a,b){"d"===a?this.node.path=jvm.VMLPathElement.pathSvgToVml(b):jvm.VMLShapeElement.prototype.applyAttr.call(this,a,b)},jvm.VMLPathElement.pathSvgToVml=function(a){var b,c,d=0,e=0;return a=a.replace(/(-?\d+)e(-?\d+)/g,"0"),a.replace(/([MmLlHhVvCcSs])\s*((?:-?\d*(?:\.\d+)?\s*,?\s*)+)/g,function(a,f,g){g=g.replace(/(\d)-/g,"$1,-").replace(/^\s+/g,"").replace(/\s+$/g,"").replace(/\s+/g,",").split(","),g[0]||g.shift();for(var h=0,i=g.length;i>h;h++)g[h]=Math.round(100*g[h]);switch(f){case"m":return d+=g[0],e+=g[1],"t"+g.join(",");case"M":return d=g[0],e=g[1],"m"+g.join(",");case"l":return d+=g[0],e+=g[1],"r"+g.join(",");case"L":return d=g[0],e=g[1],"l"+g.join(",");case"h":return d+=g[0],"r"+g[0]+",0";case"H":return d=g[0],"l"+d+","+e;case"v":return e+=g[0],"r0,"+g[0];case"V":return e=g[0],"l"+d+","+e;case"c":return b=d+g[g.length-4],c=e+g[g.length-3],d+=g[g.length-2],e+=g[g.length-1],"v"+g.join(",");case"C":return b=g[g.length-4],c=g[g.length-3],d=g[g.length-2],e=g[g.length-1],"c"+g.join(",");case"s":return g.unshift(e-c),g.unshift(d-b),b=d+g[g.length-4],c=e+g[g.length-3],d+=g[g.length-2],e+=g[g.length-1],"v"+g.join(",");case"S":return g.unshift(e+e-c),g.unshift(d+d-b),b=g[g.length-4],c=g[g.length-3],d=g[g.length-2],e=g[g.length-1],"c"+g.join(",")}return""}).replace(/z/g,"e")},jvm.VMLCircleElement=function(a,b){jvm.VMLCircleElement.parentClass.call(this,"oval",a,b)},jvm.inherits(jvm.VMLCircleElement,jvm.VMLShapeElement),jvm.VMLCircleElement.prototype.applyAttr=function(a,b){switch(a){case"r":this.node.style.width=2*b+"px",this.node.style.height=2*b+"px",this.applyAttr("cx",this.get("cx")||0),this.applyAttr("cy",this.get("cy")||0);break;case"cx":if(!b)return;this.node.style.left=b-(this.get("r")||0)+"px";break;case"cy":if(!b)return;this.node.style.top=b-(this.get("r")||0)+"px";break;default:jvm.VMLCircleElement.parentClass.prototype.applyAttr.call(this,a,b)}},jvm.VectorCanvas=function(a,b,c){return this.mode=window.SVGAngle?"svg":"vml",this.impl="svg"==this.mode?new jvm.SVGCanvasElement(a,b,c):new jvm.VMLCanvasElement(a,b,c),this.impl},jvm.SimpleScale=function(a){this.scale=a},jvm.SimpleScale.prototype.getValue=function(a){return a},jvm.OrdinalScale=function(a){this.scale=a},jvm.OrdinalScale.prototype.getValue=function(a){return this.scale[a]},jvm.NumericScale=function(a,b,c,d){this.scale=[],b=b||"linear",a&&this.setScale(a),b&&this.setNormalizeFunction(b),c&&this.setMin(c),d&&this.setMax(d)},jvm.NumericScale.prototype={setMin:function(a){this.clearMinValue=a,this.minValue="function"==typeof this.normalize?this.normalize(a):a},setMax:function(a){this.clearMaxValue=a,this.maxValue="function"==typeof this.normalize?this.normalize(a):a},setScale:function(a){var b;for(b=0;b<a.length;b++)this.scale[b]=[a[b]]},setNormalizeFunction:function(a){"polynomial"===a?this.normalize=function(a){return Math.pow(a,.2)}:"linear"===a?delete this.normalize:this.normalize=a,this.setMin(this.clearMinValue),this.setMax(this.clearMaxValue)},getValue:function(a){var b,c,d=[],e=0,f=0;for("function"==typeof this.normalize&&(a=this.normalize(a)),f=0;f<this.scale.length-1;f++)b=this.vectorLength(this.vectorSubtract(this.scale[f+1],this.scale[f])),d.push(b),e+=b;for(c=(this.maxValue-this.minValue)/e,f=0;f<d.length;f++)d[f]*=c;for(f=0,a-=this.minValue;a-d[f]>=0;)a-=d[f],f++;return a=f==this.scale.length-1?this.vectorToNum(this.scale[f]):this.vectorToNum(this.vectorAdd(this.scale[f],this.vectorMult(this.vectorSubtract(this.scale[f+1],this.scale[f]),a/d[f])))},vectorToNum:function(a){var b,c=0;for(b=0;b<a.length;b++)c+=Math.round(a[b])*Math.pow(256,a.length-b-1);return c},vectorSubtract:function(a,b){var c,d=[];for(c=0;c<a.length;c++)d[c]=a[c]-b[c];return d},vectorAdd:function(a,b){var c,d=[];for(c=0;c<a.length;c++)d[c]=a[c]+b[c];return d},vectorMult:function(a,b){var c,d=[];for(c=0;c<a.length;c++)d[c]=a[c]*b;return d},vectorLength:function(a){var b,c=0;for(b=0;b<a.length;b++)c+=a[b]*a[b];return Math.sqrt(c)}},jvm.ColorScale=function(){jvm.ColorScale.parentClass.apply(this,arguments)},jvm.inherits(jvm.ColorScale,jvm.NumericScale),jvm.ColorScale.prototype.setScale=function(a){var b;for(b=0;b<a.length;b++)this.scale[b]=jvm.ColorScale.rgbToArray(a[b])},jvm.ColorScale.prototype.getValue=function(a){return jvm.ColorScale.numToRgb(jvm.ColorScale.parentClass.prototype.getValue.call(this,a))},jvm.ColorScale.arrayToRgb=function(a){var b,c,d="#";for(c=0;c<a.length;c++)b=a[c].toString(16),d+=1==b.length?"0"+b:b;return d},jvm.ColorScale.numToRgb=function(a){for(a=a.toString(16);a.length<6;)a="0"+a;return"#"+a},jvm.ColorScale.rgbToArray=function(a){return a=a.substr(1),[parseInt(a.substr(0,2),16),parseInt(a.substr(2,2),16),parseInt(a.substr(4,2),16)]},jvm.DataSeries=function(a,b){var c;a=a||{},a.attribute=a.attribute||"fill",this.elements=b,this.params=a,a.attributes&&this.setAttributes(a.attributes),jvm.$.isArray(a.scale)?(c="fill"===a.attribute||"stroke"===a.attribute?jvm.ColorScale:jvm.NumericScale,this.scale=new c(a.scale,a.normalizeFunction,a.min,a.max)):this.scale=a.scale?new jvm.OrdinalScale(a.scale):new jvm.SimpleScale(a.scale),this.values=a.values||{},this.setValues(this.values)},jvm.DataSeries.prototype={setAttributes:function(a,b){var c,d=a;if("string"==typeof a)this.elements[a]&&this.elements[a].setStyle(this.params.attribute,b);else for(c in d)this.elements[c]&&this.elements[c].element.setStyle(this.params.attribute,d[c])},setValues:function(a){var b,c,d=Number.MIN_VALUE,e=Number.MAX_VALUE,f={};if(this.scale instanceof jvm.OrdinalScale||this.scale instanceof jvm.SimpleScale)for(c in a)f[c]=a[c]?this.scale.getValue(a[c]):this.elements[c].element.style.initial[this.params.attribute];else{if(!this.params.min||!this.params.max){for(c in a)b=parseFloat(a[c]),b>d&&(d=a[c]),e>b&&(e=b);this.params.min||this.scale.setMin(e),this.params.max||this.scale.setMax(d),this.params.min=e,this.params.max=d}for(c in a)b=parseFloat(a[c]),f[c]=isNaN(b)?this.elements[c].element.style.initial[this.params.attribute]:this.scale.getValue(b)}this.setAttributes(f),jvm.$.extend(this.values,a)},clear:function(){var a,b={};for(a in this.values)this.elements[a]&&(b[a]=this.elements[a].element.style.initial[this.params.attribute]);this.setAttributes(b),this.values={}},setScale:function(a){this.scale.setScale(a),this.values&&this.setValues(this.values)},setNormalizeFunction:function(a){this.scale.setNormalizeFunction(a),this.values&&this.setValues(this.values)}},jvm.Proj={degRad:180/Math.PI,radDeg:Math.PI/180,radius:6381372,sgn:function(a){return a>0?1:0>a?-1:a},mill:function(a,b,c){return{x:this.radius*(b-c)*this.radDeg,y:-this.radius*Math.log(Math.tan((45+.4*a)*this.radDeg))/.8}},mill_inv:function(a,b,c){return{lat:(2.5*Math.atan(Math.exp(.8*b/this.radius))-5*Math.PI/8)*this.degRad,lng:(c*this.radDeg+a/this.radius)*this.degRad}},merc:function(a,b,c){return{x:this.radius*(b-c)*this.radDeg,y:-this.radius*Math.log(Math.tan(Math.PI/4+a*Math.PI/360))}},merc_inv:function(a,b,c){return{lat:(2*Math.atan(Math.exp(b/this.radius))-Math.PI/2)*this.degRad,lng:(c*this.radDeg+a/this.radius)*this.degRad}},aea:function(a,b,c){var d=0,e=c*this.radDeg,f=29.5*this.radDeg,g=45.5*this.radDeg,h=a*this.radDeg,i=b*this.radDeg,j=(Math.sin(f)+Math.sin(g))/2,k=Math.cos(f)*Math.cos(f)+2*j*Math.sin(f),l=j*(i-e),m=Math.sqrt(k-2*j*Math.sin(h))/j,n=Math.sqrt(k-2*j*Math.sin(d))/j;return{x:m*Math.sin(l)*this.radius,y:-(n-m*Math.cos(l))*this.radius}},aea_inv:function(a,b,c){var d=a/this.radius,e=b/this.radius,f=0,g=c*this.radDeg,h=29.5*this.radDeg,i=45.5*this.radDeg,j=(Math.sin(h)+Math.sin(i))/2,k=Math.cos(h)*Math.cos(h)+2*j*Math.sin(h),l=Math.sqrt(k-2*j*Math.sin(f))/j,m=Math.sqrt(d*d+(l-e)*(l-e)),n=Math.atan(d/(l-e));return{lat:Math.asin((k-m*m*j*j)/(2*j))*this.degRad,lng:(g+n/j)*this.degRad}},lcc:function(a,b,c){var d=0,e=c*this.radDeg,f=b*this.radDeg,g=33*this.radDeg,h=45*this.radDeg,i=a*this.radDeg,j=Math.log(Math.cos(g)*(1/Math.cos(h)))/Math.log(Math.tan(Math.PI/4+h/2)*(1/Math.tan(Math.PI/4+g/2))),k=Math.cos(g)*Math.pow(Math.tan(Math.PI/4+g/2),j)/j,l=k*Math.pow(1/Math.tan(Math.PI/4+i/2),j),m=k*Math.pow(1/Math.tan(Math.PI/4+d/2),j);return{x:l*Math.sin(j*(f-e))*this.radius,y:-(m-l*Math.cos(j*(f-e)))*this.radius}},lcc_inv:function(a,b,c){var d=a/this.radius,e=b/this.radius,f=0,g=c*this.radDeg,h=33*this.radDeg,i=45*this.radDeg,j=Math.log(Math.cos(h)*(1/Math.cos(i)))/Math.log(Math.tan(Math.PI/4+i/2)*(1/Math.tan(Math.PI/4+h/2))),k=Math.cos(h)*Math.pow(Math.tan(Math.PI/4+h/2),j)/j,l=k*Math.pow(1/Math.tan(Math.PI/4+f/2),j),m=this.sgn(j)*Math.sqrt(d*d+(l-e)*(l-e)),n=Math.atan(d/(l-e));return{lat:(2*Math.atan(Math.pow(k/m,1/j))-Math.PI/2)*this.degRad,lng:(g+n/j)*this.degRad}}},jvm.WorldMap=function(a){var b,c=this;if(this.params=jvm.$.extend(!0,{},jvm.WorldMap.defaultParams,a),!jvm.WorldMap.maps[this.params.map])throw new Error("Attempt to use map which was not loaded: "+this.params.map);this.mapData=jvm.WorldMap.maps[this.params.map],this.markers={},this.regions={},this.regionsColors={},this.regionsData={},this.container=jvm.$("<div>").css({width:"100%",height:"100%"}).addClass("jvectormap-container"),this.params.container.append(this.container),this.container.data("mapObject",this),this.container.css({position:"relative",overflow:"hidden"}),this.defaultWidth=this.mapData.width,this.defaultHeight=this.mapData.height,this.setBackgroundColor(this.params.backgroundColor),this.onResize=function(){c.setSize()},jvm.$(window).resize(this.onResize);for(b in jvm.WorldMap.apiEvents)this.params[b]&&this.container.bind(jvm.WorldMap.apiEvents[b]+".jvectormap",this.params[b]);this.canvas=new jvm.VectorCanvas(this.container[0],this.width,this.height),"ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch?this.params.bindTouchEvents&&this.bindContainerTouchEvents():this.bindContainerEvents(),this.bindElementEvents(),this.createLabel(),this.params.zoomButtons&&this.bindZoomButtons(),this.createRegions(),this.createMarkers(this.params.markers||{}),this.setSize(),this.params.focusOn&&("object"==typeof this.params.focusOn?this.setFocus.call(this,this.params.focusOn.scale,this.params.focusOn.x,this.params.focusOn.y):this.setFocus.call(this,this.params.focusOn)),this.params.selectedRegions&&this.setSelectedRegions(this.params.selectedRegions),this.params.selectedMarkers&&this.setSelectedMarkers(this.params.selectedMarkers),this.params.series&&this.createSeries()},jvm.WorldMap.prototype={transX:0,transY:0,scale:1,baseTransX:0,baseTransY:0,baseScale:1,width:0,height:0,setBackgroundColor:function(a){this.container.css("background-color",a)},resize:function(){var a=this.baseScale;this.width/this.height>this.defaultWidth/this.defaultHeight?(this.baseScale=this.height/this.defaultHeight,this.baseTransX=Math.abs(this.width-this.defaultWidth*this.baseScale)/(2*this.baseScale)):(this.baseScale=this.width/this.defaultWidth,this.baseTransY=Math.abs(this.height-this.defaultHeight*this.baseScale)/(2*this.baseScale)),this.scale*=this.baseScale/a,this.transX*=this.baseScale/a,this.transY*=this.baseScale/a},setSize:function(){this.width=this.container.width(),this.height=this.container.height(),this.resize(),this.canvas.setSize(this.width,this.height),this.applyTransform()},reset:function(){var a,b;for(a in this.series)for(b=0;b<this.series[a].length;b++)this.series[a][b].clear();this.scale=this.baseScale,this.transX=this.baseTransX,this.transY=this.baseTransY,this.applyTransform()},applyTransform:function(){var a,b,c,d;this.defaultWidth*this.scale<=this.width?(a=(this.width-this.defaultWidth*this.scale)/(2*this.scale),c=(this.width-this.defaultWidth*this.scale)/(2*this.scale)):(a=0,c=(this.width-this.defaultWidth*this.scale)/this.scale),this.defaultHeight*this.scale<=this.height?(b=(this.height-this.defaultHeight*this.scale)/(2*this.scale),d=(this.height-this.defaultHeight*this.scale)/(2*this.scale)):(b=0,d=(this.height-this.defaultHeight*this.scale)/this.scale),this.transY>b?this.transY=b:this.transY<d&&(this.transY=d),this.transX>a?this.transX=a:this.transX<c&&(this.transX=c),this.canvas.applyTransformParams(this.scale,this.transX,this.transY),this.markers&&this.repositionMarkers(),this.container.trigger("viewportChange",[this.scale/this.baseScale,this.transX,this.transY])},bindContainerEvents:function(){var a,b,c=!1,d=this;this.container.mousemove(function(e){return c&&(d.transX-=(a-e.pageX)/d.scale,d.transY-=(b-e.pageY)/d.scale,d.applyTransform(),a=e.pageX,b=e.pageY),!1}).mousedown(function(d){return c=!0,a=d.pageX,b=d.pageY,!1}),jvm.$("body").mouseup(function(){c=!1}),this.params.zoomOnScroll&&this.container.mousewheel(function(a,b,c,e){var f=jvm.$(d.container).offset(),g=a.pageX-f.left,h=a.pageY-f.top,i=Math.pow(1.3,e);d.label.hide(),d.setScale(d.scale*i,g,h),a.preventDefault()})},bindContainerTouchEvents:function(){var a,b,c,d,e,f,g,h=this,i=function(i){var j,k,l,m,n=i.originalEvent.touches;"touchstart"==i.type&&(g=0),1==n.length?(1==g&&(l=h.transX,m=h.transY,h.transX-=(c-n[0].pageX)/h.scale,h.transY-=(d-n[0].pageY)/h.scale,h.applyTransform(),h.label.hide(),(l!=h.transX||m!=h.transY)&&i.preventDefault()),c=n[0].pageX,d=n[0].pageY):2==n.length&&(2==g?(k=Math.sqrt(Math.pow(n[0].pageX-n[1].pageX,2)+Math.pow(n[0].pageY-n[1].pageY,2))/b,h.setScale(a*k,e,f),h.label.hide(),i.preventDefault()):(j=jvm.$(h.container).offset(),e=n[0].pageX>n[1].pageX?n[1].pageX+(n[0].pageX-n[1].pageX)/2:n[0].pageX+(n[1].pageX-n[0].pageX)/2,f=n[0].pageY>n[1].pageY?n[1].pageY+(n[0].pageY-n[1].pageY)/2:n[0].pageY+(n[1].pageY-n[0].pageY)/2,e-=j.left,f-=j.top,a=h.scale,b=Math.sqrt(Math.pow(n[0].pageX-n[1].pageX,2)+Math.pow(n[0].pageY-n[1].pageY,2)))),g=n.length};jvm.$(this.container).bind("touchstart",i),jvm.$(this.container).bind("touchmove",i)},bindElementEvents:function(){var a,b=this;this.container.mousemove(function(){a=!0}),this.container.delegate("[class~='jvectormap-element']","mouseover mouseout",function(a){var c=jvm.$(this).attr("class").baseVal?jvm.$(this).attr("class").baseVal:jvm.$(this).attr("class"),d=-1===c.indexOf("jvectormap-region")?"marker":"region",e="region"==d?jvm.$(this).attr("data-code"):jvm.$(this).attr("data-index"),f="region"==d?b.regions[e].element:b.markers[e].element,g="region"==d?b.mapData.paths[e].name:b.markers[e].config.name||"",h=jvm.$.Event(d+"LabelShow.jvectormap"),i=jvm.$.Event(d+"Over.jvectormap");"mouseover"==a.type?(b.container.trigger(i,[e]),i.isDefaultPrevented()||f.setHovered(!0),b.label.text(g),b.container.trigger(h,[b.label,e]),h.isDefaultPrevented()||(b.label.show(),b.labelWidth=b.label.width(),b.labelHeight=b.label.height())):(f.setHovered(!1),b.label.hide(),b.container.trigger(d+"Out.jvectormap",[e]))}),this.container.delegate("[class~='jvectormap-element']","mousedown",function(){a=!1}),this.container.delegate("[class~='jvectormap-element']","mouseup",function(){var c=jvm.$(this).attr("class").baseVal?jvm.$(this).attr("class").baseVal:jvm.$(this).attr("class"),d=-1===c.indexOf("jvectormap-region")?"marker":"region",e="region"==d?jvm.$(this).attr("data-code"):jvm.$(this).attr("data-index"),f=jvm.$.Event(d+"Click.jvectormap"),g="region"==d?b.regions[e].element:b.markers[e].element;a||(b.container.trigger(f,[e]),("region"===d&&b.params.regionsSelectable||"marker"===d&&b.params.markersSelectable)&&(f.isDefaultPrevented()||(b.params[d+"sSelectableOne"]&&b.clearSelected(d+"s"),g.setSelected(!g.isSelected))))})},bindZoomButtons:function(){var a=this;jvm.$("<div/>").addClass("jvectormap-zoomin").text("+").appendTo(this.container),jvm.$("<div/>").addClass("jvectormap-zoomout").html("&#x2212;").appendTo(this.container),this.container.find(".jvectormap-zoomin").click(function(){a.setScale(a.scale*a.params.zoomStep,a.width/2,a.height/2)}),this.container.find(".jvectormap-zoomout").click(function(){a.setScale(a.scale/a.params.zoomStep,a.width/2,a.height/2)})},createLabel:function(){var a=this;this.label=jvm.$("<div/>").addClass("jvectormap-label").appendTo(jvm.$("body")),this.container.mousemove(function(b){var c=b.pageX-15-a.labelWidth,d=b.pageY-15-a.labelHeight;5>c&&(c=b.pageX+15),5>d&&(d=b.pageY+15),a.label.is(":visible")&&a.label.css({left:c,top:d})})},setScale:function(a,b,c,d){var e,f=jvm.$.Event("zoom.jvectormap");a>this.params.zoomMax*this.baseScale?a=this.params.zoomMax*this.baseScale:a<this.params.zoomMin*this.baseScale&&(a=this.params.zoomMin*this.baseScale),"undefined"!=typeof b&&"undefined"!=typeof c&&(e=a/this.scale,d?(this.transX=b+this.defaultWidth*(this.width/(this.defaultWidth*a))/2,this.transY=c+this.defaultHeight*(this.height/(this.defaultHeight*a))/2):(this.transX-=(e-1)/a*b,this.transY-=(e-1)/a*c)),this.scale=a,this.applyTransform(),this.container.trigger(f,[a/this.baseScale])},setFocus:function(a,b,c){var d,e,f,g,h;if(jvm.$.isArray(a)||this.regions[a]){for(g=jvm.$.isArray(a)?a:[a],h=0;h<g.length;h++)this.regions[g[h]]&&(e=this.regions[g[h]].element.getBBox(),e&&("undefined"==typeof d?d=e:(f={x:Math.min(d.x,e.x),y:Math.min(d.y,e.y),width:Math.max(d.x+d.width,e.x+e.width)-Math.min(d.x,e.x),height:Math.max(d.y+d.height,e.y+e.height)-Math.min(d.y,e.y)},d=f)));this.setScale(Math.min(this.width/d.width,this.height/d.height),-(d.x+d.width/2),-(d.y+d.height/2),!0)}else a*=this.baseScale,this.setScale(a,-b*this.defaultWidth,-c*this.defaultHeight,!0)},getSelected:function(a){var b,c=[];for(b in this[a])this[a][b].element.isSelected&&c.push(b);return c},getSelectedRegions:function(){return this.getSelected("regions")},getSelectedMarkers:function(){return this.getSelected("markers")},setSelected:function(a,b){var c;if("object"!=typeof b&&(b=[b]),jvm.$.isArray(b))for(c=0;c<b.length;c++)this[a][b[c]].element.setSelected(!0);else for(c in b)this[a][c].element.setSelected(!!b[c])},setSelectedRegions:function(a){this.setSelected("regions",a)},setSelectedMarkers:function(a){this.setSelected("markers",a)},clearSelected:function(a){var b,c={},d=this.getSelected(a);for(b=0;b<d.length;b++)c[d[b]]=!1;this.setSelected(a,c)},clearSelectedRegions:function(){this.clearSelected("regions")},clearSelectedMarkers:function(){this.clearSelected("markers")},getMapObject:function(){return this},getRegionName:function(a){return this.mapData.paths[a].name},createRegions:function(){var a,b,c=this;for(a in this.mapData.paths)b=this.canvas.addPath({d:this.mapData.paths[a].path,"data-code":a},jvm.$.extend(!0,{},this.params.regionStyle)),jvm.$(b.node).bind("selected",function(a,b){c.container.trigger("regionSelected.jvectormap",[jvm.$(this).attr("data-code"),b,c.getSelectedRegions()])}),b.addClass("jvectormap-region jvectormap-element"),this.regions[a]={element:b,config:this.mapData.paths[a]}},createMarkers:function(a){var b,c,d,e,f,g=this;if(this.markersGroup=this.markersGroup||this.canvas.addGroup(),jvm.$.isArray(a))for(f=a.slice(),a={},b=0;b<f.length;b++)a[b]=f[b];for(b in a)e=a[b]instanceof Array?{latLng:a[b]}:a[b],d=this.getMarkerPosition(e),d!==!1&&(c=this.canvas.addCircle({"data-index":b,cx:d.x,cy:d.y},jvm.$.extend(!0,{},this.params.markerStyle,{initial:e.style||{}}),this.markersGroup),c.addClass("jvectormap-marker jvectormap-element"),jvm.$(c.node).bind("selected",function(a,b){g.container.trigger("markerSelected.jvectormap",[jvm.$(this).attr("data-index"),b,g.getSelectedMarkers()])}),this.markers[b]&&this.removeMarkers([b]),this.markers[b]={element:c,config:e})},repositionMarkers:function(){var a,b;for(a in this.markers)b=this.getMarkerPosition(this.markers[a].config),b!==!1&&this.markers[a].element.setStyle({cx:b.x,cy:b.y})},getMarkerPosition:function(a){return jvm.WorldMap.maps[this.params.map].projection?this.latLngToPoint.apply(this,a.latLng||[0,0]):{x:a.coords[0]*this.scale+this.transX*this.scale,y:a.coords[1]*this.scale+this.transY*this.scale}},addMarker:function(a,b,c){var d,e,f={},g=[],c=c||[];for(f[a]=b,e=0;e<c.length;e++)d={},d[a]=c[e],g.push(d);this.addMarkers(f,g)},addMarkers:function(a,b){var c;for(b=b||[],this.createMarkers(a),c=0;c<b.length;c++)this.series.markers[c].setValues(b[c]||{})},removeMarkers:function(a){var b;for(b=0;b<a.length;b++)this.markers[a[b]].element.remove(),delete this.markers[a[b]]},removeAllMarkers:function(){var a,b=[];for(a in this.markers)b.push(a);this.removeMarkers(b)},latLngToPoint:function(a,b){var c,d,e,f=jvm.WorldMap.maps[this.params.map].projection,g=f.centralMeridian;return this.width-2*this.baseTransX*this.baseScale,this.height-2*this.baseTransY*this.baseScale,this.scale/this.baseScale,-180+g>b&&(b+=360),c=jvm.Proj[f.type](a,b,g),d=this.getInsetForPoint(c.x,c.y),d?(e=d.bbox,c.x=(c.x-e[0].x)/(e[1].x-e[0].x)*d.width*this.scale,c.y=(c.y-e[0].y)/(e[1].y-e[0].y)*d.height*this.scale,{x:c.x+this.transX*this.scale+d.left*this.scale,y:c.y+this.transY*this.scale+d.top*this.scale}):!1},pointToLatLng:function(a,b){var c,d,e,f,g,h=jvm.WorldMap.maps[this.params.map].projection,i=h.centralMeridian,j=jvm.WorldMap.maps[this.params.map].insets;for(c=0;c<j.length;c++)if(d=j[c],e=d.bbox,f=a-(this.transX*this.scale+d.left*this.scale),g=b-(this.transY*this.scale+d.top*this.scale),f=f/(d.width*this.scale)*(e[1].x-e[0].x)+e[0].x,g=g/(d.height*this.scale)*(e[1].y-e[0].y)+e[0].y,f>e[0].x&&f<e[1].x&&g>e[0].y&&g<e[1].y)return jvm.Proj[h.type+"_inv"](f,-g,i);return!1},getInsetForPoint:function(a,b){var c,d,e=jvm.WorldMap.maps[this.params.map].insets;for(c=0;c<e.length;c++)if(d=e[c].bbox,a>d[0].x&&a<d[1].x&&b>d[0].y&&b<d[1].y)return e[c]},createSeries:function(){var a,b;this.series={markers:[],regions:[]};for(b in this.params.series)for(a=0;a<this.params.series[b].length;a++)this.series[b][a]=new jvm.DataSeries(this.params.series[b][a],this[b])},remove:function(){this.label.remove(),this.container.remove(),jvm.$(window).unbind("resize",this.onResize)
}},jvm.WorldMap.maps={},jvm.WorldMap.defaultParams={map:"world_mill_en",backgroundColor:"#505050",zoomButtons:!0,zoomOnScroll:!0,zoomMax:8,zoomMin:1,zoomStep:1.6,regionsSelectable:!1,markersSelectable:!1,bindTouchEvents:!0,regionStyle:{initial:{fill:"white","fill-opacity":1,stroke:"none","stroke-width":0,"stroke-opacity":1},hover:{"fill-opacity":.8},selected:{fill:"yellow"},selectedHover:{}},markerStyle:{initial:{fill:"grey",stroke:"#505050","fill-opacity":1,"stroke-width":1,"stroke-opacity":1,r:5},hover:{stroke:"black","stroke-width":2},selected:{fill:"blue"},selectedHover:{}}},jvm.WorldMap.apiEvents={onRegionLabelShow:"regionLabelShow",onRegionOver:"regionOver",onRegionOut:"regionOut",onRegionClick:"regionClick",onRegionSelected:"regionSelected",onMarkerLabelShow:"markerLabelShow",onMarkerOver:"markerOver",onMarkerOut:"markerOut",onMarkerClick:"markerClick",onMarkerSelected:"markerSelected",onViewportChange:"viewportChange"},define("panels/map/lib/jquery.jvectormap.min",function(){}),define("panels/map/module",["angular","app","underscore","jquery","config","./lib/jquery.jvectormap.min"],function(a,b,c,d,e){var f=a.module("kibana.panels.map",[]);b.useModule(f),f.controller("map",["$scope","$rootScope","querySrv","dashboard","filterSrv",function(b,d,f,g,h){b.panelMeta={editorTabs:[{title:"Queries",src:"app/partials/querySelect.html"}],status:"Stable",description:"Displays a map of shaded regions using a field containing a 2 letter country , or US state, code. Regions with more hit are shaded darker. Node that this does use the Elasticsearch terms facet, so it is important that you set it to the correct field."};var i={queries:{mode:"all",ids:[]},map:"world",colors:["#A0E2E2","#265656"],size:100,exclude:[],spyable:!0,index_limit:0};c.defaults(b.panel,i),b.init=function(){b.$on("refresh",function(){b.get_data()}),b.get_data()},b.get_data=function(){if(0!==g.indices.length){b.panelMeta.loading=!0;var a;a=b.ejs.Request().indices(g.indices),b.panel.queries.ids=f.idsByMode(b.panel.queries);var d=b.ejs.BoolQuery();c.each(b.panel.queries.ids,function(a){d=d.should(f.getEjsObj(a))}),a=a.facet(b.ejs.TermsFacet("map").field(b.panel.field).size(b.panel.size).exclude(b.panel.exclude).facetFilter(b.ejs.QueryFilter(b.ejs.FilteredQuery(d,h.getBoolFilter(h.ids))))).size(0),b.populate_modal(a);var e=a.doSearch();e.then(function(a){b.panelMeta.loading=!1,b.hits=a.hits.total,b.data={},c.each(a.facets.map.terms,function(a){b.data[a.term.toUpperCase()]=a.count}),b.$emit("render")})}},b.populate_modal=function(c){b.modal={title:"Inspector",body:"<h5>Last Elasticsearch Query</h5><pre>curl -XGET "+e.elasticsearch+"/"+g.indices+"/_search?pretty -d'\n"+a.toJson(JSON.parse(c.toString()),!0)+"'</pre>"}},b.build_search=function(a,b){h.set({type:"querystring",mandate:"must",query:a+":"+b}),g.refresh()}}]),f.directive("map",function(){return{restrict:"A",link:function(b,e){function f(){e.text(""),d(".jvectormap-zoomin,.jvectormap-zoomout,.jvectormap-label").remove(),require(["./panels/map/lib/map."+b.panel.map],function(){e.vectorMap({map:b.panel.map,regionStyle:{initial:{fill:"#8c8c8c"}},zoomOnScroll:!1,backgroundColor:null,series:{regions:[{values:b.data,scale:b.panel.colors,normalizeFunction:"polynomial"}]},onRegionLabelShow:function(a,d,f){e.children(".map-legend").show();var g=c.isUndefined(b.data[f])?0:b.data[f];e.children(".map-legend").text(d.text()+": "+g)},onRegionOut:function(){d(".map-legend").hide()},onRegionClick:function(a,d){var e=c.isUndefined(b.data[d])?0:b.data[d];0!==e&&b.build_search(b.panel.field,d)}}),e.prepend('<span class="map-legend"></span>'),d(".map-legend").hide()})}e.html('<center><img src="img/load_big.gif"></center>'),b.$on("render",function(){f()}),a.element(window).bind("resize",function(){f()})}}})});
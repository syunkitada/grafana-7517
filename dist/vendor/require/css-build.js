/*! kibana - v3.0.0m3pre - 2013-09-15
 * Copyright (c) 2013 Rashid Khan; Licensed Apache License */

define(function(){function a(a,b){var d=c.readFileSync(a,"utf8");0===d.indexOf("﻿")&&(d=d.substring(1)),b(d)}function b(a){return a.replace(/[\r\n]+/g," ").replace(/[\t]/g," ")}var c=require.nodeRequire("fs"),d={},e=!1,f={load:function(c,e,f,g){f(!0),a(g.baseUrl+c,function(a){d[c]=b(a)})},write:function(a,b,c){e||(e=!0,c("define('"+a+"-embed', function()\n{\n"+"	function embed_css(content)\n"+"	{\n"+"		var head = document.getElementsByTagName('head')[0],\n"+"		style = document.createElement('style'),\n"+"		rules = document.createTextNode(content);\n"+"		style.type = 'text/css';\n"+"		if(style.styleSheet)\n"+"			style.styleSheet.cssText = rules.nodeValue;\n"+"		else style.appendChild(rules);\n"+"			head.appendChild(style);\n"+"	}\n"+"	return embed_css;\n"+"});\n")),c("define('"+a+"!"+b+"', ['"+a+"-embed'], \n"+"function(embed)\n{\n"+"	embed(\n	'"+d[b].replace(/'/g,"\\'")+"'\n	);\n"+"	return true;\n"+"});\n")},writeFile:function(){},onLayerEnd:function(){}};return f});
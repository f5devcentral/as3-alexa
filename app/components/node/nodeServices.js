"use strict";!function(){function e(e){var t={data:[]};return t.resource=e("https://2qm2k0jtsh.execute-api.us-west-2.amazonaws.com/default/awsDiscovery",{},{query:{method:"GET",isArray:!1,cancellable:!0,timeout:3e4},get:{method:"GET",cancellable:!0,timeout:3e4}}),t.filter=function(e,t,r){var c=new RegExp(t);return e.forEach(function(t){var n=!1;r.forEach(function(e){t.entity[e]&&t.entity[e].match(c)&&(n=!0)}),n||(t.visible=!1)}),e},t.setList=function(e){t.list=e.nodes},t.getList=function(){return t.list},t}e.$inject=["$resource"],angular.module("nodeServices",[]).factory("NodeFactory",e)}();
//# sourceMappingURL=../../maps/node/nodeServices.js.map
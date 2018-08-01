"use strict";!function(){function t(t,e,a,i,s,o,l,n,r,d,c){var p=this;p.dataLoaded=!1,p.dirty=0,p.selectedRows=[],p.WSAuth=!1,p.isData=!1,p.status=!1,p.err=!1,p.tags=[],p.info="",t.$watch("node.tags",function(t,e){t!==e&&(p.tags=t)},!0),p.addEditTags=function(t){c.open("md","nodesTagsAddEditTpl.html","NodeTagsCtrl","ntg",t)},p.updateTags=function(e){return p.stop(),e.selected=!0,p.selectedRow=e,d.resource.update({vpc:e.vpc,id:e.id},{status:e.status,tags:e.tags},function(t){p.gridApi.selection.clearSelectedRows(),e.selected=!1,p.getData(),p.start()},function(t){t.row=e,c.open("md","errTpl.html","ErrorCtrl","errCtrl",t),p.start()})},p.polling=function(){p.updateTimer=setTimeout(function(){p.pollData(p.polling)},3e3)},p.start=function(){clearTimeout(p.updateTimer),p.polling()},p.stop=function(){d.resource.query().$cancelRequest(),clearTimeout(p.updateTimer)},p.pollData=function(i){d.resource.query(function(t){d.setList(t);var e=t.message;if(e&&0<e.length){p.isData=!0,p.gridOptions.data=[];for(var a=0;a<e.length;a++)p.gridOptions.data.push(e[a]),p.gridOptions.data[a].isSaved=!0,p.gridOptions.data[a].statuses=p.statuses}else p.gridOptions.data=[];i()},function(t){404===t.status&&(p.isData=!1),-1!==t.status&&i(),console.log(t)})},p.getData=function(){d.resource.query(function(t){var e=t.message;if(d.setList(e),e&&0<e.length){p.isData=!0,p.gridOptions.data=[];for(var a=0;a<e.length;a++)p.gridOptions.data.push(e[a]),p.gridOptions.data[a].isSaved=!0,p.gridOptions.data[a].statuses=p.statuses}else p.gridOptions.data=[]},function(t){404===t.status&&(p.isData=!1)})},p.gridOptions={},p.gridOptions={enableCellEditOnFocus:!0,enableFiltering:!1,rowHeight:35,showGridFooter:!0,cellEditableCondition:function(t){return!t.row.entity.isSaved},rowEditWaitInterval:-1};p.gridOptions.columnDefs=[{name:"name",displayName:"NAME",field:"name",width:"20%",cellTemplate:"partials/templates/nodeTpl.html",enableCellEdit:!0},{name:"id",displayName:"INSTANCE ID",field:"id",width:"30%",cellTemplate:"partials/templates/nodeTpl.html",enableCellEdit:!0},{name:"ip",displayName:"IP",field:"ip",width:"16%",validators:{required:!0,ipAddress:"aaa.bbb.ccc.ddd"},cellTemplate:"ui-grid/cellTooltipValidator",enableCellEdit:!0},{name:"vpc",displayName:"VPC ID",field:"vpc",width:"20%",enableCellEdit:!0},{name:"tags",displayName:"TAGS",field:"tags",width:"10%",cellTemplate:"partials/templates/nodeTagsTpl.html",enableCellEdit:!1}];p.getObj=function(){return{status:"offline",name:" ",id:" ",ip:" ",port:80,desc:" ",vpc:" ",tags:[],"":" ",selected:!1}};var u=e.$on("update-tags",function(t,e){console.log("update-tags"),p.updateTags(e)});t.$on("$destroy",function(){u(),p.stop()}),p.gridOptions.onRegisterApi=function(t){p.gridApi=t,p.gridApi.rowEdit.on.saveRow(null,p.saveRow),p.gridApi.selection.on.rowSelectionChanged(null,function(t){t.isSelected?p.stop():p.start()}),p.gridApi.selection.on.rowSelectionChangedBatch(null,function(t){p.gridApi.selection.getSelectAllState()?p.start():p.stop()}),p.dirty=p.gridApi.rowEdit.getDirtyRows()},p.getData(),p.start()}function e(t,e,a,i){var s=this;if((s.err=i).data)if(-1!==i.data.errors.detail.indexOf("message")){var o=JSON.parse(i.data.errors.detail).message;-1!==o.indexOf("body")?s.err.detail=o.split("body:")[1]:s.err.detail=o}else s.err.detail=i.data.errors.detail;else s.err.detail="Details not available";s.Ok=function(){e.$broadcast("err-node",i),a.close()}}function a(t,e,a,i,s){var o=this;o.params=i,o.createTag=function(){if(o.params.tags){var t=o.params.tags;if(t&&0<t.length){var e=t[t.length-1];if(void 0!==e.key&&""!==e.key&&" "!==e.key){o.params.tags.push({key:"",value:""})}}else{i.tags=[],o.params.tags=i.tags;o.params.tags.push({key:"",value:""})}}},o.deleteTag=function(t){o.params.tags.splice(t,1)},o.deleteAlltags=function(){o.params.tags.length=0},o.save=function(){o.params.isSaved?e.$broadcast("update-tags",i):s.log("just wait for save of node"),a.close()},o.cancel=function(){a.dismiss("cancel")}}angular.module("nodeControllers",[]).controller("NodeCtrl",t).controller("ErrorCtrl",e).controller("NodeTagsCtrl",a),t.$inject=["$scope","$rootScope","$state","$uibModal","$log","$interval","uiGridConstants","$q","ValidationService","NodeFactory","ModalService"],e.$inject=["$scope","$rootScope","$uibModalInstance","params"],a.$inject=["$scope","$rootScope","$uibModalInstance","params","$log"]}();
//# sourceMappingURL=../../maps/node/nodeControllers.js.map

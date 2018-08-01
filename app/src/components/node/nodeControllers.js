/*
 * Copyright (c) 2018, F5 Networks, Inc. All rights reserved.
 * No part of this software may be reproduced or transmitted in any
 * form or by any means, electronic or mechanical, for any purpose,
 * without express written permission of F5 Networks, Inc.
 */
(function () {

    /**
Node Controllers
**/
    function NodeCtrl ($scope, $rootScope, $state, $uibModal, $log, $interval, uiGridConstants, $q, ValidationService, NodeFactory, ModalService) {

        const node = this;
        node.dataLoaded = false;
        node.dirty = 0;
        node.selectedRows = [];
        node.WSAuth = false;
        node.isData = false;
        node.status = false;
        node.err = false;
        node.tags = [];
        node.info = '';

        // Watching policy details
        $scope.$watch('node.tags', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                node.tags = newVal;
            }
        }, true);

        node.addEditTags = function (row) {
            ModalService.open('md', 'nodesTagsAddEditTpl.html', 'NodeTagsCtrl', 'ntg', row);
        };

        node.updateTags = function (row) {
            node.stop();
            row.selected = true;
            node.selectedRow = row;
            return NodeFactory.resource.update({
                vpc: row.vpc,
                id: row.id
            }, {
                status: row.status,
                tags: row.tags
            }, (data) => {
                node.gridApi.selection.clearSelectedRows();
                row.selected = false;
                node.getData();
                node.start();
            }, (err) => {
                err.row = row;
                ModalService.open('md', 'errTpl.html', 'ErrorCtrl', 'errCtrl', err);
                node.start();
            });
        };

        node.polling = function () {
            node.updateTimer = setTimeout(function () {
                node.pollData(node.polling);
            }, 3000);
        };

        node.start = function () {
            clearTimeout(node.updateTimer);
            node.polling();
        };

        node.stop = function () {
            NodeFactory.resource.query().$cancelRequest();
            clearTimeout(node.updateTimer);
        };


        node.pollData = function (polling) {
            NodeFactory.resource.query((data) => {
            // Keep nodes list in service to be used by DNodes
                NodeFactory.setList(data);
                const nodes = data.message;
                if (nodes && nodes.length > 0) {
                    node.isData = true;
                    node.gridOptions.data = [];
                    for (let j = 0; j < nodes.length; j++) {
                        node.gridOptions.data.push(nodes[j]);
                        node.gridOptions.data[j].isSaved = true;
                        node.gridOptions.data[j].statuses = node.statuses;
                    }
                } else {
                    node.gridOptions.data = [];
                }
                polling();
            }, (err) => {
                if (err.status === 404) {
                    node.isData = false;
                }
                if (err.status !== -1) {
                    polling();
                }
                console.log(err);
            });
        };


        node.getData = function () {
            NodeFactory.resource.query((data) => {
                console.log('data ============== ');
                console.log(data.message);
                const nodes = data.message;
                // Keep nodes list in service to be used by DNodes
                NodeFactory.setList(nodes);
                if (nodes && nodes.length > 0) {
                    node.isData = true;
                    node.gridOptions.data = [];
                    for (let j = 0; j < nodes.length; j++) {
                        node.gridOptions.data.push(nodes[j]);
                        node.gridOptions.data[j].isSaved = true;
                        node.gridOptions.data[j].statuses = node.statuses;
                    }
                } else {
                    node.gridOptions.data = [];
                }
            }, (err) => {
                if (err.status === 404) {
                    node.isData = false;
                }
            });
        };

        /** Initialize gridOptions **/
        node.gridOptions = {};

        node.gridOptions = {
            enableCellEditOnFocus: true,
            enableFiltering: false,
            rowHeight: 35,
            showGridFooter: true,
            cellEditableCondition: function (node) {
                return !node.row.entity.isSaved; // Disable row edit for saved row
            },

            /** Disable auto-save of rows **/
            rowEditWaitInterval: -1
        };


        const validators = ValidationService;
        node.gridOptions.columnDefs = [
            {
                name: 'name',
                displayName: 'NAME',
                field: 'name',
                width: '20%',
                cellTemplate: 'partials/templates/nodeTpl.html',
                enableCellEdit: true
            },
            {
                name: 'id',
                displayName: 'INSTANCE ID',
                field: 'id',
                width: '30%',
                cellTemplate: 'partials/templates/nodeTpl.html',
                enableCellEdit: true
            },
            {
                name: 'ip',
                displayName: 'IP',
                field: 'ip',
                width: '16%',
                validators: {
                    required: true,
                    ipAddress: 'aaa.bbb.ccc.ddd'
                },
                cellTemplate: 'ui-grid/cellTooltipValidator',
                enableCellEdit: true
            },
            {
                name: 'vpc',
                displayName: 'VPC ID',
                field: 'vpc',
                width: '20%',
                enableCellEdit: true
            },
            {
                name: 'tags',
                displayName: 'TAGS',
                field: 'tags',
                width: '10%',
                cellTemplate: 'partials/templates/nodeTagsTpl.html',
                enableCellEdit: false
            }
        ];

        let obj = {};
        obj.newRow = true;

        node.getObj = function () {
            obj = {
                status: 'offline',
                name: ' ',
                id: ' ',
                ip: ' ',
                // Port is hidden in UI but for now sending null port
                port: 80,
                desc: ' ',
                vpc: ' ',
                tags: [],
                '': ' '
            };
            obj.selected = false;
            return obj;
        };


        // Event handlers ================================================================
        const updateTags = $rootScope.$on('update-tags', function (event, row) {
            console.log('update-tags');
            node.updateTags(row);
        });


        $scope.$on('$destroy', function () {
            updateTags();
            node.stop();
        });

        node.gridOptions.onRegisterApi = function (gridApi) {
            node.gridApi = gridApi;
            node.gridApi.rowEdit.on.saveRow(null, node.saveRow);
            node.gridApi.selection.on.rowSelectionChanged(null, function (row) {
                if (row.isSelected) {
                    node.stop();
                } else {
                    node.start();
                }
            });
            node.gridApi.selection.on.rowSelectionChangedBatch(null, function (rows) {
                if (node.gridApi.selection.getSelectAllState()) {
                    node.start();
                } else {
                    node.stop();
                }

            });

            node.dirty = node.gridApi.rowEdit.getDirtyRows();

        };

        node.getData();
        node.start();
    }

    function ErrorCtrl ($scope, $rootScope, $uibModalInstance, params) {
        const errCtrl = this;
        errCtrl.err = params;
        if (params.data) {
            if (params.data.errors.detail.indexOf('message') !== -1) {
                const val = JSON.parse(params.data.errors.detail).message;
                if (val.indexOf('body') !== -1) {
                    errCtrl.err.detail = val.split('body:')[1];
                } else {
                    errCtrl.err.detail = val;
                }
            } else {
                errCtrl.err.detail = params.data.errors.detail;
            }

        } else {
            errCtrl.err.detail = 'Details not available';
        }

        errCtrl.Ok = function () {
            $rootScope.$broadcast('err-node', params);
            $uibModalInstance.close();
        };
    }



    function NodeTagsCtrl ($scope, $rootScope, $uibModalInstance, params, $log) {
        const ntg = this;
        ntg.params = params;

        ntg.createTag = function () {
            if (ntg.params.tags) {
                const tags = ntg.params.tags;
                if (tags && tags.length > 0) {
                    const lastTag = tags[tags.length - 1];
                    if (lastTag.key !== undefined && lastTag.key !== '' && lastTag.key !== ' ') {
                        const tag = {
                            key: '',
                            value: ''
                        };
                        ntg.params.tags.push(tag);
                    }
                } else {
                    params.tags = [];
                    ntg.params.tags = params.tags;
                    const tag = {
                        key: '',
                        value: ''
                    };
                    ntg.params.tags.push(tag);
                }
            }

        };

        ntg.deleteTag = function (index) {
            ntg.params.tags.splice(index, 1);
        };

        ntg.deleteAlltags = function () {
            ntg.params.tags.length = 0;
        };

        ntg.save = function () {
            if (ntg.params.isSaved) {
                $rootScope.$broadcast('update-tags', params);
            } else {
                $log.log('just wait for save of node');
            }
            $uibModalInstance.close();
        };

        ntg.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }


    angular.module('nodeControllers', []).
    controller('NodeCtrl', NodeCtrl).
    controller('ErrorCtrl', ErrorCtrl).
    controller('NodeTagsCtrl', NodeTagsCtrl);

    /** Inject the dependencies - avoid problems during minification **/
    NodeCtrl.$inject = ['$scope', '$rootScope', '$state', '$uibModal', '$log', '$interval', 'uiGridConstants', '$q', 'ValidationService', 'NodeFactory', 'ModalService'];
    ErrorCtrl.$inject = ['$scope', '$rootScope', '$uibModalInstance', 'params'];
    NodeTagsCtrl.$inject = ['$scope', '$rootScope', '$uibModalInstance', 'params', '$log'];

}());

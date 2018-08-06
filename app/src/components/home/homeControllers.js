/*
 * Copyright (c) 2018, F5 Networks, Inc. All rights reserved.
 * No part of this software may be reproduced or transmitted in any
 * form or by any means, electronic or mechanical, for any purpose,
 * without express written permission of F5 Networks, Inc.
 */
(function () {
    /**
Home Controllers - Base Controllers for Home Page
**/
    function HomeCtrl () {
        const app = this;
        app.stats = {};
        app.nodeDiscovery = false;
        app.message = '';

    }

    function GraphCtrl ($scope, $log, $timeout, $interval, $q, uiGridConstants, GraphService) {
        const graph = this;
        graph.inLimit = true;
        graph.updateTimer;

        const tmp = {
            nodes: [{
                id: 'BIG IP',
                group: 50,
                type: 'bigip',
                status: 'online'
            }],
            links: []
        };
        graph.polling = function () {
            graph.updateTimer = setTimeout(function () {
                graph.pollData(graph.polling);
            }, 3000);
        };

        graph.start = function () {
            clearTimeout(graph.updateTimer);
            graph.polling();
            console.log('graph start - polling');
        };

        graph.stop = function () {
            clearTimeout(graph.updateTimer);
            console.log('graph stop - polling');
        };

        graph.pollData = function (polling) {
            GraphService.graphResource.query((data) => {
                if (data.message.tenants) {
                    const graphData = GraphService.processData(data);
                    if (graphData.list[0]) {
                        if (angular.equals(graphData.list[0], graph.latestGraph())) {
                            graph.inLimit = true;
                        } else {
                            const newData = angular.copy(graphData.list[0]);
                            graph.updateGraph(newData);
                            graph.data = graphData.list[0];
                            graph.inLimit = true;
                        }
                        polling();
                    } else {
                        graph.updateGraph(tmp);
                        graph.data = tmp;
                        graph.inLimit = false;
                        polling();
                    }
                } else {
                    graph.updateGraph(tmp);
                    graph.data = tmp;
                    graph.inLimit = true;
                    polling();
                }
            }, (err) => {
                console.log(err);
                graph.updateGraph(tmp);
                graph.data = tmp;
                if (err.status === 403 && err.data.message && err.data.message.indexOf('Dataset is too large')) {
                    graph.inLimit = false;
                } else {
                    graph.inLimit = true;
                }
                polling();
            });
        };


        graph.getData = function () {
            GraphService.graphResource.query((data) => {
                if (data.message.tenants) {
                    const graphData = GraphService.processData(data);
                    if (graphData.list[0]) {
                        if (angular.equals(graphData.list, graph.latestGraph())) {
                            graph.inLimit = true;
                        } else {
                            const newData = angular.copy(graphData.list[0]);
                            graph.updateGraph(newData);
                            graph.data = graphData.list[0];
                            graph.inLimit = true;
                        }
                    } else {
                        graph.updateGraph(tmp);
                        graph.data = tmp;
                        graph.inLimit = false;
                    }
                } else {
                    graph.updateGraph(tmp);
                    graph.data = tmp;
                    graph.inLimit = true;
                }
            }, (err) => {
                console.log(err);
                graph.updateGraph(tmp);
                graph.data = tmp;
                if (err.status === 403 && err.data.message && err.data.message.indexOf('Dataset is too large')) {
                    graph.inLimit = false;
                } else {
                    graph.inLimit = true;
                }
            });
        };

        graph.updateGraph = function (data) {
            graph.oData = data;
        };

        graph.latestGraph = function () {
            return graph.oData;
        };

        $scope.$on('$destroy', function () {
            graph.stop();
        });

        graph.getData();
        graph.start();

    }

    function HelpCtrl () {
        const help = this;
    }

    angular.module('homeControllers', []).
    controller('HomeCtrl', HomeCtrl).
    controller('GraphCtrl', GraphCtrl).
    controller('HelpCtrl', HelpCtrl);

    /** Inject the dependencies - avoid problems during minification **/
    GraphCtrl.$inject = ['$scope', '$log', '$timeout', '$interval', '$q', 'uiGridConstants', 'GraphService'];
}());

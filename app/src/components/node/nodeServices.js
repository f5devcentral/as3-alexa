/**
 * Copyright (c) 2018, F5 Networks, Inc. 
 */
 
(function () {

    angular.module('nodeServices', []).
    factory('NodeFactory', NodeFactory);


    function NodeFactory ($resource) {

        const node = {};
        node.data = [];

        node.resource = $resource('https://2qm2k0jtsh.execute-api.us-west-2.amazonaws.com/default/awsDiscovery', {}, {
            query: {
                method: 'GET',
                isArray: false,
                cancellable: true,
                timeout: 30000
            },
            get: {
                method: 'GET',
                cancellable: true,
                timeout: 30000
            }
        });

        // Note: Unable to filter according to a number
        node.filter = function (rows, filterValue, arr) {
            const matcher = new RegExp(filterValue);
            rows.forEach(function (row) {
                let match = false;
                arr.forEach(function (field) {
                    // Using this for dev purpose
                    // [ 'name', 'email', 'body' ].forEach(function( field ){
                    if (row.entity[field] && row.entity[field].match(matcher)) {
                        match = true;
                    }
                });
                if (!match) {
                    row.visible = false;
                }
            });
            return rows;
        };

        node.setList = function (data) {
            node.list = data.nodes;
        };
        node.getList = function () {
            return node.list;
        };

        return node;

    }
  
}());

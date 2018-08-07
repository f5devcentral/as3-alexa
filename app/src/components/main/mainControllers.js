/**
 * Copyright (c) 2018, F5 Networks, Inc. 
 */

(function () {

    function MainCtrl () {

        const main = this;
        main.logLevel = 'info';
        main.year = new Date().getFullYear();
        main.version = null;
    }

    angular.module('mainControllers', []).
    controller('MainCtrl', MainCtrl);
}());

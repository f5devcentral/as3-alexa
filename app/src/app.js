/*
 * Copyright (c) 2018, F5 Networks, Inc. All rights reserved.
 * No part of this software may be reproduced or transmitted in any
 * form or by any means, electronic or mechanical, for any purpose,
 * without express written permission of F5 Networks, Inc.
 */

/**
 Main app module file
**/
(function () {

    // Declare app level module which depends on views, and components
    angular.module('alexaApp', [
        'ngAnimate',
        'ngSanitize',
        'ngTouch',
        'ngResource',
        'ngCookies',
        'ui.bootstrap',
        'ui.router',
        'ui.router.tabs',

        /** Ui Grid and related modules **/
        'ui.grid',
        'ui.grid.edit',
        'ui.grid.rowEdit',
        'ui.grid.cellNav',
        'ui.grid.selection',
        'ui.grid.resizeColumns',
        'ui.grid.validate', // Validation module is not stable as per UI Grid official website

        'angularSpinners',

        'homeDirectives',

        'mainControllers',
        'homeControllers',
        'nodeControllers',

        'commonServices',
        'homeServices',
        'nodeServices'


    ]).
    config(['$stateProvider', '$urlRouterProvider', '$animateProvider', function ($stateProvider, $urlRouterProvider, $animateProvider) {

        $urlRouterProvider.otherwise('/home');

        $stateProvider.

        state('home', {
            url: '/home',
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl as home'
        }).
        state('help', {
            url: '/help',
            templateUrl: 'partials/help.html'
        });

        // A fix for ui-grid menu and column menu issue in Firefox
        $animateProvider.classNameFilter(/^((?!(ui-grid-menu)).)*$/);

    }]).
    run(['$rootScope', '$location', '$cookieStore', '$http', '$window',
        function ($rootScope, $location, $cookieStore, $http) {
            // Prevent console logs in Production
            // const console = {};
            // console.log = function() {};
            // $window.console = console;

            // Set common http headers. Override them in individual http requests
            $http.defaults.headers.common['Content-Type'] = 'application/json';
            $http.defaults.headers.common.Accept = 'application/json';

            /** $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
              if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');
              }
            }); **/


        }
    ]);
}());

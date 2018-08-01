/*
 * Copyright (c) 2018, F5 Networks, Inc. All rights reserved.
 * No part of this software may be reproduced or transmitted in any
 * form or by any means, electronic or mechanical, for any purpose,
 * without express written permission of F5 Networks, Inc.
 */
(function () {
    angular.module('commonServices', []).
    factory('ModalService', ModalService).
    factory('ValidationService', ValidationService).
    // CONSTANTS
    constant('CONSTANTS', {
        REGEXIP: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        REGEXPORT: /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/
    });

    function ModalService ($uibModal) {
        return {
            open: function (size, template, controller, controllerAs, params) {
                return $uibModal.open({
                    animation: true,
                    templateUrl: template,
                    controller: controller,
                    controllerAs: controllerAs,
                    size: size,
                    resolve: {
                        params: function () {
                            return params;
                        }
                    }
                });
            }
        };
    }

    function ValidationService (uiGridValidateService, CONSTANTS) {
        const validation = {};

        /** Validation Service for IP Address - Alpha (might not be stable!!)  **/
        uiGridValidateService.setValidator('ipAddress',
            function (argument) {
                // UI-Grid Validation Service - example code has newValue and oldValue reversed!
                return function (oldValue, newValue, rowEntity, colDef) {
                    if (!newValue) {
                        return true; // We should not test for existence here
                    }
                    return CONSTANTS.REGEXIP.test(newValue);
                    // return newValue.startsWith(argument);

                };
            },
            function (argument) {
                return `Please enter a valid ip address of format ${argument} with each number ranging from 0 to 255`;
            }
        );

        /** Validation Service for Port - Alpha (might not be stable!!)  **/
        validation.isPortValid = uiGridValidateService.setValidator('portNum',
            function (argument) {
                // UI-Grid Validation Service - example code has newValue and oldValue reversed!
                return function (oldValue, newValue, rowEntity, colDef) {
                    if (!newValue) {
                        return true; // We should not test for existence here
                    }
                    return CONSTANTS.REGEXPORT.test(newValue);

                };
            },
            function (argument) {
                return `Please enter a valid port number of format ${argument} ranging from 0 to 65535`;
            }
        );

        return validation;

    }
}());

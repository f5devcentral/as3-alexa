/*
 * Copyright (c) 2018, F5 Networks, Inc. All rights reserved.
 * No part of this software may be reproduced or transmitted in any
 * form or by any means, electronic or mechanical, for any purpose,
 * without express written permission of F5 Networks, Inc.
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

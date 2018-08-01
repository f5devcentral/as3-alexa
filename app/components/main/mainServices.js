'use strict';

/*
 * Copyright (c) 2018, F5 Networks, Inc. All rights reserved.
 * No part of this software may be reproduced or transmitted in any
 * form or by any means, electronic or mechanical, for any purpose,
 * without express written permission of F5 Networks, Inc.
 */
(function () {

  LogService.$inject = ["$resource"];
  angular.module('mainServices', []).factory('LogService', LogService);

  function LogService($resource) {
    var logs = {};

    logs.resource = $resource('proxy/v1/logs/', {}, {
      query: {
        method: 'GET',
        isArray: false
      },
      get: { method: 'GET' },
      save: { method: 'POST' },
      update: {
        method: 'PATCH',
        isArray: false
      },
      delete: { method: 'DELETE' },
      getLevel: {
        url: 'proxy/v1/logs/level',
        method: 'GET'
      },
      updateLevel: {
        url: 'proxy/v1/logs/level',
        method: 'PATCH'
      }
    });
    return logs;
  }
})();
//# sourceMappingURL=../../maps/main/mainServices.js.map

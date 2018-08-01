/**
 * Copyright (c) 2018, F5 Networks, Inc. All rights reserved.
 * No part of this software may be reproduced or transmitted in any
 * form or by any means, electronic or mechanical, for any purpose,
 * without express written permission of F5 Networks, Inc.
 */

/**
 * Nconfig object manages Configuration.
 * 1) Determines app config values to apply by
 *    applying - Config file values,
      Env values then Command Line values-from least to most precenence
 * 2) Various objects post updates to Nconfig, which then writen to disk
 *
 */

const logger = require('./Logger');

class Nconfig {
    constructor () {
        this.port = null;
        this.name = null;
        this.description = null;


        this.defaults = {
            port: 8080
        };

        /**
     * Process constructor arguments
     *
     */
        this.fromConstructor = this._setCfgValues;
    }

    /**
   * Set undefined config values with params
   *
   */
    _setCfgValues (port, name, desc) {
        this.port = port;
        this.name = name;
        this.description = desc;
    }

}

module.exports = Nconfig;

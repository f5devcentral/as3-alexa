/**
 * Copyright (c) 2018, F5 Networks, Inc. 
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
const Config = require('./Config');

class Nconfig {
    constructor () {
        this.port = null;
        this.name = null;
        this.description = null;
        this.log = null;


        this.defaults = {
            port: 8080,
            log: Config.DEFAULT_LOG
        };

        /**
     * Process constructor arguments
     *
     */
        this.fromConstructor = this._setCfgValues;
    }

    fromDefaults () {
        const def = this.defaults;
        this._setCfgValues(def.port, null, null, def.log);
    }

    getDefault (value, defaultValue) {
        if (value === null || typeof value === 'undefined') {
            return defaultValue;
        }
        return value;
    }

    /**
   * Set undefined config values with params
   *
   */
    _setCfgValues (port, name, desc, log) {
        this.port = this.getDefault(this.port, port);
        this.name = this.getDefault(this.name, name);
        this.description = this.getDefault(this.desc, desc);
        this.log = this.getDefault(this.log, log);
    }

}

module.exports = Nconfig;

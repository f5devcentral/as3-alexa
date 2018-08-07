/**
 * Copyright (c) 2018, F5 Networks, Inc. 
 */

const path = require('path');
const Config = {};

Config.LOG_LEVEL = 'info';
Config.DEFAULT_LOG = path.join(__dirname, '../log/as3.log');

module.exports = Config;

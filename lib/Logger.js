/**
 * Copyright (c) 2013-2017, F5 Networks, Inc. All rights reserved.
 * No part of this software may be reproduced or transmitted in any
 * form or by any means, electronic or mechanical, for any purpose,
 * without express written permission of F5 Networks, Inc.
 */

/**
 * Based on the Winston logger
 * Returns a singleton logger
 * Local logs are stored to /var/log/appconn.log (default)
 * The format each log entry is : Timestamp Level Message
 * file log levels are :
 *   { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
 * syslog log levels are :
 *   { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7}
 *
 * Syslog transports are also supported.
 */

const mkdirp = require('mkdirp');
const winston = require('winston');

function SingletonLogger () {
    this.logger = new winston.Logger({
        level: 'info',
        transports: [
            new winston.transports.Console({
                name: 'console_log',
                timestamp: function () {
                    const d = new Date();
                    return d.toUTCString(Date.now());
                },
                formatter: function (options) {
                    return `${options.timestamp()} ${options.level.toUpperCase()} ${
                        options.message ? options.message : ''
                    }${options.meta && Object.keys(options.meta).length ? `\n\t${
                        JSON.stringify(options.meta)}` : ''}`;
                }
            })/* ,
      new (winston.transports.File)({
        name: 'file_log',
        filename: '/var/log/app_conn.log',
        json: false,
        maxFiles: 3,
        maxsize: 10000000,
        timestamp: function () {
          const d = new Date();
          return d.toUTCString(Date.now());
        },
        formatter: function (options) {
          return options.timestamp() +' '+ options.level.toUpperCase() +' '+
            (options.message ? options.message : '') +
            (options.meta && Object.keys(options.meta).length ? '\n\t'+
            JSON.stringify(options.meta) : '' );
        }
      })*/
        ]
    });

    this.logger.replaceFileTransport = function (newLogger) {
        this.logger = newLogger;
    };

    this.logger.addTransport = function (fileName) {
        mkdirp.sync(fileName.substring(0, fileName.lastIndexOf('/')));
        this.add(winston.transports.File, {
            name: 'file_log',
            filename: fileName,
            json: false,
            maxFiles: 3,
            maxsize: 10000000,
            //      handleExceptions: true,
            //      humanReadableUnhandledException: true,
            timestamp: function () {
                const d = new Date();
                return d.toUTCString(Date.now());
            },
            formatter: function (options) {
                return `${options.timestamp()} ${options.level.toUpperCase()} ${
                    options.message ? options.message : ''
                }${options.meta && Object.keys(options.meta).length ? `\n\t${
                    JSON.stringify(options.meta)}` : ''}`;
            }
        });
    };
    return this.logger;
}

let log;
const Logger = (function () {
    if (!log) {
        log = new SingletonLogger();
    }
    return log;
}());

module.exports = Logger;

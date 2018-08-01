/**
 * Copyright (c) 2018, F5 Networks, Inc. All rights reserved.
 * No part of this software may be reproduced or transmitted in any
 * form or by any means, electronic or mechanical, for any purpose,
 * without express written permission of F5 Networks, Inc.
 */

/**
 * A Top Level module to instantiate express server with custom configuration
 *
 */

const HttpServer = require('./HttpServer');
const logger = require('./Logger');
const commands = require('commander');
const Nconfig = require('./Nconfig');

process.on('uncaughtException', (err) => {
    logger.error(`AC Proxy received uncaught exception : ${err} ${err.stack}`);
    setTimeout(() => {
        process.exit();
    }, 1000);
});

/**
 * Alexa AS3 Demo Server
 *
 * @param {number} port - The HTTPs Management Port
 */
function Server (port, name, description, log) {
    const cfg = new Nconfig();
    cfg.fromConstructor(port, name, description, log);
    if (cfg.log) {
        logger.addTransport(cfg.log);
    }
    logger.warn('---------------------------------------------------------------------------------------');
    logger.warn(`Server:'${cfg.name}' version: '${require('../package.json').version}' starting on Port:'${port}'`);
    logger.warn('---------------------------------------------------------------------------------------');


    function initialize () {
        return new HttpServer(cfg);
    }

    initialize();
}

// get config from cmd line
if (require.main === module) {
    commands.
    version(require('../package.json').version).
    usage('[options]').
    option('-n, --name <string>', 'The name of the Server name').
    option('-d, --description <string>', 'The description of the Server').
    option('-p, --port <port>', 'The Https Port [8080]', Number).
    parse(process.argv);

    // Start the Server
    new Server(
        commands.port,
        commands.name,
        commands.description,
        commands.log
    );
}
module.exports = Server;

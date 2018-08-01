/**
 * Copyright (c) 2018, F5 Networks, Inc. All rights reserved.
 * No part of this software may be reproduced or transmitted in any
 * form or by any means, electronic or mechanical, for any purpose,
 * without express written permission of F5 Networks, Inc.
 */

/**
 * Express Server to server AS3 Demo App with Alexa support
 */


const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('./Logger');

/**
 * A Simple Express Server
 *
 * @param {Nconfig} cfg - The Server's configuration
 * @return {void}
 */
function HttpServer (cfg) {
    const app = express();


    const _port = cfg.port || 8081;

    app.listen(_port, () => {
        logger.info(`Server listening at ${_port}`);
    });
    // Http body parsing
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json()); // parse application/json
    app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
    app.use(express.static(path.join(__dirname, '../app'))); // set the static files location /public/img will be /img for users
    app.use(function (req, res, next) {
        res.header('Content-Type', 'application/json');
        next();
    });
}

module.exports = HttpServer;

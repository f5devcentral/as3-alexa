/*
 * Copyright 2018. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */
const httpServices = require('./httpServices');
const Utils = require('./utils');



exports.handler = function(event, context, callback) {
    const utils = new Utils();
    console.log('event ====================== ');
    console.log(event); // Contains incoming request data (e.g., query params, headers and more)
    try {
        let nodes = [];
        httpServices.execute('GET_BIGIP_NODES', {}, '35.160.118.96', (err, res, body) => {
            if (err) {
                console.log('Failed to get bigip nodes');
                console.log(err);
                const response = {
                    statusCode: 502,
                    headers: {
                        'x-custom-header' : 'My Header Value',
                        'Access-Control-Allow-Origin' : '*'
                    },
                    body: JSON.stringify({ 'message': 'Server Error: Failed to get bigip nodes' })
                };
                console.log('response: ' + JSON.stringify(response));
                callback(null, response); 
            } else if (res.statusCode === 404) {
                console.log('Failed with 404 status code');
                const response = {
                    statusCode: 404,
                    headers: {
                        'x-custom-header' : 'My Header Value',
                        'Access-Control-Allow-Origin' : '*'
                    },
                    body: JSON.stringify({ 'message': 'Failed with 404 status code' })
                };
                console.log('response: ' + JSON.stringify(response));
                callback(null, response);               
                
                
                
            } else if (res.statusCode === 200) {
                let data = JSON.parse(body);
                //let data = nodes;
                // Get Big IP servers
                if(data && data.items) {
                    nodes = utils.getServers(data.items);
                }
                 
                httpServices.execute('GET_DECLARE', {}, '35.160.118.96', (err, res, body) => {
                   
                    if (err) {
                        console.log('Failed to get Declaration');
                        console.log(err);
                        const response = {
                            statusCode: 502,
                            headers: {
                                'x-custom-header' : 'My Header Value',
                                'Access-Control-Allow-Origin' : '*'
                            },
                            body: JSON.stringify({ 'message': 'Server Error: Failed to get Declaration' })
                        };
                        console.log('response: ' + JSON.stringify(response));
                        callback(null, response); 
                     
                    } else if (res.statusCode === 404) {
                        console.log('Failed with 404 status code');
                        const response = {
                            statusCode: 404,
                            headers: {
                                'x-custom-header' : 'My Header Value',
                                'Access-Control-Allow-Origin' : '*'
                            },
                            body: JSON.stringify({ 'message': 'Failed with 404 status code' })
                        };
                        console.log('response: ' + JSON.stringify(response));
                        callback(null, response); 
                    } else if (res.statusCode === 200 || res.statusCode === 204) {
                        let result = {};
                        if(body) {
                            result = utils.parser(JSON.parse(body), nodes);

                        } else {
                            result = utils.parser({}, nodes);
                      
                        }

                     
                        const response = {
                            statusCode: 200,
                            headers: {
                                'x-custom-header' : 'My Header Value',
                                'Access-Control-Allow-Origin' : '*'
                            },
                            body: JSON.stringify({ 'message': result })
                        };
                        console.log('response: ' + JSON.stringify(response));
                        callback(null, response);                  
                     
                    }
                });   
            }
               
        });
                 
         
    } catch (err) {
        callback(err.message);
    } 
};
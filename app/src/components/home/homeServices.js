/*
 * Copyright (c) 2018, F5 Networks, Inc. All rights reserved.
 * No part of this software may be reproduced or transmitted in any
 * form or by any means, electronic or mechanical, for any purpose,
 * without express written permission of F5 Networks, Inc.
 */
(function() {
    angular.module('homeServices', []).
    factory('GraphService', GraphService);

    function GraphService($resource) {

        const graph = {};

        // Process Graph data

        graph.processData = (data) => {
            const tenants = data.message.tenants;
            const res = {
                nodes: [],
                links: []
            };

            // For now manually adding BIG IP
            res.nodes.push({
                id: 'BIG IP',
                group: 50,
                type: 'bigip',
                status: 'online'
            });

            // Create links between Big IP and tenants
            for (let i = 0; i < tenants.length; i++) {
                res.nodes.push({
                    id: tenants[i].name,
                    group: 40,
                    type: 'tenant',
                    status: 'online' // All tenants show 'online' status
                });

                // Create links between Big IP and proxies
                const bigipLink = {
                    source: 'BIG IP',
                    target: tenants[i].name
                };
                res.links.push(bigipLink);


                const applications = tenants[i].applications;
                for (let k = 0; k < applications.length; k++) {
                    res.nodes.push({
                        id: `${tenants[i].name}/${applications[k].name}`,
                        group: 30,
                        type: 'application',
                        status: 'online' // All applications show 'online' status
                    });

                    // Create links between Tenant and applications
                    const appLink = {
                        source: tenants[i].name,
                        target: `${tenants[i].name}/${applications[k].name}`
                    };
                    res.links.push(appLink);


                    const services = applications[k].services;
                    for (let m = 0; m < services.length; m++) {

                        res.nodes.push({
                            id: `${tenants[i].name}/${applications[k].name}/${services[m].name}`,
                            group: 20,
                            type: 'service',
                            status: 'online' // All applications show 'online' status
                        });


                        // Create links between Application and Service
                        const serviceLink = {
                            source: `${tenants[i].name}/${applications[k].name}`,
                            target: `${tenants[i].name}/${applications[k].name}/${services[m].name}`
                        };
                        res.links.push(serviceLink);




                        // Build Virtual Server and Pool Members
                        const virtualServers = services[m].virtualServers;
                        const pool = services[m].pool;
                        let poolMembers = '';
                        if(pool) {
                            poolMembers = services[m].pool.poolMembers;
                        }

                        // Add pool node
                        if (pool) {
                            res.nodes.push({
                                id: `${tenants[i].name}/${applications[k].name}/${services[m].name}/${pool.name}`,
                                group: 10,
                                type: 'pool',
                                status: 'online' // All pool show 'online' status
                            });
                        }

                        for (let p = 0; p < virtualServers.length; p++) {
                            res.nodes.push({
                                id: `${tenants[i].name}/${applications[k].name}/${services[m].name}/${virtualServers[p].name}`,
                                group: 15,
                                type: 'virtualServer',
                                status: 'online' // All virtual show 'online' status
                            });

                            // Create links between Service and Virtual Server
                            const vsLink = {
                                source: `${tenants[i].name}/${applications[k].name}/${services[m].name}`,
                                target: `${tenants[i].name}/${applications[k].name}/${services[m].name}/${virtualServers[p].name}`
                            };
                            res.links.push(vsLink);

                            // Build link between virtual servers and pool
                            if(pool) {
                                const poolLink = {
                                    source: `${tenants[i].name}/${applications[k].name}/${services[m].name}/${pool.name}`,
                                    target: `${tenants[i].name}/${applications[k].name}/${services[m].name}/${virtualServers[p].name}`
                                };
                                res.links.push(poolLink);
                            }
                        }
                        if (poolMembers && poolMembers.length > 0) {
                            for (let q = 0; q < poolMembers.length; q++) {
                                res.nodes.push({
                                    id: poolMembers[q].name + q,
                                    group: 5,
                                    type: 'poolMember',
                                    status: poolMembers[q].status, // Pool Member show 'online' status for now
                                    ip: poolMembers[q].name
                                });

                                // Create links between Pool and Pool Members
                                const memberLink = {
                                    source: `${tenants[i].name}/${applications[k].name}/${services[m].name}/${pool.name}`,
                                    target: poolMembers[q].name + q
                                };
                                res.links.push(memberLink);

                            }
                        }
                    }
                }
            }
            console.log('res ======================== ');
            console.log(res);
            return { list: [res] };
        };

        //graph.graphResource = $resource('data/rawGraph.json', {}, {
        graph.graphResource = $resource('https://6e3tjgtl1a.execute-api.us-west-2.amazonaws.com/default/as3Services', {}, {
            query: {
                method: 'GET',
                isArray: false
            },
            headers: { Authorization: `Basic ${window.btoa(`${'admin'}:${'admin'}`)}` }

        });

        return graph;
    }

}());
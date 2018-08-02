/*
 * Copyright 2018. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */
class Utils {
   constructor () {
       this.result = { isFind: false };
       this.finalObj = {tenants: []};
       this.tenantCounter = 0;
       this.appCounter = 0;
       this.classCounter = 0;
       this.poolCounter = 0;
   }
   /**
   * Process AWS Instances
   * @param {array} Instances array
   * @returns {response} Processed array
   */
    parser (decl, nodes) {
        const self = this;
        if (Array.isArray(decl)) {
            for (let i = 0, len = decl.length; i < len; i++) {
                let nested = self.parser(decl[i], nodes);
                if (nested.isFind) return nested;
            }
        } else {
            if (typeof decl !== 'object') return { isFind: false };
            for (let i in decl) {
    
                if (typeof decl[i] === 'object' && !Array.isArray(decl[i])) {
                    // Add parent name
                    decl[i].parent = i;
                }
                if (decl[i].class === 'Tenant') {
                    self.tenantCounter++;
                    self.appCounter = 0;
                    let tenant = {
                        name: i,
                        applications: []
                    };
                    self.finalObj.tenants.push(tenant);
                }
                if (decl[i].class === 'Application') {
                    self.appCounter++;
                    self.classCounter = 0;
                    let app = {
                        name: i,
                        services: []
                    };
                    self.finalObj.tenants[self.tenantCounter - 1].applications.push(app);
                }
                if (self.serviceType(decl[i].class) === true) {
                    self.classCounter++;
                    self.finalObj.tenants[self.tenantCounter - 1].applications[self.appCounter - 1].services[self.classCounter - 1] = {
                        name: decl[i].parent
                    };
                }
                if (i === 'virtualAddresses') {
                    //finalObj.tenants[tenantCounter - 1].applications[appCounter - 1].virtualServers[classCounter - 1].virtualAddresses = decl[i];
                    // Also process them as virtual servers
                    let virtualServers = [];
                    let service = self.finalObj.tenants[self.tenantCounter - 1].applications[self.appCounter - 1].services[self.classCounter - 1].name;
                    if (decl[i].length > 1) {
                        for (let k = 0; k < decl[i].length; k++) {
                            let detail = {};
                            if (k > 0) {
                                detail.name = service + '-' + k;
                                detail.virtualAddress = decl[i][k];
                            } else {
                                detail.name = service;
                                detail.virtualAddress = decl[i][k];
                            }
                            virtualServers.push(detail);
                        }
                    } else {
                        let detail = {
                            name: service,
                            virtualAddress: decl[i][0]
                        };
                        virtualServers.push(detail);
                    }
                    self.finalObj.tenants[self.tenantCounter - 1].applications[self.appCounter - 1].services[self.classCounter - 1].virtualServers = virtualServers;
                }
                if (i === 'virtualPort') {
                    self.finalObj.tenants[self.tenantCounter - 1].applications[self.appCounter - 1].services[self.classCounter - 1].virtualPort = decl[i];
                }
                if (decl[i].class === 'Pool') {
                    self.poolCounter++;
                    let pool = {
                        name: i,
                        poolMembers: []
                    };
                    self.finalObj.tenants[self.tenantCounter - 1].applications[self.appCounter - 1].services[self.classCounter - 1].pool = pool;
                }
                if (i === 'servicePort') {
                    self.finalObj.tenants[self.tenantCounter - 1].applications[self.appCounter - 1].services[self.classCounter - 1].servicePort = decl[i];
                }
                if (i === 'serverAddresses') {
                    let servers = decl[i];
                    let servicePort = self.finalObj.tenants[self.tenantCounter - 1].applications[self.appCounter - 1].services[self.classCounter - 1].servicePort;
                    const poolMembers = self.finalObj.tenants[self.tenantCounter - 1].applications[self.appCounter - 1].services[self.classCounter - 1].pool.poolMembers;
                    for (let j = 0; j < servers.length; j++) {
                        let newServer =  JSON.parse(JSON.stringify(self.isServer(nodes, servers[j])));
                        if(newServer) {
                           newServer.servicePort = servicePort; 
                           poolMembers.push(newServer);
                        } else {
                           poolMembers.push({
                              name: servers[j],
                              status: 'online', // Default to online
                              serverAddress: servers[j],
                              servicePort: servicePort
                           });
                        }
                    }
                    delete self.finalObj.tenants[self.tenantCounter - 1].applications[self.appCounter - 1].services[self.classCounter - 1].servicePort;
                }
                self.parser(decl[i], nodes);
            }
        }
        return self.finalObj;
    }
      
        serviceType (vs) {
            const vsTypes = [ "Service_HTTPS", "Service_HTTP", "Service_TCP", "Service_UDP", "Service_L4"];
            if(vsTypes.indexOf(vs) !== -1) {
                return true;
            } 
            return false;
        }
            
        getServers (nodes) {
            const servers = [];
            if(nodes && nodes.length > 0) {
                for (let i = 0; i < nodes.length; i++) {
                    let server = {
                        name: nodes[i].name,
                        serverAddress: nodes[i].address
                    };
                    if (nodes[i].session === 'user-enabled' && (nodes[i].state === 'unchecked' || nodes[i].state === 'user-up')) {
                        server.status = 'online';
                    }
                    if (nodes[i].session === 'user-disabled' && (nodes[i].state === 'unchecked' || nodes[i].state === 'user-down')) {
                        server.status = 'offline';
                    }
                    servers.push(server);
                }            
            }
        return servers;
    }
    
    isServer (nodes, node) {
        if(nodes && nodes.length > 0) {
             for (let i = 0; i < nodes.length; i++) {
                if(node === nodes[i].serverAddress) {
                    return nodes[i];
                }
            }           
        }
        return null;
    }

}


module.exports = Utils;

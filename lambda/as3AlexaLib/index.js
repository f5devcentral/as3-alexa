/**
 * Copyright (c) 2018, F5 Networks, Inc. 
 */

const AWS = require('aws-sdk');
const dns = require('dns');
const hs = require('./httpServices');
const Config = require('./Config');
const DeclarationFactory = require('./DeclarationFactory');
//const Alexa = require('alexa-sdk'); 

class AS3AlexaLib {
    static discover(callback) {
        const metadata = new AWS.MetadataService();
        const ec2Options = {apiVersion: '2016-11-15'};
        const ec2 = new AWS.EC2(ec2Options);
        const params = {DryRun: false};
        console.log(process.env.AWS_REGION);
        const lambda = new AWS.Lambda({
           region: 'us-west-2'
        });
        console.log(process.env);
        console.log(lambda);
        ec2.describeInstances(params, (err, data) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data);
            }
        });
    }
    
    static getMembers(appName, callback) {
        var request = {};
        var message = null;
        hs.execute('GET', request, Config.host, (err, res, body) => {
            if (err || res.statusCode !== 200) {
                if (!err) {
                    message = null;
                } else {
                    message = `${(JSON.parse(body)).results[0].message}`;
                }
                callback(message, null);
            } else {
                var length = 0;
                var tenant = `Tenant_${appName}`;
                var app = `App_${appName}`;
                var service = `Service_${appName}`;
                var pool = `Pool_${appName}`;
                var servers = [];
                
                if (!(JSON.parse(body))[tenant] ||
                    !(JSON.parse(body))[tenant][app] ||
                    !(JSON.parse(body))[tenant][app][pool]) {
                        setTimeout(() => {
                            callback(true, null, null, null);}, 5000);
                        return;
                    }
                if ((JSON.parse(body))[tenant][app][pool].members) {
                    servers = (JSON.parse(body))[tenant][app][pool].members[0].serverAddresses;
                }
                var virtuals = (JSON.parse(body))[tenant][app][service].virtualAddresses;

                if (!servers) {
                    length = 0;
                } else {
                    length = servers.length;
                }
                if (!servers) {
                    servers = [];
                }
                setTimeout(() => {
                    callback(null, length, servers, virtuals);}, 5000);
            }
        });
    }

    static handleCreate(intent, state, attributes, callback) {
        if ((state === 'STARTED' && (!attributes || attributes && !attributes.appname_param)) || 
            (state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'DENIED')) {
            callback(null, {
                "version": "1.0",
                "sessionAttributes": attributes,
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ElicitSlot",
                        "slotToElicit": "appname_param",
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `What is the name of the service?`
                    },
                    "shouldEndSession": false
                }
            });
        }  else if (state === 'IN_PROGRESS' && (intent.slots.appname_param.confirmationStatus === 'NONE')) {
           callback(null, {
               "version": "1.0",
               "sessionAttributes": attributes,
               "response": {
                    "directives": [
                    {
                        "type": "Dialog.ConfirmSlot",
                        "slotToConfirm": "appname_param",
                        "updatedIntent": {
                            "name": `create`,
                            "confirmationStatus": "NONE",
                            "slots": {
                                "appname_param": {
                                    "name": "appname_param",
                                    "value": intent.slots.appname_param.value,
                                    "confirmationStatus": "NONE"
                                },
                                "url_param": {
                                    "name": "url_param",
                                    "confirmationStatus": "NONE"
                                }
                            }
                        }
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Is service ${intent.slots.appname_param.value} correct?`
                    },
                    "shouldEndSession": false
                }
            });
        }   else if (state === 'STARTED' && (attributes && attributes.appname_param) || 
            state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'CONFIRMED' &&
            (intent.slots.url_param.confirmationStatus === 'DENIED' || !intent.slots.url_param.value)) {
            var newAttributes = {};
            if (attributes) {
                if (attributes.appname_param) {
                    newAttributes.appname_param = attributes.appname_param;
                } else {
                    attributes.appname_param = intent.slots.appname_param.value;
                    newAttributes = attributes;
                }
            } else {
                newAttributes.appname_param = intent.slots.appname_param.value;
            }

            callback( null, {
                "version": "1.0",
                "sessionAttributes": newAttributes,
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ElicitSlot",
                        "slotToElicit": "url_param",
                        "updatedIntent": {
                            "name": `create`,
                            "confirmationStatus": "NONE",
                            "slots": {
                                "appname_param": {
                                    "name": "appname_param",
                                    "value": newAttributes.appname_param,
                                    "confirmationStatus": "CONFIRMED"
                                },
                                "url_param": {
                                    "name": "url_param",
                                    "confirmationStatus": "NONE"
                                }
                            }
                        }
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `What is the URL of the service?`
                    },
                    "shouldEndSession": false
                }
            });
        }  else if (state === 'IN_PROGRESS' && (intent.slots.url_param.confirmationStatus === 'NONE')) {
           callback(null, {
               "version": "1.0",
               "sessionAttributes": attributes,
               "response": {
                    "directives": [
                    {
                        "type": "Dialog.ConfirmSlot",
                        "slotToConfirm": "url_param",
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Is ${intent.slots.url_param.value} correct?`
                    },
                    "shouldEndSession": false
                }
            });
        }   else if (state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'CONFIRMED' &&
                intent.slots.url_param.confirmationStatus === 'CONFIRMED') {
            newAttributes = attributes;
            if (attributes) {
                attributes.appname_param = intent.slots.appname_param.value;
                newAttributes = attributes;
            } else {
              newAttributes.appname_param = intent.slots.appname_param.value;
            }
            var domain = intent.slots.url_param.value.split('dot')[1];
            if (!domain) {
                const array = intent.slots.url_param.value.split('.');
                console.log(array);
                domain = array[array.length-2];
            }
            domain = domain.trim();
            
            dns.lookup(`www.${domain}.com`, function(err, result) {
                if (err) {
                    callback(null, {
                       "version": "1.0",
                       "sessionAttributes": attributes,
                       "response": {
                            "directives": [
                            {
                                "type": "Dialog.ConfirmSlot",
                                "slotToConfirm": "url_param"
                            }],
                           "outputSpeech": {
                              "type": "PlainText",
                              "text": `DNS lookup of ${intent.slots.url_param.value} was not successful`
                            },
                            "shouldEndSession": false
                        }
                    });
                    return;
                } else  {
                    const request = DeclarationFactory.createDeclaration({type:'create', name: intent.slots.appname_param.value, ip: result});
                    hs.execute('CREATE', request, Config.host, (err, res, body) => {
                        var responseObj = {};
                        var message = null;
                        if (err || res.statusCode !== 200) {
                            if (!err) {
                                message = null;
                            } else {
                                message = `${(JSON.parse(body)).results[0].message}`;
                            }
                            responseObj = {
                                "version": "1.0",
                                "sessionAttributes": {},
                                "response": {
                                    "outputSpeech": {
                                        "type": "PlainText",
                                        "text": `Application Services experienced an error creating AS3 resources.  Error message: ${message}`
                                    },
                                    "shouldEndSession": true
                                }
                            };
                        } else {
                            responseObj = {
                                "version": "1.0",
                                "sessionAttributes": {},
                                "response": {
                                    "outputSpeech": {
                                        "type": "PlainText",
                                        "text": `Application Services completed creating service ${intent.slots.appname_param.value} with URL ${intent.slots.url_param.value}. Success Message: ${(JSON.parse(body)).results[0].message}`
                                    },
                                    "shouldEndSession": false
                                }
                            };                    
                        }
                        callback (null, responseObj);
                    });
                }
            });
        }
    }
    
    static handleDeleteService(intent, state, attributes, callback) {
        if ((state === 'STARTED' && (!attributes || attributes && !attributes.appname_param)) || 
            (state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'DENIED')) {
            callback(null, {
                "version": "1.0",
                "sessionAttributes": attributes,
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ElicitSlot",
                        "slotToElicit": "appname_param",
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `What is the name of the Service to delete?`
                    },
                    "shouldEndSession": false
                }
            });
        }  else if (state === 'IN_PROGRESS' && (intent.slots.appname_param.confirmationStatus === 'NONE')) {
           callback(null, {
               "version": "1.0",
               "sessionAttributes": attributes,
               "response": {
                    "directives": [
                    {
                        "type": "Dialog.ConfirmSlot",
                        "slotToConfirm": "appname_param",
                        "updatedIntent": {
                            "name": `deleteService`,
                            "confirmationStatus": "NONE",
                            "slots": {
                                "appname_param": {
                                    "name": "appname_param",
                                    "value": intent.slots.appname_param.value,
                                    "confirmationStatus": "NONE"
                                }
                            }
                        }
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Is service ${intent.slots.appname_param.value} correct?`
                    },
                    "shouldEndSession": false
                }
            });
        }   else if (state === 'STARTED' && (attributes && attributes.appname_param) || 
            state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'CONFIRMED') {
            var newAttributes = {};
            if (attributes) {
                if (attributes.appname_param) {
                    newAttributes.appname_param = attributes.appname_param;
                } else {
                    attributes.appname_param = intent.slots.appname_param.value;
                    newAttributes = attributes;
                }
            } else {
                newAttributes.appname_param = intent.slots.appname_param.value;
            }
            hs.execute('DELETE_SERVICE', {tenant: intent.slots.appname_param.value}, Config.host, (err, res, body) => {
                var responseObj = {};
                var message = null;
                if (err || res.statusCode !== 200) {
                    if (err) {
                        message = null;
                    } else {
                        message = `${(JSON.parse(body)).results[0].message}`;
                    }
                    responseObj = {
                        "version": "1.0",
                        "sessionAttributes": newAttributes,
                        "response": {
                            "outputSpeech": {
                                "type": "PlainText",
                                "text": `Service ${newAttributes.appname_param} delete operation failed. Message: ${message}`
                            },
                            "shouldEndSession": false
                        }
                    };
                } else {
                    message = `${(JSON.parse(body)).results[0].message}`;
                    responseObj = {
                        "version": "1.0",
                        "sessionAttributes": {},
                        "response": {
                            "outputSpeech": {
                                "type": "PlainText",
                                "text": `Service ${newAttributes.appname_param} successfully deleted. Message: ${message}`
                            },
                            "shouldEndSession": false
                        }
                    };
                }
                callback(null, responseObj);
            });
        }
    }

    static handleDeleteAll(intent, state, attributes, callback) {
        if (state === 'STARTED' || state === 'IN_PROGRESS' && intent.slots.confirm_param.confirmationStatus === 'DENIED') {
            callback(null, {
                "version": "1.0",
                "sessionAttributes": attributes,
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ElicitSlot",
                        "slotToElicit": "confirm_param",
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Would you like Application Services to delete ALL AS3 resources?`
                    },
                    "shouldEndSession": false
                }
            });
        }  else if (state === 'IN_PROGRESS' && (intent.slots.confirm_param.confirmationStatus === 'NONE')) {
           if (intent.slots.confirm_param.value === 'yes') {
                callback(null, {
                   "version": "1.0",
                   "sessionAttributes": attributes,
                   "response": {
                        "directives": [
                        {
                            "type": "Dialog.ConfirmSlot",
                            "slotToConfirm": "confirm_param",
                        }],
                       "outputSpeech": {
                          "type": "PlainText",
                          "text": `Are you certain you wish Application Services to delete all AS3 resources?`
                        },
                        "shouldEndSession": false
                    }
                });
           } else {
                callback(null, {
                   "version": "1.0",
                   "sessionAttributes": attributes,
                   "response": {
                       "outputSpeech": {
                          "type": "PlainText",
                          "text": `Aborting delete All - exiting session`
                        },
                        "shouldEndSession": true
                    }
                });                       
           }
        }   else if (state === 'IN_PROGRESS' && intent.slots.confirm_param.confirmationStatus === 'CONFIRMED') {
            hs.execute('DELETE_DECLARE', {}, Config.host, (err, res, body) => {
                var responseObj = {};
                if (err || res.statusCode !== 200) {
                    responseObj = {
                        "version": "1.0",
                        "sessionAttributes": {},
                        "response": {
                            "outputSpeech": {
                                "type": "PlainText",
                                "text": `Application Services experienced an error deleteing AS3 resources.  Error message: ${(JSON.parse(body)).results[0].message}`
                            },
                            "shouldEndSession": true
                        }
                    };
                } else {
                    responseObj = {
                        "version": "1.0",
                        "sessionAttributes": {},
                        "response": {
                            "outputSpeech": {
                                "type": "PlainText",
                                "text": `Application Services deleted all AS3 resources. Success Message: ${(JSON.parse(body)).results[0].message}`
                            },
                            "shouldEndSession": true
                        }
                    };                    
                }
                callback (null, responseObj);
            });
        }
    }

    static handleDiscover(intent, state, attributes, callback) {
        if ((state === 'STARTED' && (!attributes || attributes && !attributes.appname_param)) || 
            (state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'DENIED')) {
            callback(null, {
                "version": "1.0",
                "sessionAttributes": attributes,
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ElicitSlot",
                        "slotToElicit": "appname_param",
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `What is the name of the service to add discovered servers to?`
                    },
                    "shouldEndSession": false
                }
            });
        }  else if (state === 'IN_PROGRESS' && (intent.slots.appname_param.confirmationStatus === 'NONE')) {
           callback(null, {
               "version": "1.0",
               "sessionAttributes": attributes,
               "response": {
                    "directives": [
                    {
                        "type": "Dialog.ConfirmSlot",
                        "slotToConfirm": "appname_param",
                        "updatedIntent": {
                            "name": `discover`,
                            "confirmationStatus": "NONE",
                            "slots": {
                                "appname_param": {
                                    "name": "appname_param",
                                    "value": intent.slots.appname_param.value,
                                    "confirmationStatus": "NONE"
                                },
                                "tag_param": {
                                    "name": "tag_param",
                                    "confirmationStatus": "NONE"
                                }
                            }
                        }
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Is service ${intent.slots.appname_param.value} correct?`
                    },
                    "shouldEndSession": false
                }
            });
        }   else if (state === 'STARTED' && (attributes && attributes.appname_param) || 
            state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'CONFIRMED' &&
            (intent.slots.tag_param.confirmationStatus === 'DENIED' || !intent.slots.tag_param.value)) {
            var newAttributes = {};
            if (attributes) {
                if (attributes.appname_param) {
                    newAttributes.appname_param = attributes.appname_param;
                } else {
                    attributes.appname_param = intent.slots.appname_param.value;
                    newAttributes = attributes;
                }
            } else {
                newAttributes.appname_param = intent.slots.appname_param.value;
            }

            callback(null, {
                "version": "1.0",
                "sessionAttributes": newAttributes,
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ElicitSlot",
                        "slotToElicit": "tag_param",
                        "updatedIntent": {
                            "name": `discover`,
                            "confirmationStatus": "NONE",
                            "slots": {
                                "appname_param": {
                                    "name": "appname_param",
                                    "value": newAttributes.appname_param,
                                    "confirmationStatus": "CONFIRMED"
                                },
                                "tag_param": {
                                    "name": "tag_param",
                                    "confirmationStatus": "NONE"
                                }
                            }
                        }
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `What is the server tag value to discover?`
                    },
                    "shouldEndSession": false
                }
            });
        }  else if (state === 'IN_PROGRESS' && (intent.slots.tag_param.confirmationStatus === 'NONE')) {
           callback(null, {
               "version": "1.0",
               "sessionAttributes": attributes,
               "response": {
                    "directives": [
                    {
                        "type": "Dialog.ConfirmSlot",
                        "slotToConfirm": "tag_param",
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Is ${intent.slots.tag_param.value} correct?`
                    },
                    "shouldEndSession": false
                }
            });
        }   else if (state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'CONFIRMED' &&
                intent.slots.tag_param.confirmationStatus === 'CONFIRMED') {
            var newAttributes = attributes;
            if (attributes) {
                attributes.appname_param = intent.slots.appname_param.value;
                newAttributes = attributes;
            } else {
              newAttributes.appname_param = intent.slots.appname_param.value;
            }

            AS3AlexaLib.discover((err, instancesData) => {  
                var ips = [];
                if (err) {
                    console.log(err);
                } else {
                    instancesData.Reservations.forEach(reservation => {
                        reservation.Instances.forEach(instance => {
                            instance.Tags.forEach(tag => {
                                if ((tag.Key === 'App') && tag.Value.toLowerCase() === intent.slots.tag_param.value.toLowerCase()) {
                                    ips.push(instance.PrivateIpAddress);
                                }
                            });
                        });
                    });
                }

                if (ips.length !== 0) {
                    var request = DeclarationFactory.createDeclaration({type:'addMember', name: intent.slots.appname_param.value, ip: ips});  

                    hs.execute('ADD', request, Config.host, (err, res, body) => {
                        var responseObj = {};
                        var message = null;
                        if (err || res.statusCode !== 200) {
                            request = DeclarationFactory.createDeclaration({type:'addPool', name: intent.slots.appname_param.value, ip: ips});  

                            hs.execute('ADD', request, Config.host, (err, res, body) => {
                                console.log(JSON.parse(body), null, 3);
                                if (err) {
                                    message = null;
                                } else {
                                    message = `${(JSON.parse(body)).message}`;
                                    console.log(body);
                                }
                                if (err || res.statusCode !== 200) {
                                    responseObj = {
                                        "version": "1.0",
                                        "sessionAttributes": {},
                                        "response": {
                                            "outputSpeech": {
                                                "type": "PlainText",
                                                "text": `Application Services experienced an error creating AS3 resources.  Error message: ${message}`
                                            },
                                            "shouldEndSession": false
                                        }
                                    };
                                } else {
                                    responseObj = {
                                       "version": "1.0",
                                       "sessionAttributes": newAttributes,
                                       "response": {
                                           "outputSpeech": {
                                              "type": "PlainText",
                                              "text": `Application Services successfully discovered ${ips.length} servers with tag ${intent.slots.tag_param.value} and deployed to service ${intent.slots.appname_param.value} `
                                            },
                                            "shouldEndSession": false
                                        }
                                    };
                                }
                                callback(null, responseObj);
                            });
                        } else {
                            responseObj = {
                               "version": "1.0",
                               "sessionAttributes": newAttributes,
                               "response": {
                                   "outputSpeech": {
                                      "type": "PlainText",
                                      "text": `Application Services successfully discovered ${ips.length} servers with tag ${intent.slots.tag_param.value} and deployed to service ${intent.slots.appname_param.value} `
                                    },
                                    "shouldEndSession": false
                                }
                            };
                            callback(null, responseObj);
                        }
                    });
                } else {
                    callback(null, {
                       "version": "1.0",
                       "sessionAttributes": newAttributes,
                       "response": {
                           "outputSpeech": {
                              "type": "PlainText",
                              "text": `Application Services could not discover any servers tagged with ${intent.slots.tag_param.value} : `
                            },
                            "shouldEndSession": false
                        }                        
                    });
                }
            });
        }
    }

    static handleDiscoverBrief(intent, state, attributes, callback) {
        if ((state === 'STARTED' || state === 'IN_PROGRESS') && intent.slots.details_param.confirmationStatus === 'NONE') {
            var tag = ((intent.slots.details_param.value).split(" "))[0];
            var service = ((intent.slots.details_param.value).split('application '))[1];
            tag = tag.trim();

            if (!service) {
                callback(null, {
                    "version": "1.0",
                    "sessionAttributes": {},
                    "response": {
                        "directives": [
                        {
                            "type": "Dialog.ElicitSlot",
                            "slotToElicit": "details_param"
                        }],
                       "outputSpeech": {
                          "type": "PlainText",
                          "text": `Request not complete: Please describe the discover request using the following format: state the name of tag ollowed by application...  An example would be: chaos... to application agility... `
                        },
                        "shouldEndSession": true
                    }
                });                
            }
            AS3AlexaLib.getMembers(service, (err, numberOfServers, servers, virtuals) => {
                if (err) {
                    callback(null, {
                        "version": "1.0",
                        "sessionAttributes": {},
                        "response": {
                            "directives": [
                            {
                                "type": "Dialog.ElicitSlot",
                                "slotToElicit": "details_param"
                            }],
                           "outputSpeech": {
                              "type": "PlainText",
                              "text": `Service ${service} not found: Please describe the discover request using the following format: state the name of service followed by the tag...  An example would be: widget... with tag... chaos`
                            },
                            "shouldEndSession": true
                        }
                    });                    
                } else {
                    AS3AlexaLib.discover((err, instancesData) => {  
                        var ips = [];
                        if (err) {
                            console.log(err);
                        } else {
                            instancesData.Reservations.forEach(reservation => {
                                reservation.Instances.forEach(instance => {
                                    instance.Tags.forEach((instanceTag) => {
                                        if ((instanceTag.Key === 'App') && instanceTag.Value.toLowerCase() === tag.toString().toLowerCase()) {
                                            ips.push(instance.PrivateIpAddress);
                                        }
                                    });
                                });
                            });
                        }
                        ips.forEach((server) => {
                            if (!servers.includes(server)) {
                                servers.push(server);
                            }
                        });
                        var request = DeclarationFactory.createDeclaration({type:'createWithMembers', name: service, ip: virtuals, ips: servers});
                        hs.execute('CREATE', request, Config.host, (err, res, body) => {   
                            var message = null;
                            var responseObj = {};
                            if (err || res.statusCode > 299) {
                                if (err) {
                                    message = null;
                                } else {
                                    if ((JSON.parse(body)).results) {
                                        message = (JSON.parse(body)).results[0].message;
                                    } else {
                                        message = JSON.stringify(JSON.parse(body), null, 3);
                                    }
                                }
                                responseObj = {
                                    "version": "1.0",
                                    "sessionAttributes": {},
                                    "response": {
                                        "outputSpeech": {
                                            "type": "PlainText",
                                            "text": `Application Services experienced an error creating AS3 resources to existing pool. Error message: ${message}`
                                        },
                                        "shouldEndSession": true
                                    }
                                };                                
                            } else {
                                responseObj = {
                                   "version": "1.0",
                                   "sessionAttributes": {},
                                   "response": {
                                       "outputSpeech": {
                                            "type": "PlainText",
                                            "text": `Application Services discovered and added ${ips.length} servers to application ${service}`
                                        },
                                        "shouldEndSession": true
                                    }
                                };
                            }
                            callback(null, responseObj);                                
                        });
                    });
                }
            });
        }
    }


    static handleHealth(intent, state, attributes, callback) {
        if ((state === 'STARTED' && (!attributes || attributes && !attributes.appname_param)) || 
            (state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'DENIED')) {
            callback(null, {
                "version": "1.0",
                "sessionAttributes": {}, //appname_param: intent.slots.appname_param.name},
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ElicitSlot",
                        "slotToElicit": "appname_param"
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `What is the name of the service to report the health of?`
                    },
                    "shouldEndSession": false
                }
            });
        }  else if (state === 'IN_PROGRESS' && (intent.slots.appname_param.confirmationStatus === 'NONE')) {
           callback(null, {
               "version": "1.0",
               "sessionAttributes": attributes,
               "response": {
                    "directives": [
                    {
                        "type": "Dialog.ConfirmSlot",
                        "slotToConfirm": "appname_param"
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Is application name ${intent.slots.appname_param.value} correct?`
                    },
                    "shouldEndSession": false
                }
            });            
        }   else if (state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'CONFIRMED') {
            var newAttributes = {};
            if (attributes) {
                attributes.appname_param = intent.slots.appname_param.value;
                newAttributes = attributes;
            } else {
              newAttributes.appname_param = intent.slots.appname_param.value;
            }
            callback(null, {
               "version": "1.0",
               "sessionAttributes": newAttributes,
               "response": {
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Reporting server health of ${intent.slots.appname_param.value}: `
                    },
                    "shouldEndSession": false
                }
            });                        
        } else {
            callback(null, {
               "version": "1.0",
               "sessionAttributes": newAttributes,
               "response": {
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Reporting server health of ${attributes.appname_param}: `
                    },
                    "shouldEndSession": false
                }
            });                                    
        }
    }

    static handleList(intent, state, attributes, callback) {
        if ((state === 'STARTED' && (!attributes || attributes && !attributes.appname_param)) || 
            (state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'DENIED')) {
            callback( null, {
                "version": "1.0",
                "sessionAttributes": attributes,
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ElicitSlot",
                        "slotToElicit": "appname_param",
                        "updatedIntent": {
                            "name": "list",
                            "confirmationStatus": "NONE",
                            "slots": {
                                "appname_param": {
                                    "name": "appname_param",
                                    "value": "appname_param",
                                    "confirmationStatus": "NONE"
                                }
                            }

                        }
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `What is the name of the service to report servers of?`
                    },
                    "shouldEndSession": false
                }
            });
        }  else if (state === 'IN_PROGRESS' && (intent.slots.appname_param.confirmationStatus === 'NONE')) {
           callback(null, {
               "version": "1.0",
               "sessionAttributes": attributes,
               "response": {
                    "directives": [
                    {
                        "type": "Dialog.ConfirmSlot",
                        "slotToConfirm": "appname_param",
                        "updatedIntent": {
                            "name": "list",
                            "confirmationStatus": "NONE",
                            "slots": {
                                "appname_param": {
                                    "name": "appname_param",
                                    "value": intent.slots.appname_param.value,
                                    "confirmationStatus": "NONE"
                                }
                            }
                        }
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Is application name ${intent.slots.appname_param.value} correct?`
                    },
                    "shouldEndSession": false
                }
            });            
        }   else if (state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'CONFIRMED') {
            var newAttributes = {};
            if (attributes) {
                attributes.appname_param = intent.slots.appname_param.value;
                newAttributes = attributes;
            } else {
              newAttributes.appname_param = intent.slots.appname_param.value;
            }
            callback(null, {
               "version": "1.0",
               "sessionAttributes": newAttributes,
               "response": {
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Service ${intent.slots.appname_param.value} includes the following servers: `
                    },
                    "shouldEndSession": false
                }
            });                        
        } else {
            callback(null, {
               "version": "1.0",
               "sessionAttributes": newAttributes,
               "response": {
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Service ${attributes.appname_param} includes the following servers: `
                    },
                    "shouldEndSession": false
                }
            });                                    
        }
    }

    static handleServer(intent, state, attributes, type, callback) {
        var preposition = (type === 'add')? 'to': 'from';
        if ((state === 'STARTED' && (!attributes || attributes && !attributes.appname_param)) || 
            (state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'DENIED')) {
            callback(null, {
                "version": "1.0",
                "sessionAttributes": attributes,
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ElicitSlot",
                        "slotToElicit": "appname_param",
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `What is the name of the service to ${type} a server ${preposition}?`
                    },
                    "shouldEndSession": false
                }
            });
        }  else if (state === 'IN_PROGRESS' && (intent.slots.appname_param.confirmationStatus === 'NONE')) {
           callback( null, {
               "version": "1.0",
               "sessionAttributes": attributes,
               "response": {
                    "directives": [
                    {
                        "type": "Dialog.ConfirmSlot",
                        "slotToConfirm": "appname_param",
                        "updatedIntent": {
                            "name": `${type}Server`,
                            "confirmationStatus": "NONE",
                            "slots": {
                                "appname_param": {
                                    "name": "appname_param",
                                    "value": intent.slots.appname_param.value,
                                    "confirmationStatus": "NONE"
                                },
                                "servername_param": {
                                    "name": "servername_param",
                                    "confirmationStatus": "NONE"
                                }
                            }
                        }
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Is service ${intent.slots.appname_param.value} correct?`
                    },
                    "shouldEndSession": false
                }
            });
        }   else if (state === 'STARTED' && (attributes && attributes.appname_param) || 
            state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'CONFIRMED' &&
            (intent.slots.servername_param.confirmationStatus === 'DENIED' || !intent.slots.servername_param.value)) {
            var newAttributes = {};
            if (attributes) {
                if (attributes.appname_param) {
                    newAttributes.appname_param = attributes.appname_param;
                } else {
                    attributes.appname_param = intent.slots.appname_param.value;
                    newAttributes = attributes;
                }
            } else {
                newAttributes.appname_param = intent.slots.appname_param.value;
            }

            callback(null,  {
                "version": "1.0",
                "sessionAttributes": newAttributes,
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ElicitSlot",
                        "slotToElicit": "servername_param",
                        "updatedIntent": {
                            "name": `${type}Server`,
                            "confirmationStatus": "NONE",
                            "slots": {
                                "appname_param": {
                                    "name": "appname_param",
                                    "value": newAttributes.appname_param,
                                    "confirmationStatus": "CONFIRMED"
                                },
                                "servername_param": {
                                    "name": "servername_param",
                                    "confirmationStatus": "NONE"
                                }
                            }
                        }
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `What is the name of the server to ${type}?`
                    },
                    "shouldEndSession": false
                }
            });
        }  else if (state === 'IN_PROGRESS' && (intent.slots.servername_param.confirmationStatus === 'NONE')) {
           callback(null, {
               "version": "1.0",
               "sessionAttributes": attributes,
               "response": {
                    "directives": [
                    {
                        "type": "Dialog.ConfirmSlot",
                        "slotToConfirm": "servername_param",
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Is ${intent.slots.servername_param.value} correct?`
                    },
                    "shouldEndSession": false
                }
            });
        }   else if (state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'CONFIRMED' &&
                intent.slots.servername_param.confirmationStatus === 'CONFIRMED') {
            newAttributes = attributes;
            if (attributes) {
                attributes.appname_param = intent.slots.appname_param.value;
                newAttributes = attributes;
            } else {
              newAttributes.appname_param = intent.slots.appname_param.value;
            }

            AS3AlexaLib.discover((err, instancesData) => {  
                var ip = [];
                var ips = [];
                if (err) {
                    console.log(err);
                } else {
                    instancesData.Reservations.forEach(reservation => {
                        reservation.Instances.forEach(instance => {
                            instance.Tags.forEach(tag => {
                                if ((tag.Key === 'Name' || tag.Key == 'name') && tag.Value.toLowerCase() === intent.slots.servername_param.value.toLowerCase()) {
                                    ips.push(instance.PrivateIpAddress);
                                }
                            });
                        });
                    });
                }

                if (ips[0]) {
                    var responseObj = {};
                    var message = null;
                    AS3AlexaLib.getMembers(attributes.appname_param, (err, numberOfServers, servers, virtuals) => {
                        if (err) {
                            
                        } else {
                            servers.push(ips[0]);
                            var request = DeclarationFactory.createDeclaration({type:'createWithMembers', name: intent.slots.appname_param.value, ip: virtuals, ips: servers});

                            hs.execute('CREATE', request, Config.host, (err, res, body) => {                        
                                if (err || res.statusCode > 299) {
                                    if (err) {
                                        message = null;
                                    } else {
                                        if ((JSON.parse(body)).results) {
                                            message = (JSON.parse(body)).results[0].message;
                                        } else {
                                            message = JSON.stringify(JSON.parse(body), null, 3);
                                        }
                                    }
                                    responseObj = {
                                        "version": "1.0",
                                        "sessionAttributes": {},
                                        "response": {
                                            "outputSpeech": {
                                                "type": "PlainText",
                                                "text": `Application Services experienced an error creating AS3 resources to existing pool. Error message: ${message}`
                                            },
                                            "shouldEndSession": false
                                        }
                                    };                                
                                } else {
                                    responseObj = {
                                       "version": "1.0",
                                       "sessionAttributes": newAttributes,
                                       "response": {
                                           "outputSpeech": {
                                              "type": "PlainText",
                                              "text": `Application Services ${type}ed ${intent.slots.servername_param.value} ${preposition} service ${intent.slots.appname_param.value} : `
                                            },
                                            "shouldEndSession": false
                                        }
                                    };
                                }
                                callback(null, responseObj);                                
                            });
                        }
                    });        
                } else {
                    callback(null, {
                       "version": "1.0",
                       "sessionAttributes": newAttributes,
                       "response": {
                           "outputSpeech": {
                              "type": "PlainText",
                              "text": `Application Services could not find Server Named ${intent.slots.servername_param.value} : `
                            },
                            "shouldEndSession": false
                        }                        
                    });
                }
            });
        }
    }
 
    static handleAutomation(intent, state, attributes, callback) {
        if ((state === 'STARTED' || state === 'IN_PROGRESS') && intent.slots.details_param.confirmationStatus === 'NONE') {
            var name = ((intent.slots.details_param.value).split(" "))[0];
            var domain = ((intent.slots.details_param.value).split('dot'))[1];
            if (!domain) {
                const array = intent.slots.details_param.value.split('.');
                domain = array[array.length-2];
            }
            domain = domain.trim();
            var tag = ((intent.slots.details_param.value).split("tag "))[1];

            callback(null, {
                "version": "1.0",
                "sessionAttributes": {},
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ConfirmSlot",
                        "slotToConfirm": "details_param"
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Is automating a service named ${name} at url www dot ${domain} dot com using discovered servers with tag ${tag} correct?`
                    },
                    "shouldEndSession": false
                }
            });
        }   else if (state === 'IN_PROGRESS' && intent.slots.details_param.confirmationStatus === 'DENIED') {
            callback(null, {
                "version": "1.0",
                "sessionAttributes": {},
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ElicitSlot",
                        "slotToElicit": "details_param"
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Please describe the automation using the following format: state the name of service followed by the url... followed by server tag... An example would be: widget... at www dot your domain dot com... with tag... apache`
                    },
                    "shouldEndSession": false
                }
            });
        }  else { //if (state === 'IN_PROGRESS' && intent.slots.details_param.confirmationStatus === 'CONFIRMED') {
            name = ((intent.slots.details_param.value).split(" "))[0];
            domain = intent.slots.details_param.value.split('dot')[1];
            if (!domain) {
                const array = intent.slots.details_param.value.split('.');
                domain = array[array.length-2];
            }
            domain = domain.trim();
            tag = ((intent.slots.details_param.value).split("tag "))[1];

            dns.lookup(`www.${domain}.com`, function(err, result) {
                if (err) {
                    callback(null, {
                       "version": "1.0",
                       "sessionAttributes": {},
                       "response": {
                           "outputSpeech": {
                              "type": "PlainText",
                              "text": `DNS lookup of www dot ${domain} dot com was not successful`
                            },
                            "shouldEndSession": false
                        }
                    });
                } else  {
                    AS3AlexaLib.discover((err, instancesData) => {  
                        var ips = [];
                        if (err) {
                            console.log(err);
                        } else {
                            instancesData.Reservations.forEach(reservation => {
                                reservation.Instances.forEach(instance => {
                                    instance.Tags.forEach((instanceTag) => {
                                        if ((instanceTag.Key === 'App') && instanceTag.Value.toLowerCase() === tag.toString().toLowerCase()) {
                                            ips.push(instance.PrivateIpAddress);
                                        }
                                    });
                                });
                            });
                        }

                        if (ips.length !== 0) {
                            const request = DeclarationFactory.createDeclaration({type:'deployment', name: name, serviceIP: result, ip: ips});  
                            hs.execute('DEPLOY', request, Config.host, (err, res, body) => {
                                var message = null;
                                var responseObj = {};

                                if (err) {
                                    message = null;
                                } else {
                                    message = `${(JSON.parse(body)).results[0].message}`;
                                }
                                if (err || res.statusCode !== 200) {
                                    responseObj = {
                                        "version": "1.0",
                                        "sessionAttributes": {},
                                        "response": {
                                            "outputSpeech": {
                                                "type": "PlainText",
                                                "text": `Application Services experienced an error creating AS3 resources.  Error message: ${message}`
                                            },
                                            "shouldEndSession": false
                                        }
                                    };
                                } else {
                                    responseObj = {
                                        "version": "1.0",
                                        "sessionAttributes": {},
                                        "response": {
                                            "outputSpeech": {
                                                "type": "PlainText",
                                                "text": `Application Services created a service named ${name} at url www dot ${domain} dot com using discovered servers with tag ${tag}. Message: ${message}`
                                            },
                                            "shouldEndSession": false
                                        }
                                    };
                                }
                                callback(null, responseObj);
                            });
                        } else {
                            callback(null, {
                                "version": "1.0",
                                "sessionAttributes": {},
                                "response": {
                                    "outputSpeech": {
                                        "type": "PlainText",
                                        "text": `Application Services could not discover any servers tagged with ${tag} `
                                    },
                                    "shouldEndSession": false
                                }                        
                            });
                        }
                    });
                }
            });
        }
    }
    
    static handleList(intent, state, attributes, callback) {
        var newAttributes = {};

        if ((state === 'STARTED' && (!attributes || attributes && !attributes.appname_param)) || 
            (state === 'IN_PROGRESS' && intent.slots.appname_param.confirmationStatus === 'DENIED')) {

            callback(null, {
                "version": "1.0",
                "sessionAttributes": newAttributes,
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ElicitSlot",
                        "slotToElicit": "appname_param",
                    }],
                    "outputSpeech": {
                        "type": "PlainText",
                        "text": `What is the name of the service to report the number of servers of?`
                    },
                    "shouldEndSession": false
                }
            });
        }  else if (state === 'IN_PROGRESS' && (intent.slots.appname_param.confirmationStatus === 'NONE')) {
            callback(null, {
                "version": "1.0",
                "sessionAttributes": attributes,
                "response": {
                    "directives": [
                    {
                        "type": "Dialog.ConfirmSlot",
                        "slotToConfirm": "appname_param"
                    }],
                   "outputSpeech": {
                      "type": "PlainText",
                      "text": `Is service ${intent.slots.appname_param.value} correct?`
                    },
                    "shouldEndSession": false
                }
            });
        } else { // confirmed
            newAttributes = attributes;
            if (attributes) {
                attributes.appname_param = intent.slots.appname_param.value;
                newAttributes = attributes;
            } else {
                newAttributes = {};
                newAttributes.appname_param = intent.slots.appname_param.value;
            }               
            AS3AlexaLib.getMembers(intent.slots.appname_param.value, (err, response, servers, virtuals) => {
                if (err) {
                    callback(null, {
                        "version": "1.0",
                        "sessionAttributes": newAttributes,
                        "outputSpeech": {
                            "type": "PlainText",
                            "text": `Error querying the number of servers in application: ${intent.slots.appname_param.value}. Error message: ${err}`
                        },
                        "shouldEndSession": false
                    });                           
                } else {
                    callback( null, {
                        "version": "1.0",
                        "sessionAttributes": newAttributes,
                        "response": {
                            "outputSpeech": {
                                "type": "PlainText",
                                "text": `Application: ${intent.slots.appname_param.value} contains ${response} server`
                            }
                        },
                        "shouldEndSession": false
                    });
                }
            });
        }
    }

    static handleAgilityDeploy(intent, state, attributes, callback) {
        var tag = 'agility';
        if (state === 'STARTED') {
            AS3AlexaLib.discover((err, instancesData) => {  
                var ips = [];
                if (err) {
                    console.log(err);
                } else {
                    instancesData.Reservations.forEach(reservation => {
                        reservation.Instances.forEach(instance => {
                            instance.Tags.forEach((instanceTag) => {
                                if ((instanceTag.Key === 'App') && instanceTag.Value.toLowerCase() === tag) {
                                    ips.push(instance.PrivateIpAddress);
                                }
                            });
                        });
                    });
                }

                if (ips.length !== 0) {
                    const request = DeclarationFactory.createDeclaration({type:'deployment', name: "agility", serviceIP: process.env.SERVER_IP , ip: ips});  
                    hs.execute('DEPLOY', request, Config.host, (err, res, body) => {
                        var message = null;
                        var responseObj = {};

                        if (err) {
                            message = null;
                        } else {
                            message = `${(JSON.parse(body)).results[0].message}`;
                        }
                        if (err || res.statusCode > 299) {
                            responseObj = {
                                "version": "1.0",
                                "sessionAttributes": {},
                                "response": {
                                    "outputSpeech": {
                                        "type": "PlainText",
                                        "text": `Application Services experienced an error creating AS3 resources.  Error message: ${message}`
                                    },
                                    "shouldEndSession": true
                                }
                            };
                        } else {
                            responseObj = {
                                "version": "1.0",
                                "sessionAttributes": {},
                                "response": {
                                    "outputSpeech": {
                                        "type": "PlainText",
                                        "text": `Okay ${process.env.USER_NAME}, deploying the Agility App`
                                    },
                                    "shouldEndSession": true
                                }
                            };
                        }
                        callback(null, responseObj);
                    });
                } else {
                    callback(null, {
                        "version": "1.0",
                        "sessionAttributes": {},
                        "response": {
                            "outputSpeech": {
                                "type": "PlainText",
                                "text": `Application Services could not discover any servers tagged with... ${tag} `
                            },
                            "shouldEndSession": true
                        }                        
                    });
                }
            });
        }
    }

    static handleAgilityStatus(intent, state, attributes, callback) {
        if (state === 'STARTED') {
            AS3AlexaLib.getMembers('agility', (err, numberOfServers, servers, virtuals) => {
                if (err) {
                    
                } else {
                    callback(null, {
                        "version": "1.0",
                        "sessionAttributes": {},
                        "response": {
                           "outputSpeech": {
                              "type": "PlainText",
                              "text": `${process.env.USER_NAME}, the Agility App is ready to go with ${numberOfServers} servers`
                            },
                            "shouldEndSession": true
                        }
                    });
                }
            });
        }
    }

    static handleLaunch(callback) {
        callback(null, {
            "version": "1.0",
            "sessionAttributes": {},
            "response": {
                "outputSpeech": {
                    "type": "PlainText",
                    "text": `Application Services is ready, would you like to: automate a service, create a service, discover servers, 
                        list servers, add a server, delete a server, delete a service or delete All`
                },            
                "shouldEndSession": false
            }
        });
    }    
    
    static handleAMAZONFallback(intent, state, attributes, callback) {
        callback(null, {
            "version": "1.0",
            "sessionAttributes": attributes,
            "response": {
                "outputSpeech": {
                    "type": "PlainText",
                    "text": `Application Services could not help with that request, could you please repeat?`
                },
                "shouldEndSession": false
            }
        });
    }

    static handleAMAZONHelp(intent, state, attributes, callback) {
        callback (null, {
            "version": "1.0",
            "sessionAttributes": attributes,
            "response": {
                "outputSpeech": {
                    "type": "PlainText",
                    "text": `Application Services options are to: automate a service, create a service, discover servers, 
                        list servers, add a server, delete a server, delete a service or delete all`
                },
                "shouldEndSession": false
            }
        });
        return;
    }

    static handleAMAZONCancel(intent, state, callback) {
        callback(null, {
            "version": "1.0",
            "sessionAttributes": {},
            "response": {
                "outputSpeech": {
                    "type": "PlainText",
                    "text": `Application Services is terminating this session`
                },
                "shouldEndSession": true
            }
        });
    }
        
    static handleSessionEnd(reason, callback) {
        callback(null, {
            "version": "1.0",
            "sessionAttributes": {},
            "response": {
                "outputSpeech": {
                    "type": "PlainText",
                    "text": `Application Services Session Ended`
                },
                "shouldEndSession": true
            }
        });    
    }
}

exports.handler = (event, context, callback) => {
    console.log('what ?');
    console.log(JSON.stringify(event, null, 3));
    console.log(JSON.stringify(context, null, 3));
    AS3AlexaLib.discover(() => {});
    let response = null;
    
    const requestType = event.request.type;

    switch (requestType) {
        case 'LaunchRequest':
            response = AS3AlexaLib.handleLaunch(callback);
            break;
        case 'SessionEndedRequest':
            response = AS3AlexaLib.handleSessionEnd(event.request.reason, callback);
            break;
        case 'IntentRequest':
            const intentName = event.request.intent.name;
            switch (intentName) {
                case 'create':
                    response = AS3AlexaLib.handleCreate(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;
                case 'discover':
                    response = AS3AlexaLib.handleDiscover(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;
                case 'discoverBrief':
                    response = AS3AlexaLib.handleDiscoverBrief(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;
                case 'health':
                    response = AS3AlexaLib.handleHealth(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;                    
                case 'list':
                    response = AS3AlexaLib.handleList(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;     
                case 'addServer':
                    response = AS3AlexaLib.handleServer(event.request.intent, event.request.dialogState, event.session.attributes, 'add', callback);
                    break;  
                case 'deleteServer':
                    response = AS3AlexaLib.handleServer(event.request.intent, event.request.dialogState, event.session.attributes, 'delete', callback);
                    break;  
                case 'deleteService':
                    response = AS3AlexaLib.handleDeleteService(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;  
                case 'deleteAll':
                    response = AS3AlexaLib.handleDeleteAll(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;
                case 'automate':
                    response = AS3AlexaLib.handleAutomation(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;
                case 'list':
                    response = AS3AlexaLib.handleList(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;                    
                case 'agilityDeploy':
                    response = AS3AlexaLib.handleAgilityDeploy(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;
                case 'agilityStatus':
                    response = AS3AlexaLib.handleAgilityStatus(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;                    
                case 'AMAZON.FallbackIntent':
                    response = AS3AlexaLib.handleAMAZONFallback(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;
                case 'AMAZON.CancelIntent', 'AMAZON.StopIntent':
                    response = AS3AlexaLib.handleAMAZONCancel(null, null, callback);
                    break;
                case 'AMAZON.HelpIntent':
                    response = AS3AlexaLib.handleAMAZONHelp(event.request.intent, event.request.dialogState, event.session.attributes, callback);
                    break;                    
                default:
            }
            default:
    }
};
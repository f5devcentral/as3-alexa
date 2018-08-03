/*
 * Copyright 2018. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

const AWS = require('aws-sdk');
const Utils = require('./utils');

exports.handler = async function(event, context, callback) {
     const opts = {region: 'us-west-2', apiVersion: '2016-11-15'};
     const ec2 = new AWS.EC2(opts);
     const utils = new Utils();
     console.log('event ====================== ');
     console.log(event); // Contains incoming request data (e.g., query params, headers and more)

     
     try {
         const instancesData = await ec2.describeInstances().promise();
         const instancesArr = [];
         
         instancesData.Reservations.forEach(reservation => {
             reservation.Instances.forEach(instance => {
                 instancesArr.push(instance);
             });
         });
         
         const finalInstances = utils.processInstances(instancesArr);
         
             const response = {
              statusCode: 200,
              headers: {
                "x-custom-header" : "My Header Value",
                "Access-Control-Allow-Origin" : "*"
              },
              body: JSON.stringify({ "message": finalInstances })
            };
         callback(null, response); 
         
     } catch (err) {
         callback(err.message);
     }

};

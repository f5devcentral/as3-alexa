/*
 * Copyright 2018. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */
const httpServices = require('./httpServices');
const Utils = require('./utils');


// Testing
const decl = {
  "class": "ADC",
  "schemaVersion": "3.0.0",
  "id": "urn:uuid:33045210-3ab8-4636-9b2a-c98d22ab915d",
  "label": "Sample 1",
  "remark": "Simple HTTP application with RR pool",
  "Sample_01": {
    "class": "Tenant",
    "verifiers": {
      "13.x": "3a8e7cd0671054b9de43fb746fd48983c6b20db1cf004136f4030326f4d6c08a"
    },
    "A1": {
      "class": "Application",
      "template": "http",
      "serviceMain": {
        "class": "Service_HTTP",
        "virtualAddresses": [
          "198.19.192.1"
        ],
        "pool": "web_pool"
      },
      "web_pool": {
        "class": "Pool",
        "monitors": [
          "http"
        ],
        "members": [
          {
            "servicePort": 80,
            "serverAddresses": [
              "198.19.192.2",
              "198.19.192.3"
            ]
          }
        ]
      }
    }
  }
}
//(action, obj, host, auth, func)
//null, res, body




exports.handler = function(event, context, callback) {
     const utils = new Utils();
     console.log('event ====================== ');
     console.log(event); // Contains incoming request data (e.g., query params, headers and more)

    console.log('result ============================= ');
    //console.log(result);
    
     try {
        let nodes = [];
        httpServices.execute('GET_BIGIP_NODES', {}, '35.160.118.96', (err, res, body) => {
             console.log('GET_BIGIP_NODES ====================');
              if (err) {
                console.log('Failed to get bigip nodes');
                console.log(err);
                callback(err);
              } else if (res.statusCode === 404) {
                console.log('Failed with 404 status code');
              } else if (res.statusCode === 200) {
                 console.log('body ================= ');
                 console.log(JSON.parse(body));
                 let data = JSON.parse(body);
                 //let data = nodes;
                 // Get Big IP servers
                 if(data && data.items) {
                     nodes = utils.getServers(data.items);
                 }
                 
                     console.log('nodes ======================= ');
                     console.log(nodes);  
                 
                 httpServices.execute('GET_DECLARE', {}, '35.160.118.96', (err, res, body) => {
                   
                  console.log('GET_DECLARE ====================');
                  console.log('body ====================== ');
                  console.log(body);
                  if (err) {
                    console.log('Failed to get bigip nodes');
                    console.log(err);
                    callback(err);
                  } else if (res.statusCode === 404) {
                    console.log('Failed with 404 status code');
                  } else if (res.statusCode === 200 || res.statusCode === 204) {
                     console.log('as3 body ================= ');
                     console.log(body);
                     console.log('as3 nodes =========== ');
                     console.log(nodes);
                     let result = {};
                     if(body) {
                         result = utils.parser(JSON.parse(body), nodes);
                         console.log('final result ================= ');
                         console.log(result);
                     } else {
                         result = utils.parser({}, nodes);
                         console.log('final result ================= ');
                         console.log(result);                         
                     }

                     
                     const response = {
                      statusCode: 200,
                      headers: {
                            "x-custom-header" : "My Header Value",
                            "Access-Control-Allow-Origin" : "*"
                          },
                          body: JSON.stringify({ "message": result })
                     };
                     console.log("response: " + JSON.stringify(response));
                     callback(null, response);                  
                     
                  }
                });   
              }
               
             });
                 
         
     } catch (err) {
         callback(err.message);
     } 
}



/** exports.handler = async function(event, context, callback) {
     const utils = new Utils();
     console.log('event ====================== ');
     console.log(event); // Contains incoming request data (e.g., query params, headers and more)

    console.log('result ============================= ');
    //console.log(result);
     try {
         const result = utils.parser(decl);
         
         console.log('result =================== ');
         console.log(result);
             const response = {
              statusCode: 200,
              headers: {
                "x-custom-header" : "My Header Value",
                "Access-Control-Allow-Origin" : "*"
              },
              body: JSON.stringify({ "message": result })
            };
         console.log("response: " + JSON.stringify(response))
         callback(null, response); 
         
     } catch (err) {
         callback(err.message);
     }

}; **/


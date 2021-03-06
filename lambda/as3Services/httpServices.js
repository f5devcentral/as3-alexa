/**
 * Copyright 2018. F5 Networks, Inc.
 */
 

const https = require("https"); 
const _auth = new Buffer('admin:admin').toString("base64");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";     

class HttpServices {
    
    static execute (action, obj, host, func) {
      var _body = {};
      const _options = {
        headers: {                                                                                 
          "Authorization": "Basic " + _auth,                                                       
          "Content-Type": "application/json",                                                      
          "Accept": "application/json"                                                             
        },
        hostname: host,
        port: 443                                                                                  
      };
      

      switch (action) {
        case 'GET_BIGIP_NODES': 
        _options.path = '/mgmt/tm/ltm/node';
        _options.method = 'Get';
        console.log('Get BIG IP NODES');
        break;
        case 'GET_DECLARE':
        _options.path = '/mgmt/shared/appsvcs/declare';
        _options.method = 'Get';
        break;
        case 'DELETE_DECLARE':
        _options.path = '/mgmt/shared/appsvcs/declare';
        _options.method = 'Delete';
        break;
      default:
      }
      
      const callback = function (res) {    
        var body = [];                                                                             
        res.on("data", function (chunk) {                                                          
          body.push(chunk);                                                                        
        }).on("end", function () {                                                                 
          body = Buffer.concat(body).toString(); 
          func(null, res, body);                                                                   
        }).on("error", function (err) {                                                            
          func(err, res, body);                                                                    
        });                                                                                        
      };
      console.log(_options);
      const req = https.request(_options, callback);
      if (_options.method === "Post" || _options.method === "Patch" || _options.method === "Put") {
        req.write(_body);
      }
      
      req.end();
      req.on('error', (err) => {
        func(err, null, null);
        return false;
      });
    }
  }
module.exports = HttpServices;

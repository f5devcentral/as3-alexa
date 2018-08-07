/**
 * Copyright (c) 2018, F5 Networks, Inc. 
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
        case 'DELETE_DECLARE':
          _options.path = '/mgmt/shared/appsvcs/declare';
          _options.method = 'Delete';
          _body = JSON.stringify({});
          break;
        case 'DELETE_SERVICE':
          _options.path = `/mgmt/shared/appsvcs/declare/Tenant_${obj.tenant}`;
          _options.method = 'Delete';
          _body = JSON.stringify({});
          break;
        case 'CREATE':
          _options.path = '/mgmt/shared/appsvcs/declare';
          _options.method = 'Post';
          _body = JSON.stringify(obj);
          break;        
        case 'ADD':
          _options.path = '/mgmt/shared/appsvcs/declare';
          _options.method = 'Patch';
          _body = JSON.stringify(obj);
          break;
        case 'DEPLOY':
          _options.path = '/mgmt/shared/appsvcs/declare';
          _options.method = 'Post';
          _body = JSON.stringify(obj);
          break;
        case 'GET':
          _options.path = '/mgmt/shared/appsvcs/declare';
          _options.method = 'Get';
          _body = JSON.stringify({});
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
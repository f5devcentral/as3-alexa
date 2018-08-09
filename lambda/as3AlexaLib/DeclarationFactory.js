/**
 * Copyright (c) 2018, F5 Networks, Inc. 
 */

class DeclarationFactory {
    
  static createDeclaration (obj) {
    switch (obj.type) {
      case 'create':
        var req = DeclarationFactory.createBaseDeclaration(obj.name, obj.ip);
        return req;
      case 'createWithMembers':
        req = DeclarationFactory.createWithMembersDeclaration(obj.name, obj.ip, obj.ips);
        return req;
      case 'deployment':
        req = DeclarationFactory.createDeployDeclaration(obj.name, obj.serviceIP, obj.ip);
        return req;
      case 'addMember':
        req = DeclarationFactory.createAddMemberDeclaration(obj.name, obj.ip);
        return req;
      case 'addPool':
        req = DeclarationFactory.createAddPoolDeclaration(obj.name, obj.ip);
        return req;
      case 'refresh':
        req.data.attributes.refresh = this._oAuth.getRefreshToken();
        break;
      default:
    }
  }
  
  static createBaseDeclaration(name, ip) {
    const tenant = `Tenant_${name}`;
    const app = `App_${name}`;
    const service = `Service_${name}`;
    const pool = `Pool_${name}`;

    return {
      "class": "ADC",
      "schemaVersion": "3.0.0",
      "id": `${name}`,
      "remark": `AWS Alexa created: ${name}`,
      "controls": {
        "class": "Controls",
        "trace": true,
        "logLevel": "debug"
      },
      [tenant]: {
        "class": "Tenant",
        [app]: {
          "class": "Application",
          "template": "generic",
          "remark": `AWS Alexa created: ${name}`,
          [service]: {
            "class": "Service_HTTP",
            "virtualAddresses": [
              `${ip}`
            ],
            "virtualPort": 443,
            "pool": `${pool}`
          },
          [pool]: {
            "class": "Pool"
          }
        }
      }
    };
  }

  static createWithMembersDeclaration(name, ip, ips) {
    const tenant = `Tenant_${name}`;
    const app = `App_${name}`;
    const service = `Service_${name}`;
    const pool = `Pool_${name}`;

    return {
      "class": "ADC",
      "schemaVersion": "3.0.0",
      "id": `${name}`,
      "remark": `AWS Alexa created: ${name}`,
      "controls": {
        "class": "Controls",
        "trace": true,
        "logLevel": "debug"
      },
      [tenant]: {
        "class": "Tenant",
        [app]: {
          "class": "Application",
          "template": "generic",
          "remark": `AWS Alexa created: ${name}`,
          [service]: {
            "class": "Service_HTTP",
            "virtualAddresses": [
              `${ip}`
            ],
            "virtualPort": 443,
            "pool": `${pool}`
          },
          [pool]: {
            "class": "Pool",
            "members": [
              {
                "servicePort": 443,
                "serverAddresses": ips
              }
              ]
          }
        }
      }
    };
  }

  static createDeployDeclaration(name, serviceIP, ip) {
    const tenant = `Tenant_${name}`;
    const app = `App_${name}`;
    const service = `Service_${name}`;
    const pool = `Pool_${name}`;
    return {
      "class": "ADC",
      "schemaVersion": "3.0.0",
      "id": `${name}`,
      "remark": `AWS Alexa created: ${name}`,
      "controls": {
        "class": "Controls",
        "trace": true,
        "logLevel": "debug"
      },
      [tenant]: {
        "class": "Tenant",
        [app]: {
          "class": "Application",
          "template": "generic",
          "remark": `AWS Alexa created: ${name}`,
          [service]: {
            "class": "Service_HTTP",
            "virtualAddresses": [
              `${serviceIP}`
            ],
            "virtualPort": 443,
            "pool": `${pool}`
          },
          [pool]: {
            "class": "Pool",
            "members": [
              {
                "servicePort": 443,
                "serverAddresses":ip
              }]
          }
        }
      }
    };
  }
  
  
  static createAddMemberDeclaration(name, ip) {
    const tenant = `Tenant_${name}`;
    const app = `App_${name}`;
    const service = `Service_${name}`;
    const pool = `Pool_${name}`;    

    return [
      {
        "op":"add",
        "path":`/${tenant}/${app}/${pool}/members/-`,
        "value":{
          "servicePort":443,
          "serverAddresses": ip
        }
      }
    ];
  }
  
  static createAddPoolDeclaration(name, ip) {
    const tenant = `Tenant_${name}`;
    const app = `App_${name}`;
    const service = `Service_${name}`;
    const pool = `Pool_${name}`;    
    
    return [
      {
        "op":"add",
        "path":`/${tenant}/${app}/${pool}`,
        "value": {
          "class": "Pool",
          "members": [
            {
              "servicePort":443,
              "serverAddresses": ip
            }
          ]
        }
      }
    ];
  }  
}
module.exports = DeclarationFactory;
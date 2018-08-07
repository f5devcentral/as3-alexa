/**
 * Copyright (c) 2018, F5 Networks, Inc. 
 */

const validator = require('./validator');

class Utils {
  /**
   * Process AWS Instances
   * @param {array} Instances array
   * @returns {response} Processed array
   */
    processInstances (instances) {
          const self = this;
          const finalInstances = [];
          if (instances && instances.length > 0) {
            for (let i = 0; i < instances.length; i++) {
              let instance;
              // Check if there a 'Name' tag
              if (instances[i].Tags && instances[i].Tags.length > 0) {
                let count = 0;
                for (let k = 0; k < instances[i].Tags.length; k++) {
                  const tag = instances[i].Tags[k].Key.toUpperCase();
                  if (tag === 'NAME') {
                    const name = instances[i].Tags[k].Value.replace(/\s/g, '_');
                    if (validator.isValidString(name)) {
                      instance = self.buildNode(name, instances[i]);
                      if (instance) {
                        finalInstances.push(instance);
                      }
                    } else {
                      console.warn(`AWS Node name ${name} is invalid. `);
                    }
                    break;
                  }
                  count++;
                  // Could not found a NAME tag
                  if (count === instances[i].Tags.length) {
                    const name = instances[i].InstanceId;
                    instance = self.buildNode(name, instances[i]);
                    if (instance) {
                      finalInstances.push(instance);
                    }

                  }
                }
              } else if (instances[i].Tags && instances[i].Tags.length === 0) {
                const name = instances[i].InstanceId;
                instance = self.buildNode(name, instances[i]);
                if (instance) {
                  finalInstances.push(instance);
                }
              }
            }
          }
        return finalInstances;
    }
    
  /**
   * Helper method to create server instance
   * @private
   * @param {name} Instance name
   * @param {data} AWS data
   * @returns {response} Server object
   */
    buildNode (name, data) {
    const self = this;
    const tags = self.buildTags(data.Tags);
    if (data.State.Name === 'running') {
      const node = {
        status: 'online',
        name: name,
        id: data.InstanceId,
        ip: data.PrivateIpAddress,
        port: 80,
        desc: ' ',
        vpc: data.VpcId,
        tags: tags
      };

      return node;

    } else if (data.State.Name !== 'terminated') {
      const node = {
        status: 'offline',
        name: name,
        id: data.InstanceId,
        ip: data.PrivateIpAddress,
        port: 80,
        desc: ' ',
        vpc: data.VpcId,
        tags: tags
      };

      return node;
    } // terminated

    return null;

  }
  
  /**
   * Helper method to build tags
   * @private
   * @param {array} tag array 
   * @returns {response} processed tags
   */
  buildTags (tags) {
    const tagArr = [];
      if (tags && tags.length > 0) {
        for (let i = 0; i < tags.length; i++) {
          const tag = {};
          if (tags[i] && tags[i].Key && typeof tags[i].Key === 'string') {
            tag.key = tags[i].Key;
            if (tags[i].Value && typeof tags[i].Value === 'string' && tags[i].Value !== '') {
              tag.value = tags[i].Value;
              tagArr.push(tag);
            } else if (typeof tags[i].Value === 'undefined' || tags[i].Value !== null || tags[i].Value === '' || tags[i].Value === 0) {
              tagArr.push(tag);
            }
          }
        }
      }
    return tagArr;
  }
}

module.exports = Utils;
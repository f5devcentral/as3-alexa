/**
 * Copyright (c) 2018, F5 Networks, Inc. 
 */

class Validator {
    static isValidString (str) {
      if (typeof str !== 'string') {
        return false;
      }
      const regex = /^[a-zA-Z0-9-_][a-zA-Z0-9-._]*$/;
      return regex.test(str);
    };
}

module.exports = Validator;
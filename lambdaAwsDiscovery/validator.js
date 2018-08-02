/*
 * Copyright 2018. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
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
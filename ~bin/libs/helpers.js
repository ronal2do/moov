/**
 * \libs\Helpers
 */
var https = require('https');
var yts   = require('./yts.json');

var Helper = function () {};

Helper.prototype = {
  /**
   * Make a request using https
   * @param  {String}   url
   * @param  {Function} callback
   */
  request : function (url, callback) {
    https.get(url, function (response) {
      var data = '';

      response.on('data', function (newData) {
        data += newData;
      });

      response.on('end', function () {
        if (typeof callback === 'function') {
          callback(data);
        }
      });
    });
  }
};

module.exports = new Helper;

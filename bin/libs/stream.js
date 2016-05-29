/**
 * \libs\Stream
 */
module.exports = function (torrent, subtitle) {
  var colors = require('colors');
  var shell = require('shelljs');
  var path = require('path');
  var peerflixPath = path.resolve(__dirname + '/../../node_modules/peerflix/app.js');

  console.log('downloading...'.magenta);

  var execStr = 'node '+ peerflixPath +' "' + torrent + '" --vlc';

  if (subtitle !== undefined) {
    execStr += ' -- --sub-file=' + subtitle;
  }

  shell.exec(execStr);
}

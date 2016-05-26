/**
 * \libs\Stream
 */
module.exports = function (torrent, subtitle) {
  var colors = require('colors');
  var shell = require('shelljs');

  console.log('downloading...'.magenta);

  var execStr = 'peerflix "' + torrent + '" --vlc';

  if (subtitle !== undefined) {
    execStr += ' -- --sub-file=' + subtitle;
  }

  shell.exec(execStr);
}

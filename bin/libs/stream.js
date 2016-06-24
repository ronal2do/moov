/**
 * \libs\Stream
 */
'use strict'

require('colors')

const shell = require('shelljs')
const path = require('path')
const peerflixPath = path.resolve(path.join(__dirname, '/../../node_modules/peerflix/app.js'))

module.exports = (torrent, subtitle) => {
  console.log('downloading...'.cyan)

  let execStr = 'node ' + peerflixPath + ' "' + torrent + '" --vlc'

  if (subtitle !== undefined) {
    execStr += ' -- --sub-file=' + subtitle
  }

  shell.exec(execStr)
}

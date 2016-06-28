/**
 * \libs\Subtitle.
 */
'use strict'

const OS = require('opensubtitles-api')
const stream = require('./stream')
const download = require('download-file')
const list = require('./prompt').list
const cache = require('../settings.json').cache.subs
const fs = require('fs')
const HOME = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
const subsFolder = HOME + cache

const opensubs = new OS({
  useragent: 'OSTestUserAgent'
})

/**
 * Search for subtitle.
 *
 * @param  Object options
 */
const searchSubtitle = (options, torrent) => {
  opensubs
    .search(options)
    .then(response => {
      let subtitleList = []
      let subtitleID

      for (let i in response) {
        subtitleID = response[i].id

        subtitleList.push({
          name: response[i].langName,
          value: response[i].url + ':sid:' + subtitleID
        })
      }

      if (subtitleList.length === 1) {
        return downloadSubtitle(subtitleList[0].value, torrent)
      }

      list(subtitleList, {
        name: 'subtitle',
        message: 'Available subtitles'
      }, e => {
        downloadSubtitle(e.subtitle, torrent)
      })
    }).catch(err => console.log(err))
}

/**
 * Download the subtitle, if file not exists.
 *
 * @param  string url
 */
const downloadSubtitle = (url, torrent) => {
  url = url.split(':sid:')

  let subtitle = subsFolder + url[1] + '.srt'

  if (!verifySubtitleExists(subtitle)) {
    download(url[0], {directory: subsFolder}, err => {
      if (!err) {
        return stream(torrent, subtitle)
      }

      // @TODO: if can't download verify if stream
    })
  } else {
    stream(torrent, subtitle)
  }
}

/**
 * Verify is subtitle exists before download.
 *
 * @param  string name
 * @return bool
 */
const verifySubtitleExists = name => {
  try {
    return fs.statSync(name).isFile()
  } catch (e) {
    return false
  }
}

/**
 * The param for search.
 *
 * @param  object query
 */
module.exports = (query, movieURL) => {
  let options = {extensions: ['srt']}

  for (let i in query) {
    if (query.hasOwnProperty(i)) {
      options[i] = query[i]
    }
  }

  searchSubtitle(options, movieURL)
}

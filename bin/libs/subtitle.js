/**
 * \libs\Subtitle
 * 
 * @TODO: [✔] List Subtitles
 * @TODO: [ ] Verify if language for subtitle is set
 * @TODO: [ ] Stream
 */
'use strict'

const OS = require('opensubtitles-api')
    , stream = require('./stream')
    , list = require('./prompt').list
    , cache = require('../settings.json').cache.subs
    , HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
    , subsFolder = HOME + cache

const opensubs = new OS({
  useragent: 'OSTestUserAgent'
})

/**
 * Search for subtitle.
 * 
 * @param  Object options
 */
const searchSubtitle = options => {
  opensubs
    .search(options)
    .then( response => {

      // Se nenhum idioma de legenda foi adicionado
      let subtitleList = []

      for(let i in response) {
        subtitleList.push({
          name: response[i].langName,
          value: response[i].url + ':sid:' + response[i].id
        })
      }

      list(subtitleList, {
        name: 'subtitle',
        message: 'Available subtitles'
      }, e => console.log(e))

    }).catch( err => console.log(err) )
}

/**
 * Download the subtitle, if file not exists.
 * 
 * @param  String url
 * @param  String name
 */
const downloadSubtitle = (url, name) => {

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

  searchSubtitle(options)
}

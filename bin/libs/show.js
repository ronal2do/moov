/**
 * \libs\Show
 *
 * @TODO: [✔] List Show info
 * @TODO: [✔] List Seasons
 * @TODO: [✔] List Episodes
 * @TODO: [✔] Stream the ep
 */
'use strict'

const eztv = require('eztv-api')
    , subtitle = require('./subtitle')
    , _ = require('underscore')
    , ptn = require('parse-torrent-name')
    , stream = require('./stream')
    , group = require('./helpers').groupBy
    , list = require('./prompt').list
    , inquirer = require('inquirer')

/**
 * List shows for query search.
 * 
 * @param  String q query search
 */
const getShow = q => {
  let shows = []

  eztv.getShows({
    query: q
  }, (err, response) => {
    if (err) {
      throw err
    }

    for(let i in response) {
      if (response.hasOwnProperty(i)) {
        shows.push({
          name: response[i].title,
          value: response[i].id
        })
      }
    }

    list(shows, {
      name: 'id',
      message: 'Listing tv shows'
    }, show => {
      getSeason(show.id)
    })
  })
}

/** 
 * List Seasons for a tv-show.
 * 
 * @param  Integer showID id tv-show
 */
const getSeason = showID => {
  let season = []

  eztv.getShowEpisodes(showID, (err, response) => {
    let arr = group(response.episodes, 'seasonNumber')

    arr.map( n => season.push({
      name: 'Season ' + n,
      value: n
    }))
    
    list(season, {
      name: 'season',
      message: 'Listing Seasons'
    }, e => {
      getEpisodes(showID, e.season)
    })
  })
}

/**
 * List episode for season.
 * 
 * @param  integer showID
 * @param  integer season Season Number
 */
const getEpisodes = (showID, season) => {
  let episodes = []
  let originalTitle

  eztv.getShowEpisodes(showID, (err, response) => {
    let arr = _.filter(response.episodes, e => {
      return e.seasonNumber === season
    })

    arr.map(i => {
      originalTitle = i.title
      let title = ptn(i.title)

      if (title.resolution === '720p') {
        episodes.push({
          name: 'Episode: ' + title.episode,
          value: i.magnet
        })  
      }
    })

    list(episodes, {
      name: 'url',
      message: 'Listing episodes for season: ' + season
    }, e => {
      subtitle({query: originalTitle}, e.url)
      // stream(e.url)
    })
  })
}

module.exports = query => {
  getShow(query)
}

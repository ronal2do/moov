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
    , helpers = require('./helpers')
    , list = require('./prompt').list
    , inquirer = require('inquirer')
    , omdb = require('../settings.json').omdb.base
    , fs = require('fs')
    , path = require('path')

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
          value: {
            id: response[i].id, 
            title: response[i].title,
            slug: response[i].slug
          }
        })
      }
    }

    list(shows, {
      name: 'info',
      message: 'Listing tv shows'
    }, show => {
      getSeason(show.info)
    })
  })
}

/** 
 * List Seasons for a tv-show.
 * 
 * @param  Integer showID id tv-show
 */
const getSeason = show => {
  let season = []

  eztv.getShowEpisodes(show.id, (err, response) => {
    if (err) {
      throw err
    }

    fs.writeFile(path.resolve(__dirname, '../../cache/' + show.slug + '.json'), JSON.stringify(response))

    let arr = helpers.groupBy(response.episodes, 'seasonNumber')

    arr.map(n => {
      season.push({
        name: 'Season: ' + n,
        value: {
          season: n,
          title: show.title,
          slug: show.slug
        }
      })
    })

    list(season, {
      name: 'season',
      message: 'Listing seasons'
    }, e => {
      getShowEpisodes(e.season, show.title)
    })
  })
}

/**
 * List episodes for season.
 * 
 * @param  integer season
 * @param  string title
 */
const getShowEpisodes = (show) => {
  let episodes = []
  let url = omdb + show.title + '&Season=' + show.season

  helpers.requestHttp(url, response => {
    response = JSON.parse(response)

    response.Episodes.map( ep => {
      episodes.push({
        name: ep.Episode + ' - ' + ep.Title,
        value: {
          season: show.season,
          episode: ep.Episode,
          imdb: ep.imdbID,
          slug: show.slug,
          title: show.title + ' ' + ep.Title
        }
      })
    })

    list(episodes, {
      name: 'info',
      message: 'Listing episodes'
    }, ep => streamShow(ep.info))
  })
}

const streamShow = info => {
  let search = require('../../cache/'+ info.slug +'.json')

  let episode = _.filter(search.episodes, e => {
    return e.seasonNumber === info.season && e.episodeNumber == info.episode
  })

  stream(episode[0].magnet)
  // subtitle({query: info.title, season: info.season, episode: info.episode}, episode[0].magnet)
}

module.exports = query => {
  getShow(query)
}

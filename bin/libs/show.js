/**
 * \libs\Show
 */
'use strict'

const eztv = require('eztv-api')
const subtitle = require('./subtitle')
const stream = require('./stream')
const _ = require('underscore')
const helpers = require('./helpers')
const list = require('./prompt').list
const omdb = require('../settings.json').omdb.base
const fs = require('fs')
const path = require('path')

let option

/**
 * List shows for query search.
 *
 * @param String q query search
 */
const getShow = q => {
  let shows = []

  eztv.getShows({
    query: q
  }, (err, response) => {
    if (err) {
      throw err
    }

    for (let i in response) {
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

    if (shows.length === 1) {
      return getSeason(shows[0].value)
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

    if (arr.indexOf(option.season)) {
      let showInfo = {
        season: option.season,
        title: show.title,
        slug: show.slug
      }

      return getShowEpisodesFromSeasson(showInfo, show.title)
    }

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
    }, show => {
      getShowEpisodesFromSeasson(show.season)
    })
  })
}

/**
 * List episodes for season.
 *
 * @param  integer season
 * @param  string title
 */
const getShowEpisodesFromSeasson = show => {
  let episodes = []
  let url = omdb + show.title + '&Season=' + show.season

  helpers.requestHttp(url, response => {
    response = JSON.parse(response)

    if (typeof option.episode !== 'undefined') {
      let episode = _.filter(response.Episodes, e => {
        return e.Episode == option.episode
      })[0]

      return streamShow({
        season: parseInt(show.season),
        episode: parseInt(episode.Episode),
        imdb: episode.imdbID,
        slug: show.slug,
        title: show.title + ' - ' + episode.Title
      })
    }

    response.Episodes.map(ep => {
      episodes.push({
        name: ep.Episode + ' - ' + ep.Title,
        value: {
          season: show.season,
          episode: parseInt(ep.Episode),
          imdb: ep.imdbID,
          slug: show.slug,
          title: show.title + ' - ' + ep.Title
        }
      })
    })

    list(episodes, {
      name: 'info',
      message: 'Listing episodes'
    }, ep => streamShow(ep.info))
  })
}

/**
 * Stream the episode.
 *
 * @param  object info
 */
const streamShow = info => {
  let search = require('../../cache/' + info.slug + '.json')

  let episode = _.filter(search.episodes, e => {
    return e.seasonNumber === info.season && e.episodeNumber === info.episode
  })

  if (!option.subtitle) {
    return stream(episode[0].magnet)
  } else {
    subtitle({query: info.title, sublanguageid: option.subtitle}, episode[0].magnet)
  }
}

module.exports = (query, options) => {
  option = options
  getShow(query)
}

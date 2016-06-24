/**
 * \libs\Movie
 *
 * @TODO: [✔] List
 * @TODO: [✔] Quality
 * @TODO: [ ] Verify if is quality is set in arguments
 * @TODO: [ ] Subtitle
 * @TODO: [ ] Verify if language for subtitle is set
 * @TODO: [✔] Stream
 */
'use strict'

require('colors')

const request = require('./helpers').request
const list = require('./prompt').list
const subtitle = require('./subtitle')
const yts = require('../settings.json').yts

/**
 * Search movies.
 *
 * @param Object options
 * @param String q
 */
const getMovie = (options, q) => {
  let movieList = []
  let url = yts.search + encodeURI(q) + '&sort_by=year&order_by=asc'

  request(url, response => {
    response = JSON.parse(response).data.movies

    if (response === undefined || !response.length) {
      return console.error('No movie found. :/'.red)
    }

    response.map(e => {
      movieList.push({
        name: e.title_long,
        value: e.id
      })
    })

    list(movieList, {
      name: 'id',
      message: 'Listing movies'
    }, movie => {
      getQuality(movie.id)
    })
  })
}

/**
 * List Availables qualities for movie.
 *
 * @param  integer movieId
 */
const getQuality = movieId => {
  let qualities = []
  let url = yts.details + movieId

  request(url, response => {
    let movie = JSON.parse(response).data.movie

    movie.torrents.map(e => {
      qualities.push({
        name: e.quality,
        value: e.url
      })
    })

    list(qualities, {
      name: 'url',
      message: 'Available qualities'
    }, q => {
      subtitle({imdbid: movie.imdb_code}, q.url)
    })
  })
}

module.exports = (options, query) => {
  getMovie(options, query)
}

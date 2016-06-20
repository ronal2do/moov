/**
 * \libs\movie
 *
 * @TODO: [✔] List
 * @TODO: [ ] Quality
 * @TODO: [ ] Subtitle
 * @TODO: [ ] Stream
 */
'use strict'

require('colors')

const request = require('./helpers').request
    , list = require('./prompt').list
    , yts = require('../settings.json').yts

const getMovie = (options, q) => {
  let coll = []
  let url = yts.search + encodeURI(q) + '&sort_by=year&order_by=asc'

  request(url, response => {
    response = JSON.parse(response).data.movies

    if (response === undefined || !response.length) {
      return console.error('No movie found. :/'.red)
    }

    response.map( e => {
      coll.push({
        name: e.title_long,
        value: e.id
      })
    })

    list(coll, {
      name: 'id',
      message: 'Listing movies'
    }, movie => console.log(movie.id))
  })
}

module.exports = (options, query) => {
  getMovie(options, query)
}

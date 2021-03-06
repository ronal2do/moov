/**
 * \libs\Search
 *
 * Search for a movie or tv show
 */
'use strict'

const tv = require('./show')
const movie = require('./movie')

module.exports = (options, query) => {
  if (!options.tv) {
    movie(options, query)
  } else {
    tv(query, options)
  }
}

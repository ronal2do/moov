/**
 * \libs\search
 *
 * Search for a movie or tv show
 */
'use strict'

const tv = require('./show')

module.exports = (options, query) => {
  if (!options.tv) {
    // @todo Select movies
  } else {
    tv(query)
  }
}

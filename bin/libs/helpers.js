/**
 * \libs\helpers
 */
'use strict'

let https = require('https')
  , tv = require('./show').search
  , urlSearch = require('../settings.json').yts.search

const Helper = () => {

  const proto = {
    search: (options, query) => {
      if (!options.tv) {
        // Criar função pra isso
      } else {
        tv(query)
      }
    },

    request: (url, cb) => {
      https.get(url, response => {
        let data = ''

        response.on('data', newData => {
          data += newData
        })

        response.on('end', () => {
          if (typeof cb === 'function') {
            cb(data)
          }
        })
      })
    }
  }

  return Object.create(proto)
}

module.exports = Helper()

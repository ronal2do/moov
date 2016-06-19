/**
 * \libs\helpers
 */
'use strict'

const https = require('https')
    , _ = require('underscore')

const Helper = () => {
  const proto = {
    groupBy: (data, key) => {
      let groups = []

      for (let i in data) {
        groups.push(data[i][key])
      }

      return _.uniq(groups)
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

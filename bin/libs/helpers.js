/**
 * \libs\helpers
 */
'use strict'

let https = require('https')

const Helper = () => {

  const proto = {
    search: options => {
      // Se o param '--tv-show' for passado fazer a requisição
      // usando o módulo do eztv, se não usar a API do
      // YIFI mesmo.
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

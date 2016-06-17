/**
 * \libs\show
 */
'use strict'

const eztv = require('eztv-api')
    , helper = require('./list')
    , inquirer = require('inquirer')

const Show = () => {
  const ep = (episodes) => {
    let list = []
    
    for(var i in episodes) {
      if (episodes.hasOwnProperty(i)) {
        list.push({
          name: episodes[i].title,
          value: episodes[i].magnet
        })
      }
    }

    // @TODO
    // Create a selection
    console.log(list)
  }

  const proto = {
    search: (query) => {
      let list = []

      eztv.getShows({query: query}, (err, response) => {
        if (err) {
          throw err
        }

        for(let i in response) {
          if (response.hasOwnProperty(i)) {
            list.push({
              name: response[i].title + ' status: ' + response[i].status,
              value: response[i].id
            })
          }
        }

        helper.list(list, {
          name: 'id',
          message: 'Select your show'
        }, show => {
          eztv.getShowEpisodes(show.id, (err, response) => {
            if (err) {
              throw err
            }

            ep(response.episodes)
          })
        })
      })
    }
  }

  return Object.create(proto)
}

module.exports = Show()

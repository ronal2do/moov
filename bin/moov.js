#! /usr/bin/env node
'use strict'

require('colors')

// Thirdy party
// ----------------------------------------------------------------------------
const program = require('commander')

// Libs
// ----------------------------------------------------------------------------
const req = require('./libs/search')

const pkg = require('../package.json')

program.version(pkg.version.cyan + ' - Moov'.cyan)
  .option('-s, --subtitle [subtitle]', 'Code for subtitle labguage. ex: pob')
  .option('-n, --no-subtitle', 'Skip the search for subtitles')
  .option('-q, --quality [quality]', 'Video quality')
  .option('-t, --tv-show', 'Change the search for tv shows instead movies')
  .option('-S, --season [season]', 'Session of tv show')
  .option('-e, --episode [episode]', 'Episode for tv show.')

program
  .command('search <search>')
  .alias('s')
  .description('Search for a movie or tv show')
  .action(search => {
    let options = {
      subtitle: program.subtitle,
      quality: program.quality,
      tv: program.tvShow,
      season: program.season,
      episode: program.episode
    }

    req(options, search)
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

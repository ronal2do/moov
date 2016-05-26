#!/usr/bin/env node

// Third party
// --------------------------------------------------------
var colors = require('colors');
var program = require('commander');

// Libs
// --------------------------------------------------------
// var helper = require('./libs/helpers');
var movie = require('./libs/movies');
var pkg = require('../package.json');

program.version(pkg.version.cyan + ' - Moov'.cyan)
	.option('-c, --category [category]', 'Category')
	.option('-s, --subs [language]', 'Language for subtitle')
  .option('-n, --no-subs', 'No subtitles')
	.option('-q, --quality [quality]', 'Quality for videeo');

// Search
program
	.command('search <search>')
	.alias('s')
	.description('Search for a movie')
	.action(function (search) {

    // Make options object
    var options = {
      category : program.category,
      subtitle : program.subs,
      quality  : program.quality
    };

    movie.search(search, options);
	});

program.parse(process.argv);

// If no command was provided
if (!process.argv.slice(2).length) {
	program.outputHelp();
}

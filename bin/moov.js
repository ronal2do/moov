#!/usr/bin/env node
var fs = require('fs');
var https = require('https');
var colors = require('colors');
var shell = require('shelljs');
var program = require('commander');
var inquirer = require('inquirer');
var OS = require('opensubtitles-api');
var download = require('download-file');

var opensubtitle = new OS({
  useragent : 'OSTestUserAgent'
});

var HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var subsFolder = HOME + '/.moov/subs/';

/**
 * Functions
 * @type {Object}
 */
var helpers = {};
var movies  = {};

var ytsBase = 'https://yts.ag/api/v2/';
var ytsSearch   = ytsBase + 'list_movies.json?query_term=';
var ytsDetails  = ytsBase + 'movie_details.json?movie_id=';

program
  .version('[1.0.1]'.grey + ' - Moov'.cyan)
  .option('-c, --category [category]', 'Category (tv for search tv show)')
  .option('-s, --subs [subs]', 'Language for subtitle')
  .option('-r, --resolution [resolution]', 'Quality for video');

program
  .command('search <query>')
  .description('Search for a movie')
  .action(function (query) {

    // Verify if exists category and if this is different from tv
    if (program.category !== 'tv') {
      search(ytsSearch + encodeURI(query) + '&sort_by=year&order_by=asc');
    }

    // If this tv
  });

/**
 * Search for a query
 * @param  {string} query Title for search
 */
var search = function (url) {
  helpers.request(url, function (response) {
    var response = JSON.parse(response).data.movies;

    movies.searchList(response, movies.quality);

  });
}

/**
 * Make request for [url]
 * @param  {String}   url
 * @param  {Function} cb 
 */
helpers.request = function (url, cb) {
  https.get(url, function (response) {
    var data = '';

    response.on('data', function (newData) {
      data += newData;
    });

    response.on('end', function () {
      cb(data);
    });
  });
};

/**
 * List movies find by query
 * @param  {Object}   list
 * @param  {Function} cb
 */
movies.searchList = function (object, cb) {
  var list = [];

  for (var i in object) {
    list.push({
      name  : object[i].title_long,
      value : object[i].id
    });
  }

  inquirer.prompt([
    {
      type: 'list',
      name: 'movie',
      message: 'Select your movie:',
      choices: list
    }
  ]).then(function (awsers) {
    if (typeof cb === 'function') {
      cb(awsers.movie);
    };
  });
};

/**
 * List qualities for movie
 * @param  {integer} movieID
 */
movies.quality = function (movieID) {
  var url = ytsDetails + movieID;

  helpers.request(url, function (response) {
    var movie = JSON.parse(response).data.movie;
    var torrents = movie.torrents;
    var list  = [];

    for (var i in torrents) {

      if (program.resolution != undefined && program.resolution == torrents[i].quality) {
        // Selecionar legendas a partir daqui
        movies.subtitles(movie.imdb_code, torrents[i].url);
        return;

      } else {
        list.push({
          name  : torrents[i].quality,
          value : torrents[i].url 
        });
      }
    }

    // Make a choice list for qualities availables
    if (list.length > 0) {
      inquirer.prompt([
          {
            type : 'list',
            name :  'resolution',
            message: 'Available qualities:',
            choices: list
          }
      ]).then(function (awsers) {
        movies.subtitles(movie.imdb_code, awsers.resolution);
      });
    }
  });
};

/**
 * Search for a subtitle
 * @param  {String} imdb
 */
movies.subtitles = function (imdb, torrentURL) {
  opensubtitle.search({
    extensions: ['srt'],
    imdbid: imdb
  }).then(function (subtitles) {

    var list = [];
    
    // Se não existir idioma setado
    for (var i in subtitles) {
      list.push({
        name: subtitles[i].langName,
        value: subtitles[i].url + 'id:' + subtitles[i].id
      });
    }

    inquirer.prompt([
      {
        type: 'list',
        name: 'language',
        message: 'Subtitles for:',
        choices: list
      }
    ]).
    then(function (awsers) {

      var subs = awsers.language.split('id:');
      var url  = subs[0];
      var id   = subs[1];
      var subtitle = subsFolder + id + '.srt';

      // Verificar se existe legenda
      // Se não existir legenda
      download(url, {directory: subsFolder}, function (err) {
        if (!err) {
          stream(torrentURL, subtitle);
        } else {
          console.log('Oops! Something was wrong: '.magenta + err, url);
        }
      });

    });
  }).catch(function (e) {
    inquirer.prompt([
      {
        type: 'confirm',
        name: 'stream',
        message: 'Something breaks: \n'+ e +' \nstream anyway?',
        default: false
      }
    ]).then(function (nope) {
      if (!nope) {
        console.log('Bye.'.magenta);
        return;
      }

      stream(torrentURL);
    });
  });
};

/**
 * Stream a movie or tv show
 * @param  {String} torrentURL Path or url to torrent
 * @param  {String} subtitle   Path for subtitle
 */
var stream = function (torrentURL, subtitle) {
  var execString = 'peerflix ' + torrentURL + ' --vlc';

  if (subtitle != undefined) {
    execString += ' -- --sub-file=' + subtitle;
  }

  shell.exec(execString);
};

program.parse(process.argv);
/**
 * libs\Movies
 */
var shell = require('shelljs');
var inquirer = require('inquirer');
var OS = require('opensubtitles-api');
var download = require('download-file');

var stream   = require('./stream');
var request  = require('./helpers').request;
var yts      = require('./yts.json');

var _options = [];

var HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var subsFolder = HOME + yts.cache + 'subs/';

OpenSubs = new OS({
  useragent : 'OSTestUserAgent'
});

var Movies = function () {};

Movies.prototype = {  
  /**
   * Search movies
   * @param  {String} name
   * @param  {Object} options Object for search
   */
  search : function (name, options) {
    var url = yts.search + encodeURI(name) + '&sort_by=year&order_by=asc';
    var choice = this.choiceMovie;

    // SetQuality
    _options.quality = options.quality;
    _options.nosubs = options.nosubs;

    request(url, function (response) {
      response = JSON.parse(response).data.movies;

      if (response === undefined || !response.length) {
        console.error('No movie found. :/');
        return;
      }

      // Make a choice list
      choice(response);
    });
  },

  /**
   * Make a choice list
   * @param  {Object} moviesObject
   */
  choiceMovie : function (moviesObject) {
    var list  = [];
    var movie = Movies.prototype.getMovie;

    for (var i in moviesObject) {
      list.push({
        name: moviesObject[i].title_long,
        value: moviesObject[i].id
      })
    }

    inquirer.prompt([
      {
        type: 'list',
        name: 'id',
        message: 'Select your movie',
        choices: list
      }
    ]).then(movie);
  },

  /**
   * List the qualities for movie
   * @param  {Object} movie
   * @param  {String} resolution
   */
  getMovie : function (movie) {
    var url = yts.details + movie.id;
    var subs = Movies.prototype.getSubtitle;
    var quality = _options.quality;

    request(url, function (response) {
      var movie = JSON.parse(response).data.movie;
      var torrents = movie.torrents;
      var list = [];

      for (var i in torrents) {

        if (quality !== undefined && quality == torrents[i].quality) {
          if (_options.nosubs) {
            return stream(torrents[i].url);
          } else {
            return subs(movie.imdb_code, torrents[i].url);
          }
        } else {
          list.push({
            name : torrents[i].quality,
            value: torrents[i].url
          });
        }
      }

      inquirer.prompt([
        {
          type: 'list',
          name: 'resolution',
          message: 'Available qualities:',
          choices: list
        }
      ]).then(function (awsers) {
        if (_options.nosubs) {
          return stream(awsers.resolution);
        } else {
          subs(movie.imdb_code, awsers.resolution);
        }
      });
    });
  },

  getSubtitle : function (imdb, torrentURL) {
    console.log('Searching subtitles...'.magenta);

    OpenSubs.search({
      extensions: ['srt'],
      imdbid: imdb
    }).then(function (response) {

      var list = [];

      // @todo If subtitles are not set yet
      for(var i in response) {
        list.push({
          name: response[i].langName,
          value: response[i].url + ':id:' + response[i].id
        })
      }

      inquirer.prompt([
        {
          type: 'list',
          name: 'subtitles',
          message: 'Available subtitles:',
          choices: list
        }
      ]).then(function (awsers) {

        awsers = awsers.subtitles.split(':id:');

        var url = awsers[0];
        var id  = awsers[1];
        var subtitle = subsFolder + id + '.srt';

        // @todo: If file exists use this
        
        download(url, {directory: subsFolder}, function (err) {
          if (!err) {
            stream(torrentURL, subtitle);
          } else {
            inquirer.prompt([
              {
                type: 'confirm',
                name: 'stream',
                message: 'Something was broken. You want start stream anyway?',
                default: false
              }
            ]).then(function (whatido) {
              if (!whatido) {
                console.log('Bye!'.grey);
                return;
              }

              stream(torrentURL);
            });
          }
        });

      });

    }).catch(function (err) {
      inquirer.prompt([
        {
          type: 'confirm',
          name: 'stream',
          message: 'Subtitle can\'t be found. You want start stream anyway?',
          default: false
        }
      ]).then(function (whatido) {
        if (!whatido) {
          console.log('Bye!'.grey);
          return;
        }

        stream(torrentURL);
      });
    });
  }
};

module.exports = new Movies;

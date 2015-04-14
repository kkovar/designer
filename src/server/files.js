/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var parseUrl = require('url').parse;
var polyserve = require('polyserve');
var send = require('send');

var app = express();

var demoDir = path.join(__dirname, '../../demo');
var bowerComponentDir = path.join(demoDir, '/bower_components');

app.use(function(req, res, next) {
  console.log('files.js', req.path);
  next();
});

var componentHeaders = {
  'Access-Control-Allow-Origin': '*'
};

app.use('/components', polyserve.makeApp(
    bowerComponentDir,
    'polymer-designer-demos',
    componentHeaders,
    demoDir));

app.get('/ls*', function(req, res, next) {


  var url = parseUrl(req.path);
  var dir = decodeURIComponent(url.pathname).split('/').slice(2);
  var filePath = path.normalize(path.join.apply(null,
      [__dirname, '../../demo'].concat(dir)));

  console.log('files.js listing *', req.path, filePath);

  fs.stat(filePath, function(err, stat) {
    if (err) {
      if (err.code === 'ENOENT') {
        return next();
      }
      err.status = 500;
      return next(err);
    }

    res.append('Access-Control-Allow-Origin', '*');

    if (stat.isDirectory()) {
      fs.readdir(filePath, function(err, files) {
        if (err) {
          return next(err);
        }
        var stats = files.map(function(f) {
          // oh, for Promises. sync instead
          var stat = fs.statSync(path.join(filePath, f));
          return {
            'path': f,
            'isDirectory': stat.isDirectory(),
          };
        });
        res.send(stats);
      });
    } else {
      send(req, filePath).pipe(res);
    }

  });

});

module.exports = app;

#!/usr/bin/env node

var _ = require('lodash'),
  Packages = require('./packages');

Packages.fromFile(function (error, packages) {
  // Fail gracefully.
  if (error) return console.log('Unable to load packages.json');

  var done = _.after(2, function () {
    process.exit();
  });

  Packages.ensureGitIgnore(packages, done);
  Packages.load(packages, done);
});

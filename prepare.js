#!/usr/bin/env node

var Packages = require('./packages');

Packages.fromFile(function (error, packages) {
  // Fail gracefully.
  if (error) return console.log('Unable to load packages.json')

  Packages.copy(packages, function () {
    process.exit(0)
  });
});

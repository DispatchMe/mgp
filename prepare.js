#!/usr/bin/env node

var Packages = require('./packages');

Packages.fromFile(function (packages) {
  Packages.copy(packages, function () {
    process.exit(0)
  });
});

#!/usr/bin/env node

var Packages = require('./packages');

Packages.fromFile(function (packages) {
  Packages.checkout(packages, function () {
    Packages.link(packages, function () {
      process.exit(0)
    });
  });
});

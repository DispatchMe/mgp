#!/usr/bin/env node

var _ = require('lodash'),
  argv = require('minimist')(process.argv.slice(2)),
  Packages = require('./packages');

var link = !!argv._.contains('link');

var packageFile = process.cwd() + '/packages/' +
  (link ? 'local-packages.json' : 'git-packages.json');

Packages.fromFile(packageFile, function (error, packages) {
  // Fail gracefully.
  if (error) return console.log('Unable to load ' + packageFile);

  var done = _.after(2, function () {
    process.exit();
  });

  Packages.ensureGitIgnore(packages, done);

  if (link) Packages.link(packages, done);
  else Packages.load(packages, done);
});

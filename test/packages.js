var Packages = require('../packages');

var fs = require('fs-extra');

var PACKAGES = {
  "jon:bank-account": {
    "tarball": "https://api.github.com/repos/jperl/mgp-private-package-test/tarball/327746c6eb3aface483c9879472cb43c27808185",
    "path": "bank-account"
  },
  "jon:secrets": {
    "tarball": "https://api.github.com/repos/jperl/mgp-private-package-test/tarball/c2792ca2970c6d88e5e2fb6b8a26e26b81d220f9",
    "path": "secrets"
  },
  // From our encrypted variables, someone was messing with the hardcoded one :(
  "token": process.env.GITHUB_TOKEN
};

// Throw an error if any of the files are missing.
var expectFiles = function (dir, files) {
  files.forEach(function (file) {
    fs.openSync(dir + '/' + file, 'r');
  });
};

describe('Package Loading', function () {
  Packages.config('test/packages');

  it('should copy each package into the packageDir', function (done) {
    this.timeout(30000);

    Packages.load(PACKAGES, function () {
      expectFiles('test/packages', [
        'jon:bank-account/README.md',
        'jon:bank-account/folder/INSIDE.md',
        'jon:secrets/README.md'
      ]);

      done();
    });
  });
});

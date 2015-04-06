var Packages = require('../packages');

var fs = require('fs-extra');

var PACKAGES = {
  "jon:bank-account": {
    "tarball": "https://api.github.com/repos/jperl/mgp-private-package-test/tarball/b8fdb40c99dc5057ee4a869cc4b4ad481d58a231",
    "path": "bank-account"
  },
  "jon:secrets": {
    "tarball": "https://api.github.com/repos/jperl/mgp-private-package-test/tarball/c2792ca2970c6d88e5e2fb6b8a26e26b81d220f9",
    "path": "secrets"
  },
  // An access token for a github account: mgp-private-package-test
  // which has permission to access `jperl/mgp-private-package-test`
  "token": "f7f2ee0b2695b9305bd5de3e018338613b5a9d15"
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

    Packages.copy(PACKAGES, function () {
      expectFiles('test/packages', [
        'jon:bank-account/README.md',
        'jon:secrets/README.md'
      ]);

      done();
    });
  });
});

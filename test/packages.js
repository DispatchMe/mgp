var Packages = require('../packages');

var _ = require('lodash'),
  shell = require('shelljs');

var pwd = shell.pwd();
var PACKAGE_DIR = 'test/packages';

before(function () {
  shell.rm('-fr', PACKAGE_DIR);
  Packages.config(PACKAGE_DIR);
});

after(function () {
  shell.rm('-fr', PACKAGE_DIR);
});

var PACKAGES_TO_LOAD = {
  "jon:bank-account": {
    "git": "https://github.com/DispatchMe/mgp-private-package-test.git",
    "version": "441e30e2c4b6622674c1663914baeff51c6c3ee5",
    "path": "bank-account"
  },

  "jon:secrets": {
    "git": "https://github.com/DispatchMe/mgp-private-package-test.git",
    "version": "441e30e2c4b6622674c1663914baeff51c6c3ee5",
    "path": "secrets"
  },

  // Test multiple package versions per repo we ran into
  // an issue before where that did not work.
  "jon:bank-account2": {
    "git": "https://github.com/DispatchMe/mgp-private-package-test.git",
    "version": "v0.0.2",
    "path": "bank-account"
  },

  // Test hitting another repo
  "dispatch:mgp": {
    "git": "https://github.com/DispatchMe/mgp.git",
    "version": "514633ccc63779620e161c0ce6972c3977ae4539",
    "path": "test/source-for-link/mgp-private-package-test/secrets"
  }
};

// Throw an error if any of the files are missing.
var expectFiles = function (dir, files) {
  files.forEach(function (file) {
    var path = dir + '/' + file;

    if (!shell.test('-f', path)) {
      throw new Error('Assertion failed - file not found: ' + path);
    }
  });
};

var checkFiles = function (done) {
  return function () {
    shell.cd(pwd);

    expectFiles('test/packages', [
      'jon_bank-account/README.md',
      'jon_bank-account/folder/INSIDE.md',
      'jon_secrets/README.md',
      'jon_bank-account2/README.md',
      'jon_bank-account2/folder/NEW_INSIDE.md',
      'dispatch_mgp/README.md'
    ]);

    done();
  };
};


describe('Meteor Git Packages -- mgp', function () {
  it('should copy each package into the package directory', function (done) {
    this.timeout(30000);

    Packages.load(PACKAGES_TO_LOAD, checkFiles(done));
  });

  it('should create a .gitignore in the package directory', function (done) {
    Packages.ensureGitIgnore(PACKAGES_TO_LOAD, function () {
      var gitIgnore = shell.cat(PACKAGE_DIR + '/.gitignore');

      _.forOwn(PACKAGES_TO_LOAD, function (def, packageName) {
        // Convert colons in package names to underscores for Windows
        packageName = packageName.replace(/:/g, '_');

        if (gitIgnore.indexOf(packageName) < 0 && packageName !== 'token')
          throw packageName + ' was not in the .gitignore';
      });

      done();
    });
  });
});

var PACKAGES_TO_LINK = {
  "jon:bank-account": {
    "path": "test/source-for-link/mgp-private-package-test/bank-account"
  },
  "jon:secrets": {
    "path": "test/source-for-link/mgp-private-package-test/secrets"
  },
  "jon:bank-account2": {
    "path": "test/source-for-link/mgp-private-package-test/bank-account2"
  },
  "dispatch:mgp": {
    "path": "test/source-for-link/mgp-private-package-test/secrets"
  }
};

describe('Meteor Git Packages -- mgp link', function () {
  it('should symlink each package into the package directory', function (done) {
    this.timeout(30000);

    Packages.link(PACKAGES_TO_LINK, checkFiles(done));
  });
});

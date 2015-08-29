var Test = module.exports = {};

var Packages = require('../packages');

var shell = require('shelljs');
var pwd = shell.pwd();

// The package directory relative to the project root.
Test.PACKAGE_DIR = 'test/packages';

var EXPECTED_FILES = [
  'jon-bank-account/README.md',
  'jon-bank-account/folder/INSIDE.md',
  'jon-secrets/README.md',
  'jon-bank-account2/README.md',
  'jon-bank-account2/folder/NEW_INSIDE.md',
  'jon-bank-account2/folder/.dotfile',
  'dispatch-mgp/README.md'
];

Test.PACKAGE_DEFINITIONS = {
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
    "version": "v0.0.3",
    "path": "bank-account"
  },

  // Test using another repo
  "dispatch:mgp": {
    "git": "https://github.com/DispatchMe/mgp.git",
    "version": "514633ccc63779620e161c0ce6972c3977ae4539",
    "path": "test/source-for-link/mgp-private-package-test/secrets"
  }
};

/**
 * Remove the old test package directory
 * and configure the package directory.
 */
Test.prepare = function () {
  Test.cleanup();

  Packages.config(Test.PACKAGE_DIR);
};

/**
 * Remove the test package directory.
 */
Test.cleanup = function () {
  shell.rm('-fr', Test.PACKAGE_DIR);
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

/**
 * Check the folder contains files from the
 * repositories in the packages definition.
 */
Test.checkFiles = function (done) {
  return function () {
    shell.cd(pwd);
    expectFiles(Test.PACKAGE_DIR, EXPECTED_FILES);
    done();
  };
};

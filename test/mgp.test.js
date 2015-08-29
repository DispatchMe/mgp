var _ = require('lodash');
var assert = require('assert');
var shell = require('shelljs');

var Packages = require('../packages');
var Test = require('./test');

describe('Meteor Git Packages -- mgp', function () {
  before(Test.prepare);
  after(Test.cleanup);

  it('should copy each package into the package directory', function (done) {
    this.timeout(30000);

    Packages.load(Test.PACKAGE_DEFINITIONS, Test.checkFiles(done));
  });

  it('should convert ssh urls to https when --https is passed', function () {
    var httpsDefinitions = Packages.toHttps({
      'package-one': {
        'git': 'git@github.com:DispatchMe/mgp-private-package-test.git'
      }
    });

    assert.equal(httpsDefinitions['package-one'].git,
      'https://github.com/DispatchMe/mgp-private-package-test.git');
  });

  it('should create a .gitignore in the package directory', function (done) {
    Packages.ensureGitIgnore(Test.PACKAGE_DEFINITIONS, function () {
      var gitIgnore = shell.cat(Test.PACKAGE_DIR + '/.gitignore');

      _.forOwn(Test.PACKAGE_DEFINITIONS, function (def, packageName) {
        // Convert colons in package names to dashes for Windows
        packageName = packageName.replace(/:/g, '-');

        if (gitIgnore.indexOf(packageName) < 0 && packageName !== 'token') {
          throw packageName + ' was not in the .gitignore';
        }
      });

      done();
    });
  });
});

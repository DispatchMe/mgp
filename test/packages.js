var Packages = require('../packages');

var assert = require('assert');
var fs = require('fs-extra');

var PACKAGES = {
  'dispatch:roles': {
    repo: 'git@github.com:DispatchMe/meteor-packages.git',
    tag: '29649f115b22222d094dc58a2c65ca094c1c4a9a',
    path: 'roles'
  },
  'dispatch:accounts': {
    repo: 'git@github.com:DispatchMe/meteor-packages.git',
    tag: '4887ffe80e0c40de0d650d4fb2f33570f8f3ced1',
    path: 'accounts-dispatch'
  }
};

var expectFiles = function (dir, files) {
  files.forEach(function (file) {
    fs.openSync(dir + '/' + file, 'r');
  });
};

describe('Package Loading', function () {
  var repoDir = 'test/.packages',
    packageDir = 'test/packages';

  Packages.config({
    repoDir: repoDir,
    packageDir: packageDir
  });

  it('should clone each unique set of packages / tags', function (done) {
    this.timeout(30000);

    Packages.checkout(PACKAGES, function () {
      expectFiles(repoDir, [
        '29649f115b22222d094dc58a2c65ca094c1c4a9a/README.md',
        '4887ffe80e0c40de0d650d4fb2f33570f8f3ced1/README.md'
      ]);

      done();
    });
  });

  it('should symlink each package', function (done) {
    Packages.link(PACKAGES, function () {
      expectFiles(packageDir, [
        'dispatch:accounts/README.md',
        'dispatch:roles/README.md'
      ]);

      done();
    });
  });
});

var Packages = require('../packages');
var Test = require('./test');

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
  "jon:bank-account3": {
    "path": "test/source-for-link/mgp-private-package-test/bank-account2"
  },
  "dispatch:mgp": {
    "path": "test/source-for-link/mgp-private-package-test/secrets"
  }
};

describe('Meteor Git Packages -- mgp link', function () {
  before(Test.prepare);
  after(Test.cleanup);

  it('should symlink each package into the package directory', function (done) {
    this.timeout(30000);

    Packages.link(PACKAGES_TO_LINK, Test.checkFiles(done));
  });
});

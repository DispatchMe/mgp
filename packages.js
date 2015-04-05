var Packages = module.exports = {};

var _ = require('lodash'),
  fs = require('fs-extra'),
  path = require('path'),
  nodegit = require('nodegit');

var PACKAGE_DIR = process.cwd() + '/packages';
var REPO_DIR = process.cwd() + '/.packages';

/**
 * Configure the repo and package directories.
 * @param [options.packageDir] The directory to symlink the packages to.
 *                             Defaults to cwd/packages
 * @param [options.repoDir]    The directory to clone the repos to.
 *                             Defaults to cwd/.packages
 */
Packages.config = function (options) {
  if (options.packageDir) PACKAGE_DIR = path.resolve(options.packageDir);
  if (options.repoDir) REPO_DIR = path.resolve(options.repoDir);
};

/**
 * Load the packages file.
 * Ex.
 * {
 *   'dispatch:roles': {
 *     'repo': 'https://github.com/DispatchMe/meteor-packages.git',
 *     'tag': '29649f115b22222d094dc58a2c65ca094c1c4a9a',
 *     'root': 'roles'
 *   }
 * }
 *
 * @param [file] Defaults to cwd/.meteor/git-packages.json
 * @param callback
 */
Packages.fromFile = function (file, callback) {
  if (_.isFunction(file)) {
    callback = file;
    file = null;
  }

  var packagesFile = file || process.cwd() + '/.meteor/git-packages.json';
  fs.readJson(packagesFile, function (err, packages) {
    if (err) throw err;

    // XXX check the packages schema
    if (callback) callback(packages);
  });
};

/**
 * Checkout each unique set of repos / tags into dir/owner/name/tag
 * @param packages The package definitions which have
 *                 the repos and tags to checkout.
 *
 * @param callback
 */
Packages.checkout = function (packages, callback) {
  // Remove the packages directory
  // XXX Keep the directory and only fetch the new repos
  fs.removeSync(REPO_DIR);
  fs.ensureDirSync(REPO_DIR);

  // Load the unique repo / tags
  var packageDefs = _.uniq(_.values(packages), false, function (repo) {
    return repo.repo + repo.tag;
  });

  callback = _.after(packageDefs.length, callback);

  packageDefs.forEach(function (packageDef) {
    var repoDir = REPO_DIR + '/' + packageDef.tag;

    nodegit.Clone(packageDef.repo, repoDir,
      {
        remoteCallbacks: {
          certificateCheck: function () {
            // github will fail cert check on some OSX machines
            // this overrides that check
            return 1;
          },
          credentials: function (url, userName) {
            return nodegit.Cred.sshKeyNew(
              userName,
              process.env.HOME + '/.ssh/id_rsa.pub',
              process.env.HOME + '/.ssh/id_rsa',
              '');
          }
        }
      })
      .then(function (repo) {
        // Checkout the commit
        return repo.setHeadDetached(packageDef.tag,
          nodegit.Signature.default(repo), packageDef.tag);
      })
      .done(callback);
  });
};

/**
 * Symlink the .packages/ into packages/
 * @param packages The package definitions to symlink
 * @param callback
 */
Packages.link = function (packages, callback) {
  fs.ensureDirSync(PACKAGE_DIR);

  callback = _.after(_.values(packages).length, callback);

  _.forOwn(packages, function (packageDef, name) {
    var srcPath = REPO_DIR + '/' + packageDef.tag;
    if (packageDef.path) srcPath += '/' + packageDef.path;

    var destPath = PACKAGE_DIR + '/' + name;
    fs.removeSync(destPath);

    fs.symlink(srcPath, destPath, callback);
  });
};

var Packages = module.exports = {};

var _ = require('lodash'),
  fs = require('fs-extra'),
  path = require('path'),
  request = require('request'),
  tar = require('tar'),
  zlib = require('zlib');

var PACKAGE_DIR = process.cwd() + '/packages';

/**
 * Configure the package directory.
 * @param packageDir The directory to copy the packages to.
 *                             Defaults to cwd/packages
 */
Packages.config = function (packageDir) {
  PACKAGE_DIR = path.resolve(packageDir);
};

/**
 * Load the packages file.
 * @param [file] Defaults to cwd/git-packages.json
 * @param callback
 */
Packages.fromFile = function (file, callback) {
  if (_.isFunction(file)) {
    callback = file;
    file = null;
  }

  var packagesFile = file || process.cwd() + '/git-packages.json';
  fs.readJson(packagesFile, function (err, packages) {
    if (err) throw err;

    // XXX check the packages schema
    if (callback) callback(packages);
  });
};

/**
 * Download and copy the packages from teh tarballs
 * @param packages The package definitions which have
 *                 the repos and tags to checkout.
 *
 * @param done
 */
Packages.copy = function (packages, done) {
  fs.ensureDirSync(PACKAGE_DIR);

  // Create a temp directory to store the tarballs
  var tempDir = PACKAGE_DIR + '/temp';
  fs.ensureDirSync(tempDir);

  // { url: { destPath: srcPath } }
  var tarballs = {};

  _.forOwn(packages, function (definition, packageName) {
    var url = definition.tarball;
    if (!url) return;

    var tarball = tarballs[url] = tarballs[url] || {};

    // destPath = srcPath
    tarball[packageName] = definition.path || '';
  });

  var headers = {'User-Agent': 'meteor-git-packages tool'};
  if (packages.token) headers.Authorization = 'token ' + packages.token;

  // Remove the temp directory after the packages are copied.
  var packagesCopied = _.after(_.keys(tarballs).length, function () {
    fs.removeSync(tempDir);
    done();
  });

  var copyPackages = function (tarDir, packagePaths) {
    var packageCopied = _.after(_.keys(packagePaths.length), packagesCopied);
    _.forOwn(packagePaths, function (srcPath, name) {
      var destPath = PACKAGE_DIR + '/' + name;
      fs.removeSync(destPath);
      fs.copy(tarDir + '/' + srcPath, destPath, packageCopied);
    });
  };

  var index = 0;
  _.forOwn(tarballs, function (packagePaths, tarballUrl) {
    var tarDir = tempDir + '/' + index++;

    request.get({
      uri: tarballUrl,
      headers: headers
    })
      .on('error', function (error) {
        throw error;
      })
      .pipe(zlib.Gunzip())
      .pipe(tar.Extract({path: tarDir, strip: 1}))
      .on('end', function () {
        copyPackages(tarDir, packagePaths);
      });
  });
};

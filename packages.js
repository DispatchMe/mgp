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
    // XXX check the packages schema
    if (callback) callback(err, packages);
  });
};

// Create a packages document per tarball url.
// { tarUrl: { packageName: tarPath, .. }, ... }
var getTarballDict = function (packages) {
  var tarballs = {};

  _.forOwn(packages, function (definition, packageName) {
    var url = definition.tarball;
    if (!url) return;

    var tarball = tarballs[url] = tarballs[url] || {};

    // package name -> source path inside tarball
    tarball[packageName] = definition.path || '';
  });

  return tarballs;
};

// Copy the packages from the tarball directory to the package path
var copyPackages = function (packages, tarballDir, done) {
  var packageCopied = _.after(_.keys(packages.length), done);

  _.forOwn(packages, function (src, packageName) {
    src = tarballDir + '/' + src;

    var dest = PACKAGE_DIR + '/' + packageName;
    fs.removeSync(dest);

    fs.copy(src, dest, function (error) {
      // Fail explicitly.
      if (error) throw 'Could not copy ' + src + ' to ' + dest;

      packageCopied();
    });
  });
};

/**
 * Download the tarballs and copy the packages.
 * @param packages The packages to load.
 * @param done
 */
Packages.load = function (packages, done) {
  fs.ensureDirSync(PACKAGE_DIR);

  // Create a temp directory to store the tarballs
  var tempDir = PACKAGE_DIR + '/temp';
  fs.ensureDirSync(tempDir);

  var tarballs = getTarballDict(packages);

  // Remove the temp directory after the packages are copied.
  var tarballCopied = _.after(_.keys(tarballs).length, function () {
    fs.removeSync(tempDir);
    done();
  });

  // Load the tarballs from github.
  var headers = {'User-Agent': 'meteor-git-packages tool'};
  if (packages.token) headers.Authorization = 'token ' + packages.token;

  var index = 0;
  _.forOwn(tarballs, function (packagesFortar, tarUrl) {
    var tarballDir = tempDir + '/' + index++;

    request.get({
      uri: tarUrl,
      headers: headers
    })
      .on('error', function (error) {
        throw error;
      })
      .pipe(zlib.Gunzip())
      .pipe(tar.Extract({path: tarballDir, strip: 1}))
      .on('end', function () {
        copyPackages(packagesFortar, tarballDir, tarballCopied);
      });
  });
};

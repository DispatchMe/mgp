var Packages = module.exports = {};

var _ = require('lodash'),
  fs = require('fs-extra'),
  path = require('path'),
  shell = require('shelljs');

// We rely on system git command and its configuration
// In this way it is possible to pick up .netrc
if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}

var PACKAGE_DIR = process.cwd() + '/packages';

function resolvePath(string) {
  if (string.substr(0, 1) === '~') {
    var homedir = (process.platform.substr(0, 3) === 'win') ? process.env.HOMEPATH : process.env.HOME;
    string = homedir + string.substr(1);
  } else if (string.substr(0, 1) !== '/') {
    string = process.cwd() + '/' + string;
  }
  return path.resolve(string);
}

/**
 * Configure the package directory.
 * @param packageDir The directory to copy the packages to.
 *                             Defaults to cwd/packages
 */
Packages.config = function (packageDir) {
  PACKAGE_DIR = resolvePath(packageDir);
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

// Create a packages document per git url.
// { gitRepo: { version: { packageName: packagePath, .. }, ... } }
var getPackagesDict = function (packages) {
  var resolvedPackages = {};

  _.forOwn(packages, function (definition, packageName) {
    if (!definition) return;

    var git = definition.git;
    if (!git) return;

    var repo = resolvedPackages[git] = resolvedPackages[git] || {};

    // If no version provided - pull HEAD
    version = definition.version || 'HEAD';
    repo[version] = repo[version] || {};
    repo[version][packageName] = definition.path || '';
  });

  return resolvedPackages;
};

// Test if path exists and fail with error if it is not exists
var checkPathExist = function (path, errorMessage) {
  if (!shell.test('-e', path)) {
    shell.echo('Error: ' + errorMessage);
    shell.exit(1);
  }
};

/**
 * Create a git ignore in the package directory for the packages.
 * @param packages
 * @param {Function} callback
 */
Packages.ensureGitIgnore = function (packages, callback) {
  var filePath = PACKAGE_DIR + '/.gitignore';

  fs.ensureFileSync(filePath);
  fs.readFile(filePath, 'utf8', function (err, gitIgnore) {
    // Append packages to the gitignore
    _.forOwn(packages, function (def, packageName) {
      // Convert colons in package names to underscores for Windows
      packageName = packageName.replace(/:/g, '_');

      if (packageName === 'token' || gitIgnore.indexOf(packageName) > -1) return;

      gitIgnore += packageName + '\n';
    });

    fs.writeFile(filePath, gitIgnore, callback);
  });
};

/**
 * Symlink local directories to the packages directory.
 * @param packages The packages to symlink.
 * @param {Function} callback
 */
Packages.link = function (packages, callback) {
  shell.mkdir('-p', PACKAGE_DIR);

  var dirLinked = _.after(_.keys(packages).length, callback);

  _.forOwn(packages, function (def, packageName) {
    if (!def.path || !packageName) return;

    // Convert colons in package names to underscores for Windows
    packageName = packageName.replace(/:/g, '_');
    var dest = PACKAGE_DIR + '/' + packageName;
    shell.rm('-fr', dest);

    var src = resolvePath(def.path);
    checkPathExist(src, 'Cannot find package ' + packageName + ' at ' + src);

    shell.ln('-s', src, dest);
    checkPathExist(src, 'Link failed for ' + dest);

    dirLinked();
  });
};

/**
 * Clones repositories and copy the packages.
 * @param packages The packages to load.
 * @param {Function} callback
 */
Packages.load = function (packages, callback) {
  shell.mkdir('-p', PACKAGE_DIR);

  // Create a temp directory to store the tarballs
  var tempDir = PACKAGE_DIR + '/temp';
  shell.rm('-fr', tempDir);
  shell.mkdir('-p', tempDir);
  shell.cd(tempDir);

  var resolvedPackages = getPackagesDict(packages);

  var repoDirIndex = 0;

  _.forOwn(resolvedPackages, function (repoPackages, gitRepo) {
    var repoDir = tempDir + '/' + repoDirIndex;

    // Change to the temp directory before cloning the repo
    shell.cd(tempDir);

    if (shell.exec('git clone ' + gitRepo + ' ' + repoDirIndex, {silent: true}).code !== 0) {
      shell.echo('Error: Git clone failed');
      shell.exit(1);
    }

    // Change to the repo directory
    shell.cd(repoDir);

    repoDirIndex++;

    _.forOwn(repoPackages, function (storedPackages, version) {
      _.forOwn(storedPackages, function (src, packageName) {
        if (shell.exec('git reset --hard ' + version, {silent: false}).code !== 0) {
          shell.echo('Error: Git checkout failed for ' + packageName + '@' + version);
          shell.exit(1);
        }
        packageName = packageName.replace(/:/g, '_');
        shell.echo('\nProcessing ' + packageName + ' at ' + version);

        shell.echo('Cleaning up');
        var dest = PACKAGE_DIR + '/' + packageName;
        shell.rm('-rf', dest);

        src = repoDir + '/' + src + '/';
        checkPathExist(src, 'Cannot find package in repository: ' + src);

        shell.echo('Copying package');
        // Adding the dot after `src` forces it to copy hidden files as well
        shell.cp('-rf', src + '.', dest);
        checkPathExist(dest, 'Cannot copy package: ' + dest);
        shell.echo('Done...\n');
      });
    });

  });

  // Remove the temp directory after the packages are copied.
  shell.cd(process.cwd());
  shell.rm('-fr', tempDir);
  callback();
};

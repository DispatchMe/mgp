# Meteor Git Packages [![Build Status](https://travis-ci.org/DispatchMe/mgp.svg?branch=master)](https://travis-ci.org/DispatchMe/mgp)

This tools helps you share private meteor packages.

## Getting Started

- `npm install -g mgp`

- Add `git-packages.json` to the root of your project.

````
{
  "my:private-package": {
    "git": "git@github.com:my/private-packages.git",
    "version": "commithashortag",
    "path": "optional/directory/path"
  },
  "my:other-private-package": {
    "git": "git@github.com:my/private-packages.git",
    "version": "commithashortag"
  }
}
````

- Run `mgp` in your meteor directory to copy the packages from github or `mgp my:private-package` to copy an individual package.

You can also run `mgp --https` to convert github ssh urls to https. This is useful for using `.netrc` on build machines.

or

- Add `local-packages.json` to the root of your project:

````
{
  "my:private-package": {
    "path": "~/path/to/private-package"
  },
  "my:other-private-package": {
    "path": "relative/path/to/other-private-package"
  }
}
````

- Run `mgp link` in your meteor directory to symlink your local packages or `mgp link my:private-package` to symlink an individual package.

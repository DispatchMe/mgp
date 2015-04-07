# Meteor Git Packages [![Build Status](https://travis-ci.org/DispatchMe/mgp.svg)](https://travis-ci.org/DispatchMe/mgp)

This tools helps you share private meteor packages.

## Getting Started

- `npm install -g mgp`

- Add `git-packages.json` to the root of your project and [generate](https://github.com/settings/applications#personal-access-tokens) a token for private tarball access.

````
{
  "my:private-package": {
    "tarball": "https://api.github.com/repos/my/private-packages/tarball/commithash",
    "path": "optional/directory/path"
  },
  "my:other-private-package": {
    "tarball": "https://api.github.com/repos/my/private-packages/tarball/commithash"
  },
  "token": "GITHUB_ACCESS_TOKEN"
}
````

- Run `mgp` in your meteor directory to copy the packages from github.

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

- Run `mgp link` in your meteor directory to symlink your local packages.

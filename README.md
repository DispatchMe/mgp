# Meteor Git Packages [![Build Status](https://travis-ci.org/DispatchMe/mgp.svg)](https://travis-ci.org/DispatchMe/mgp)

This tools helps you share private meteor packages.

## Getting Started

- `npm install -g mgp`

- Add `git-packages.json` to the root of your project and [generate](https://github.com/settings/applications#personal-access-tokens) a token for private tarball access.

````
{
  "your:private-package": {
    "tarball": "https://api.github.com/repos/your/private-packages/tarball/commithash",
    "path": "optional/directory/path"
  },
  "your:other-private-package": {
    "tarball": "https://api.github.com/repos/your/private-packages/tarball/commithash"
  },
  "token": "GITHUB_ACCESS_TOKEN"
}
````

- Run `mgp` in your meteor directory

When meteor [refactors](https://meteor.hackpad.com/Proposal-queues-based-build-tool-kbqhWoYYfKR)
 their build tool we can plug this into it.

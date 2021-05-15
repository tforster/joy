# Change Log

v1.2.0 **Git Ticket Command** (2021-05-15)

- [Create git-ticket.sh to implement basic JoyFlow](https://dev.azure.com/techsmarts/TechSmarts/_workitems/edit/889)

v1.1.0 **Joy Private Docker Registry** (2019-10-02)

Added support for an S3 backed private Docker registry

- Note that since Joy defines that we store per-client AWS credentials in ~/.aws/credentials, this tool is now accesses and reads that file. There is no writing at this time and read credentials are stored in memory only.
- This release also sees some cleanup of joy.js where routes have now been moved out to a separate routes/index.js file.
- Also added a new commands summary table in the section above. Updates to this table should be synchronized with future feature releases and the changelog for enhanced communication of changes.

v1.0.0 **Breaking Refactor** (2019-09-13)

- Replaced Caporal with a custom parser that can handle multiple sub levels of commands
- Refactored into a service based architecture reminiscent of an API
  - Various command sequences are now defined similar to a connect.js path aka `joy.use('/build/docker/{-n, --name, name}', controller.buildDocker)`
  - A controller file handles the previously defined routes, checks validity, etc before calling a specific service class
  - A services folder contains services for handling docker, swagger, S3, etc
- Bumped the major version from 0 to 1 as a result

v0.3.3 **Another Refactor** (2019-08-22)

- Switched to Caporal for managing CLI args
- Moved away from .sh to .js (aka Shell to NodeJS)
- Static site generator code is more robust

Known Issues

- Most commands, except `joy build static` are not working following the refactorig due to some pathing issues that will be resolved in the next release.

v0.3.2 **A11Y** (2019-07-26)

Added new `test a11y` command for basic accessibility testing

v0.3.1 **Bug**

v0.3.0 **NPX'fied** (2019-05-16)

Changed installation strategy from SSH and Git based to NPM/NPX. Also improved the basic help text for each command.

v0.2.0 **Local environment settings** (2019-05-07)

Local .joy folders gain a new config.local.env file. This file is added once then .gitignored so that each installation can maintain its own local settings. Settings that include local path to secrets volume, environment type (e.g. dev, stage or prod), etc.

v0.1.0 **Really early PoC** (2019-04-05)

First commit to Github.

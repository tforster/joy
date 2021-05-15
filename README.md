# Joy CLI <!-- omit in toc -->

_The Jake and trOY devops-y utility._

# Table of Contents <!-- omit in toc -->

- [Installation](#installation)
- [Built With](#built-with)
- [Tips and Tricks](#tips-and-tricks)
  - [Required Runtime Dependencies](#required-runtime-dependencies)
  - [Required Development Dependencies](#required-development-dependencies)
  - [Configure a new Joy project](#configure-a-new-joy-project)
  - [Current Joy Commands](#current-joy-commands)
  - [Notes for .joy/config.json](#notes-for-joyconfigjson)
  - [Debugging from Visual Studio Code](#debugging-from-visual-studio-code)
- [Change Log](#change-log)

## Installation

1. Git clone the project
2. Checkout master
3. Create an alias in bash to cli/joy.js
4. Add a new AWS profile for [registry.joy] in ~/.aws/credentials. See @troy for values until we have a shared secrets process.

## Built With

The following is a list of the technologies used to develop and manage this project.

| Tool                                                                                                              | Description                                                                                          |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [AWS CLI 1.16.52](https://aws.amazon.com/cli/)                                                                    | Used for managing buckets and files on dev.                                                          |
| [AWS-SDK](https://aws.amazon.com/sdk-for-node-js/)                                                                | Helps orchestrate S3 and CloudFront management                                                       |
| [Coffee](https://en.wikipedia.org/wiki/Coffee)                                                                    | A good source of [C8H10N4O2](https://pubchem.ncbi.nlm.nih.gov/compound/caffeine)                     |
| [Docker Desktop WSL 2 Tech Preview](https://docs.docker.com/docker-for-windows/wsl-tech-preview/)                 | A current version of Docker for Linux and OSX should work the same (but unconfirmed as of now)       |
| [Git 2.17.1](https://git-scm.com/)                                                                                | Source Code Management (SCM) client                                                                  |
| [NodeJS 12.10.0](https://nodejs.org/en/)                                                                          | Task running, automation and driving the API                                                         |
| [NPM 6.9.0](https://www.npmjs.com/package/npm)                                                                    | Node package management                                                                              |
| [Oh-My-Zsh](https://github.com/robbyrussell/oh-my-zsh)                                                            | ZSH shell enhancement                                                                                |
| [Ubuntu 18.04 for WSL](https://www.microsoft.com/en-ca/p/ubuntu/9nblggh4msv6?activetab=pivot:overviewtab)         | Canonical supported Ubuntu for Windows Subsystem for Linux                                           |
| [Visual Studio Code 1.37.1](https://code.visualstudio.com/)                                                       | Powerful and cross-platform code editor                                                              |
| [Windows 10 Pro Insider Preview](https://www.microsoft.com/en-us/software-download/windowsinsiderpreviewadvanced) | The stable version of the Insiders build typically brings new tools of significant use to developers |
| [WSL 2](https://devblogs.microsoft.com/commandline/wsl-2-is-now-available-in-windows-insiders/)                   | Windows Subsystem for Linux supports native Linux distributions                                      |
| [ZSH](https://www.zsh.org/)                                                                                       | A better shell than Bash                                                                             |

## Tips and Tricks

- If using Windows consider upgrading to WSL2. While it is still pre-release it has proven to be exceptionally stable and outperforms WSL by as much as 20x.

### Required Runtime Dependencies

- NodeJs 12.10.0+: Everything else should come in from `npm i`.

### Required Development Dependencies

- Git
- A code editor

### Configure a new Joy project

Instructions here to explain how to use `joy init` and what to change in the config.env file.

To view Swagger docs and send Slack notifications to the #build channel ensure that the project config.env has the following two lines. If you're running your API from a Docker container then substitute the proper URI. The Slack webhook URL is masked so we don't accidentally copy/paste and spam the wrong client's channel.

```bash
SWAGGER_FILE_URI=http://localhost:10010/swagger
SLACK_INCOMING_WEBHOOK_URL https://hooks.slack.com/services/T7KSWL4E9/BGL0HSVB2/************************
```

### Current Joy Commands

| Joy   | Subcommand | Subcommand | Subcommand | Description                                                                                                                                             | Flags            |
| ----- | ---------- | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| start | docker     | registry   |            | Starts the private Docker registry on http://localhost:5000. This command requires a properly configured AWS credentials profile called [registry.joy]. |                  |
| stop  | docker     | registry   |            | Stops the private Docker registry                                                                                                                       |                  |
| build |            |            |            |                                                                                                                                                         |                  |
| build | static     |            |            | Compiles the static site into build/dev, build/stage or build/prod depending upon the stage flag                                                        | -s --stage stage |

### Notes for .joy/config.json

Coming soon...

### Debugging from Visual Studio Code

Create an appropriate configuration in ./vscode/launch.json

```javascript
{
  "version": "0.2.0",
  "configurations": [{
    "type": "node",
    "request": "launch",
    "name": "Debug joy.js",
    "program": "${workspaceFolder}/joy/joy.js",
    "args": [
      "Joy",
      "args",
      "to",
      "debug",
      "here"
    ]
  }]
}
```

## Change Log

See [CHANGELOG.md](CHANGELOG.md)

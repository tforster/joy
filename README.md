# joy v0.1.0

The Jake and trOY devops-y utility

## Built With

* [Coffee](https://en.wikipedia.org/wiki/Coffee): A good source of [C8H10N4O2](https://pubchem.ncbi.nlm.nih.gov/compound/caffeine)
* [Git 2.17.1](https://git-scm.com/)
* [Gulp](http://gulpjs.com/)
* [NodeJS 11.1.0](https://nodejs.org/en/)
* [NPM 6.4.1](https://www.npmjs.com/package/npm)
* [Oh-My-Zsh](https://github.com/robbyrussell/oh-my-zsh) on Bash on Ubuntu on [Windows Subsystem for Linux](https://msdn.microsoft.com/en-us/commandline/wsl/install_guide)
* [Visual Studio Code 1.29.1](https://code.visualstudio.com/) on Windows 10

### Required Runtime Dependencies

* NodeJs: Everything else should come in from `npm i`.

### Required Development Dependencies

* Git
* A code editor

## Installation

via curl

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/tforster/joy/develop/cli/install.sh)"
```

via wget

```bash
sh -c "$(wget https://raw.githubusercontent.com/tforster/joy/develop/cli/install.sh -O -)"
```

## Usage

Once installed you can interact with Joy by simply typing `joy {command} [param1] [param2] [param3] [etc]`. Be sure to run `joy update` periodically to ensure you have the latest version.

### Configure a new Joy project

Instructions here to explain how to use `joy init` and what to change in the config.env file.

To view Swagger docs and send Slack notifications to the #build channel ensure that the project config.env has the following two lines. If you're running your API from a Docker container then substitute the proper URI. The Slack webhook URL is masked so we don't accidentally copy/paste and spam the wrong client's channel.

```bash
SWAGGER_FILE_URI=http://localhost:10010/swagger
SLACK_INCOMING_WEBHOOK_URL https://hooks.slack.com/services/T7KSWL4E9/BGL0HSVB2/************************
```

### Joy Commands

Commands are grouped into five categories:

* Docker
* Navigation
* Swagger
* Utilities
* Wordpress

### Notes for .joy/config.env

tbd

## Developer Installation and Setup

1. Git clone
2. Some other stuff

### Debugging from Visual Studio Code

Create an appropriate configuration in ./vscode/launch.json

``` javascript
{
  "version": "0.2.0",
  "configurations": [{
    "type": "node",
    "request": "launch",
    "name": "Debug joy.js",
    "program": "${workspaceFolder}/joy/joy.js",
    "useWSL": true,
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

Note that the example above sets `"useWSL": true`. This is necessary if running on Windows with Node and the majority of the development tool chain installed into the Windows Subsystem for Linux.

## Tips and Tricks

tbd

## Change Log

v0.1.0 **Really early PoC** (2019-04-05)

First commit to Github.

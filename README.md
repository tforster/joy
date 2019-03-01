# joy v0.0.0

The Jake and trOY Devopsy utility

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

## Runtime Installation

1. Clone the repository `git clone git@ssh.dev.azure.com:v3/geekhacks/Joy/Joy`
1. Checkout the develop branch for now since we do not have a production release on master yet `git checkout develop`.
1. Fetch Node dependencies with `npm i`.
1. Add the Joy utility folder to your path after adjusting the following to suit your shell and environment `export PATH=/home/tforster/dev/geekhacks/joy/utility:$PATH`
1. If you have added the export line to your .*shrc file the don't forget to `source` it before continuing
1. Test it out by navigating to the root of a Joy enabled project and run `joy.sh env`. This should display all environment variables including those in .joy/config.env and secrets/secrets.env.

### Notes for .joy/config.env

To view Swagger docs and send Slack notifications to the #build channel ensure that the project config.env has the following two lines. If you're running your API from a Docker container then substitute the proper URI. The Slack webhook URL is masked so we don't accidentally copy/paste and spam the wrong client's channel.

```bash
SWAGGER_FILE_URI=http://localhost:10010/swagger
SLACK_INCOMING_WEBHOOK_URL https://hooks.slack.com/services/T7KSWL4E9/BGL0HSVB2/************************
```

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
    "program": "${workspaceFolder}/utility/joy.js",
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

## Change Log

v0.0.0 **Really early PoC** (2019-03-01)

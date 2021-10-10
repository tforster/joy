# Joy CLI <!-- omit in toc -->

_The **J**ake and Tr**oy** devopsy utility._

# Table of Contents <!-- omit in toc -->

- [Prerequisites](#prerequisites)
- [Setup and Configuration](#setup-and-configuration)
- [Usage](#usage)
  - [How It Works](#how-it-works)
  - [Commands](#commands)
- [Change Log](#change-log)

# Prerequisites

The versions listed for these prerequisites are current at the time of writing. More recent versions will likely work but "your mileage may vary".

- A current laptop or desktop running the latest version of Windows 10 Pro with [WSL2](https://www.omgubuntu.co.uk/how-to-install-wsl2-on-windows-10) and [Ubuntu 20.04](https://www.microsoft.com/en-gb/p/ubuntu-2004-lts/9n6svws3rx71), or MacOS.
- A good code editor. While we recommend [Microsoft VSCode 1.57.1](https://code.visualstudio.com/download) and reference it in some examples any contemporary editor will work.
- [Docker v20.10.9](https://docs.docker.com/get-docker/)
- [Docker Compose v1.29.2](https://docs.docker.com/compose/install/)
- [Git 2.31.1](https://git-scm.com/downloads)
- [GitHub CLI](https://github.com/cli/cli): Required if you wish to use `joy git ticket` with GitHub repositories.
- [jq v1.6](https://stedolan.github.io/jq/): A shell tool for parsing JSON.
- [Microsoft Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli): Required if you wish to use `joy git ticket` with Microsoft Azure DevOps Boards
  - [Azure DevOps Extension for Azure CLI](https://github.com/Azure/azure-devops-cli-extension): Following the installation of the Microsoft Azure CLI run `az extension add --name azure-devops`
- [Node.js v16.3.0 with NPM 7.15.1](https://nodejs.org/en/download/)
- [Bash Debug v0.3.9](https://marketplace.visualstudio.com/items?itemName=rogalmic.bash-debug): Required if you are developing and debugging with VSCode.

# Setup and Configuration

1. Clone the project
2. Install dependencies

    `npm install`

    _Note that the install process will also symlink the scripts in the src folder to your path making the CLI available from any project directory._

# Usage

Joy can be thought of as a bash task runner that can launch scripts that are grouped together in families.

## How It Works

opinionated view on environment settings per project, get read from *.env, the passed to scripts.

## Commands

Most commands are invoked directly from joy and a subcommand family. Some commands are available directly from Joy and in one command, `cw`, is available outside of Joy.

| Prefix | Family       | Command                         | description                                                       |
| ------ | ------------ | ------------------------------- | ----------------------------------------------------------------- |
| joy    | aws          | certificate-manager-new-cert    | Provision new ACM certificates                                    |
| joy    | aws          | cloudfront-new-distribution     | Create a new CloudFront distribution                              |
| joy    | aws          | dynamodb-new-table              | Create a new DynamoDB table                                       |
| joy    | aws          | route53-cloudfront-alias        | Alias a CloudFront distribution to a Route53 CNAME                |
| joy    | aws          | route53-new-zone                | Createa  new Route53 hosted zone                                  |
| joy    | aws          | s3-new-web                      | Create a new S3 bucket configured for static web hosting          |
| joy    | git          | git-ticket                      | Create a new branch based on the provided ticket number           |
| joy    | wp           | deploy                          | Deploy a WebProducer application to S3                            |
| joy    | wp           | wp-install                      | Create a new empty WebProducer instance                           |
| joy    | wpe          | build-stack                     |                                                                   |
| joy    | wpe          | exportEnv                       |                                                                   |
| joy    | wpe          | setHomeSiteUrl                  |                                                                   |
| joy    | wpe          | sart-stack                      |                                                                   |
| joy    | wpe          | syncCodeToStage                 |                                                                   |
| joy    | wpe          | syncDataAndPluginsFromProdToDev |                                                                   |
| joy    | create-certs |                                 | Create a new self-signed certificate                              |
| joy    | cw           |                                 | Manage working directory bookmarks                                |
| joy    | help         |                                 | Get help for the Joy CLI                                          |
| joy    | info         |                                 | Get information about the current directroy                       |
| cw     |              |                                 | Change the current working directory to one previously bookmarked |

# Change Log

See [CHANGELOG.md](CHANGELOG.md)

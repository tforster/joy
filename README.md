# Joy CLI <!-- omit in toc -->

_The **J**ake and Tr**oy** devopsy utility._

# Table of Contents <!-- omit in toc -->

- [Prerequisites](#prerequisites)
- [Setup and Configuration](#setup-and-configuration)
  - [Scripts](#scripts)
- [Notes](#notes)
- [Change Log](#change-log)

# Prerequisites

The versions listed for these prerequisites are current at the time of writing. More recent versions will likely work but "your mileage may vary".

- A current laptop or desktop running the latest version of Windows 10 Pro with [WSL2](https://www.omgubuntu.co.uk/how-to-install-wsl2-on-windows-10) and [Ubuntu 20.04](https://www.microsoft.com/en-gb/p/ubuntu-2004-lts/9n6svws3rx71), or MacOS.
- A good code editor. While we recommend [Microsoft VSCode 1.57.1](https://code.visualstudio.com/download) and reference it in some examples any contemporary editor will work.
- [Docker v19.03.8](https://docs.docker.com/get-docker/)
- [Docker Compose v1.23.1](https://docs.docker.com/compose/install/)
- [Git 2.31.1](https://git-scm.com/downloads)
- [Node.js v16.3.0 with NPM 7.15.1](https://nodejs.org/en/download/)
- [Bash Debug v0.3.9](https://marketplace.visualstudio.com/items?itemName=rogalmic.bash-debug): This extension is recommended If you are developing and debugging with VSCode.
- Your SSH public key has been added to [Azure DevOps](https://dev.azure.com/NATIONAL-Toronto/_usersSettings/keys)
- Your SSH public key has also been added to [WPEngine](https://my.wpengine.com/ssh_keys)

- This README assumes that the target directory follows the `/home/{username}/dev/{client}/{brand}/{project}/{product}` naming convention. E.g. `/home/tforster/dev/NationalPR/Toronto/CLI`

# Setup and Configuration

1. Clone the project

    1. Change (create if necessary) to your client and projects root directory `cd ~/dev/NationalPR/Toronto`.
    2. Clone this repository `git clone xxx`.
    3. Change to the newly cloned directory `cd CLI`.

2. Install dependencies

    `npm install`

    _Note that the install process will also symlink the scripts in the src folder to your path making the CLI available from any project directory._

3. Add secrets to .env

    A .gitignored .env file will be created in the project root as part of the `npm install` process and needs one or more secrets to be added.

    - Set the database password: Create a new secure password for MySQL that will run in an isolated container on this system. Open .env, locate the line and add a new password:

        ``` ini
        ...
        DB_PASSWORD={your-new-password-here}
        ...
        ```

## Scripts

The following scripts have been created to manage changes up and down the instance tree.

| `npm run`     | Script                               | Description                                                                                                                                                       |
| ------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start`       | stack-start.sh                       | Starts the Docker stack defined in docker-compose.yml using variables found in .env.                                                                              |
| `stop`        | n/a                                  | Stops the stack.                                                                                                                                                  |
| `restart`     | n/a                                  | Restarts the stack.                                                                                                                                               |
| `updateDev`   | syncDataAndPluginsFromProdToLocal.sh | Imports the latest database from production.<br/>Synchronises the local plugins folder from production.<br/>Synchronise the local uploads folder from production. |
| `deployStage` | syncCodeToStage.sh                   | Checks out the latest develop branch to an ephemeral directory then synchronises the wp-content folder to stage.                                                  |

# Notes

No notes yet.

# Change Log

See [CHANGELOG.md](CHANGELOG.md)

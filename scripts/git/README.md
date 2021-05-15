# Git Related Scripts <!-- omit in toc -->

_Scripts to make working with Git repositories easier. Currently just one so far._

## Table of Contents <!-- omit in toc -->

- [Prerequisites](#prerequisites)
- [Setup and Configuration](#setup-and-configuration)
- [Usage](#usage)
- [Road Map](#road-map)

## Prerequisites

- [bash](https://en.wikipedia.org/wiki/Bash_(Unix_shell)) or [zsh](https://www.zsh.org/): The bash or zsh shells are required to use `<<<` redirection. E.g. this script won't work with sh. 
- [git v2.30.0](https://git-scm.com/): Because this script is all about creating a Git branch so you need Git installed.
- [GitHub CLI v1.9.2](https://github.com/cli/cli#installation): The GitHub CLI is only required if you wish to work with GitHub repositories.
- [Azure DevOps CLI v2.22.1](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli): The Azure CLI is only required if you wish to work with Azure DevOps repositories.
  - [Azure DevOps CLI](https://docs.microsoft.com/en-us/azure/devops/cli/?view=azure-devops): Don't be confused by the subtle name difference. The Azure DevOps CLI is an optional extension to the Azure CLI above that is a requirement for this script.
- [jq v1.6](https://stedolan.github.io/jq/): jq is a shell tool for parsing JSON.

## Setup and Configuration

1. Clone this repository
   1. Change (create if necessary) to your client and projects root directory `cd ~/dev/TechSmarts/Joy`.
   2. Clone this repository `git clone  git@github.com:tforster/joy.git cli.joy`.
2. Make the script executable
   1. Change to the newly cloned directory `cd cli.joy`.
   2. Make the git-ticket.sh script executable with `chmod +x scripts/git/git-ticket.sh`.
3.
   1. Symlink the git-ticket.sh file to `/usr/bin` with `sudo ln -s /home/{your-username}/dev/TechSmarts/Joy/cli.joy/scripts/git/git-ticket.sh /usr/bin/git-ticket`
4. Install any required dependencies listed above

## Usage

`git ticket` will be available on your path thanks to the symlink into /usr/bin. This also means that the script can be updated by simply `git pull`ing the latest Joy CLI from the repo.

The Git command line client recognises scripts in the path that start with `git-` and will automatically alias them to feel like a native Git command. Ergo `git-ticket.sh` can be invoked with `git ticket`.

`git ticket` must be run inside a Git enabled folder. That is any folder that contains, or is a child of a folder that contains `.git`. `git ticket` requires one parameter, the number of a valid GitHub issue or Azure DevOps work item. It will then query the git remote to determine the provider then query the provider for the ticket number, extract the title of that ticket and create a new branch using a sluggified title name.

E.g. Assuming that the project you are in is available in GitHub and there is an issue #123 with the title "Provision a new environment" labelled "enhancement" then `git ticket 123` will create a new branch titled "feature/0123-provision-a-new-branch"

_Do not forget to pull the latest changes for your develop branch from upstream **before** creating your new branch with `git ticket`._

## Road Map

- [Dockerise this script and its dependencies](https://dev.azure.com/techsmarts/TechSmarts/_workitems/edit/893).
- [Extend to work with GitLab](https://dev.azure.com/techsmarts/TechSmarts/_workitems/edit/894).
- [Support a global setting to (en/dis)able the folder prefix](https://dev.azure.com/techsmarts/TechSmarts/_workitems/edit/895).
- [Remove common stop-words like and, the, is, etc to shorten the resulting branch name](https://dev.azure.com/techsmarts/TechSmarts/_workitems/edit/896).

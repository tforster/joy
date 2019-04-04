#!/bin/bash

################################################################################
# joy.sh
#
# Adds some sugar to docker-compose that lets us easily build, run and restart
# containers. Thus allowing a single script to launch multiple different
# environments on the same Docker host.
#
# Depends upon secrets.env file that contains sensitive keys. Secrets.env is not
# available in the repository and must be obtained from 1Password. Ensure that
# you place the correct secrets.env in the develop or master working folder.
#
################################################################################

# Cache installation directory of joy.sh
export joyDir="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

# Make any project environment variables available to our sub processes
if [ -f .joy/config.env ]; then
  export $(grep -v '^#' .joy/config.env | xargs)
fi

if [ -f secrets/secrets.env ]; then
  export $(grep -v '^#' secrets/secrets.env | xargs)
fi

# Parse command
case "$1" in
"init")
  echo Initializing Joy project here
  ;;
"update")
  echo Checking for and potentially updating Joy
  ;;
"version")
  echo Joy version ?
  ;;
"install")
  $joyDir/install.sh "$@"
  ;;
"env")
  echo Displaying current environment
  printenv | sort
  ;;
*)

  # No internal matches so check plugins
  if [ -f $joyDir/plugins/$1.sh ]; then
    $joyDir/plugins/$1.sh "$@"
  else
    echo Plugin not found. Joy help to be added here...
  fi
  ;;

esac

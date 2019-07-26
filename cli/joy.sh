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

# Cache installation directory of joy.sh (https://stackoverflow.com/questions/59895/get-the-source-directory-of-a-bash-script-from-within-the-script-itself)
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
export JOY="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"

# Check that current directory is a Joy project
if [ ! -d .joy ]; then
  if [ "$1" == "init" ]; then    
    echo Init here
  else
    echo This is not a Joy project. Try running joy init.
  fi
  exit
else 
  export JOYPROJECT=$(pwd)
fi


# Make any project environment variables available to our sub processes
if [ -f .joy/config.env ]; then
  export $(grep -v '^#' .joy/config.env | xargs)
fi

if [ -f .joy/config.local.env ]; then
  export $(grep -v '^#' .joy/config.local.env | xargs)
fi

if [ -f secrets/secrets.env ]; then
  export $(grep -v '^#' secrets/secrets.env | xargs)
fi

# Construct some environment variables from the three files above
export NODE_ENV=${ENVIRONMENT}
export COMPOSE_PROJECT_NAME=${PRODUCT}_${ENVIRONMENT}_${DOMAIN}..${TLD}

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
  $JOY/install.sh "$@"
  ;;
"env")
  echo Displaying current environment
  printenv | sort
  ;;
"help")
  HELP=HELP
  ;;
*)

  # No internal matches so check plugins
  if [ -f $JOY/plugins/$1.sh ]; then
    $JOY/plugins/$1.sh "$@"
  else
    echo The requested command '"'$1'"' was not found.
    echo
    HELP=HELP
  fi
  ;;

esac

if [ $HELP ]; then
  echo "Usage: joy {command} [options]"
  echo 
  echo "Commands:"
  echo "  docker:    Build and push images, start/stop predefined stack of containers"
  echo "  navigate:  SSH and SSH Tunnels"
  echo "  s3:        Provision S3 buckets as static servers, deploy to buckets and invalidate Cloudfront caches"
  echo "  swagger:   Build, validate, serve and view Swagger documentation"
  echo "  utils:     Create JWT signing keys"
  echo "  wordpress: Configure site_url and home URLs"
  echo
  echo "Type joy {command} for more help"
fi

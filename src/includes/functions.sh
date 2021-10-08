####################################################################################################################################
# function.sh
# - Common functions to reuse
####################################################################################################################################

. $cliDir/includes/git.sh

getShell() { 
  if [ -n "`$SHELL -c 'echo $ZSH_VERSION'`" ]; then
    echo zsh
  elif [ -n "`$SHELL -c 'echo $BASH_VERSION'`" ]; then
    echo bash
  else
    ech unknown
  fi
}


# isWPEngine
# @returns {boolean}: True if the current directory contains at least one WPEngine environment reference
isWPEngine() {
  if [ -z ${WPE_PROD+x} ] || [ -z ${WPE_STAGE+x} ] || [ -z ${WPE_DEV+x} ]; then
    false
  else
    true
  fi
}

# isWebProducer
# @returns {boolean}: True if the current directory contains a WebProducer enabled project
isWebProducer() {
  [ -d "webproducer" ]
}

# Expands the named .env file
# @param {string} $1: relative path to a .env file e.g. webproducer/.env
# @returns {void}
dotEnv() {
  if [ -f "$1" ]; then
    set -o allexport
    source $1
    set +o allexport
  fi
}
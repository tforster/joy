####################################################################################################################################
# function.sh
# - Common functions to reuse
####################################################################################################################################

# Include dependencies
. $cliDir/includes/shell.sh
. $cliDir/includes/git.sh

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

# Crude function to help layout the output of joy info
indent() { sed 's/^/                 /'; }
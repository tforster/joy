#!/bin/bash

###################################################################################################################################
# Exports the contents of .env to the current shell
#
# @usage ./scripts/exportEnv.sh
#
###################################################################################################################################

# Set project specific environment variables
echo "Exporting required environment variables..."
set -o allexport
echo $PWD
source ./.env
set +o allexport

#!/bin/bash

###################################################################################################################################
# Deploys the latest develop branch to staging
# - Regardless of the branch and/or state of local code this script creates a temporary clone of the remote develop branch before
#   using rsync to synchronise recursive file changes in wp-content/themes/$THEME_NAME only
#
# @usage ./scripts/syncCodeToStage.sh
#
###################################################################################################################################

# Set project specific environment variables
source ./scripts/exportEnv.sh

echo "Cloning the latest develop branch to an ephemeral build folder..."

# Empty the build folder in case it was not cleaned up before
rm -rf build/develop
mkdir -p build/develop

# Clone develop branch to build folder
git clone -b develop $GIT_REPOSITORY build/develop

echo "Synchronising theme contents of ephemeral folder to staging..."
rsync -avz --delete ./build/develop/src/themes/$THEME_NAME/ $WPE_STAGE@$WPE_STAGE.ssh.wpengine.net:/sites/$WPE_STAGE/wp-content/themes/$THEME_NAME/

echo "Cleanup the ephemeral build folder..."
rm -rf build/develop

echo "Deployed the latest develop branch to staging."

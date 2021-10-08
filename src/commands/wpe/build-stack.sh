#!/bin/bash

###################################################################################################################################
# Starts the Docker Compose stack found in the docker directory
#
# @usage ./scripts/build-stack.sh
#
###################################################################################################################################

# Set project specific environment variables
source ./scripts/exportEnv.sh

echo "Building Docker stack..."
docker-compose -f docker/docker-compose.yml build --no-cache

echo "Docker stack built."

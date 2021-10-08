#!/bin/bash

###################################################################################################################################
# Starts the Docker Compose stack found in the docker directory
#
# @usage ./scripts/start-stack.sh
#
###################################################################################################################################

# Set project specific environment variables
source ./scripts/exportEnv.sh

echo "Starting Docker stack..."
docker-compose -f docker/docker-compose.yml up -d

echo "Opening home page..."
# Generate a random 4 character cache buster to avoid the default browser trying to load a different developer WP project
CACHE_BUSTER=$(xxd -l 2 -c 32 -p < /dev/random)
# Open the home page on localhost with the cache buster
xdg-open http://localhost:$WWW_PORT?cache-buster=$CACHE_BUSTER

#!/bin/sh

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

# Make all environment variables available to our sub processes
export $(grep -v '^#' .joy/config.env | xargs)
export $(grep -v '^#' secrets/secrets.env | xargs)

# Parse args to determine if we're building, starting (up), stopping (down) or restarting
case "$1" in
  "start")
    echo Starting stack, new images will be fetched first
    docker-compose -f .joy/docker/docker-compose.yml up -d
    ;;
  "stop")
    echo Stopping
    docker-compose -f .joy/docker/docker-compose.yml down
    ;;
  "build")
    echo Building $2 image .joy/docker/$2.dockerfile tagged ${ORG}/$2.${PRODUCT}.${TLD}
    docker build --force-rm --no-cache -f .joy/docker/$2.dockerfile . -t ${ORG}/$2.${PRODUCT}.${TLD}
    ;;
  "push")
    echo Pushing ${ORG}/$2.${PRODUCT}.${TLD} to Dockerhub
    docker push ${ORG}/$2.${PRODUCT}.${TLD}
    curl -X POST --data-urlencode "payload={\"channel\": \"#build\", \"username\": \"buildbot\", \"text\": \"${ORG}/$2.${PRODUCT}.${TLD} pushed to Dockerhub\", \"icon_emoji\": \":docker-hub:\"}" $SLACK_INCOMING_WEBHOOK_URL 
    ;;  
  "deploy")
    echo Deploying to $2@${STAGE}:/srv/www/${ORG}/${PRODUCT}/${WORKSPACEROOT}
    ## Todo: Improve variabalization to make portability between environments less risky
    scp -r ./.joy $2@${STAGE}:/srv/www/${ORG}/${PRODUCT}/${WORKSPACEROOT}/
    scp -r ./secrets $2@${STAGE}:/srv/www/${ORG}/${PRODUCT}/${WORKSPACEROOT}/
    ;;
  "sandbox")
    echo SSHing to sandbox.rylli.com for user $2
    ssh $2@sandbox.rylli.com 
    ;;
  "api")
    echo SSHing into api.rylli.com for user $2
    ssh -i ~/.ssh/$2.pem $2@api.rylli.com
    ;;
  "env")
    echo Displaying current environment
    printenv | sort
    ;;
  "tunnel")
    echo Creating a TCP tunnel between localhost:$2 and $3
    ssh -N -L $2:127.0.0.1:$3 -i ~/.ssh/tforster.pem sandbox.rylli.com
    ;;
  *)
    # Not found? Try it in joy.js
    joy.js $1 $2 $3 $4 $5
    ;;
esac

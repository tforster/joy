# Shift args so that $2 becomes $1, etc
shift;

export IMAGE_NAME=${ORG}/$2.${DOMAIN}.${TLD}

# Parse sub-command
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
    echo Building $2 image .joy/docker/$2.dockerfile tagged ${IMAGE_NAME}
    docker build --force-rm --no-cache -f .joy/docker/$2.dockerfile . -t ${IMAGE_NAME}
    ;;
  "push")
    echo Pushing ${IMAGE_NAME} to Dockerhub
    docker push ${IMAGE_NAME}
    curl -X POST --data-urlencode "payload={\"channel\": \"#build\", \"username\": \"buildbot\", \"text\": \"${IMAGE_NAME} pushed to Dockerhub\", \"icon_emoji\": \":docker-hub:\"}" $SLACK_INCOMING_WEBHOOK_URL 
    ;;  
  *)
  echo Additional Docker help goes here
esac

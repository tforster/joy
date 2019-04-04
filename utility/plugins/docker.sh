# Shift args so that $2 becomes $1, etc
shift;

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
    echo Building $2 image .joy/docker/$2.dockerfile tagged ${ORG}/$2.${PRODUCT}.${TLD}
    docker build --force-rm --no-cache -f .joy/docker/$2.dockerfile . -t ${ORG}/$2.${PRODUCT}.${TLD}
    ;;
  "push")
    echo Pushing ${ORG}/$2.${PRODUCT}.${TLD} to Dockerhub
    docker push ${ORG}/$2.${PRODUCT}.${TLD}
    curl -X POST --data-urlencode "payload={\"channel\": \"#build\", \"username\": \"buildbot\", \"text\": \"${ORG}/$2.${PRODUCT}.${TLD} pushed to Dockerhub\", \"icon_emoji\": \":docker-hub:\"}" $SLACK_INCOMING_WEBHOOK_URL 
    ;;  
  *)
  echo Additional Docker help goes here
esac

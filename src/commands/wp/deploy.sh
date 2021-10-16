####################################################################################################################################
# deploy.sh
# - Deploys a WebProducer project from the /dist folder to stage or prod OR builds a dev instance into /dist
####################################################################################################################################

# Export WebProducer .env file
dotEnv "webproducer/.env"

# Check that this is indeed a WebProducer project
if ! isWebProducer; then
  printf "${fRed}${fBold}NOT a WebProducer project${f0}\n"
  exit 1
fi

# Set publish target based on argument, defaulting to dev if one was not provided
PUBLISH_TARGET=${1:-"dev"}

if [ $PUBLISH_TARGET = "prod" ]; then
  # Publish to production
  S3=s3://$PRODUCT.$ORG
  printf "${fYellow}Synchronising /dist to $S3 using AWS profile [$AWS_PROFILE]${f0}\n"
  $commandsDir/aws.sh s3 sync ./dist $S3 --cache-control max-age=31536000 --acl public-read 
  $commandsDir/aws.sh s3 cp $S3/index $S3/index --cache-control max-age=31536000 --content-type text/html --acl public-read 
  echo "User-agent: *\nAllow: /" | $commandsDir/aws.sh s3 cp - $S3/robots.txt --cache-control max-age=31536000 --content-type text/plain --acl public-read 
  printf "${fYellow}Invalidating CloudFront $AWS_CLOUDFRONT_DISTRIBUTION${f0}\n"
  $commandsDir/aws.sh cloudfront create-invalidation --distribution-id $AWS_CLOUDFRONT_DISTRIBUTION --paths "/index" "/feed.xml" 

elif [ $PUBLISH_TARGET = "stage" ]; then
  # Publish to stage
  S3=s3://$PRODUCT.stage.$ORG
  printf "${fYellow}Synchronising /dist to $S3 using AWS profile [$AWS_PROFILE]${f0}\n" 
  $commandsDir/aws.sh s3 sync ./dist $S3 --cache-control max-age=31536000 --acl public-read
  $commandsDir/aws.sh s3 cp $S3/index $S3/index --cache-control max-age=31536000 --content-type text/html --acl public-read

else
  # Build to /dist
  printf "${fYellow}Building /dist. Use 'joy wp http2-server' to view locally.${f0}\n"
  node webproducer/index
fi
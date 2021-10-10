
###################################################################################################################################
# Builds and deploys a WebProducer project
#
###################################################################################################################################

# Include colours.sh for colourised output
. $cliDir/includes/colours.sh

# Include common functions
. $cliDir/includes/functions.sh

# Export WebProducer .env file
dotEnv "webproducer/.env"

# Check that this is indeed a WebProducer project
if ! isWebProducer; then
  echo "NOT a WebProducer project"
  exit 1
fi

# Turn off the default pager which causes the script to pause after each command
export AWS_PAGER=""

# Set publish target based on arguement, defaulting to dev if one was not provided
PUBLISH_TARGET=${1:-"dev"}

if [ $PUBLISH_TARGET = "prod" ]; then
  S3=s3://$PRODUCT.$ORG
  purple "Synchronising dist to $S3"
  aws s3 sync ./dist $S3 --cache-control max-age=31536000 --acl public-read --profile $AWS_PROFILE
  aws s3 cp $S3/index $S3/index --cache-control max-age=31536000 --content-type text/html --acl public-read --profile $AWS_PROFILE
  echo "User-agent: *\nAllow: /" | aws s3 cp - $S3/robots.txt --cache-control max-age=31536000 --content-type text/plain --acl public-read --profile $AWS_PROFILE
  purple "Invalidating CloudFront $AWS_CLOUDFRONT_DISTRIBUTION"
  aws cloudfront create-invalidation --distribution-id $AWS_CLOUDFRONT_DISTRIBUTION --paths "/index" "/feed.xml" --profile $AWS_PROFILE

elif [ $PUBLISH_TARGET = "stage" ]; then
  # Publish to stage
  S3=s3://$PRODUCT.stage.$ORG
  purple "Synchronising dist to $S3"
  aws s3 sync ./dist $S3 --cache-control max-age=31536000 --acl public-read --profile $AWS_PROFILE
  aws s3 cp $S3/index $S3/index --cache-control max-age=31536000 --content-type text/html --acl public-read --profile $AWS_PROFILE

else
  # Publish locally
  purple "Building and publishing to dist. Use 'joy wp http2-server' to view locally."
  node webproducer/index
fi
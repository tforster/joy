# Shift args so that $2 becomes $1, etc
shift

# $2: domain
# $3: region
# $4: profile

if [ ! $3 ]; then
  REGION=ca-central-1
else
  REGION=$3
fi

if [ ! $4 ]; then
  PROFILE=rylli
else
  PROFILE=$4
fi

# Parse sub-command
case "$1" in
"new-web-bucket")
  # Create the bucket
  aws s3 mb s3://$2 --region $REGION --profile $PROFILE
  
  # Make the bucket a static website
  aws s3 website s3://$2 --index-document index.html --error-document error.html --region $REGION --profile $PROFILE

  # Provision an AWS certificate
  aws acm request-certificate --domain-name $2 --validation-method DNS --region $REGION --profile $PROFILE

  # Create the distribution
  aws cloudfront create-distribution --origin-domain-name $2.s3.amazonaws.com --default-root-object index.html --region $REGION --profile $PROFILE

  echo Don't forget to add the certificate once it has been generated as it's an asynchronous operation

  ;;
"invalidate-cloudfront")
  aws cloudfront create-invalidation --distribution-id EJLYWVJ4HQ254 --paths /index.html /error.html --profile rylli
  ;;

*)
  echo Additional utils help goes here
  ;;
esac



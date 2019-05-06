# Shift args so that $2 becomes $1, etc
shift

if [ ! $3 ]; then
  REGION=ca-central-1
else
  REGION=$3
fi

# Parse sub-command
case "$1" in
"web-bucket")
  # Make the bucket
  aws s3 mb s3://$2 --region $REGION
  # Make the bucket a static website
  aws s3 website s3://$2 --index-document index.html --error-document error.html --profile $2  

  aws cloudfront create-distribution --origin-domain-name my-bucket.s3.amazonaws.com --default-root-object index.html

  aws cloudfront create-invalidation --distribution-id EJLYWVJ4HQ254 --paths /index.html /error.html --profile rylli
  ;;
*)
  echo Additional utils help goes here
  ;;
esac



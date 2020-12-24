#!/bin/sh

###################################################################################################################################
# Creates a new S3 bucket configured as a website using extensionless defaults of index and error
#
# TODO: Add CORS policy 
#
# @usage ./s3-new-web.sh {bucket} {region} {profile}
#
# @param {string} bucket as $1:   The unique bucket name
# @param {string} region as $2:   The region to create the bucket in
# @param {string} profile as $3:  The ~/.aws/credentials profile name to use
###################################################################################################################################

# Turn off the default pager which causes the script to pause after each command
export AWS_PAGER=""

# Set the AWS profile as an environment variable so we don't have to specify --profile multiple times
export AWS_PROFILE=$3

# Create the bucket named $1 in the region $2
aws s3api create-bucket --bucket $1 --region $2  --create-bucket-configuration LocationConstraint=$2

# Configure the bucket as a website using index and error as the two default fuiles
aws s3 website s3://$1/ --index-document index --error-document error

# Add simple placeholder files
cat <<EOF | aws s3 cp - s3://$1/index --content-type "text/html" --acl public-read
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Index</title>
</head>
<body>
  <h1>Index</h1>
</body>
</html>
EOF

cat <<EOF | aws s3 cp - s3://$1/error --content-type "text/html" --acl public-read
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error</title>
</head>
<body>
  <h1>Error</h1>
</body>
</html>
EOF


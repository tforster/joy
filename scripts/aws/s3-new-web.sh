#!/bin/sh

###################################################################################################################################
# Creates a new S3 bucket configured as a website using extensionless defaults of index and error
#
# @usage ./s3-new-web {bucket} {region} {profile}
#
# @param {string} bucket as $1:   The unique bucket name
# @param {string} region as $2:   The region to create the bucket in
# @param {string} profile as $3:  The ~/.aws/credentials profile name to use
###################################################################################################################################

# Turn off the default pager which causes the script to pause after each command
export AWS_PAGER=""

# Set the AWS profile as an environment variable so we don't have to specify --profile multiple times
export AWS_PROFILE=$3

# Create the temporary bucket policy json file 
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'$1'/*"
    }
  ]
}
EOF

# Create the bucket named $1 in the region $2 using profile $3
aws s3api create-bucket --bucket $1 --region $2  --create-bucket-configuration LocationConstraint=$2

# Set the bucket policy created above
aws s3api put-bucket-policy --bucket $1 --policy file:///tmp/bucket-policy.json

# Configure the bucket as a website using index and error as the two default fuiles
aws s3 website s3://$1/ --index-document index --error-document error

# Cleanup the temporary file
rm /tmp/bucket-policy.json

#!/bin/sh

###################################################################################################################################
# Creates a new A record in Route53 and aliases it to a CloudFront distribution
#
# - NOTE: Route53 does not support naked domains aliased to CloudFront. A Lambda naked-to-subdomain function is required.
# - NOTE: Using CloudFront with custom CNAME requires a certificate. Run certificate-manager-new-cert.sh before this script.
# - NOTE: The AliasTarget.HostedZoneId is NOT ours but AWSs. See 
#         https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/quickref-route53.html#w2ab1c27c22c81c11
#
# TODO: Pass in the fully qualified domain including any required subdomains then split out zone using a regular expression.
#
# @usage ./route53-cloudfront-cname.sh {zone-name} {subdomain} {cloudfront-id} {certificate-arn} {profile}
# 
# @param {string} zone name as $1:        The zone to host the CNAME
# @param {string} subdomain as $2:        The subdomain (e.g. www. or www.stage.). 
# @param {string} cloudfront-id as $3:    The CloudFront distribution Id
# @param {string} certificate-arn as $4:  The previously created ACM certificate arn
# @param {string} profile as $5:          The ~/.aws/credentials profile name to use
#
###################################################################################################################################

# Turn off the default pager which causes the script to pause after each command
export AWS_PAGER=""

# Set the AWS profile as an environment variable so we don't have to specify --profile multiple times
export AWS_PROFILE=$5

# Define the Route53 hosted zone name as well as the fully qualified domain name
ZONE_NAME=$1
DOMAIN_NAME=$2$1
CLOUDFRONT_DISTRIBUTION_ID=$3

echo "[SCRIPT]   Route53 Zone Name: $ZONE_NAME"
echo "[SCRIPT]   Fully Qualified Domain Name: $DOMAIN_NAME"
echo "[SCRIPT]   CloudFront Endpoint: $CLOUDFRONT_DISTRIBUTION_ID"
echo "[SCRIPT]   AWS Profile Id: $AWS_PROFILE"

# Get the Route53 hosted zone Id for the domain
R53_HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name "$ZONE_NAME" \
  --query "HostedZones[?Name=='$ZONE_NAME.'].Id" \
  --output text)

echo "[Route53]  Hosted Zone ID: $R53_HOSTED_ZONE_ID"

R53_HOSTED_ZONE=${R53_HOSTED_ZONE_ID##*/}

echo "[Route53]  Hosted Zone: $R53_HOSTED_ZONE"

# Create a change batch to upsert the domain identity CNAME record in the hosted zone
R53_CHANGE_BATCH=$(cat <<EOM
{
  "Comment": "Alias record for CloudFront distribution $DOMAIN_NAME",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$DOMAIN_NAME",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "$CLOUDFRONT_DISTRIBUTION_ID",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
EOM
)

echo "[Route53]  Change Batch: "$R53_CHANGE_BATCH

# Execute the change batch
R53_CHANGE_BATCH_REQUEST_ID=$(aws route53 change-resource-record-sets \
  --hosted-zone-id "$R53_HOSTED_ZONE_ID" \
  --change-batch "$R53_CHANGE_BATCH" \
  --query "ChangeInfo.Id" \
  --output text)

echo "[Route53]  Request Id: $R53_CHANGE_BATCH_REQUEST_ID"

# Wait for the validation record to be created, 
echo "[Route53]  Waiting for validation records to be created..."
aws route53 wait resource-record-sets-changed --id "$R53_CHANGE_BATCH_REQUEST_ID" 

#!/bin/sh

###################################################################################################################################
# Creates a new CloudFront distribution fronting an S3 web bucket. 
#
# - Creates custom domain (CNAME) references
# - Binds to the provided ACM certificate
#
# @usage ./cloudfront-new-distribution \
#          {s3-bucket-name} \
#          {s3-region} \
##         {alias1} \
#          {alias2} \
#          {certificate-arn} \
#          {aws-profile}
# 
# @param {string} s3-bucket-name as $1: The origin S3 bucket name 
# @param {string} s3-region as $2:      The orign S3 bucket region
# @param {string} alias1 as $3:         The first alias, e.g. www.mydomain.com
# @param {string} alias2 as $4:         The second alias, e.g. mydomain.com
# @param {string} certificate-arn:      The arn for a previously created certificate (./certificate-manager-new-cert.sh)
# @param {string} profile as $3:        The ~/.aws/credentials profile name to use
#
###################################################################################################################################

# Turn off the default pager which causes the script to pause after each command
export AWS_PAGER=""

# Set the AWS profile as an environment variable so we don't have to specify --profile multiple times
export AWS_PROFILE=$6

# Create a unique value for the caller reference
CALLER_REFERENCE=$(date +%s)

# Name incoming arguments for improved legibility
BUCKET=$1
REGION=$2
ALIAS_1=$3
ALIAS_2=$4
CERTIFICATE_ARN=$5

# Construct the S3 origin domain name
DOMAIN_NAME=${BUCKET}.s3-website.${REGION}.amazonaws.com

# Create the temporary cloudfront-distribution.json file 
cat > /tmp/cloudfront-distribution.json <<EOF
{
  "CallerReference": "${CALLER_REFERENCE}",
  "Aliases": {
    "Quantity": 2,
    "Items": [
      "$ALIAS_1",
      "$ALIAS_2"
    ]
  },
  "DefaultRootObject": "index",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "${BUCKET}",
        "DomainName": "${DOMAIN_NAME}",
        "OriginPath": "",
        "CustomHeaders": {
          "Quantity": 0
        },
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": {
            "Quantity": 3,
            "Items": [
              "TLSv1",
              "TLSv1.1",
              "TLSv1.2"
            ]
          },
          "OriginReadTimeout": 30,
          "OriginKeepaliveTimeout": 5
        }
      }
    ]
  },
  "OriginGroups": {
    "Quantity": 0
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "${BUCKET}",
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      },
      "Headers": {
        "Quantity": 0
      },
      "QueryStringCacheKeys": {
        "Quantity": 0
      }
    },
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "AllowedMethods": {
      "Quantity": 2,
      "Items": [
        "HEAD",
        "GET"
      ],
      "CachedMethods": {
        "Quantity": 2,
        "Items": [
          "HEAD",
          "GET"
        ]
      }
    },
    "SmoothStreaming": false,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": false,
    "LambdaFunctionAssociations": {
      "Quantity": 0
    },
    "FieldLevelEncryptionId": ""
  },
  "CacheBehaviors": {
    "Quantity": 0
  },
  "CustomErrorResponses": {
    "Quantity": 0
  },
  "Comment": "${BUCKET}",
  "Logging": {
    "Enabled": false,
    "IncludeCookies": false,
    "Bucket": "",
    "Prefix": ""
  },
  "PriceClass": "PriceClass_100",
  "Enabled": true,
  "ViewerCertificate": {
    "ACMCertificateArn": "${CERTIFICATE_ARN}",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2018",
    "Certificate": "${CERTIFICATE_ARN}",
    "CertificateSource": "acm"
  },
  "Restrictions": {
    "GeoRestriction": {
      "RestrictionType": "none",
      "Quantity": 0
    }
  },
  "WebACLId": "",
  "HttpVersion": "http2",
  "IsIPV6Enabled": false
}
EOF

# Create the CloudFront distribution
CF_DISTRIBUTION=$(aws cloudfront create-distribution \
  --distribution-config file:///tmp/cloudfront-distribution.json)
echo "CloudFront distribution: "$CF_DISTRIBUTION

# Cleanup the temporary file
rm /tmp/cloudfront-distribution.json

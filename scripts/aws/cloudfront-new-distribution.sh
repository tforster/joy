#!/bin/sh

###################################################################################################################################
# Requests a new AWS certifcate for the specified domain
# - Automatically includes a wildcard for subdomains to make it easy to serve resources such as www., api., etc
# - Uses DNS (in Route53) for domain validation
# - Thanks to https://gist.github.com/andrewodri/1d3c25b01f2b7b307f4b7b538ef36fff
#
# @usage ./cloudfront-new-distribution {bucket} {region} {profile}
# 
# @param {string} s3Bucket as $1: The S3 bucket name (conventionally the domain name)
# @param {string} region as $2:   The AWS region
# @param {string} profile as $3:  The ~/.aws/credentials profile name to use
###################################################################################################################################

# Turn off the default pager which causes the script to pause after each command
export AWS_PAGER=""

# Set the AWS profile as an environment variable so we don't have to specify --profile multiple times
export AWS_PROFILE=$3

# Create a unique value for the caller reference
CALLER_REFERENCE=$(date +%s)

# Name incoming arguments for improved legibility
BUCKET=$1
REGION=$2

# Construct the S3 origin domain name
DOMAIN_NAME=${BUCKET}.s3-website-${REGION}.amazonaws.com

# Create the temporary cloudfront-distribution.json file 
cat > /tmp/cloudfront-distribution.json <<EOF
{
  "CallerReference": "${CALLER_REFERENCE}",
  "Aliases": {
    "Quantity": 0
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
    "CloudFrontDefaultCertificate": true,
    "MinimumProtocolVersion": "TLSv1",
    "CertificateSource": "cloudfront"
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
  --distribution-config file:///tmp/cloudfront-distribution.json
)

echo "[CF]             Distribution: $CF_DISTRIBUTION"

# Cleanup the temporary file
rm /tmp/cloudfront-distribution.json

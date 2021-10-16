#!/bin/sh

###################################################################################################################################
# Requests a new AWS certifcate for the specified domain
#
# - Automatically includes a wildcard for subdomains to make it easy to serve resources such as www., api., etc
# - Uses DNS (in Route53) for domain validation
# - Thanks to https://gist.github.com/andrewodri/1d3c25b01f2b7b307f4b7b538ef36fff
# - NOTE: Profile is NOT the final parameter since subdomain is optional. See todo note below.
# - NOTE: Region is forced to us-east-1 as that is the only issuing region that CloudFront will accept
#
# TODO: Pass in the fully qualified domain including any required subdomains then split out zone using a regular expression.
#
# @usage ./certificate-manager-new-cert.sh {domain} {profile} {subdomain.}
# 
# @param {string} domain name as $1:  The domain to request the certificate for.
# @param {string} profile as $2:      The ~/.aws/credentials profile name to use.
# @param {string} subdomain as $3:    Optional. Remember to include the trailing period.
#
###################################################################################################################################

# Turn off the default pager which causes the script to pause after each command
export AWS_PAGER=""

# Set the AWS profile as an environment variable so we don't have to specify --profile multiple times
export AWS_PROFILE=$2

# Define the Route53 hosted zone name as well as the fully qualified domain name
ZONE_NAME=$1
DOMAIN_NAME=$3$1

echo "[SCRIPT]   Route53 Zone Name: $ZONE_NAME"
echo "[SCRIPT]   Fully Qualified Domain Name: $DOMAIN_NAME"

# Request a certificate based on the provided domain name from ACM.
ARN=$(aws acm request-certificate \
  --domain-name "${DOMAIN_NAME}" \
  --subject-alternative-names "*.${DOMAIN_NAME}" \
  --validation-method DNS \
  --query CertificateArn \
  --region us-east-1 \
  --output text)

echo "[ACM]      Certificate ARN: $ARN"

# ToDo: describe-certificate once and grep results twice?

# Seems that a call is required to either introduce some latency, or kick Route53 in the butt. 
aws acm describe-certificate \
  --certificate-arn "$ARN" \
  --query "Certificate.DomainValidationOptions[?DomainName=='$DOMAIN_NAME'].ResourceRecord.Name" \
  --region us-east-1 \
  --output text \
  > /dev/null 2>&1


# Get the Route53 validation CNAME record name
RECORD_NAME=$(aws acm describe-certificate \
  --certificate-arn "$ARN" \
  --query "Certificate.DomainValidationOptions[?DomainName=='$DOMAIN_NAME'].ResourceRecord.Name" \
  --region us-east-1 \
  --output text)

echo "[Route53]  validation CNAME name: $RECORD_NAME"

# Get the Route53 validation CNAME value
VALUE=$(aws acm describe-certificate \
  --certificate-arn "$ARN" \
  --query "Certificate.DomainValidationOptions[?DomainName=='${DOMAIN_NAME}'].ResourceRecord.Value" \
  --region us-east-1 \
  --output text)

echo "[Route53]  validation CNAME value: $VALUE"


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
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$RECORD_NAME",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "$VALUE"
          }
        ]
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

# Wait and 2) for the certificate
echo "[ACM]      Waiting for certificate to validate..."
aws acm wait certificate-validated --certificate-arn --region us-east-1 "$ARN" 


ACM_CERTIFICATE_STATUS=$(aws acm describe-certificate \
  --certificate-arn "$ARN" \
  --query "Certificate.Status" \
  --region us-east-1 \
  --output text)

echo "[ACM]      Status: $ACM_CERTIFICATE_STATUS"


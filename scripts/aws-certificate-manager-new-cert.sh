#!/bin/sh

###################################################################################################################################
# Requests a new AWS certifcate for the specified domain
# - Automatically includes a wildcard for subdomains to make it easy to serve resources such as www., api., etc
# - Uses DNS (in Route53) for domain validation
# - Thanks to https://gist.github.com/andrewodri/1d3c25b01f2b7b307f4b7b538ef36fff
#
# @usage ./aws-certificate-manager-new-cert.sh {domain} {profile}
# 
# @param {string} domain name as $1:  The domain to request the certificate for
# @param {string} profile as $2:      The ~/.aws/credentials profile name to use
###################################################################################################################################

# Turn off the default pager which causes the script to pause after each command
export AWS_PAGER=""

# Set the AWS profile as an environment variable so we don't have to specify --profile multiple times
export AWS_PROFILE=$2

# Request a certificate based on the provided domain name from ACM.
ACM_CERTIFICATE_ARN=$(aws acm request-certificate \
--domain-name "$1" \
--subject-alternative-names "*.$1" \
--validation-method DNS \
--query CertificateArn \
--output text \
)

echo "[ACM]          Certificate ARN: $ACM_CERTIFICATE_ARN"

# ToDo: describe-certificate once and grep results twice or regex?

# Get validation name from certificate request
VALIDATION_NAME="$(aws acm describe-certificate \
--certificate-arn "$ACM_CERTIFICATE_ARN" \
--query "Certificate.DomainValidationOptions[?DomainName=='$1'].ResourceRecord.Name" \
--output text \
)"

# Get validation value from certificate request
VALIDATION_VALUE="$(aws acm describe-certificate \
--certificate-arn "$ACM_CERTIFICATE_ARN" \
--query "Certificate.DomainValidationOptions[?DomainName=='$1'].ResourceRecord.Value" \
--output text \
)"

echo "[ACM]          Certificate validation record: $VALIDATION_NAME CNAME $VALIDATION_VALUE"

# Get the Route53 hosted zone Id for the domain
R53_HOSTED_ZONE_ID="$(aws route53 list-hosted-zones-by-name \
--dns-name "$1" \
--query "HostedZones[?Name=='$1.'].Id" \
--output text \
)"

R53_HOSTED_ZONE=${R53_HOSTED_ZONE_ID##*/}

echo "[Route 53]     Hosted Zone ID: $R53_HOSTED_ZONE"

# Create a change batch to upsert the domain identity CNAME record in the hosted zone
R53_CHANGE_BATCH=$(cat <<EOM
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$VALIDATION_NAME",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "$VALIDATION_VALUE"
          }
        ]
      }
    }
  ]
}
EOM
)

echo "[Route 53]     Change Batch:   $R53_CHANGE_BATCH"

# Execute the change batch
R53_CHANGE_BATCH_REQUEST_ID="$(aws route53 change-resource-record-sets \
--hosted-zone-id "$R53_HOSTED_ZONE" \
--change-batch "$R53_CHANGE_BATCH" \
--query "ChangeInfo.Id" \
--output text \
)"

echo "[Route 53]     Request Id:     $R53_CHANGE_BATCH_REQUEST_ID"

################################################################################
# Wait 1) for the validation record to be created, and 2) for the certificate
# to validate the domain and issue the certificate.
################################################################################
echo "[Route 53]     Waiting for validation records to be created..."
aws route53 wait resource-record-sets-changed --id "$R53_CHANGE_BATCH_REQUEST_ID" 

echo "[ACM]          Waiting for certificate to validate..."
aws acm wait certificate-validated --certificate-arn "$ACM_CERTIFICATE_ARN" 

ACM_CERTIFICATE_STATUS="$(aws acm describe-certificate \
--certificate-arn "$ACM_CERTIFICATE_ARN"
--query "Certificate.Status"
--output text \
)"

ACM_CERTIFICATE="$(aws acm describe-certificate \
--certificate-arn "$ACM_CERTIFICATE_ARN"
--output json \
)"

################################################################################
# Output the certificate description from ACM, and highlight the status of the
# certificate.
################################################################################
if [ "$ACM_CERTIFICATE_STATUS" = "ISSUED" ]; then
  GREP_GREEN="1;32"
  echo "$ACM_CERTIFICATE" | GREP_COLOR="$GREP_GREEN" grep --color -E "\"Status\": \"${ACM_CERTIFICATE_STATUS}\"|$"
else
  GREP_RED="1;31"
  echo "$ACM_CERTIFICATE" | GREP_COLOR="$GREP_RED" grep --color -E "\"Status\": \"${ACM_CERTIFICATE_STATUS}\"|$"
fi

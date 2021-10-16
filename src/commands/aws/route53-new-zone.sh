#!/bin/sh

###################################################################################################################################
# Creates a new Route53 hosted zone
#
# @usage ./route53-new-zone.sh {domain} {profile}
#
# @param {string} zone name as $1:  The domain name of the new hosted zone
# @param {string} profile as $2:    The ~/.aws/credentials profile name to use
###################################################################################################################################

# Turn off the default pager which causes the script to pause after each command
export AWS_PAGER=""

# Set the AWS profile as an environment variable so we don't have to specify --profile multiple times
export AWS_PROFILE=$2

# Create a unique value for the caller reference
CALLER_REFERENCE=$(date +%s)

# Create the comment text
COMMENT="Hosted zone for $1"

# Create the hosted zone
aws route53 create-hosted-zone --name $1 --caller-reference $CALLER_REFERENCE --hosted-zone-config Comment="$COMMENT"

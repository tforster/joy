#!/bin/sh

# Creates a new Route53 hosted zone
#
# @param {string} zone name as $1:  The domain name of the new hosted zone
# @param {string} profile as $2:    The ~/.aws/credentials profile name to use
#
# @example ./aws-route53-new-zone.sh mynewdomain.com myprofile

# Turn off the default pager which causes the script to pause after each command
export AWS_PAGER=""

# Create a unique value for the caller reference
CALLER_REFERENCE=$(date +%s)
COMMENT="Hosted zone for $1"

# Create the hosted zone
aws route53 create-hosted-zone --name $1 --caller-reference $CALLER_REFERENCE --hosted-zone-config Comment="$COMMENT" --profile $2

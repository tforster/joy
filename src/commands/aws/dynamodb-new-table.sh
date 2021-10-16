#!/bin/sh

###################################################################################################################################
# Creates a new DynamoDB table in the specified region with a defined primary key (PK + SK)
# - Assumes all three stages required (dev, stage, prod)
# - Assumes single table design with string based generic PK and SK for partition and sort key names
# - Default mode is PAY_PER_REQUEST but expectation is it will be changed to ON_DEMAND once throughput expectatons are understood.
#
# @usage ./dynamodb-new-table.sh {table-name} {region} {profile}
#
# @param {string} table-name as $1: The region-unique table name
# @param {string} region as $2:     The region to create the bucket in
# @param {string} profile as $3:    The ~/.aws/credentials profile name to use
###################################################################################################################################

# Turn off the default pager which causes the script to pause after each command
export AWS_PAGER=""

# Set the AWS profile as an environment variable so we don't have to specify --profile multiple times
export AWS_PROFILE=$3

TABLE_NAME=$1
REGION=$2


aws dynamodb create-table \
    --table-name $TABLE_NAME-dev \
    --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
    --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION

aws dynamodb create-table \
    --table-name $TABLE_NAME-stage \
    --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
    --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION

aws dynamodb create-table \
    --table-name $TABLE_NAME-prod \
    --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
    --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION

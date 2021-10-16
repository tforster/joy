#!/bin/sh

###################################################################################################################################
# Creates a new WebProducer folder c/w all dependencies including Serverless Framework
# - Note: code files including Transform/index.js, index.js and handler.js are empty. Populated versions coming soon...

# @usage ./wp-install.sh 
#
###################################################################################################################################

# Prompt the user for various data
read -p "Site source directory [src]:     " SRC
read -p "WebProducer directory [src/wp]:  " WP
read -p "Organisation [MyOrg]:            " ORG
read -p "Domain [domain.com]:             " DOMAIN
read -p "AWS Region [ca-central-1]:       " AWS_REGION
read -p "AWS Profile [default]:           " AWS_PROFILE

# Setup variables and/or defaults
SRC=${SRC:-"src"}
WP=${WP:-"src/wp"}
ORG=${ORG:-"MyOrg"}
DOMAIN=${DOMAIN:-"domain.com"}
AWS_REGION=${AWS_REGION:-"ca-central-1"}
AWS_PROFILE=${AWS_PROFILE:-"default"}

# Create folder structure
# TODO: Check for existance and prompt for --force to overwrite
mkdir -p $WP 

# Make the FaaS directory the working directory
cd $WP

# Create the FaaS package.json
cat > ./package.json <<EOF
{
  "dependencies": {
    "@tforster/webproducer": "git+ssh://git@github.com/tforster/webproducer.git#semver:v0.7.2-beta",
    "serverless-dotenv-plugin": "^3.1.0"
  },
  "devDependencies": {
    "serverless": "^2.15.0",
    "serverless-offline": "^6.8.0"
  }
}
EOF

# Install dependencies
npm install

# Create the serverless.yml file
cat > ./serverless.yml <<EOF
service: WebProducer
org: ${ORG}

provider:
  name: aws  
  stage: \${env:STAGE}
  runtime: nodejs14.x
  region: ${AWS_REGION}
  timeout: 20
  memorySize: 512

  iamRoleStatements:
    - Effect: 'Allow'
      Action:
        - 's3:PutObject'
        - 's3:PutObjectAcl'
        - 's3:GetObject'
        - 's3:ListBucket'
      Resource:
        - arn:aws:s3:::wp.${DOMAIN}/*
        - arn:aws:s3:::wp.${DOMAIN}
    - Effect: 'Allow'
      Action:
        - 's3:GetObject'
        - 's3:ListBucket'
        - 's3:PutObject'
        - 's3:PutObjectAcl'
        - 's3:GetObject'
        - 's3:ListBucket'
      Resource:
        - arn:aws:s3:::www.${DOMAIN}/*
        - arn:aws:s3:::www.${DOMAIN}
        - arn:aws:s3:::www.stage.${DOMAIN}/*
        - arn:aws:s3:::www.stage.${DOMAIN}
    - Effect: 'Allow'
      Action:
        - 'cloudfront:CreateInvalidation'
      Resource: '*'

functions:
  build:
    handler: handler.build
    description: WebProducer for ${ORG} for \${env:STAGE}
    events:
      - http: 
          method: POST
          path: publish

plugins:
  - serverless-offline
  - serverless-dotenv-plugin

package:
  include:
    - ../src/**

# Create the webproducer.yml file
EOF

# Create the serverless.yml file
cat > ./webproducer.yml <<EOF
#################################################
# WebProducer for Local and Serverless Building #
#################################################
templates: templates-fs
destination: destination-\${env:STAGE}
data: \${env:BUILD_DATA}

####################
# Template Aliases #
####################
templates-fs:
  type: filesystem
  base: ./src

#######################
# Destination Aliases #
#######################
destination-dev:
  type: filesystem
  base: ./dist

destination-stage:
  type: s3
  base: s3://www.stage.${DOMAIN}
  region: ${AWS_REGION}

destination-prod:
  type: s3
  base: s3://www.${DOMAIN}
  region: ${AWS_REGION}  

################
# Data Aliases #
################
data-fs:
  type: filesystem
  base: ./src/data/data.json
  published: true

data-graphql:
  type: graphql
  base: https://graphql.cosmicjs.com/v2
  token: \${env:GRAPHQL_API_TOKEN}
EOF

# Create a starter .env file
cat > .env <<EOF
STAGE=dev
BUILD_DATA=data-graphql
CLOUDFRONT_ARN=XXX
GRAPHQL_API_TOKEN=XXX
PUBLISHED=false 
CANONICAL_URL=https://www.${DOMAIN}
AWS_PROFILE=${AWS_PROFILE}
TRACKING_GTM_ID=XXX
EOF

# Create empty index.js and handler.js
# TODO: Should either copy from the main branch of the repo OR use handlebars and a template
touch index.js
touch handler.js

# Create an empty Transform 
# TODO: Should either copy from the main branch of the repo OR use handlebars and a template
mkdir Transform
touch Transform/index.js 

echo Installation of WebProducer into $PWD is complete however you will need to manually populate the Transform function as well as index and handler.js.

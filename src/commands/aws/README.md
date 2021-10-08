# AWS Scripts <!-- omit in toc -->

_A collection of opinionated scripts to help provision typical TechSmarts project infrastructures for serverless web applications._

## Table of Contents <!-- omit in toc -->

- [How Tos](#how-tos)
  - [Provisioning a New Web Hosting Stack](#provisioning-a-new-web-hosting-stack)
- [Scripts](#scripts)
  - [Content Delivery Network (CloudFront)](#content-delivery-network-cloudfront)
  - [Domain Management (Route53)](#domain-management-route53)
  - [Simple Storage Service (S3)](#simple-storage-service-s3)
  - [Certificate Manager (ACM)](#certificate-manager-acm)

## How Tos

Most of the scripts are deliberately granular and intended to be manually chained to achieve a given use-case. If a script fails then the use-case can be restarted from the failed script rather than the beginning. This is advantageous in the AWS world since many activities are cached and uncertain behaviour may occur when existing activities are re-run.

### Provisioning a New Web Hosting Stack

The TechSmarts/Joy approach to serverless hosting of websites and web applications leverages the HTTPS redirection capability of CloudFront as a CDN with S3 as the origin. While setting up the stack is relatively straightforward, there is a specific order of operations that accounts for some dependencies such as certificate creation.

The following example assumes a new website, www.mydomain.com is being provisioned in the central Canadian region using a previously created AWS config of myprofile. The website will have both a stage and production configuration.

Note that if the domain is not registered with Route53 then it will be necessary to update the registrars nameservers using the new values generated in step #1 below. Instructions are specific to the registrar and cannot be included here.

``` sh
DOMAIN=mydomain.com
AWS_PROFILE=myprofile
AWS_REGION=ca-central-1

# 1. Create a new hosted zone
./route53-new-zone.sh $DOMAIN $AWS_PROFILE

# 2. Request new certificate(s). 
#    - This script can take a few minutes to complete
#    - If you see a blank result for either CNAME name or CNAME value cancel and restart the script
#    - Make a note of the resulting certificate ARNS as they will be required in step #4
#    - Note the trailing period in the subdomain parameter (to be fixed in a future release)
./certificate-manager-new-cert.sh $DOMAIN $AWS_PROFILE
./certificate-manager-new-cert.sh $DOMAIN $AWS_PROFILE stage.

# 3. Create the S3 buckets that will host the website
./s3-new-web.sh www.$DOMAIN $AWS_REGION $AWS_PROFILE
./s3-new-web.sh www.stage.$DOMAIN $AWS_REGION $AWS_PROFILE

# 4. Create the CloudFront distributions 
./cloudfront-new-distribution.sh www.$DOMAIN $AWS_REGION $DOMAIN www.$DOMAIN certificate-arn $AWS_PROFILE # Manually copy the arn from ACM dashboard for now
./cloudfront-new-distribution.sh www.stage.$DOMAIN $AWS_REGION stage.$DOMAIN www.stage.$DOMAIN certificate-arn $AWS_PROFILE # Manually copy the arn from ACM dashboard for now

# 5. Create CloudFront alternate domain name (CNAME) entries in Route53
 ./route53-cloudfront-alias.sh $DOMAIN www.stage. xxx.cloudfront.net arn:aws:acm:us-east-1:xxx:certificate/xxx-xxx-xxx ss23

# 6. Copy an index file to S3, set it's content type to text/html and test...
```

## Scripts

The scripts are organised by AWS resource.

### Content Delivery Network (CloudFront)

- **cloudfront-new-distribution**: Creates a new CloudFront distribution with alternate domain names (CNAME) and ACM secured SSL.

### Domain Management (Route53)

- **route53-new-zone**: Creates a new Route53 hosted zone
- **route53-cloudfront-alias**: Creates Route53 A record entry as an alias to a Cloudfront distribution. Note that while it is an A record in Route53, CloudFront refers to them as CNAMEs.

### Simple Storage Service (S3)

- **s3-new-web**: Creates a new S3 bucket configured for web serving with TechSmarts opinionated extensionless default files of index and error.

### Certificate Manager (ACM)

- **certificate-manager-new-cert**: Requests and provisions a new ACM certificate. Includes the creation of DNS validation entries in Route53.

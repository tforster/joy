# Joy Templates

These templates are used by `joy init --template {template-name}` to initialize an empty directory as a Joy project

## Templates

- **static-s3**: A simple S3 bucket configured for web hosting. Uses default index.html and error.html files. Cloudfront is provisioned to provide CDN and SSL. Buckets are created for dev, stage and prod with dev and stage using Lambda@Edge functions to implement basic auth.
- **swagger-api**: This template will create a Connect based Swagger API and configure a docker image each for the NodeJS and MongoDb containers.
- **wordpress**: To support legacy sites still running on Wordpress use this template. It will create two docker images one each for the latest Wordpress engine and a MariaDb container.
  
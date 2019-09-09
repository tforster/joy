'use strict';
/**
 * Super lightweight wrapper around Javascript AWS SDK to support the creation
 * of S3 buckets suitable for web serving.
 *
 * @class S3
 */

const AWS = require('aws-sdk');
const parallelize = require('concurrent-transform');
const gulp = require('gulp');
const awspublish = require('gulp-awspublish');
const through = require('through2');
const vfs = require('vinyl-fs');
const debug = require('gulp-debug');
const path = require('path');

class S3 {
  constructor(region, profile, bucket) {
    this.bucket = bucket;
    this.awsConfig = {
      region,
      credentials: new AWS.SharedIniFileCredentials({ profile }),
      params: {
        Bucket: bucket
      },
      s3ForcePathStyle: false,
      apiVersion: '2006-03-01',
      signatureVersion: 'v4'
    };
    this.s3 = new AWS.S3(this.awsConfig);
  }

  static test() {
    vfs
      .src(path.resolve(`./*.*`))
      .pipe(debug())
      .pipe(vfs.dest(path.resolve(`./temp`)));
  }

  putObject(key, fileStream, acl, contentType) {
    return this.s3.putObject({ Bucket: this.bucket, Key: key, Body: fileStream, ACL: acl, ContentType: contentType }).promise();
  }

  dest() {
    return through.obj(function writeStream(file, enc, cb) {
      console.log('f', file);
      // const p = this.s3.upload({ Bucket: this.bucket, Key: key, Body: file.contents, ACL: acl, ContentType: contentType });
      // console.log(p);
      return cb(null, file);
    });
  }

  /**
   * Creates a new empty bucket with a public-read ACL if none is provided.
   *
   * @static
   * @param {object} AwsConfig
   * @param {string} Bucket
   * @param {string} ACL
   * @returns
   *
   * @memberof S3
   */
  static async createNewWebBucket(AwsConfig, Bucket, ACL) {
    ACL = ACL || 'public-read';
    console.log(AwsConfig, Bucket);
    //return new Promise((resolve, reject) => {
    AwsConfig.apiVersion = '2006-03-01';
    AwsConfig.s3ForcePathStyle = true;

    let client = new AWS.S3(AwsConfig);

    let bucketParams = {
      Bucket: Bucket,
      ACL: ACL
    };

    let staticHostParams = {
      Bucket: Bucket,
      WebsiteConfiguration: {
        ErrorDocument: {
          Key: 'app.html'
        },
        IndexDocument: {
          Suffix: 'index.html'
        }
      }
    };
    const create = client.createBucket(bucketParams).promise();
    //const web = client.putBucketWebsite(staticHostParams).promise();
    return { create };
  }

  /**
   * Creates a new empty bucket with the appropriate policy to support static
   * web serving. Also applies support for default index.html and error.html
   * files.
   *
   * @static
   * @param {object} AwsConfig
   * @param {string} Bucket
   * @returns
   *
   * @memberof S3
   */
  static async makeWebBucketServable(AwsConfig, Bucket) {
    //return new Promise((resolve, reject) => {
    AwsConfig.apiVersion = '2006-03-01';
    AwsConfig.s3ForcePathStyle = true;
    AwsConfig.signatureVersion = 'v4';
    let client = new AWS.S3(AwsConfig);

    let staticHostParams = {
      Bucket: Bucket,
      WebsiteConfiguration: {
        ErrorDocument: {
          Key: 'app.html'
        },
        IndexDocument: {
          Suffix: 'index.html'
        }
      }
    };

    return client.putBucketWebsite(staticHostParams).promise();
    // client.putBucketWebsite(staticHostParams, function (err, data) {
    //   if (err) {
    //     reject(err);
    //   } else {
    //     resolve(data);
    //   }
    // });
    //});
  }

  /**
   * Synchronizes the local files specified in the glob with the named bucket
   * with any pre-existing files in the bucket no longer in the glob being
   * removed.
   *
   * @static
   * @param {object} AwsConfig
   * @param {string} Bucket
   * @param {[string]} Glob
   * @param {[string]} whitelist: Array of keys to ignore during sync (e.g. preserve)
   * @returns A Promise
   *
   * @memberof S3
   */
  static async syncGlobToBucket(AwsConfig, Bucket, Glob, whitelist) {
    return new Promise((resolve, reject) => {
      AwsConfig.apiVersion = '2006-03-01';
      AwsConfig.s3ForcePathStyle = true;
      AwsConfig.signatureVersion = 'v4';
      AwsConfig.params = {
        Bucket: Bucket
      };
      let publisher = awspublish.create(AwsConfig);

      const headers = {
        'Cache-Control': 'max-age=60'
      };

      gulp
        .src(Glob)
        .on('error', function (e) {
          console.log(e);
        })
        .pipe(
          parallelize(publisher.publish(headers, { force: true })),
          10
        )
        .pipe(publisher.sync('', whitelist))
        .pipe(awspublish.reporter())
        .on('end', resolve);
    });
  }

  /**
   * Retrieves the S3 object named by bucket.key and saves to destination
   *
   * @static
   * @param {any} AwsConfig
   * @param {any} Bucket
   * @param {any} Key
   * @param {any} destination
   * @returns
   * @memberof S3
   */
  static getFile(AwsConfig, bucket, key, destination) {
    return new Promise((resolve, reject) => {
      AwsConfig.apiVersion = '2006-03-01';
      AwsConfig.s3ForcePathStyle = true;
      AwsConfig.signatureVersion = 'v4';
      let s3 = new AWS.S3(AwsConfig);
      s3.getObject(
        {
          Bucket: bucket,
          Key: key
        },
        (err, data) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            require('fs').writeFileSync(destination, data.Body);
            resolve();
          }
        }
      );
    });
  }
}

module.exports = S3;

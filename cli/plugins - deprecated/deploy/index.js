'use strict';
const AWS = require('aws-sdk');
const awspublish = require('gulp-awspublish');
const debug = require('gulp-debug');
const gulp = require('gulp');
const parallelize = require('concurrent-transform');
const path = require('path');
const through = require('through2');
const S3 = require('./S3');
const vfs = require(`vinyl-fs`);
/**
 * Deploy implements Joy commands for static S3 websites and Lambda functions
 *
 */
class Deploy {
  /**
   * @param {*} joy : Instance of a Joy class c/w config.json, env and helper functions
   *
   */
  constructor(joy) {
    this.config = joy.config;
    const prog = joy.prog;
    prog
      .command('deploy', 'Deploy various artifacts including static S3 sites and AWS Lambda functions')
      //.argument('[staticS3]', 'staticS3', ['staticS3'])
      .argument('<artifact-type>', 'Type of artifact to build [static, Lambda]', ['static', 'Lambda'], 'static')
      .option('-s, --stage <stage>', 'Stage name [dev, stage or prod]', ['dev', 'stage', 'prod'], 'dev')
      .option('-n, --name <name>', 'Site or Lambda name')
      .action((args, options, logger) => {
        //const s3 = new S3();
        S3.test();
        // const code = await this[args.artifactType].call(joy, options, logger);
        // return code;
      });
  }

  /**
   * @param {*} options : Additional CLI flags
   *
   */
  async static(options) {
    return new Promise((resolve, reject) => {
      if (options.stage === 'dev') {
        console.log('Please static serve the build/dev folder');
        resolve(1);
      }

      // const glob = path.join(this.config.projectRoot, `./build/${options.stage}/**/*`);

      // const s3 = new S3(this.config.aws.region, this.config.aws.profile, this.config.aws.buckets[options.stage]);

      //   through.obj((file, enc, cb) => {
      //     if (file.extname === '.html') {
      //       file.extname = '';
      //       //headers['Content-Type'] = 'text/html';
      //     }
      //     //console.log(file.basename);
      //     const x = s3.putObject('bob', file, 'public-read', 'text/html');
      //     cb(null, file);
      //   })
      // );

      resolve(0);
    });

    return new Promise((resolve, reject) => {
      if (options.stage === 'dev') {
        console.log('Please static serve the build/dev folder');
        resolve(1);
      }

      const glob = path.join(this.config.projectRoot, `./build/${options.stage}/**/*`);

      const config = {
        region: this.config.aws.region,
        credentials: new AWS.SharedIniFileCredentials({ profile: this.config.aws.profile }),
        params: {
          Bucket: this.config.aws.buckets[options.stage]
        },
        s3ForcePathStyle: false
      };

      let publisher = awspublish.create(config);

      const headers = {
        'Cache-Control': 'max-age=60'
      };

      gulp
        .src(glob)
        .on('error', (e) => {
          console.error('deploy static:', e);
          reject(e);
        })

        .on('close', () => {
          resolve(0);
        })
        .pipe(
          through({ objectMode: true }, (file, enc, cb) => {
            if (file.extname === '.html') {
              file.extname = '';
              //headers['Content-Type'] = 'text/html';
            }
            //console.log(file.basename);

            cb(null, file);
          })
        )

        .pipe(publisher.publish())

        .pipe(publisher.sync())
        .pipe(awspublish.reporter());
    });
  }

  /**
   * Returns a Promise from invoking an external command to `serverless deploy`
   *
   * @param {*} options : Additional CLI flags
   *
   */
  async lambda(options) {
    console.error('not implemented yet');
    return 1;
  }
}

module.exports = Deploy;

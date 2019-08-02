#!/usr/bin/env node
'use strict';
const fs = require('fs');
const prog = require('caporal');
const path = require('path');
const pa11y = require('pa11y');

class Joy {
  constructor() {

    this.env = process.env;
    this.prog = prog;

    this.prog.version('1.0.0')

    // Some commands only work in a Joy project
    if (this.isJoy()) {
      // Parse config.env
      require('dotenv').config({ path: '.joy/config.env' })

      // Docker Command
      this.prog
        .command('stack', 'Build, start, stop, restart the Docker stack')
        .argument('<subcommand>', 'subcommand', ['build', 'start', 'stop', 'restart'])
        .option('-n, --name <name>', 'Component name', prog.STRING)
        .action(async (args, options, logger) => {
          logger.debug("arguments: %j", args);
          logger.debug("options: %j", options);
          const code = await (this.Docker(args, options, logger));
        });
    } else {
      // Init Command
      this.prog
        .command('init', 'Initialize a new Joy project here')
        .argument('<type>', 'Type of project [Swagger API, Serverless AWS, Ionic, Static S3]', ['Swagger API', 'Serverless AWS', 'Ionic', 'Static S3'])
        .option('-p, --profile <name>', 'AWS.config profile', prog.STRING)
        .action((args, options, logger) => {
          logger.debug("arguments: %j", args);
          logger.debug("options: %j", options);
        });
    }


    // Remaining commands are available inside and outside of Joy projects

    // Test Command
    this.prog
      .command('test', 'Execute various tests including a11y, static code analysis, etc')
      .argument('<type>', 'Type of test [a11y, static]', ['a11y', 'static'])
      .option('-u, --url <url>', 'Page URIs to test', prog.LIST)
      .action(async (args, options, logger) => {
        logger.debug("arguments: %j", args);
        logger.debug("options: %j", options);
        await (this.Test(args, options, logger));
      });

    // Validate Command
    this.prog
      .command('validate', 'Execute various validations including Swagger')
      .argument('<type>', 'Type of validation', ['swagger'])
      .action((args, options, logger) => {
        logger.debug("arguments: %j", args);
        logger.debug("options: %j", options);
      });

    // Build Command
    this.prog
      .command('build', 'Execute various build types including Swagger.yaml and static site generation')
      .argument('<type>', 'Type of build', ['swagger', 'static'])
      .action((args, options, logger) => {
        logger.debug("arguments: %j", args);
        logger.debug("options: %j", options);
      });

    this.prog.parse(process.argv);
  }

  /**
   * Indicates whether the CWD is a Joy enabled project (e.g. has a .joy folder)
   * 
   */
  isJoy() {
    try {
      const stats = fs.statSync(path.join(process.cwd(), './.joy'));
      return stats && stats.isDirectory();
    }
    catch (e) {
      return false;
    }
  }


  /**
   * Simple wrapper to exec a child process to call an external binary. 
   * Child stdout and stderror are piped directly to ours.
   * Returns a shell success code
   * 
   * @param {*} cmd 
   * @param {*} params 
   */
  _exec(cmd, params) {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process')
      const child = spawn(cmd, params);

      // Connect child std to our std
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);

      // Ensure we return a success code on exit
      child.on('close', code => {
        if (!code) {
          resolve(code);
        } else {
          reject(code);
        }
      });
    })
  }


  /**
   * Wraps a11y module
   * Todo: More research to see if this is the best module or test app to use
   * 
   * @param {*} args 
   * @param {*} options 
   * @param {*} logger 
   */
  async Test(args, options, logger) {
    switch (args.type.toLowerCase()) {
      case 'a11y':
        if (this.isJoy()) {
          // Remind the user that if this is a Joy project they may need to serve the app if it is local too
          logger.info('Have you started the local stack?');
        }

        // Promisify and run a11y for each supplied url 
        const results = await Promise.all(
          options.url.map(async url => {
            return await pa11y(url, options);
          })
        );

        // Output the raw result objects to stdout
        results.forEach(result => {
          console.log(result);
        })

        break;
      default:
        // Lots more tests to add but for now...
        logger.info('Currently only supporting a11y testing');
    }
  }


  /**
   * Wraps some basic Docker functionality for building images, launching and terminating stacks, and pushing to DockerHub
   * Todo: Modularize and externalize this and other top level commands
   * Todo: Just call this._exec once at the bottom after constructing params
   * 
   * @param {*} args 
   * @param {*} options 
   */
  async Docker(args, options, logger) {
    const env = this.env;
    const imageName = `${env.ORG}/${options.name}.${env.PRODUCT}.${env.TLD}`;
    switch (args.subcommand.toLowerCase()) {
      case 'build':
        if (options.name) {
          return await this._exec('docker', ['build', '--force-rm', '--no-cache', '-f', `.joy/docker/${options.name}.dockerfile`, '.', '-t', imageName]).catch(reason => {
            throw reason;
          });
        }
        break;
      case 'start':
        return await this._exec('docker-compose', ['-f', `.joy/docker/docker-compose.yml`, 'up', '-d'])
          .then(code => {
            logger.info(`stack started`);
            return code;
          })
          .catch(reason => {
            throw reason;
          });
        break;
      case 'stop':
        return await this._exec('docker-compose', ['-f', `.joy/docker/docker-compose.yml`, 'down']).catch(reason => {
          throw reason;
        });
        break;
      case 'push':
        return await this._exec('docker', ['push', imageName]).catch(reason => {
          throw reason;
        });
        break;
      default:
    }
  }

}

new Joy()

'use strict';

const fs = require('fs');

/**
 * Build implements Joy commands for static S3 websites, swagger docs and docker images.
 *
 */
class Build {
  /**
   * @param {*} joy : Instance of a Joy class c/w config.json, env and helper functions
   *
   */
  constructor(joy) {
    const prog = joy.prog;
    prog
      .command('build_staticS3')
      //.argument('[staticS3]', 'staticS3', ['staticS3'])
      .option('-s, --stage <stage>', 'Stage name', prog.STRING)
      .option('-d, --data <data>', 'Data', prog.STRING)
      .option('-i, --input <input>', 'Input file', prog.STRING)
      .action(async (args, options, logger) => {
        logger.debug('arguments: %j', args);
        logger.debug('options: %j', options);
        const code = await this.staticS3.call(joy, options, logger);
        return code;
      });
    prog.command('build_swagger').action(async (args, options, logger) => {
      logger.debug('arguments: %j', args);
      logger.debug('options: %j', options);
      const code = await this.swagger.call(joy, options, logger);
      return code;
    });
    prog
      .command('build_docker')
      .option('-i, --image <image>', 'Image name', prog.STRING)
      .action(async (args, options, logger) => {
        logger.debug('arguments: %j', args);
        logger.debug('options: %j', options);
        const code = await this.docker.call(joy, options, logger);
        return code;
      });
  }

  /**
   * @param {*} options : Additional CLI flags
   *
   */
  async staticS3(options) {
    // New instance of staticS3 initialized with joy.config and the chosen stage
    const s = require('./staticS3');
    let payload;
    if (options.input) {
      payload = require(options.input);
    }

    const statS3 = new s(this.config, options.stage);
    await statS3.build(payload);

    // Return an exit code
    return 0;
  }

  // TODO: To be implemented
  swagger() {
    console.error('not implemented yet');
  }
  docker() {
    console.error('use joy docker for now');
  }
}

module.exports = Build;

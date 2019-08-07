'use strict';

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
      .command('build', 'Build a Joy project')
      .argument('<subcommand>', 'subcommand [staticS3, swagger, docker]', ['staticS3', 'swagger', 'docker'])
      .option('-s, --stage <stage>', 'Stage name', prog.STRING)
      .action(async (args, options, logger) => {
        logger.debug("arguments: %j", args);
        logger.debug("options: %j", options);
        const code = await this[args.subcommand].call(joy, options, logger);
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
    const statS3 = new s(this.config, options.stage);
    await statS3.build();

    // Return an exit code
    return 0;
  }

  // TODO: To be implemented
  swagger() { }
  docker() { }
}

module.exports = Build;

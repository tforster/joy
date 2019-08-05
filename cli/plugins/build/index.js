'use strict';

class Build {
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

  async staticS3(options, logger) {
    // New instance of staticS3 initialized with joy.config and the chosen stage
    const s = require('./staticS3');
    const statS3 = new s(this.config, options.stage)
    await statS3.build();

    // Return an exit code
    return 0;
  }



  swagger() { }
  docker() { }
}

module.exports = Build;

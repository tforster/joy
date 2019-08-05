'use strict';

class Template {
  constructor(joy) {
    const prog = joy.prog;
    prog
      .command('init', 'Initialize a new Joy project')
      .option('-t, --template <template>', 'Template name', prog.STRING)
      .action(async (args, options, logger) => {
        logger.debug("arguments: %j", args);
        logger.debug("options: %j", options);
        const code = await this[args.subcommand].call(joy, options, logger);
        return code;
      });
  }

  copyFiles(options, logger) {
    if (this.isJoy()) {
      throw new Error('This is already a Joy enabled folder');
    }

    // Check the folder is empty
    throw new Error('Folder must be empty to be initialized.');

    // Get root of folder
    throw new Error('Specified template could not be found.');

    // Copy files


  }
}

module.exports = Template;

'use strict';

/**
 * Template implements Joy commands for initializing an empty directory as a Joy project type
 * 
 */
class Template {

  /**
   * @param {*} joy : Instance of a Joy class c/w config.json, env and helper functions
   * 
   */
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


  /**
   * Copies everything from the template folder to the target
   * 
   */
  copyFiles() {
    if (this.isJoy()) {
      throw new Error('This is already a Joy enabled folder');
    }

    // // Check the folder is empty
    // throw new Error('Folder must be empty to be initialized.')

    // // Get root of folder
    // throw new Error('Specified template could not be found.');

    // Copy files
  }
}

module.exports = Template;

'use strict';
const pa11y = require('pa11y');

class Test {
  constructor(joy) {
    const prog = joy.prog;
    prog
      .command('test', 'Run various tests including a11y and static analysis')
      .argument('<subcommand>', 'subcommand [a11y, static]', ['a11y', 'static'])
      .option('-u, --urls <urls>', 'URLs to test', prog.LIST)
      .action(async (args, options, logger) => {
        logger.debug("arguments: %j", args);
        logger.debug("options: %j", options);
        const code = await this[args.subcommand].call(joy, options, logger);
        return code;
      })
      .argument('<x>', 'x', ['x'])
      .option('-x, --xrls <xrls>', 'xRLs to test', prog.LIST)
      .action(async (args, options, logger) => {
        logger.debug("arguments: %j", args);
        logger.debug("options: %j", options);
        const code = await this[args.subcommand].call(joy, options, logger);
        return code;
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
  async a11y(options, logger) {
    if (this.isJoy()) {
      // Remind the user that if this is a Joy project they may need to serve the app if it is local too
      logger.info('Have you started the local stack?');
    }

    // Promisify and run a11y for each supplied url 
    const results = await Promise.all(
      options.urls.map(async url => {
        return await pa11y(url, options);
      })
    );

    // Output the raw result objects to stdout
    results.forEach(result => {
      console.log(result);
    });

    return 0;
  }


}

module.exports = Test;

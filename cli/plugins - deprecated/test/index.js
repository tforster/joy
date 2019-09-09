'use strict';
const pa11y = require('pa11y');
const { Analyzer } = require('hint');

/**
 * Test implements Joy commands for running a11y and static code tests
 *
 */
class Test {
  /**
   * @param {*} joy : Instance of a Joy class c/w config.json, env and helper functions
   *
   */
  constructor(joy) {
    const prog = joy.prog;
    prog
      .command('analyze', 'Run various analysis including accessibility and static code')
      .argument('<analysis-type>', 'Type of analysis to perform [a11y, static]', ['a11y', 'static'], 'static')
      .option('-u, --urls <urls>', 'URLs to analyze', prog.LIST)
      .action(async (args, options, logger) => {
        const code = await this[args.subcommand].call(joy, options, logger);
        return code;
      });
  }

  /**
   * Wraps a11y module
   * Todo: More research to see if this is the best module or test app to use
   *
   * @param {*} options : Additional CLI flags
   * @param {*} logger :  Logger
   *
   */
  async a11y(options, logger) {
    if (this.isJoy()) {
      // Remind the user that if this is a Joy project they may need to serve the app if it is local too
      logger.info('Have you started the local stack?');
    }

    // Promisify and run a11y for each supplied url
    const results = await Promise.all(
      options.urls.map(async (url) => {
        return await pa11y(url, options);
      })
    );

    // Output the raw result objects to stdout
    results.forEach((result) => {
      console.log(result);
    });

    return 0;
  }

  /**
   * Wraps [webhint](https://webhint.io/) to provide extensive analysis of front-end code
   *
   * @param {*} options : Additional CLI flags
   * @param {*} logger :  Logger
   */
  async staticWeb(options, logger) {
    const config = {
      connector: {
        name: 'jsdom'
      },
      extends: ['web-recommended'],
      formatters: ['stylish'],
      parsers: ['css', 'html', 'javascript', 'manifest', 'package-json'],
      browserslist: ['> 1%', 'last 2 versions']
    };

    const webhint = Analyzer.create(config);
    const results = await webhint.analyze(options.urls[0]);

    // TODO: Determine how we want to handle output (json to stdout? create excel file? display on screen? something else?)
    results.forEach((result) => {
      webhint.format(result.problems);
    });

    return 0;
  }
}

module.exports = Test;

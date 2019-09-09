#!/usr/bin/env node

'use strict';

// Node system dependencies
const fs = require('fs');
const path = require('path');

// Joy project dependencies
const controllers = require('./controllers');


/**
 * The "App" class
 * 
 * Responsible for creating a command stack, parsing the CLI args, matching against an item in 
 * the commands stack and calling it's related controller. 
 * 
 * All controllers must respond with an exit code that is returned to the OS via process.exit(code)
 * upon completion.
 *
 * @class Joy
 */
class Joy {

  /**
   * Creates an instance of Joy.
   * @memberof Joy
   */
  constructor() {
    // Fetch the config.json file (if this is a Joy project)
    this.config = this._getConfigJson();
    this.config.projectRoot = process.cwd();
    this.config.isJoy = this.isJoy();

    // Cache the environment variables (Follows this._config() since we may have just created some while parsing the config file)
    this.env = process.env;

    // A stack to manage routes (cli command sequences) as well as flags and function to execute
    this.stack = {};
  }


  /**
   * Update an internal stack representing all routes and their flags and functions
   * 
   * @param {*} route : A URI-like route with optional flags.
   *                    Example: build/static
   * @param {*} flags : The optional flags that a user can pass along with the command 
   *                    Example: build/static/{-s, --stage, stage}/{-w, --watch}
   * @param {*} fn :    Function to execute against this route
   * @memberof Joy
   */
  use(route, flags, fn) {
    // Push the commands, flags and function on to the commands stack
    this.stack[route] = { flags, fn };
  }


  /**
   * Parse .joy/config.json if it exists, expanding any key/val pairs in the env object to environment variables
   *
   * @returns An object containing all the configuration information 
   * @memberof Joy
   */
  _getConfigJson() {
    let config = Object.create({});
    try {
      const configFile = fs.readFileSync(path.join(process.cwd(), './.joy/config.json'), 'utf-8');
      if (configFile) {
        config = JSON.parse(configFile);

        // Expand any environment variables that might be in the config file
        for (let p in config.env) {
          process.env[p] = config.env[p];
        }
        // Remove from the JSON file as it will be picked up in the environment (don't need dupes)
        delete config.env;

      }
      config.projectRoot = process.cwd();
      return config;
    } catch (e) {
      return config;
    }
  }


  /**
   * Indicates whether the CWD is a Joy enabled project (e.g. is the parent to a .joy subdirectory)
   *
   * @returns Boolean
   * @memberof Joy
   */
  isJoy() {
    try {
      const stats = fs.statSync(path.join(this.config.projectRoot, './.joy'));
      return stats && stats.isDirectory();
    } catch (e) {
      return false;
    }
  }


  /**
   * Simple wrapper to exec a child process to call an external binary.
   * Child stdout and stderr are piped directly to ours.
   * Returns a shell success code
   *
   * @param {*} cmd A shell compatible command
   * @param {*} params Any additional parameters to pass to the command
   * @returns A shell compatible exit code
   * @memberof Joy
   */
  invoke(cmd, params) {
    return new Promise((resolve, reject) => {
      const child = require('child_process').spawn(cmd, params, { cwd: this.config.projectRoot, stdio: 'inherit' });

      child.on('close', (code) => {
        resolve(code);
      });

      child.on('error', (err) => {
        reject(err);
      });
    });
  }


  /**
   * Parses arguments into object suitable for matching against an existing route
   *
   * @param {*} args Arguments obtained from process.argv
   * @returns An object with a subobject each for the commands and flags respectively
   * @memberof Joy
   */
  _parseCommandLineArgs(args) {

    /**
     * Helper function that returns true if the arg represents a flag
     *
     * @param {string} arg
     * @returns boolean
     * @memberof Joy
     */
    const isFlag = function (arg) {
      return arg.indexOf('-') === 0;
    }

    // Drop the node program file path for now. We will revisit it later.
    args.shift();

    // Split the args into an array each for commands and flags
    const route = (args.splice(0, args.findIndex(el => isFlag(el))).join('/') || args.join('/'))

    // Get the definition for the route if it exists, or default to help
    const def = this.stack[route];
    if (!def) {
      return { route: 'help', args, def: this.stack.help };
    }

    // Iterate the array of flags, including optional flag values, and return an object
    const flags = args.reduce((acc, flagOrVal, i) => {
      if (isFlag(flagOrVal)) {
        const flag = def.flags.find(flag => {
          return (flag.flag.short === flagOrVal || flag.flag.long === flagOrVal)
        });
        if (!flag) {
          // User supplied flag does not exist in the definition for this route
          console.warn(`Ignoring invalid flag ${flagOrVal}`)
        } else {
          // Add the new flag property to the accumulator object, default to true (for valueless flags)
          acc[flag.name] = {
            value: true
          };
          // If the next element of the array is a value, then update the value property
          if (args[i + 1] && !isFlag(args[i + 1])) {
            acc[flag.name].value = args[i + 1];
          }
        }
      } else {
        // Do nothing as we added this value in the previous pass
      }

      // Return the updated object to the next iteration of reduce()
      return acc;
    }, {})

    return ({ route, flags, def })
  }


  /**
   * Executes the route indicated with all arguments
   *
   * @param {*} args A combination of the commands and flags
   * @returns A Promise of the completion
   * @memberof Joy
   */
  async _joyExec(args) {
    if (args.def) {
      return await args.def.fn.call(this, args);
    } else {
      console.log(`The command ${args} was not found.`);
      return await this.stack.help.fn.call(this, args);
    }
  }
}


(async () => {
  // Initialize an instance of Joy
  const joy = new Joy();

  // Add all possible command routes, flags, methods, etc to the commands stack
  joy.use('help',
    [], controllers.help);

  joy.use('build',
    [], controllers.build);

  joy.use('build/static',
    [{
      name: 'stage',
      flag: { short: '-s', long: '--stage' },
      help: 'The stage to build for (e.g. dev, stage, prod)'
    },
    {
      name: 'watch',
      flag: { short: '-w', long: '--watch' },
      help: 'Watch for changes in /src folder'
    }], controllers.buildStatic);

  joy.use('build/swagger',
    [{
      name: 'watch',
      flag: { short: '-w', long: '--watch' },
      help: 'Watch for changes in swagger folder'
    }], controllers.buildSwagger);

  joy.use('build/docker',
    [{
      name: 'name',
      flag: { short: '-n', long: '--name' },
      help: 'Docker file prefix (e.g. www, db, etc.'
    }], controllers.buildDocker);

  // Extract the commands and flags just entered by the user into a manageable object
  const parsedArgs = joy._parseCommandLineArgs(process.argv.slice(1));

  // (Attempt to) execute the specified commands and arguments, returning an exit code
  const exitCode = await joy._joyExec(parsedArgs);

  // Exit Joy with an OS exit code that can be used in the shell and shell scripts
  console.log(`exiting with ${exitCode}`);
  process.exit(exitCode);
})();

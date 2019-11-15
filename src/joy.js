#!/usr/bin/env node

'use strict';

// System dependencies (Built in modules)
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const url = require('url');

// Third party dependencies (Typically found in public NPM packages)
const ini = require('ini'); // Required to read and parse ~/.aws/credentials

// Project code dependencies (Code modules defined in this project)
const routes = require('./routes');

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
    this.config.awsProfiles = this._getAwsProfiles();
    this.config.projectRoot = process.cwd();
    this.config.isJoy = this.isJoy();
    this.config.joyRoot = __dirname;

    // Cache the environment variables (Follows this._config() since we may have just created some while parsing the config file)
    this.env = process.env;

    // A stack to manage routes (cli command sequences) as well as flags and function to execute
    this.stack = [];
  }


  /**
   * Update an internal stack representing all routes and their flags and functions
   * 
   * @param {*} route : A URI-like route with optional flags.
   *                    Example: git/branch/:number/:title
   * @param {*} fn :    Function to execute against this route
   * @memberof Joy
   */
  use(route, fn) {
    // Push the commands, flags and function on to the commands stack
    this.stack.push({ route, fn })
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
   * Wraps child_process.spawn()
   * - Set capture = false to allow stdout and stderr to pass up to parent 
   *
   * @param {string[]} cmd A shell compatible command in the format ['cmd', 'param1 param2 etc']
   * @param {boolean} [capture=false] If true, captures the output to stdout and stderr so it can be parsed. Also prevents it from going to parent std
   * @param {object} options 
   * @returns {number} A shell success code
   * @memberof Joy
   * 
   * !!! Piped stdout and stderr DO NOT APPEAR in the debug console. Test from a terminal.
   * 
   */
  invoke(cmd, capture = false, options) {
    // Merge provided options with Joy required options
    options = {
      ...{ cwd: this.config.projectRoot, stdio: 'inherit', shell: true }, ...options
    }

    return new Promise((resolve, reject) => {
      // spawn() format is 'cmd', [params] so we shift() the first element of our array accordingly
      const child = spawn(cmd.shift(), [cmd], options);

      // Only bind events if capturing is required
      if (capture) {
        if (options.stdio !== 'inherit' && options.stdio !== 'pipe') {
          reject(`Cannot capture without { stdio: 'inherit' | 'pipe' }`);
        }

        // String variables to capture stdout and stderr
        let captureOut = '';
        let captureErr = '';

        // Hook stdout
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (out) => {
          captureOut += out.toString();
        });

        // Hook stderr
        child.stderr.setEncoding('utf8');
        child.stderr.on('err', (err) => {
          captureErr += err.toString();
        });

        // Return the success code and captured std*
        child.on('close', (code) => {
          resolve({ code, captureOut, captureErr });
        });
      } else {
        // Return just the success code
        child.on('close', (code) => {
          resolve({ code });
        });
      }

      child.on('error', (err) => {
        reject(err);
      });
    });
  }


  /**
   * Reads the local ~/.aws/credentials file and adds found profiles to joy.config.awsProfiles
   *
   * @returns An object hash of profiles with access key ids and secrets
   * @memberof Joy
   */
  _getAwsProfiles() {
    const awsCredentials = ini.parse(fs.readFileSync(path.join(process.env['HOME'], '.aws/credentials'), 'utf-8'));
    return awsCredentials;
  }


  /**
    * Parses the various arguments supplied on the command line to a escaped URI format
    *
    * @param {*} args Arguments obtained from process.argv
    * @returns A string representation of the arguments matching a URI format
    * @memberof Joy
    */
  _argsToURI(args) {
    let query = false;
    let uri = ''

    // Drop the node program file path for now. We will revisit it later.
    args.shift();

    // Walk the array of arguments, URI encoding where necessary and converting flags to query string variables
    while (args.length > 0) {
      const arg = encodeURIComponent(args.shift());

      if (arg.indexOf('-') !== 0) {
        // Not a flag, assume it is a path element
        uri += `/${arg}`;
      } else {
        // Is a flag, build the query string
        if (query) {
          // Query string has already been started, use query param separators "&"
          uri += `&${arg.slice(1)}`;
        } else {
          // Query string has not been started, use a query "?" character
          uri += `?${arg.slice(1)}`;
          query = true;
        }
        if (args[0] && args[0].indexOf('-') !== 0) {
          // Next element is the value for the just captured flag
          const val = encodeURIComponent(args.shift());
          uri = uri + `=${val}`
        }
      }
    }
    // ToDo: If uri is null, default to help

    // Add joy protocol and cli hostname to complete the URI format
    return `joy://cli${uri}`;
  }


  /**
   * Takes the URI generated from user input, matches against a known route and returns the corresponding handler
   *
   * @param {string} uri  Command line args in the form of a URI e.g. joy://cli/git/branch/123/my%20title?v=verbose
   * @returns {object} An object representing a handler containing route, user generated input, controller function
   * @memberof Joy
   */
  _URIToHandler(uri) {
    uri = url.parse(uri);
    const uriParts = uri.pathname.split('/').slice(1); // slice(1) removes the leading empty string ""

    // Iterate stack of handlers looking for a matching route and returning handler plus expanded args
    return this.stack.find(handler => {
      // Define some empty property placeholders for path params and query string flags
      handler.params = {};
      handler.flags = {};

      // Break the route into an array of path segments for easier 1:1 matching
      const routeParts = handler.route.split('/');

      // Shortcut any routes that are not at least the correct length
      if (routeParts.length === uriParts.length) {

        // Iterate the route parts comparing each to its uri part equivalent at the same index
        for (let i = 0; i < routeParts.length; i++) {

          const s = routeParts[i];
          if (s.indexOf(':') === 0) {
            // It is a parameter so add it to the results .params object         
            handler.params[s.slice(1)] = decodeURIComponent(uriParts[i]);
          } else if (s !== uriParts[i]) {
            // It is an unmatched path segment so exit the loop and move to the next stack.find() call
            return false;
          }
        }

        // Convert query/search params to flags object. E.g. ?a=b&c=d becomes {a:b, c:d}
        if (uri.search) {
          // Slice the leading "?" then split on the "&" followed by another split on the "=" before converting the resulting array of arrays to an object
          handler.flags = Object.fromEntries(uri.search.slice(1).split('&').map(flag => {
            return flag.split('=');
          }))
        }
        return true;
      } else {
        // Explicit return false rather than ambiguous auto return of "undefined"
        return false;
      }
    });
  }

}


(async () => {
  // Initialize an instance of Joy
  const joy = new Joy();
  let exitCode;

  // Add routes from the routes folder/file
  routes(joy);

  // Extract the commands and flags just entered by the user into the handler
  const uri = joy._argsToURI(process.argv.slice(1));
  joy.handler = joy._URIToHandler(uri);

  if (joy.handler.fn) {
    exitCode = await joy.handler.fn.call(joy).catch(reason => {
      throw reason;
    })
  } else {
    console.log(`The command ${route.pathname} was not found.`);
    exitCode = await this.stack.help.fn.call(this, options);
  }

  // Exit Joy with an OS exit code that can be used in the shell and shell scripts
  console.log(`exiting with \n${JSON.stringify(exitCode, null, 2)} `);
  process.exit(exitCode);
})();

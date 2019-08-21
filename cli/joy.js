#!/usr/bin/env node

'use strict';
const fs = require('fs');
const prog = require('caporal');
const path = require('path');

// Joy modules
const Build = require('./plugins/build');
const Docker = require('./plugins/docker');
const Test = require('./plugins/test');

class Joy {
  constructor() {
    // Setup an instance of caporal (prog from their example)
    this.prog = prog;
    this.prog.version('1.0.0');

    // Fetch the config.json file (if this is a Joy project)
    this.config = this._config();

    // Cache the environment variables (Follows this._config() since we may have just created some while parsing the config file)
    this.env = process.env;
  }

  /**
   * Add functionality from a Joy specific required module
   *
   * @param {*} commandModule
   */
  use(commandModule) {
    // All command modules must expose a constructor that accepts `this` and mutates this.prog. Also allows module to use this.config and this.invoke
    new commandModule(this);
  }

  /**
   * Parse .joy/config.json if it exists, expanding any key/val pairs in the env object to environment variables
   *
   */
  _config() {
    let config = Object.create({});
    try {
      const configFile = fs.readFileSync(path.join(process.cwd(), './.joy/config.json'), 'utf-8');
      if (configFile) {
        config = JSON.parse(configFile);
        // Expand any environment variables that might be in the config file
        for (let p in config.env) {
          process.env[p] = config.env[p];
        }
      }
      return config;
    } catch (e) {
      return config;
    }
  }

  /**
   * Indicates whether the CWD is a Joy enabled project (e.g. is the parent to a .joy subdirectory)
   *
   */
  isJoy() {
    try {
      const stats = fs.statSync(path.join(process.cwd(), './.joy'));
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
   * @param {*} cmd
   * @param {*} params
   */
  invoke(cmd, params) {
    return new Promise((resolve, reject) => {
      const child = require('child_process').spawn(cmd, params, { cwd: process.cwd(), stdio: 'inherit' });

      child.on('close', (code) => {
        resolve(code);
      });

      child.on('error', (err) => {
        reject(err);
      });
    });
  }
}

(async () => {
  // Create a new instance of Joy
  const joy = new Joy();

  // Add plugins from the ./plugins directory
  joy.use(Build);
  joy.use(Docker);
  joy.use(Test);

  const code = await joy.prog.parse(process.argv);

  // Todo: Figure out why the debugger won't disconnect unless there's a synchronous action like a console.log()
  console.log('exit code:', code);

  // Exit with the success code so we can potentially include Joy inside a shell script if required
  process.exit(code);
})();

#!/usr/bin/env node
'use strict';
const fs = require('fs');
const prog = require('caporal');
const path = require('path');
const pa11y = require('pa11y');
const Docker = require('./plugins/docker');
const Test = require('./plugins/test');
const util = require('util');

class Joy {
  constructor() {
    this.env = process.env;
    this.prog = prog;
    this.prog.version('1.0.0');
  }

  addCommand(commandObj) {
    new commandObj(this);
  }


  /**
   * Indicates whether the CWD is a Joy enabled project (e.g. is the parent to a .joy subdirectory)
   * 
   */
  isJoy() {
    try {
      const stats = fs.statSync(path.join(process.cwd(), './.joy'));
      return stats && stats.isDirectory();
    }
    catch (e) {
      return false;
    }
  }


  /**
   * Simple wrapper to exec a child process to call an external binary. 
   * Child stdout and stderror are piped directly to ours.
   * Returns a shell success code
   * 
   * @param {*} cmd 
   * @param {*} params 
   */
  invoke(cmd, params) {
    return new Promise((resolve, reject) => {
      const child = require('child_process').spawn(cmd, params);

      // Connect the child's std* to our std*
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);

      child.on('close', code => {
        resolve(code);
      });

      child.on('error', err => {
        reject(err);
      });
    })
  }
}


(async () => {
  // Create a new instance of Joy
  const joy = new Joy();

  // Add plugins from the ./plugins directory
  joy.addCommand(Docker);
  joy.addCommand(Test);

  const code = await joy.prog.parse(process.argv);

  // Todo: Figure out why the debugger won't disconnect unless there's a synchronous action like a console.log()
  console.log(code);

  // Exit with the success code so we can potentially include Joy inside a shell script if required
  process.exit(code);
})();

#!/usr/bin/env node

'use strict';

/*******************************************************************************
 * JOY - Implements a bash-ish environment for running simple scripts written 
 * in Javascript. 
 * 
 * - Scripts are intended to work standalone without interdependencies
 * - Every script gets a copy of config including secrets and command line
 *   arguments
 * 
 * Usage: `./utility/joy.js --help`
 * 
 ******************************************************************************/

const path = require('path');
const tasks = require('./plugins');
const fs = require('fs');


class Joy {
  constructor() {
    // Todo: Replace minimist with a few lines of our own to remove the only hard dependency
    this.args = require('minimist')(process.argv.slice(2));
    if (!this.args.p) {
      this.args.p = path.join(__dirname, '../');
    }
    this.args.cwd = process.cwd();
    this.task = this.args._;
    this.env = {}

    // If {project}/.joy/tasks exists, merge with tasks
    const customTasksPath = path.join(this.args.p, '.joy', 'scripts');
    if (fs.existsSync(customTasksPath)) {
      Object.assign(tasks, require(customTasksPath));
    }
  }

  help() {
    console.log(`Help
----
./joy.js -p {path to project root}`);
  }

  execute() {
    console.log('task',this.task[0])
    const fn = this._searchModules(tasks, this.task[0]);
    if (fn && typeof (fn) === 'function') {
      fn.call(undefined, this.task, this.args, this.env)
    }
  }


  /**
   * Setup environment variables and gather other required info
   */
  prepare() {
    return this._environmentVariables(path.join(this.args.p, '.joy', 'config.env'));
  }


  /**
   * Parse the .env file pointed to by path into this.env object
   * @param {*} path 
   */
  _environmentVariables(path) {
    // Use Promise since async only experimental in 11.4.0 https://nodejs.org/api/readline.html#readline_rl_symbol_asynciterator
    return new Promise((resolve, reject) => {
      if (fs.existsSync(path)) {
        const lineReader = require('readline').createInterface({
          input: fs.createReadStream(path)
        });

        // Parse each line ignoring anything after (and including) a comment delimiter `#`
        lineReader.on('line', (line) => {
          const l = line.match(/^[^#]+/);
          if (l) {
            const kv = l[0].split('=');
            this.env[kv[0].trim()] = kv[1].trim() || null;
          }
        });

        lineReader.on('error', function (e) {
          reject(e);
        })

        lineReader.on('close', () => {
          resolve();
        })
      }
    });
  }


  _searchModules(tasks, task) {
    const _this = this;
    let func;

    // Iterate each module
    for (let mod in tasks) {
      // Get reference to module      
      const m = tasks[mod]
      if (typeof m === 'object' && m.hasOwnProperty(task) && typeof (m[task]) === 'function') {
        return m[task];

        break;
      }
    }
  }

}



(() => {
  const joy = new Joy();
  joy.prepare()

  joy.execute();


})();

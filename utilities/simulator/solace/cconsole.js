/* eslint-disable no-return-assign */
// cconsole.js

const chalk = require('chalk');
module.exports = class cconsole {
  static getTime = () => {
    const now = new Date();
    const time = [('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2),
      ('0' + now.getSeconds()).slice(-2)];
    return '[' + time.join(':') + '] ';
  }

  static log(name, ...args) {
    let str = chalk.green.bold(`[${name}]: `);
    str += chalk.cyan.bold(` ${this.getTime()} - `);
    args.forEach(arg => str += ` ${arg}`);
    console.log(str);
  }

  static error(name, ...args) {
    let str = chalk.green.bold(`[${name}]: `);
    str += chalk.red.bold(` ${this.getTime()} - `);
    args.forEach(arg => str += ` ${arg}`);
    console.log(str);
  }
};

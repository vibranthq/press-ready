#!/usr/bin/env node

import yargs from 'yargs';

import {build} from './commands/build';
import {lint} from './commands/lint';
import {log, rawLog} from './util';
import chalk from 'chalk';

yargs
  .scriptName('press-ready')
  .command({
    command: 'build',
    desc: 'build PDF',
    builder: (yargs) =>
      yargs
        .option('input', {
          demandOption: true,
          alias: 'i',
          description: 'Input file path (relative)',
        })
        .option('output', {
          default: './output.pdf',
          alias: 'o',
          description: 'Output file path (relative)',
        })
        .option('gray-scale', {
          boolean: true,
          default: false,
          description: 'Use gray scale color space instead of CMYK',
        })
        .option('enforce-outline', {
          boolean: true,
          description: 'Convert embedded fonts to outlined fonts',
        })
        .option('boundary-boxes', {
          boolean: true,
          default: false,
          description: 'Add boundary boxes on every page',
        }),
    handler: build,
  })
  .command({
    command: 'lint <input>',
    desc: 'lint PDF',
    builder: (yargs) =>
      yargs.positional('input', {
        required: true,
        description: 'Input file path (relative)',
      }),
    handler: lint,
  })
  .demandCommand()
  .help()
  .fail((msg, err, yargs) => {
    if (err) {
      log(chalk.red(err));
    } else {
      rawLog(yargs.help(), '\n');
      rawLog(msg);
    }
    process.exit();
  }).argv;

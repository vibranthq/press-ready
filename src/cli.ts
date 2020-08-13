#!/usr/bin/env node

import yargs from 'yargs'

import { build } from './commands/build'
import { lint } from './commands/lint'
import { log, rawLog } from './util'
import chalk from 'chalk'

export interface Args {
  input: unknown
  output: string
  'gray-scale'?: boolean
  'enforce-outline'?: boolean
  'boundary-boxes'?: boolean
}

yargs
  .scriptName('press-ready')
  .command({
    command: 'build',
    describe: 'build PDF',
    builder: (yargs) =>
      yargs
        .option('input', {
          demand: true,
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
    describe: 'lint PDF',
    builder: (yargs) =>
      yargs.positional('input', {
        required: true,
        description: 'Input file path (relative)',
      }),
    handler: lint,
  })
  .demandCommand()
  .help()
  // @ts-ignore
  .fail((msg: string, err: Error, yargs: any) => {
    if (err) {
      log(chalk.red(err))
    } else {
      rawLog(yargs.help(), '\n')
      rawLog(msg)
    }
    process.exit()
  }).argv

#!/usr/bin/env node

const yargs = require('yargs')
const path = require('path')
const chalk = require('chalk')
const Table = require('cli-table')
const tableArgs = {
  chars: {
    top: '',
    'top-mid': '',
    'top-left': '',
    'top-right': '',
    bottom: '',
    'bottom-mid': '',
    'bottom-left': '',
    'bottom-right': '',
    left: '',
    'left-mid': '',
    mid: '',
    'mid-mid': '',
    right: '',
    'right-mid': '',
    middle: ' ',
  },
  style: { 'padding-left': 0, head: ['white'] },
}

const { pdfFonts, pdfInfo } = require('./xpdf')
const { ghostScript } = require('./ghostScript')

function log(...obj) {
  // eslint-disable-next-line no-console
  console.log(chalk.gray('==>'), chalk.blue(...obj))
}

function rawLog(...obj) {
  // eslint-disable-next-line no-console
  console.log(...obj)
}

async function inspectPDF(filePath) {
  const { fonts } = await pdfFonts(filePath)

  if (fonts.length) {
    const table = new Table({
      head: ['name', 'type', 'embedded', 'subset'],
      ...tableArgs,
    })
    for (const font of fonts) {
      table.push([
        chalk.gray(font.name),
        chalk.yellow(font.type),
        font.emb === 'yes' ? chalk.green('yes') : chalk.red('no'),
        font.sub === 'yes' ? chalk.green('yes') : chalk.red('no'),
      ])
    }
    rawLog(table.toString())
  } else {
    log(chalk.yellow('No fonts found'))
  }

  // Check if all fonts are embedded
  const isEmbedded = fonts.every((font) => font.emb === 'yes')

  // Check if all fonts are a subset of font
  const isSubset = fonts.every((font) => font.sub === 'yes')

  const shouldEnforceOutline = !isEmbedded || !isSubset
  if (shouldEnforceOutline) {
    log(chalk.red('Some fonts need to be outlined'))
  } else {
    log(chalk.green('Every font is properly embedded or no fonts embedded'))
  }

  return {
    isEmbedded,
    isSubset,
    shouldEnforceOutline,
  }
}

async function build(args) {
  if (!args.input || !args.output) {
    throw new Error('No input given')
  }

  const resolvedInput = path.resolve(args.input)
  const resolvedOutput = path.resolve(args.output)

  log(`Listing fonts in '${args.input}'`)
  const { shouldEnforceOutline } = await inspectPDF(resolvedInput)
  const isEnforceOutline =
    args.enforceOutline !== undefined
      ? args.enforceOutline
      : shouldEnforceOutline

  log('Generating PDF (using Ghostscript)')
  const table = new Table(tableArgs)
  table.push(
    {
      Input: chalk.white(args.input),
    },
    {
      Output: chalk.white(args.output),
    },
    {
      'Color Mode': args.grayScale
        ? chalk.white('Gray')
        : `${chalk.cyan('C')}${chalk.red('M')}${chalk.yellow('Y')}${chalk.white(
            'K'
          )}`,
    },
    {
      'Enforce outline': isEnforceOutline
        ? chalk.green('yes')
        : chalk.red('no'),
    },
    {
      'Boundary boxes': args.boundaryBoxes
        ? chalk.green('yes')
        : chalk.red('no'),
    }
  )
  rawLog(table.toString())

  const gsResult = await ghostScript(
    resolvedInput,
    resolvedOutput,
    path.resolve(__dirname, '../assets/PDFX_def.ps.mustache'),
    path.resolve(__dirname, '../assets/JapanColor2001Coated.icc'),
    args.grayScale,
    isEnforceOutline,
    args.boundaryBoxes
  )

  if (gsResult.rawError) {
    log(chalk.red('Done with some errors'))
    rawLog(chalk.gray(gsResult.rawError))
  } else {
    log('Done without error')
  }

  log(`Listing fonts in '${args.output}'`)
  await inspectPDF(resolvedOutput)
}

async function lint(args) {
  const info = await pdfInfo(args.input)
  log(`Linting metadata for '${args.input}'`)
  log(chalk.gray('Title'), info.Title)
  log(chalk.gray('Page No.'), info.Pages)
  log(chalk.gray('PDF version'), info['PDF version'])
  log(chalk.gray('TrimBox'), Object.values(info.TrimBox))
  log(chalk.gray('BleedBox'), Object.values(info.BleedBox))
  log('Listing fonts')
  await inspectPDF(args.input)
}

yargs
  .scriptName('press-ready')
  .command(
    ['build', '$0'],
    'build PDF',
    (yargs) =>
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
    build
  )
  .command(
    ['lint'],
    'lint PDF',
    (yargs) =>
      yargs.option('input', {
        required: true,
        alias: 'i',
        description: 'Input file path (relative)',
      }),
    lint
  )
  .fail((msg, err) => {
    log(chalk.red(msg || err))
    process.exit()
  })
  .help().argv

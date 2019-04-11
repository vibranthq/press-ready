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

const { pdfFonts } = require('./pdfFonts')
const { ghostScript } = require('./ghostScript')

function log(...obj) {
  console.log(chalk.gray('==>'), chalk.blue(...obj))
}

function rawLog(...obj) {
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
      // rawLog(
      //   chalk.gray(
      //     `${font.name}\t (${chalk.yellow(font.type)})\t embedded: ${
      //       font.emb === 'yes' ? chalk.green('yes') : chalk.red('no')
      //     } subset: ${
      //       font.sub === 'yes' ? chalk.green('yes') : chalk.red('no')
      //     }`
      //   )
      // )
    }
    rawLog(table.toString())
  } else {
    log(chalk.yellow('No fonts found'))
  }

  // Check if all fonts are embedded
  const isEmbedded = fonts.every((font) => font.emb === 'yes')

  // Check if all fonts are a subset of font
  const isSubset = fonts.every((font) => font.sub === 'yes')

  if (!isEmbedded || !isSubset) {
    log(chalk.red('Some fonts need to be outlined'))
  } else {
    log(chalk.green('Every font is properly embedded or no fonts embedded'))
  }

  return {
    isEmbedded,
    isSubset,
    shouldEnforceOutline: !isEmbedded || !isSubset,
  }
}

async function build(argv) {
  const { input, output, grayScale, enforceOutline, boundaryBoxes } = argv
  if (!input || !output) {
    log(chalk.red('No input given'))
    process.exit()
  }

  const resolvedInput = path.resolve(input)
  const resolvedOutput = path.resolve(output)

  log(`Listing fonts in '${input}'`)
  const { shouldEnforceOutline } = await inspectPDF(resolvedInput)
  const isEnforceOutline =
    enforceOutline !== undefined ? enforceOutline : shouldEnforceOutline

  log('Generating PDF (using Ghostscript)')
  const table = new Table(tableArgs)
  table.push(
    {
      Input: chalk.white(input),
    },
    {
      Output: chalk.white(output),
    },
    {
      'Color Mode': grayScale
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
      'Boundary boxes': boundaryBoxes ? chalk.green('yes') : chalk.red('no'),
    }
  )
  rawLog(table.toString())

  const gsResult = await ghostScript(
    resolvedInput,
    resolvedOutput,
    path.resolve(__dirname, '../assets/PDFX_def.ps.mustache'),
    path.resolve(__dirname, '../assets/JapanColor2001Coated.icc'),
    grayScale,
    isEnforceOutline,
    boundaryBoxes
  )

  if (gsResult.rawError) {
    log(chalk.red('Done with some errors'))
    rawLog(chalk.gray(gsResult.rawError))
  } else {
    log('Done without error')
  }

  log(`Listing fonts in '${output}'`)
  await inspectPDF(resolvedOutput)
}

async function lint(argv) {}

const argv = yargs
  .option('input', { required: true, description: 'Input file path' })
  .option('output', {
    default: './output.pdf',
    description: 'Output file path',
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
  })
  .help().argv

build(argv).catch((err) => {
  log(chalk.red('Error'))
  rawLog(chalk.red(err.message))
})

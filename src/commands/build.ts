import path from 'upath'
import chalk from 'chalk'
import Table from 'cli-table'
import { isPdfFontsAvailable } from '../pdffonts'
import { ghostScript, isGhostscriptAvailable } from '../ghostScript'
import { inspectPDF } from '../inspectPDF'
import { log, rawLog } from '../util'
import { tableArgs } from '../table'
import { Args } from '../cli'

export async function build(args: Args) {
  if (typeof args.input !== 'string' || !args.output) {
    throw new Error('No input given')
  }
  if (!isGhostscriptAvailable()) {
    throw new Error(`'gs' command missing. Install Ghostscript on your machine.
macOS:
    $ brew install ghostscript

Ubuntu:
    $ apt-get install ghostscript

Windows:
    Download and install the Ghostscript for Windows at
    https://www.ghostscript.com/download/gsdnld.html
    Then, add the installed Ghostscript's bin directory
    (e.g., "C:\\Program Files\\gs\\gs9.52\\bin")
    to the PATH environment variable.
`)
  }
  if (!isPdfFontsAvailable()) {
    throw new Error(`'pdffonts' command missing. Install pdffonts on your machine.
macOS:
    $ brew install xpdf

Ubuntu:
    $ apt-get install poppler-utils

Windows:
    Download and install the Xpdf command line tools for Windows at
    http://www.xpdfreader.com/download.html
    Then, add the installed Xpdf's bin directory
    (e.g., "C:\\xpdf-tools-win-4.02\\bin64")
    to the PATH environment variable.
`)
  }
  const resolvedInput = path.resolve(args.input)
  const resolvedOutput = path.resolve(args.output)
  log(`Listing fonts in '${args.input}'`)
  const { shouldEnforceOutline } = await inspectPDF(resolvedInput)
  const isEnforceOutline =
    args['enforce-outline'] !== undefined
      ? args['enforce-outline']
      : shouldEnforceOutline
  log('Generating PDF')
  const table = new Table(tableArgs)
  table.push(
    {
      Input: chalk.white(args.input),
    },
    {
      Output: chalk.white(args.output),
    },
    {
      'Color Mode': args['gray-scale']
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
      'Boundary boxes': args['boundary-boxes']
        ? chalk.green('yes')
        : chalk.red('no'),
    }
  )
  rawLog(table.toString())
  const gsResult = await ghostScript({
    inputPath: resolvedInput,
    outputPath: resolvedOutput,
    grayScale: args['gray-scale'],
    enforceOutline: isEnforceOutline,
    boundaryBoxes: args['boundary-boxes'],
  })
  if (gsResult.rawError) {
    log(chalk.red(gsResult.rawError))
    rawLog(chalk.gray(gsResult.rawOutput))
  } else {
    log('Ghostscript: Done without error')
  }
  log(`Listing fonts in '${args.output}'`)
  await inspectPDF(resolvedOutput)
}

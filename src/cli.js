#!/usr/bin/env node

const yargs = require('yargs');
const path = require('path');
const chalk = require('chalk');
const Table = require('cli-table');

const {pdfFonts, pdfInfo, isXPDFAvailable} = require('./xpdf');
const {ghostScript, isGhostscriptAvailable} = require('./ghostScript');

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
  style: {'padding-left': 0, head: ['white']},
};

function log(...obj) {
  // eslint-disable-next-line no-console
  console.log(chalk.gray('==>'), chalk.blue(...obj));
}

function rawLog(...obj) {
  // eslint-disable-next-line no-console
  console.log(...obj);
}

async function inspectPDF(filePath) {
  const {fonts} = await pdfFonts(filePath);

  if (fonts.length) {
    const table = new Table({
      head: ['name', 'type', 'embedded', 'subset'],
      ...tableArgs,
    });
    for (const font of fonts) {
      table.push([
        chalk.gray(font.name),
        chalk.yellow(font.type),
        font.emb === 'yes' ? chalk.green('yes') : chalk.red('no'),
        font.sub === 'yes' ? chalk.green('yes') : chalk.red('no'),
      ]);
    }
    rawLog(table.toString());
  } else {
    log(chalk.yellow('No fonts found'));
  }

  // Check if all fonts are embedded
  const isEmbedded = fonts.every((font) => font.emb === 'yes');

  // Check if all fonts are a subset of font
  const isSubset = fonts.every((font) => font.sub === 'yes');

  const shouldEnforceOutline = !isEmbedded || !isSubset;
  if (shouldEnforceOutline) {
    log(chalk.red('Some fonts need to be outlined'));
  } else {
    log(chalk.green('Every font is properly embedded'));
  }

  return {
    isEmbedded,
    isSubset,
    shouldEnforceOutline,
  };
}

async function build(args) {
  if (!args.input || !args.output) {
    throw new Error('No input given');
  }

  if (!isGhostscriptAvailable()) {
    throw new Error(`'gs' command missing. Install Ghostscript on your machine.
macOS:
$ brew install ghostscript

Ubuntu:
$ apt-get install ghostscript
`);
  }

  if (!isXPDFAvailable()) {
    throw new Error(`'pdffonts' command missing. Install XPDF on your machine.
macOS:
$ brew install xpdf

Ubuntu:
$ apt-get install xpdf
`);
  }

  const resolvedInput = path.resolve(args.input);
  const resolvedOutput = path.resolve(args.output);

  log(`Listing fonts in '${args.input}'`);
  const {shouldEnforceOutline} = await inspectPDF(resolvedInput);
  const isEnforceOutline =
    args.enforceOutline !== undefined
      ? args.enforceOutline
      : shouldEnforceOutline;

  log('Generating PDF');
  const table = new Table(tableArgs);
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
            'K',
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
    },
  );
  rawLog(table.toString());

  const gsResult = await ghostScript({
    inputPath: resolvedInput,
    outputPath: resolvedOutput,
    grayScale: args.grayScale,
    enforceOutline: isEnforceOutline,
    boundaryBoxes: args.boundaryBoxes,
  });

  if (gsResult.rawError) {
    log(chalk.red(gsResult.rawError));
    rawLog(chalk.gray(gsResult.rawOutput));
  } else {
    log('Ghostscript: Done without error');
  }

  log(`Listing fonts in '${args.output}'`);
  await inspectPDF(resolvedOutput);
}

async function lint(args) {
  const info = await pdfInfo(args.input);
  log(`Linting metadata for '${args.input}'`);
  log(chalk.gray('Title'), info.Title);
  log(chalk.gray('Page No.'), info.Pages);
  log(chalk.gray('PDF version'), info['PDF version']);
  log(chalk.gray('TrimBox'), Object.values(info.TrimBox));
  log(chalk.gray('BleedBox'), Object.values(info.BleedBox));
  log('Listing fonts');
  await inspectPDF(args.input);
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
    build,
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
    lint,
  )
  .fail((msg, err) => {
    log(chalk.red(msg || err));
    process.exit();
  })
  .help().argv;

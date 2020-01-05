import path from 'path';
import chalk from 'chalk';
import Table from 'cli-table';
import {isXPDFAvailable} from '../xpdf';
import {ghostScript, isGhostscriptAvailable} from '../ghostScript';
import {inspectPDF} from '../inspectPDF';
import {log, rawLog} from '../util';
import {tableArgs} from '../table';

export async function build(args) {
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

import chalk from 'chalk';
import Table from 'cli-table';
import {pdfFonts} from './xpdf';
import {rawLog, log} from './util';

import {tableArgs} from './table';

export async function inspectPDF(filePath) {
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

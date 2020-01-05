import chalk from 'chalk';
import {pdfInfo} from '../xpdf';
import {inspectPDF} from '../inspectPDF';
import {log} from '../util';
import {Args} from '../cli';

export async function lint(args: Args) {
  if (typeof args.input !== 'string') {
    throw new Error('Invalid input');
  }
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

import chalk from 'chalk';

export function rawLog(...obj: any) {
  // eslint-disable-next-line no-console
  console.log(...obj);
}

export function log(...obj: any) {
  rawLog(chalk.gray('==>'), chalk.blue(...obj));
}

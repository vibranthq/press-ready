import chalk from 'chalk';

export function rawLog(...obj) {
  // eslint-disable-next-line no-console
  console.log(...obj);
}

export function log(...obj) {
  rawLog(chalk.gray('==>'), chalk.blue(...obj));
}

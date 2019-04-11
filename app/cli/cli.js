#!/usr/bin/env node

const argv = require('yargs')
  .option('input')
  .option('output')
  .boolean('grayScale')
  .boolean('forceOutline')
  .boolean('trimBoxes').argv
const path = require('path')
const chalk = require('chalk')

const { pdfFonts } = require('./pdfFonts')
const { ghostScript } = require('./ghostScript')

async function inspectPDF(filePath) {
  const { fonts } = await pdfFonts(filePath)

  if (fonts.length) {
    for (const font of fonts) {
      console.log(
        chalk.gray(
          `${font.name} (${chalk.yellow(font.type)})\t  Embedded:${
            font.emb === 'yes' ? chalk.green('yes') : chalk.red('no')
          } Subset:${font.sub === 'yes' ? chalk.green('yes') : chalk.red('no')}`
        )
      )
    }
  } else {
    console.log(chalk.gray('===>'), 'No fonts found')
  }

  // Check if all fonts are embedded
  const isEmbedded = fonts.every((font) => font.emb === 'yes')
  // Check if all fonts are a subset of font
  const isSubset = fonts.every((font) => font.sub === 'yes')
  if (!isEmbedded || !isSubset) {
    console.log(chalk.gray('===>'), chalk.red('! Should enforce outline fonts'))
  } else {
    console.log(
      chalk.gray('===>'),
      chalk.green('* No need to enforce outline fonts')
    )
  }
  return {
    isEmbedded,
    isSubset,
    shouldEnforceOutline: !isEmbedded || !isSubset,
  }
}

async function main() {
  const { input, output, grayScale, forceOutline, trimBoxes } = argv
  if (!input || !output) {
    console.log(chalk.red('===> No input given'))
    process.exit()
  }

  const resolvedInput = path.resolve(input)
  const resolvedOutput = path.resolve(output)

  console.log(chalk.gray('===>'), chalk.green('Listing fonts in', input))
  const { shouldEnforceOutline } = await inspectPDF(resolvedInput)

  console.log(chalk.gray('===> Input:'), input)
  console.log(chalk.gray('===> Output:'), output)
  console.log(
    chalk.gray('===> Color mode:'),
    grayScale
      ? chalk.gray('Gray')
      : `${chalk.cyan('C')}${chalk.red('M')}${chalk.yellow('Y')}${chalk.white(
          'K'
        )}`
  )

  console.log(chalk.gray('===>'), chalk.green('Generating PDF (Ghostscript)'))

  const gsResult = await ghostScript(
    resolvedInput,
    resolvedOutput,
    path.resolve(__dirname, '../assets/PDFX_def.ps.mustache'),
    path.resolve(__dirname, '../assets/JapanColor2001Coated.icc'),
    grayScale,
    shouldEnforceOutline,
    trimBoxes
  )

  console.log(chalk.gray('===>'), chalk.green('Listing fonts in', output))
  await inspectPDF(resolvedOutput)
}

main().catch((err) => {
  console.log(err.message)
})

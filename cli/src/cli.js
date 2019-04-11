#!/usr/bin/env node

const yargs = require('yargs')
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

async function main(argv) {
  const { input, output, grayScale, enforceOutline, boundaryBoxes } = argv
  if (!input || !output) {
    console.log(chalk.red('===> No input given'))
    process.exit()
  }

  const resolvedInput = path.resolve(input)
  const resolvedOutput = path.resolve(output)

  console.log(
    chalk.gray('===>'),
    chalk.green('Listing embedded fonts in', input)
  )
  const { shouldEnforceOutline } = await inspectPDF(resolvedInput)

  console.log(chalk.gray('===> Input:'), input)
  console.log(chalk.gray('===> Output:'), output)
  console.log(
    chalk.gray('===> Color Mode:'),
    grayScale
      ? chalk.white('Gray')
      : `${chalk.cyan('C')}${chalk.red('M')}${chalk.yellow('Y')}${chalk.white(
          'K'
        )}`
  )
  console.log(
    chalk.gray('===> Enforce Outline:'),
    enforceOutline || shouldEnforceOutline
  )
  console.log(chalk.gray('===> Add Boundary Boxes:'), boundaryBoxes)

  console.log(chalk.gray('===>'), chalk.green('Generating PDF (Ghostscript)'))

  const gsResult = await ghostScript(
    resolvedInput,
    resolvedOutput,
    path.resolve(__dirname, '../assets/PDFX_def.ps.mustache'),
    path.resolve(__dirname, '../assets/JapanColor2001Coated.icc'),
    grayScale,
    enforceOutline || shouldEnforceOutline,
    boundaryBoxes
  )

  console.log(
    chalk.gray('===>'),
    chalk.green('Listing embedded fonts in', output)
  )
  await inspectPDF(resolvedOutput)
}

const argv = yargs
  .option('input', { required: true })
  .option('output', { default: './output.pdf' })
  .option('grayScale', { boolean: true, default: false })
  .option('enforceOutline', { boolean: true })
  .option('boundaryBoxes', { boolean: true, default: false })
  .help().argv

main(argv).catch((err) => {
  console.log(err.message)
})

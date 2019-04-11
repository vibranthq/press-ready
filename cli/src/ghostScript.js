const fs = require('fs')
const execa = require('execa')
const Mustache = require('mustache')
const debug = require('debug')('press-ready')
const { join } = require('path')
const { tmpdir } = require('os')

async function ghostScript(
  inputPath,
  outputPath,
  pdfxDefTemplatePath,
  iccProfilePath,
  grayScale = false,
  enforceOutline = false,
  boundaryBoxes = false
) {
  const pdfxDefPath = join(tmpdir(), 'press-ready-def.ps')
  const gsCommand = 'gs'
  const gsOptions = [
    '-dPDFX',
    '-dBATCH',
    '-dNOPAUSE',
    '-dNOOUTERSAVE',
    '-sDEVICE=pdfwrite',
    '-dPDFSTOPONERROR',
    '-dShowAnnots=false',
    '-dPDFSETTINGS=/prepress',
    '-dPrinted',
    '-r600',
    '-dGrayImageResolution=600',
    '-dMonoImageResolution=600',
    '-dColorImageResolution=600',
    `-sOutputFile=${outputPath}`,
  ]
  if (boundaryBoxes) {
    gsOptions.push('-dUseCropBox', '-dUseTrimBox', '-dUseBleedBox')
  }
  if (enforceOutline) {
    gsOptions.push('-dNoOutputFonts')
  }
  if (grayScale) {
    gsOptions.push(
      '-sProcessColorModel=DeviceGray',
      '-sColorConversionStrategy=Gray',
      '-sColorConversionStrategyForImages=Gray'
    )
  } else {
    gsOptions.push(
      '-sProcessColorModel=DeviceCMYK',
      '-sColorConversionStrategy=CMYK',
      '-sColorConversionStrategyForImages=CMYK',
      '-dOverrideICC',
      `-sOutputICCProfile=${iccProfilePath}`
    )
  }

  // generate PDFX_def.ps
  pdfxDefTemplate = fs.readFileSync(pdfxDefTemplatePath, 'utf-8')
  const pdfxDef = Mustache.render(pdfxDefTemplate, {
    title: 'Auto-generated PDF (press-ready)',
    iccProfilePath,
  })
  fs.writeFileSync(pdfxDefPath, pdfxDef, 'utf-8')

  // generate pdf with ghostscript
  const args = [...gsOptions, pdfxDefPath, inputPath]
  const command = [gsCommand, args]
  debug(command)
  try {
    const { stdout, stderr } = await execa(...command)
    return {
      command,
      rawOutput: stdout,
      rawError: stderr,
    }
  } catch (err) {
    return {
      command,
      rawOutput: err.stdout,
      rawError: err.stderr,
    }
  }
}

module.exports = {
  ghostScript,
}

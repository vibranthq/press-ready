const fs = require('fs')
const execa = require('execa')
const Mustache = require('mustache')

async function ghostScript(
  inputPath = './input.pdf',
  outputPath = './output.pdf',
  pdfxDefTemplatePath = './assets/PDFX_def.ps.mustache',
  iccProfilePath = './assets/JapanColor2001Coated.icc',
  grayScale = false,
  forceOutline = true,
  addBoxes = false
) {
  const pdfxDefPath = '/tmp/def.ps'
  const gsCommand = 'gs'
  const gsOptions = [
    '-dPDFX',
    '-dBATCH',
    '-dNOPAUSE',
    '-dNOOUTERSAVE',
    '-dPDFSTOPONERROR',
    '-sDEVICE=pdfwrite',
    '-dShowAnnots=false',
    '-dPDFSETTINGS=/prepress',
    '-dPrinted',
    `-sOutputFile=${outputPath}`,
  ]
  if (addBoxes) {
    gsOptions.push('-dUseCropBox', '-dUseTrimBox', '-dUseBleedBox')
  }
  if (forceOutline) {
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
      `-sOutputICCProfile=${iccProfilePath}`
    )
  }

  // generate PDFX_def.ps
  pdfxDefTemplate = fs.readFileSync(pdfxDefTemplatePath, 'utf-8')
  const pdfxDef = Mustache.render(pdfxDefTemplate, {
    title: 'Generated PDF',
    iccProfilePath,
  })
  fs.writeFileSync(pdfxDefPath, pdfxDef, 'utf-8')

  // generate pdf with ghostscript
  const args = [...gsOptions, pdfxDefPath, inputPath]
  const command = [gsCommand, args]
  const { stdout, stderr } = await execa(...command)
  return {
    command,
    rawOutput: stdout,
    rawError: stderr,
  }
}

module.exports = {
  ghostScript,
}

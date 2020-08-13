import fs from 'fs'
import path from 'path'
import execa from 'execa'
import { tmpdir } from 'os'
import { join } from 'path'
import Mustache from 'mustache'
import { v4 as uuid } from 'uuid'
import shell from 'shelljs'
const debug = require('debug')('press-ready')

export interface GhostscriptOption {
  inputPath: string
  outputPath: string
  pdfxDefTemplatePath?: string
  sourceIccProfilePath?: string
  grayScale?: boolean
  enforceOutline?: boolean
  boundaryBoxes?: boolean
  title?: string
}

const ASSETS_DIR = path.resolve(__dirname, '..', 'assets')

export function isGhostscriptAvailable() {
  return shell.which('gs')
}

export async function ghostScript({
  inputPath,
  outputPath,
  pdfxDefTemplatePath = path.join(ASSETS_DIR, 'PDFX_def.ps.mustache'),
  sourceIccProfilePath = path.join(ASSETS_DIR, 'JapanColor2001Coated.icc'),
  grayScale = false,
  enforceOutline = false,
  boundaryBoxes = false,
  title = 'Auto-generated PDF (press-ready)',
}: GhostscriptOption) {
  const workingDir = tmpdir()
  const id = uuid()

  // ICC profile
  const iccProfilePath = join(workingDir, `press-ready-${id}.icc`)
  fs.copyFileSync(sourceIccProfilePath, iccProfilePath)

  // PDFXDef
  const pdfxDefPath = join(workingDir, `press-ready-${id}.ps`)
  const pdfxDefTemplateString = fs.readFileSync(pdfxDefTemplatePath, 'utf-8')
  const pdfxDef = Mustache.render(pdfxDefTemplateString, {
    title,
    iccProfilePath,
  })
  fs.writeFileSync(pdfxDefPath, pdfxDef, 'utf-8')

  // configure gs command
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

  const args = [...gsOptions, pdfxDefPath, inputPath]
  const command: [string, string[]] = [gsCommand, args]

  debug(gsCommand, args.join(' '))

  try {
    // generate pdf with ghostscript
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
  } finally {
    fs.unlinkSync(iccProfilePath)
    fs.unlinkSync(pdfxDefPath)
  }
}

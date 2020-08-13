import execa from 'execa'
import shell from 'shelljs'

type BoxColumn = 'MediaBox' | 'CropBox' | 'BleedBox' | 'TrimBox' | 'ArtBox'

const BOX_COLUMNS = [
  'MediaBox',
  'CropBox',
  'BleedBox',
  'TrimBox',
  'ArtBox',
] as const

interface RawResult {
  Pages: string
  'PDF version': string
  MediaBox: string
  CropBox: string
  BleedBox: string
  TrimBox: string
  ArtBox: string
  'Page size': string
}

export type BoundaryParamKey =
  | 'bottomLeftX'
  | 'bottomLeftY'
  | 'topRightX'
  | 'topRightY'

export interface Result {
  Title: string
  Pages: number
  'PDF version': number
  MediaBox: { [index in BoundaryParamKey]: number }
  CropBox: { [index in BoundaryParamKey]: number }
  BleedBox: { [index in BoundaryParamKey]: number }
  TrimBox: { [index in BoundaryParamKey]: number }
  ArtBox: { [index in BoundaryParamKey]: number }
  'Page size': {
    width: number
    height: number
    raw?: string
  }
}

export interface Font {
  name: string
  type: string
  emb: 'yes' | 'no'
  sub: 'yes' | 'no'
}

export interface PDFFontsResponse {
  rawResponse: unknown
  fonts: Font[]
}

export class ParserError extends Error {}

export function isPdfFontsAvailable() {
  return shell.which('pdffonts')
}

export async function pdfFonts(filePath: string): Promise<PDFFontsResponse> {
  const cmd = await execa('pdffonts', [filePath])
  const result = cmd.stdout.split('\n')

  if (!/^name/.test(result[0])) {
    throw new ParserError('Parse Error')
  }

  if (result.length < 3) {
    return { rawResponse: result, fonts: [] }
  }

  const maxLineLength = result[0].length
  const columns = result[0].split(/(?<!object)\s+/)
  const counter = result[1]
    .split(' ')
    .map((hyp) => hyp.length)
    .reduce<number[]>((acum, cur, i) => {
      acum.push(cur + (i == 0 ? 0 : acum[i - 1]) + 1)
      return acum
    }, [])

  const scraper = (line: string, column: string) => {
    let extraPad = 0
    if (line.length > maxLineLength) {
      extraPad = line.indexOf(' ') - counter[0]
    }
    return line
      .substring(
        counter[columns.indexOf(column) - 1] + extraPad || 0,
        counter[columns.indexOf(column)] + extraPad
      )
      .trim()
  }

  const fonts = result.slice(2).map((line) =>
    Object.assign(
      {},
      ...columns.map((column) => ({
        [column]: scraper(line, column),
      }))
    )
  )
  return { rawResponse: result, fonts }
}

export async function pdfInfo(filePath: string) {
  const cmd = await execa('pdfinfo', ['-box', filePath])
  const lines = cmd.stdout.split('\n')
  const rawResult: RawResult = Object.assign(
    {},
    ...lines
      .map((line) => line.split(/:\s+/))
      .map((arr) => ({ [arr[0]]: arr[1] }))
  )
  const result = {} as Result

  // parse boundary boxes
  const labels = ['bottomLeftX', 'bottomLeftY', 'topRightX', 'topRightY']
  for (const column of BOX_COLUMNS) {
    result[column] = Object.assign(
      {},
      ...rawResult[column].split(/\s+/).map((val, i) => ({
        [labels[i] as BoundaryParamKey]: parseFloat(val),
      }))
    )
  }

  // parse pages
  result['Pages'] = parseInt(rawResult['Pages'], 10)

  // parse page size
  const size = rawResult['Page size'].match(/(\d+) x (\d+)/)
  result['Page size'] = {
    width: parseInt(size?.[1] ?? '0', 10),
    height: parseInt(size?.[2] ?? '0', 10),
    raw: size?.input,
  }

  // parse pdf version
  result['PDF version'] = parseFloat(rawResult['PDF version'])

  return result
}

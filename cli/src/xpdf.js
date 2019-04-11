const execa = require('execa')

class ParserError extends Error {}

async function pdfFonts(filePath) {
  let result
  try {
    const cmd = await execa('pdffonts', [filePath])
    result = cmd.stdout.split('\n')
  } catch (err) {
    throw err
  }

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
    .reduce((acum, cur, i) => {
      acum.push(cur + (i == 0 ? 0 : acum[i - 1]) + 1)
      return acum
    }, [])

  const scraper = (line, column) => {
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

  const fonts = result
    .slice(2)
    .map((line) =>
      Object.assign(
        {},
        ...columns.map((column) => ({ [column]: scraper(line, column) }))
      )
    )
  return { rawResponse: result, fonts }
}

async function pdfInfo(filePath) {
  let result
  try {
    const cmd = await execa('pdfinfo', ['-box', filePath])
    result = cmd.stdout.split('\n')
  } catch (err) {
    throw err
  }

  result = Object.assign(
    {},
    ...result
      .map((line) => line.split(/:\s+/))
      .map((arr) => ({ [arr[0]]: arr[1] }))
  )

  // parse boundary boxes
  const boxColumns = ['MediaBox', 'CropBox', 'BleedBox', 'TrimBox', 'ArtBox']
  const labels = ['bottomLeftX', 'bottomLeftY', 'topRightX', 'topRightY']
  for (const column of boxColumns) {
    result[column] = Object.assign(
      {},
      ...result[column]
        .split(/\s+/)
        .map((val, i) => ({ [labels[i]]: parseFloat(val) }))
    )
  }

  // parse pages
  result['Pages'] = parseInt(result['Pages'], 10)

  // parse page size
  const size = result['Page size'].match(/(\d+) x (\d+)/)
  result['Page size'] = {
    width: parseInt(size[1], 10),
    height: parseInt(size[2], 10),
    raw: size.input,
  }

  // parse pdf version
  result['PDF version'] = parseFloat(result['PDF version'])

  return result
}

module.exports = { pdfFonts, pdfInfo }

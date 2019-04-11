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

  const fonts = result.slice(2).map((line) =>
    columns.reduce((acum, column) => {
      acum[column] = scraper(line, column)
      return acum
    }, {})
  )
  return { rawResponse: result, fonts }
}

module.exports = { pdfFonts }

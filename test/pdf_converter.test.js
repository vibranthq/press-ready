const lib = require('../lib/converter/pdf_converter.js')

const fixturePath = './fixtures/main.md'

describe('pdf_converter', () => {
  it('export pdf', () => {
    lib.exportPDF(fixturePath)
  })
})

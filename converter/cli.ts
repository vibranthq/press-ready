import { exportPDFWebKit, exportPDFChrome } from './pdf_converter'

const inputFile = process.argv[2]
const outputFile = process.argv[3]
exportPDFChrome(inputFile, outputFile)

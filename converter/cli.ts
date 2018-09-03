import { exportPDF, convertToHTML, exportPDFWebKit } from './pdf_converter'
import fs = require('fs')
import { promisify } from 'util'
import Listr from 'listr'
import execa from 'execa'

const inputFile = process.argv[2]
const outputFile = process.argv[3]

const tasks = new Listr([
  {
    title: 'read markdown manuscript',
    task: ctx =>
      promisify(fs.readFile)(inputFile, 'utf-8').then(result => {
        ctx.markdown = result
      }),
  },
  {
    title: 'convert to HTML',
    task: ctx => {
      const html = convertToHTML(ctx.markdown)
      ctx.html = html
      return promisify(fs.writeFile)('/datadir/rendered.html', html)
    },
  },
  {
    title: 'convert to PDF',
    task: ctx => {
      exportPDFWebKit(ctx.html, '/datadir/rendered.pdf')
    },
  },
])

tasks.run()

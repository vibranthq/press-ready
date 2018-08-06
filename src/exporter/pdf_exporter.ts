import MarkdownIt from 'markdown-it'
import puppeteer from 'puppeteer'
import wkhtmltopdf from 'wkhtmltopdf'
import path from 'path'
import os from 'os'
import fs from 'fs'

export function exportPDF(inputMarkdownSource: string, outputPath: string) {
  // Input markdown to HTML
  const md = MarkdownIt()
  const result = md.render(inputMarkdownSource)
  console.log(result)

  // HTML to PDF
  const workspaceDir = os.tmpdir()
  const outputPDFPath = path.join(workspaceDir, 'output.pdf')
  const exported_path = exportPDFWebkit(result, outputPDFPath)
  console.log(outputPDFPath)
}

async function exportPDFChrome(url: string) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: ['networkidle0'], timeout: 10000 })
  // await page.setViewport({
  //   width: 2100,
  //   height: 2970,
  // })
  await page.pdf({
    path: './output.pdf',
    format: 'A4',
    width: '210mm',
    height: '297mm',
    landscape: false,
  })
  await browser.close()
}

function exportPDFWebkit(sourceString: string, outputPath: string) {
  wkhtmltopdf(sourceString, {
    pageSize: 'A4',
    imageDpi: 300,
    dpi: 300,
    title: 'PDFC',
    marginTop: 10,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
    disableExternalLinks: true,
    disableJavascript: true,
    printMediaType: true,
  }).pipe(fs.createWriteStream(outputPath))
}

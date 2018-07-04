import puppeteer from 'puppeteer'
import wkhtmltopdf from 'wkhtmltopdf'

async function exportPDFChrome(url: string) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: ['networkidle0'], timeout: 10000 })
  await page.setViewport({
    width: 1280,
    height: 1024,
  })
  await page.pdf({
    path: './output-chrome.pdf',
    format: 'A4',
    width: '210mm',
    height: '297mm',
    landscape: false,
  })
  await browser.close()
}

function exportPDFWebkit(url: string) {
  wkhtmltopdf(url, {
    output: 'output-webkit.pdf',
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
  })
}

const targetURL = 'https://uechi.io/blog/2018/04/13/camping'
exportPDFWebkit(targetURL)

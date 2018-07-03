import puppeteer from 'puppeteer'

async function exportPDF(url: string) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: ['networkidle0'], timeout: 10000 })
  await page.setViewport({
    width: 1280,
    height: 1024,
  })
  await page.pdf({
    path: './output.pdf',
    format: 'A4',
    width: '210mm',
    height: '297mm',
    landscape: false,
  })
  await browser.close()
}

exportPDF(
  'file:///Users/uetchy/Repos/src/github.com/uetchy/vibrant-core/book.html'
)

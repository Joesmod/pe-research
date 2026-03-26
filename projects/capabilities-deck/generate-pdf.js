const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const filePath = path.resolve(__dirname, 'deck-v7.html');
  await page.goto('file://' + filePath, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: path.resolve(__dirname, 'deck-v7.pdf'),
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await browser.close();
  console.log('PDF saved: deck-v7.pdf');
})();

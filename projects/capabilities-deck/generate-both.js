const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  
  for (const [src, out] of [['deck-v4a.html', 'gumbo-capabilities-v4a.pdf'], ['deck-v4b.html', 'gumbo-capabilities-v4b-icons.pdf']]) {
    const page = await browser.newPage();
    await page.goto('file:///' + path.resolve(__dirname, src).replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await page.pdf({
      path: path.resolve(__dirname, out),
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });
    await page.close();
    console.log('Generated:', out);
  }
  
  await browser.close();
})();

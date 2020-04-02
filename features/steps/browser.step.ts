import { Given } from 'cucumber';
import fs from 'fs';

const pptrFirefox = require('puppeteer-firefox');
const puppeteer = require('puppeteer');

Given('ArianeeLib is used on browser {string} it works', async function (browserName) {
  const contentHtml = '<!doctype html><html><body id=\'div1\'></body></html>';
  const contentJSBundle = fs.readFileSync('./browser/bundle.js', 'utf8');
  const contentTestJS = fs.readFileSync('./dist/example/myexecfile.js', 'utf8');

  let browser;
  if (browserName === 'chrome') {
    browser = await puppeteer.launch({ headless: true });
  } else if (browserName === 'firefox') {
    browser = await pptrFirefox.launch({ headless: true });
  }

  const page = await browser.newPage();

  // launch any page
  await page.goto('https://google.com', { waitUntil: 'load' });

  // replace content
  await page.setContent(contentHtml);
  await page.addScriptTag({ content: contentJSBundle });
  await page.addScriptTag({ content: contentTestJS });

  const i = await page
    .waitForSelector('#successFullID');

  return browser.close();
});

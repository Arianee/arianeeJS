import {Given} from '@cucumber/cucumber';
import fs from 'fs';

const playwright = require('playwright')

Given('ArianeeLib is used on browser {string} it works', async function (browserName) {
  const contentHtml = '<!doctype html><html><body id=\'div1\'></body></html>';
  const contentJSBundle = fs.readFileSync('./browser/bundle.js', 'utf8');
  const contentTestJS = fs.readFileSync('./dist/myexecfile.js', 'utf8');

  const browser = await playwright[browserName].launch({ headless: true });

  const page = await browser.newPage({baseUrl:"https://google.com"});

  // replace content
  await page.setContent(contentHtml);
  await page.addScriptTag({ content: contentJSBundle });
  await page.addScriptTag({ content: contentTestJS });

  const i = await page
    .waitForSelector('#successFullID',
      {
        timeout: 120000
      }
    );

  return browser.close();
});

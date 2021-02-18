import { Booking } from './types/Booking';
import puppeteer from 'puppeteer';

export const bookWithPuppeteer = async(booking: Booking): Promise<boolean> => {
  const browser = await puppeteer.launch({
    headless: false,
    // executablePath: '/usr/bin/chromium-browser',
    // args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(6000);
  await page.goto('http://ibooking.sit.no/');

  const logInBtn = await page.$x("//a[contains(text(),'Logg inn')]");
  await logInBtn[0].click();

  await page.waitForSelector('input[name=username]');
  await page.type('input[name=username]', booking.profile.phone.toString());
  await page.type('input[name=password]', booking.profile.sitPassword);
  await page.click('.btn-primary');

  await page.waitForSelector('select[name=type]');
  await page.select('select[name=type]', '13');
  await page.waitForTimeout(1000);
  await page.waitForSelector('select[name=type]');

  if (booking.day < 2) {
    await page.select('select[name=week]', '+1 weeks');
  }
  await page.waitForTimeout(1000);
  await page.waitForSelector('select[name=type]');

  const cell = await page.$x(`//div[@id='schedule']/ul[${booking.day + 1}]/li[${booking.rowNumber}]/div`);
  await cell[0].click();

  await page.waitForTimeout(250);
  await page.waitForSelector('.ui-button-text');
  await page.click('.ui-button-text');
  await page.waitForSelector('input[name=submit]');
  if ((await page.waitForSelector('.order', {timeout: 500})) !== null) {
    await page.click('input[name=submit]');
    await browser.close();
    return true;
  }
  await browser.close();
  return false;
}
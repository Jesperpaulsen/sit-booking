import puppeteer from 'puppeteer';
import { Booking } from './types/Booking';

export const bookWithPuppeteer = async(booking: Booking): Promise<boolean> => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
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
  const cell = await page.$x(`//ul[${booking.day}]/li[${booking.rowNumber}]/div/div/div/span`);
  await cell[0].click();

  await page.waitForTimeout(250);
  await page.waitForSelector('.ui-button-text');
  await page.click('.ui-button-text');
  await page.waitForSelector('input[name=submit]');
  if ((await page.waitForSelector('.order', {timeout: 500})) !== null) {
    await page.click('input[name=submit]');
    await page.close();
    return true;
  }
  await page.close();
  return false;
}
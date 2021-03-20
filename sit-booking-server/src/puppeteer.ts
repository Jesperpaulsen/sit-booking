import { Booking, STATUS } from './types/Booking';
import puppeteer from 'puppeteer';
import { Profile } from './types/Profile';
import moment from 'moment';

export const bookWithPuppeteer = async(booking: Booking, defaultTimeOut: number): Promise<STATUS> => {
  const browser = await puppeteer.launch({
    headless: true,
    // executablePath: '/usr/bin/chromium-browser',
    // args: ['--no-sandbox', '--disable-setuid-sandbox']
    args: ['--incognito']
  });
  const page = await browser.newPage();
  console.log('Hei');
  page.setDefaultTimeout(defaultTimeOut);
  await page.goto('http://ibooking.sit.no/index.php?page=login');
  await page.waitForSelector('input[name=username]');
  await page.type('input[name=username]', booking.profile.phone.toString());
  await page.type('input[name=password]', booking.profile.sitPassword);
  try {
    await page.click('input[name=submit]');
  } catch (e) {
    console.log('Didnt find login btn');
  }
  console.log('Logger inn')
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

  await page.waitForTimeout(1000);
  await page.waitForSelector('.ui-button-text');
  await page.click('.ui-button-text');
  await page.waitForSelector('input[name=submit]');
  try {
    if ((await page.waitForSelector('input[value="Reserver"]', {timeout: 500})) !== null) {
      await page.click('input[name=submit]');
      await browser.close();
      return STATUS.BOOKED;
    }
  } catch (e) {
    try {
      if ((await page.waitForSelector('input[value="Sett på venteliste"]', {timeout: 500})) !== null)  {
        await page.click('input[name=submit]');
        await browser.close();
        return STATUS.WAITING_LIST;
      }
    } catch (e) {
      console.log(e);
    }
  }
  await browser.close();
  console.log('failed');
  return STATUS.FAILED;
}

export const resetPasswordWithPuppeteer = async(profile: Profile): Promise<boolean> => {
  const browser = await puppeteer.launch({
    headless: true,
    // executablePath: '/usr/bin/chromium-browser',
    // args: ['--no-sandbox', '--disable-setuid-sandbox']
    args: ['--incognito']
  });
  const page = await browser.newPage();
  console.log('Resetter passord');
  page.setDefaultTimeout(15000);
  await page.goto('http://ibooking.sit.no/index.php?page=password');
  await page.waitForSelector('input[name=user_email]');
  await page.type('input[name=user_email]', profile.phone.toString());
  await page.click('.btn-primary');
  profile.lastPasswordReset = moment().unix();
  await browser.close();
  return true;
}
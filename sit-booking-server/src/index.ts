import { firestore, messaging } from './firebase';

import { Booking, STATUS } from './types/Booking';
import FCMNotification from "./types/FCMNotification";
import { Preference } from './types/Preference';
import { Profile } from './types/Profile';
import { bookWithPuppeteer } from './puppeteer';
import moment from 'moment';
import { convertTimeToRowNumber, fetchProfiles, getCurrentRowNumber, numberToTimestamp } from './utils';

moment.locale('nb');

const failedBookings: Booking[] = [];
const successfulBookings: Booking[] = [];
const waitingBookings: Booking[] = [];

const bookingsThatShouldBeBooked = (profiles: Profile[]) => {
  const twoDaysInTheFuture = moment().add(2, 'days').weekday();
  console.log(twoDaysInTheFuture);
  const bookings: Booking[] = [];
  for (const profile of profiles) {
    try {
      const preference = profile.preferences[twoDaysInTheFuture];
      console.log(preference);
      if (preference && preference.time && preference.time.length > 0) {
        let rowNumber = convertTimeToRowNumber(twoDaysInTheFuture, preference);
        const currentRowNumber = getCurrentRowNumber(twoDaysInTheFuture);
        if (preference.isDoubleBooking && rowNumber + 2 === currentRowNumber) rowNumber += 2;
        console.log(rowNumber, currentRowNumber);
        if (rowNumber === currentRowNumber) {
          console.log('Found booking to book');
          const booking: Booking = {
            day: twoDaysInTheFuture,
            rowNumber,
            profile,
            retries: 0,
            status: STATUS.FAILED,
          };
          bookings.push(booking);
        }
      }
    } catch(e) {
      continue;
    }
  }
  return bookings;
}

const bookBooking = async (booking: Booking, defaultTimeOut: number): Promise<void> => {
  try {
    const status = await bookWithPuppeteer(booking, defaultTimeOut);
    if (!status || status === STATUS.FAILED) throw new Error('Failed to book');
    else if (status === STATUS.BOOKED) successfulBookings.push(booking);
    else if (status === STATUS.WAITING_LIST) waitingBookings.push(booking);
    console.log('Booked booking ' + booking.profile.name);
  } catch (e) {
    console.log(e);
    booking.retries ++;
    if (booking.retries < 15) return bookBooking(booking, defaultTimeOut + 500 * booking.retries);
    failedBookings.push(booking);
  }
}

const sendPushNotification = async (booking: Booking, payload: FCMNotification) => {
  try {
    await messaging.sendToDevice(booking.profile.FCMToken, payload, { priority: 'high' });
  } catch (e) {
    console.log(e)
  }
}

const sendSuccessNotification = async () => {
  for (const booking of successfulBookings) {
    const payload: FCMNotification = {
      notification: {
        title: booking.retries === 0 ? 'Booking gjennomført 🤠🎉' : `Booking gjennomført etter ${booking.retries} forsøk 🙂🙂`,
        body: `Vi fikk booket time kl. ${numberToTimestamp[booking.rowNumber]} på ${moment().add(2, 'days').format('dddd')}`
      }
    }
    try {
      await sendPushNotification(booking, payload);
    } catch (e) {
      console.log(e)
    }
  }
}

const sendWaitingNotification = async () => {
  for (const booking of waitingBookings) {
    const payload: FCMNotification = {
      notification: {
        title: booking.retries === 0 ? 'Det kan se ut som om det ble venteliste... 😑' : `Du ble satt på venteliste etter ${booking.retries} forsøk 😑`,
        body: `Vi fikk venteliste på time kl. ${numberToTimestamp[booking.rowNumber]} på ${moment().add(2, 'days').format('dddd')}`
      }
    }
    try {
      await sendPushNotification(booking, payload);
    } catch (e) {
      console.log(e)
    }
  }
}

const sendFailureNotification = async () => {
  for (const booking of failedBookings) {
    console.log(booking.profile.name);
    const payload: FCMNotification = {
      notification: {
        title: 'Booking ble ikke gjennomført 😭',
        body: `Vi fikk ikke booket time kl. ${numberToTimestamp[booking.rowNumber]} på ${moment().add(2, 'days').format('dddd')}. Vi prøvde å booke denne timen ${booking.retries} ganger.`
      }
    }
    try {
      await sendPushNotification(booking, payload);
    } catch (e) {
      console.log(e)
    }
  }
}

const retryCounts = 0;

const main = async (): Promise<void> => {
  console.log('Starting to book');
  const profiles = await fetchProfiles();
  const bookings = bookingsThatShouldBeBooked(profiles);
  const promises: Promise<void>[] = [];

  for (const booking of bookings) {
    promises.push(bookBooking(booking, 15000));
  }
  try {
    await Promise.all(promises);
  } catch (e) {
    console.log(e);
  }
  try {
    await sendSuccessNotification();
    await sendWaitingNotification();
    await sendFailureNotification();
  } catch (e) {
    console.log(e);
  }
  return process.exit();
}

main();
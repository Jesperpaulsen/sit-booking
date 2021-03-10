import { firestore, messaging } from './firebase';

import { Booking, STATUS } from './types/Booking';
import FCMNotification from "./types/FCMNotification";
import { Preference } from './types/Preference';
import { Profile } from './types/Profile';
import { bookWithPuppeteer } from './puppeteer';
import moment from 'moment';

moment.locale('nb');

const failedBookings: Booking[] = [];
const successfulBookings: Booking[] = [];
const waitingBookings: Booking[] = [];

let fetchProfileRetries = 0;

const fetchProfiles = async (): Promise<Profile[]> => {
  try {
    const res: Profile[] = [];

    const profilesSnapshot = await firestore.collection('profiles').get();

    for (const profile of profilesSnapshot.docs) {
      res.push(profile.data() as Profile);
    }

    return res;
  } catch (e) {
    if (fetchProfileRetries < 6) return fetchProfiles();
    else console.log(e)
    return [];
  }
}

const timeToNumberMap: {[timestamp: string]: number} = {
  '06:00': 1,
  '06:30': 2,
  '07:00': 3,
  '07:30': 4,
  '08:00': 5,
  '08:30': 6,
  '09:00': 7,
  '09:30': 8,
  '10:00': 9,
  '10:30': 10,
  '11:00': 11,
  '11:30': 12,
  '12:00': 13,
  '12:30': 14,
  '13:00': 15,
  '13:30': 16,
  '14:00': 17,
  '14:30': 18,
  '15:00': 19,
  '15:30': 20,
  '16:00': 21,
  '16:30': 22,
  '17:00': 23,
  '17:30': 24,
  '18:00': 25,
  '18:30': 26,
  '19:00': 27,
  '19:30': 28, 
  '20:00': 29,
  '20:30': 30,
  '21:00': 31,
  '21:30': 32,
  '22:00': 33,
};

const numberToTimestamp: {[timestamp: number]: string} = {
  1: '06:00',
  2: '06:30',
  3: '07:00',
  4: '07:30',
  5: '08:00',
  6: '08:30',
  7: '09:00',
  8: '09:30',
  9: '10:00',
  10: '10:30',
  11: '11:00',
  12: '11:30',
  13: '12:00',
  14: '12:30',
  15: '13:00',
  16: '13:30',
  17: '14:00',
  18: '14:30',
  19: '15:00',
  20: '15:30',
  21: '16:00',
  22: '16:30',
  23: '17:00',
  24: '17:30',
  25: '18:00',
  26: '18:30',
  27: '19:00',
  28: '19:30',
  29: '20:00',
  30: '20:30',
  31: '21:00',
  32: '21:30',
  33: '22:00',
};

const convertTimeToRowNumber = (weekDay: number, preference: Preference) => {
  const timeNumber = timeToNumberMap[preference.time];
  if (weekDay > 4) {
    return timeNumber - 5;
  }
  return timeNumber;
}

const getCurrentRowNumber = (weekDay: number) => {
  const currentTime = moment();
  const minutes = currentTime.minutes() >= 30 ? '30' : '00';
  const time = moment().startOf('hour').format('HH');
  const timeNumber = timeToNumberMap[`${time}:${minutes}`];
  if (weekDay > 4) {
    return timeNumber - 5;
  }
  return timeNumber;
}

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
        if (preference.isDoubleBooking) rowNumber += 2;
        const currentRowNumber = getCurrentRowNumber(twoDaysInTheFuture);
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
    if (booking.retries < 30) return bookBooking(booking, defaultTimeOut + 500 * booking.retries);
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
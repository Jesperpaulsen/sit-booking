import { Booking } from './types/Booking';
import { Profile } from './types/Profile';
import { bookWithPuppeteer } from './puppeteer';
import { firestore, messaging } from './firebase';
import moment from 'moment';
import FCMNotification from "./types/FCMNotification";

moment.locale('nb');

const failedBookings: Booking[] = [];
const successfulBookings: Booking[] = [];

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
  '07:00': 3,
  '08:00': 5,
  '09:00': 7,
  '10:00': 9,
  '11:00': 11,
  '12:00': 13,
  '13:00': 15,
  '14:00': 17,
  '15:00': 19,
  '16:00': 21,
  '17:00': 23,
  '18:00': 25,
  '19:00': 27, 
  '20:00': 29,
  '21:00': 31,
  '22:00': 33,
};

const convertTimeToRowNumber = (weekDay: number, time: string) => {
  const timeNumber = timeToNumberMap[time];
  if (weekDay > 4) {
    return timeNumber - 5;
  }
  return timeNumber;
}

const getCurrentRowNumber = (weekDay: number) => {
  const time = moment().startOf('hour').format('HH');
  console.log(time);
  const timeNumber = timeToNumberMap[`${time}:00`];
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
    const preference = profile.preferences[twoDaysInTheFuture];
    if (preference && preference.length > 0) {
      const rowNumber = convertTimeToRowNumber(twoDaysInTheFuture, preference);
      const currentRowNumber = getCurrentRowNumber(twoDaysInTheFuture);

      if (rowNumber === currentRowNumber) {
        console.log('Found booking to book');
        const booking: Booking = {
          day: twoDaysInTheFuture,
          rowNumber,
          profile,
          retries: 0,
        };
        bookings.push(booking);
      }
    }
  }
  return bookings;
}

const bookBooking = async (booking: Booking): Promise<void> => {
  try {
    const success = await bookWithPuppeteer(booking);
    if (!success) throw new Error('Failed to book');
    console.log('Booked booking ' + booking.profile.name);
    successfulBookings.push(booking);
  } catch (e) {
    console.log(e);
    booking.retries ++;
    if (booking.retries < 20 && moment().minute() < 5) return bookBooking(booking);
    failedBookings.push(booking);
  }
}

const sendPushNotification = async (booking: Booking, payload: FCMNotification) => {
  try {
    await messaging.sendToDevice(booking.profile.FCMToken, payload);
  } catch (e) {
    console.log(e)
  }
}

const sendSuccessNotification = async () => {
  for (const booking of successfulBookings) {
    const payload: FCMNotification = {
      notification: {
        title: booking.retries === 0 ? 'Booking gjennomført 🤠🎉' : `Booking gjennomført etter ${booking.retries} forsøk 🙂🙂`,
        body: `Vi fikk booket time kl. ${moment().startOf('hour').format('H')} på ${moment().add(2, 'days').format('dddd')}`
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
        body: `Vi fikk ikke booket time kl. ${moment().startOf('hour').format('H')} på ${moment().add(2, 'days').format('dddd')}. Vi prøvde å booke denne timen ${booking.retries} ganger i 5 minutter.`
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
    promises.push(bookBooking(booking));
  }
  try {
    await Promise.all(promises);
  } catch (e) {
    console.log(e);
  }
  try {
    await sendSuccessNotification();
    await sendFailureNotification();
  } catch (e) {
    console.log(e);
  }
  return process.exit();
}

main();
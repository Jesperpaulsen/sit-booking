import { Booking } from './types/Booking';
import { Profile } from './types/Profile';
import { bookWithPuppeteer } from './puppeteer';
import { firestore, messaging } from './firebase';
import moment from 'moment';
import FCMNotification from "./types/FCMNotification";

const failedBookings: Booking[] = [];
const successfulBookings: Booking[] = [];

const fetchProfiles = async () => {
  const res: Profile[] = [];

  const profilesSnapshot = await firestore.collection('profiles').get();

  for (const profile of profilesSnapshot.docs) {
    res.push(profile.data() as Profile);
  }

  return res;
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
  const time = moment().startOf('hour').format('H');
  const timeNumber = timeToNumberMap[`${time}:00`];
  if (weekDay > 4) {
    return timeNumber - 5;
  }
  return timeNumber;
}

const bookingsThatShouldBeBooked = (profiles: Profile[]) => {
  const twoDaysInTheFuture = moment().add(2, 'days').weekday() - 1;
  const bookings: Booking[] = [];

  for (const profile of profiles) {
    const preference = profile.preferences[twoDaysInTheFuture];
    if (preference && preference.length > 0) {
      const rowNumber = convertTimeToRowNumber(twoDaysInTheFuture, preference);
      const currentRowNumber = getCurrentRowNumber(twoDaysInTheFuture);
      if (rowNumber === currentRowNumber) {
        const booking: Booking = {
          day: twoDaysInTheFuture,
          rowNumber,
          profile,
        };
        bookings.push(booking);
      }
    }
  }
  return bookings;
}

const bookBooking = async (booking: Booking) => {
  try {
    const success = await bookWithPuppeteer(booking);
    if (!success) throw new Error('Failed to book');
    console.log('Booked booking ' + booking.profile.name);
    successfulBookings.push(booking);
  } catch (e) {
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
        title: 'Booking gjennomført!',
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
    const payload: FCMNotification = {
      notification: {
        title: 'Booking ble ikke gjennomfør :(',
        body: `Vi fikk ikke booket time kl. ${moment().startOf('hour').format('H')} på ${moment().add(2, 'days').format('dddd')}`
      }
    }
    try {
      await sendPushNotification(booking, payload);
    } catch (e) {
      console.log(e)
    }
  }
}

const main = async () => {
  console.log('Starting to book');
  const profiles = await fetchProfiles();
  const bookings = bookingsThatShouldBeBooked(profiles);
  const promises: Promise<void>[] = [];

  for (const booking of bookings) {
    promises.push(bookBooking(booking));
  }
  try {
    await Promise.all(promises);
    await sendSuccessNotification();
    await sendFailureNotification();
  } catch (e) {
    console.log(e);
  }
}

main();
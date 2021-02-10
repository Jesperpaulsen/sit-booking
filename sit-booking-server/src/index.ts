import { Booking } from './types/Booking';
import { Profile } from './types/Profile';
import { bookWithPuppeteer } from './puppeteer';
import { firestore } from './firebase';
import moment from 'moment';

const failedBookings = [];

const fetchProfiles = async () => {
  const res: Profile[] = [];

  const profilesSnapshot = await firestore.collection('profiles').get();

  for (const profile of profilesSnapshot.docs) {
    res.push(profile.data() as Profile);
  }

  return res;
}

const timeToNumberMap: {[timestamp: string]: number} = {
  '07:00': 1,
  '08:00': 3,
  '09:00': 5,
  '10:00': 7,
  '11:00': 9,
  '12:00': 11,
  '13:00': 13,
  '14:00': 15,
  '15:00': 17,
  '16:00': 19,
  '17:00': 21,
  '18:00': 23,
  '19:00': 25, 
  '20:00': 27,
  '21:00': 29,
  '22:00': 31,
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
  return timeToNumberMap[`${time}:00`];
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
  } catch (e) {
    failedBookings.push(booking);
  }
}

const main = async () => {
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
}

main();
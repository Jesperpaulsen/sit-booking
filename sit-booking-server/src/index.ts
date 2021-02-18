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
      console.log(rowNumber);
      console.log(currentRowNumber);
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
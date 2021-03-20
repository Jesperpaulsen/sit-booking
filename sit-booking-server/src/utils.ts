import moment from "moment";
import { firestore } from "./firebase";
import { Preference } from "./types/Preference";
import { Profile } from "./types/Profile";

moment.locale('nb');

let fetchProfileRetries = 0;

export const fetchProfiles = async (): Promise<Profile[]> => {
  try {
    const res: Profile[] = [];

    const profilesSnapshot = await firestore.collection('profiles').where('sitDown', '==', true).get();

    for (const profile of profilesSnapshot.docs) {
      console.log(profile.id);
      res.push(profile.data() as Profile);
    }

    return res;
  } catch (e) {
    if (fetchProfileRetries < 6) return fetchProfiles();
    else console.log(e)
    return [];
  }
}

export const updateProfiles = async (profiles: Profile[]) => {
  try {
    for (const profile of profiles) {
      await firestore.collection('profiles').doc(profile.userID).update(profile);
    }
  } catch (e) {
    console.log(e);
  }
}

export const timeToNumberMap: {[timestamp: string]: number} = {
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

export const numberToTimestamp: {[timestamp: number]: string} = {
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

export const convertTimeToRowNumber = (weekDay: number, preference: Preference) => {
  const timeNumber = timeToNumberMap[preference.time];
  if (weekDay > 4) {
    return timeNumber - 5;
  }
  return timeNumber;
}

export const getCurrentRowNumber = (weekDay: number) => {
  const currentTime = moment();
  const minutes = currentTime.minutes() >= 30 ? '30' : '00';
  const time = moment().startOf('hour').format('HH');
  const timeNumber = timeToNumberMap[`${time}:${minutes}`];
  if (weekDay > 4) {
    return timeNumber - 5;
  }
  return timeNumber;
}

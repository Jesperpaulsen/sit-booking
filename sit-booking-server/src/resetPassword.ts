import moment from "moment";
import { resetPasswordWithPuppeteer } from "./puppeteer";
import { Preference } from "./types/Preference";
import { Profile } from "./types/Profile";
import { convertTimeToRowNumber, fetchProfiles, timeToNumberMap, updateProfiles } from "./utils"

// HH:50 and HH:20

export const getClosestRowNumber = (weekDay: number) => {
  const currentTime = moment();
  let time = ''
  let minutes = ''
  if (currentTime.minutes() > 44) {
    time = moment().add(1, 'hour').startOf('hour').format('HH');
    minutes = '00'
  } else if (currentTime.minutes() > 0) {
    time = moment().startOf('hour').format('HH');
    minutes = '30'
  }
  const timeNumber = timeToNumberMap[`${time}:${minutes}`];
  if (weekDay > 4) {
    return timeNumber - 5;
  }
  return timeNumber;
}


const resetPasswords = async (profiles: Profile[]) => {
  const promises = [];
  const res = passwordsThatShouldBeReset(profiles)
  for (const profile of res) {
      promises.push(resetPasswordWithPuppeteer(profile));
  }
  await Promise.all(promises);
}

const passwordsThatShouldBeReset = (profiles: Profile[]): Profile[] => {
  const res: Profile[] = [];
  
  const twoDaysInTheFuture = moment().add(2, 'days').weekday();
  const lastday = moment().startOf('day').add(6, 'hours').unix();
  for (const profile of profiles) {
    const preference = profile.preferences[twoDaysInTheFuture];
    if (preference && preference.time && preference.time.length > 0) {
      let rowNumber = convertTimeToRowNumber(twoDaysInTheFuture, preference);
      const closestRowNumber = getClosestRowNumber(twoDaysInTheFuture);
      if (preference.isDoubleBooking && rowNumber + 2 === closestRowNumber) rowNumber += 2;
      console.log(rowNumber, closestRowNumber)
      if (rowNumber === closestRowNumber) {
        res.push(profile);
      }
    }
  }

return res;
}

const main = async () => {
  try {
    const profiles = await fetchProfiles();
    await resetPasswords(profiles);
    await updateProfiles(profiles);
  }
  catch (e) {
    console.log(e);
  }
  return process.exit();
}

main();

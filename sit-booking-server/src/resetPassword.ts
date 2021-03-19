import moment from "moment";
import { resetPasswordWithPuppeteer } from "./puppeteer";
import { Profile } from "./types/Profile";
import { fetchProfiles, updateProfiles } from "./utils"

const resetPasswords = async (profiles: Profile[]) => {
  const promises = [];
  const twoDaysInTheFuture = moment().add(2, 'days').weekday();
  const lastday = moment().startOf('day').unix();
  for (const profile of profiles) {
    const preference = profile.preferences[twoDaysInTheFuture];
    if (preference && preference.time && preference.time.length > 0 && (profile.lastPasswordReset < lastday || !profile.lastPasswordReset)) {
      promises.push(resetPasswordWithPuppeteer(profile));
    }
  }
  await Promise.all(promises);
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

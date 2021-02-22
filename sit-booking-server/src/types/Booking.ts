import { Profile } from "./Profile";

export interface Booking {
  day: number;
  rowNumber: number;
  profile: Profile;
  retries: number;
}
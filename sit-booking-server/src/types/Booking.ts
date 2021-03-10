import { Profile } from "./Profile";

export interface Booking {
  day: number;
  rowNumber: number;
  profile: Profile;
  retries: number;
  status: STATUS;
}
export enum STATUS {
  BOOKED = 'BOOKED',
  WAITING_LIST = 'WAITING_LIST',
  FAILED = 'FAILED',
}
import { Preference } from "./Preference";

export interface Profile {
  email: string;
  name: string;
  phone: number;
  sitPassword: string;
  userID: string;
  preferences: Preference[]; // 0 = Monday, 1 = Tuesday, etc.
  FCMToken: string;
}
import Conversation from './Conversation';
import { Coordinates } from './Coordinates';
import Sms from './Sms';
import User from './User';

export interface RideObject {
  text: string;
  value: number;
}

export const enum RideStatus {
  SCHEDULED = 'SCHEDULED',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  ARRIVED = 'ARRIVED',
}

export default interface Ride {
  _id?: string;
  start_address: string;
  end_address: string;
  summary: string;
  pickup: Coordinates;
  dropOff: Coordinates;
  distance: RideObject;
  duration: RideObject;
  date: Date;
  time: string;
  datetime: Date;
  seats: number;
  price: number;
  conversation: Conversation;
  plateNumber: string;
  path: string; //json
  createdBy: User;
  status: RideStatus;
  emptySeat: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

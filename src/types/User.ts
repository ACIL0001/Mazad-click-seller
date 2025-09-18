import Attachment from './Attachment';
import Device from './Device';
import Preference from './Preference';
import Rating from './Rating';
import Restaurant from './Restaurant';
import Role, { RoleCode } from './Role';

export enum ACCOUNT_TYPE {
  CLIENT = 'CLIENT',
  RESELLER = 'RESELLER',
  PROFESSIONAL = 'PROFESSIONAL',
}

export default interface User<T = any> {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  type: ACCOUNT_TYPE;
  role?: RoleCode;
  isPhoneVerified?: boolean;
  avatar?: Attachment;
  // Legacy fields for backward compatibility
  isEmailVerified?: boolean;
  device?: Device;
  isVerified?: boolean;
  verified?: boolean; // Legacy property
  enabled?: boolean;
  isHasIdentity?: boolean;
  rate?: number;
  rating?: Rating;
  details?: T;
  preference?: Preference;
  firstSignIn?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  name?: string; // For backward compatibility
}

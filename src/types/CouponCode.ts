import User from './User'

export default interface ICouponCode {
  _id: String;
  code: String;
  isDisabled: Boolean;
  discount: Number;
  expiresAt: Date;
  usedBy: User[]; 
  createdAt: Date;
}
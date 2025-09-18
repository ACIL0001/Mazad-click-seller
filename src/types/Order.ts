import Drink from './Drink';
import Extra from './Extra';
import Product from './Product';
import Restaurant from './Restaurant';
import User from './User';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARED = 'PREPARED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface IProductItem {
  product: Product;
  quantity: number;
  extra: Extra[];
}

export interface IDrinkItem {
  drink: Drink;
  quantity: number;
}

export default interface IOrder {
  _id?: string;
  orderId: string;
  user: User;
  restaurant: Restaurant;
  items: IProductItem[];
  drinks: IDrinkItem[];
  totalAmount: number;
  note?: string;
  promocode?: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

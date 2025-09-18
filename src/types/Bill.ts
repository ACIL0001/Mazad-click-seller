import Order from './Order';
import Restaurant from './Restaurant';

export default interface Bill {
  _id: String;
  bill_id: number;
  startDate: string;
  paymentDate: string;
  orders: Order[];
  orderCount: number;
  restaurant: Restaurant;
  clientFee: number;
  restaurantFee: number;
  totalFee: number;
  totalSaleAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUnpayedStates {
  title: string;
  startDate: string;
  endDate: string;
  orderCount: number;
  restaurantFee: number;
  clientFee: number;
  totalSaleAmount: number;
  totalFee: number;
  orders: Order[];
}

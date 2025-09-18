import { Coordinates } from "./Coordinates";
import Order from "./Order";
import User from "./User";


export enum DeliveryStatus {
    PENDING = 'PENDING',
    DELIVERED = 'DELIVERED',
    CANCELED = 'CANCELED',
    EXPIRED = 'EXPIRED'
}


export default interface IDelivery extends Document {
    _id?: string,
    order: Order;
    user: User;
    rider?: User;
    restaurant: User;
    start_address: string;
    end_address: string;
    summary: string;
    pickup: Coordinates;
    dropOff: Coordinates;
    price: number;
    status: DeliveryStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
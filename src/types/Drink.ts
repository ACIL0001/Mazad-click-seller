import Attachment from "./Attachment";
import Restaurant from "./Restaurant";

export default interface Drink {
    _id?: string;
    name: string;
    restaurant: Restaurant;
    image: Attachment;
    price: number;
    deleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
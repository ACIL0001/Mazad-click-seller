import Attachment from "./Attachment";
import Restaurant from "./Restaurant";

export default interface Extra extends Document {
  name: string;
  description: string;
  image: Attachment;
  restaurant: Restaurant;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}
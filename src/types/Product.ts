import Attachment from "./Attachment";
import ICategory from "./Category";
import Extra from "./Extra";
import Restaurant, { FoodCategory } from "./Restaurant";

export default interface Product extends Document {
  _id: string;
  name: string;
  description: string;
  restaurant: Restaurant;
  category: ICategory;
  image: Attachment;
  price: number;
  extra: Extra[];
  deleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
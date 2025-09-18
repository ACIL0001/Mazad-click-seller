import Attachment from "./Attachment";
import { Coordinates } from "./Coordinates";
import Rating from "./Rating";
import User from "./User";

export enum FoodCategory {
    PIZZA = 'PIZZA',
    BURGER = 'BURGER',
    TACOS = 'TACOS',
    SANDWICH = 'SANDWICH',
  };
  
  
  export default interface Restaurant {
    _id: string,
    name: string;
    description: string;
    address: string;
    mobile: number;
    location: Coordinates;
    rating: Rating;
    cover?: Attachment;
    logo?: Attachment;
    active: boolean;
    opensAt: number;
    closeAt: number;
    category: FoodCategory[];
    verified: boolean;
  }
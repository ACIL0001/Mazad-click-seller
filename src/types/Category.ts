import Attachment from "./Attachment";

export enum CATEGORY_TYPE {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export default interface ICategory {
  _id: string;
  name: string;
  type: CATEGORY_TYPE;
  thumb: Attachment;
  attributes: string[];
}
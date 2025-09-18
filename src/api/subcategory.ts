import { requests } from './utils';

export const SubCategoryAPI = {
  create: (data:any): Promise<any> => requests.post('subcategory' , data),
  get: (): Promise<any> => requests.get('subcategory'),
};

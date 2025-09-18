import { requests } from './utils';

export const RestaurantApi = {
  find: (): Promise<any> => requests.get('restaurant/find'),
  activity: (data: { _id: string; activity: boolean }): Promise<any> => requests.put('restaurant/a/activity', data),
  verify: (id: any): Promise<any> => requests.put('restaurant/a/verify', { id }),
};

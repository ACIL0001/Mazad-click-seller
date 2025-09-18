import { requests } from "./utils";

export const BillAPI = {
  getBills: (restaurant_ID: string) : Promise<any> => requests.get(`bill/a/restaurant/${restaurant_ID}`),
  cashOut: (restaurant_ID: string) : Promise<any> => requests.post(`bill/a/cashout`, {id: restaurant_ID}),
	getUnpayedFee: (id?: string): Promise<any> => requests.get(`bill/a/unpayed/${id}`)
}
import { requests } from "./utils";

export const OffersAPI = {
  getOffers: (data:any) : Promise<any> => requests.post(`/offers/all`, data),
  createOffer: (bidId: string, data: any) : Promise<any> => requests.post(`/offers/${bidId}`, data),
  getOffersByBidId: (bidId: string) : Promise<any> => requests.get(`/offers/${bidId}`),
  getAllOffersTest: () : Promise<any> => requests.get(`/offers/test/all`),
}
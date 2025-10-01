import { requests } from "./utils";
import app from '@/config';

export const OffersAPI = {
  getOffers: (data: any): Promise<any> => requests.post(`/offers/all`, data),
  createOffer: (bidId: string, data: any): Promise<any> => requests.post(`/offers/${bidId}`, data),
  getOffersByBidId: (bidId: string): Promise<any> => requests.get(`/offers/${bidId}`),
  getAllOffersTest: (): Promise<any> => requests.get(`/offers/test/all`),
  getOffersByTenderId: (tenderId: string): Promise<any> => requests.get(`/offers/tender/${tenderId}`),
  
  // Fixed: Use PUT method and ensure body is passed
  acceptOffer: (offerId: string): Promise<any> => requests.put(`/offers/${offerId}/accept`, {}),
  rejectOffer: (offerId: string): Promise<any> => requests.put(`/offers/${offerId}/reject`, {}),
  
  deleteOffer: (offerId: string): Promise<any> => requests.delete(`/offers/${offerId}`),
}
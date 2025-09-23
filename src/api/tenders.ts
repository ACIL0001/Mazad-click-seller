import { requests } from "./utils";

export const TendersAPI = {
  getTenders: () : Promise<any> => requests.get('tender/my-tenders'),
  getAllTenders: () : Promise<any> => requests.get('tender'),
  create: (data: any) : Promise<any> => requests.post('tender', data),
  getTenderById: (id: string) : Promise<any> => requests.get(`tender/${id}`),
  update: (id: string, data: any) : Promise<any> => requests.put(`tender/${id}`, data),
  createTenderBid: (id: string, data: any) : Promise<any> => requests.post(`tender/${id}/bid`, data),
  getTenderBids: (id: string) : Promise<any> => requests.get(`tender/${id}/bids`),
  getTenderBidsByOwner: (ownerId: string) : Promise<any> => requests.get(`tender/owner/${ownerId}/bids`),
  getTenderBidsByBidder: (bidderId: string) : Promise<any> => requests.get(`tender/bidder/${bidderId}/bids`),
}

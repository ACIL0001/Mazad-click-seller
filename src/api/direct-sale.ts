import { requests } from "./utils";

export const DirectSaleAPI = {
  getDirectSales: (): Promise<any> => requests.get('direct-sale'),
  getMyDirectSales: (): Promise<any> => requests.get('direct-sale/my-sales'),
  getDirectSaleById: (id: string): Promise<any> => requests.get(`direct-sale/${id}`),
  create: (data: FormData): Promise<any> => {
    return requests.post('direct-sale', data);
  },
  update: (id: string, data: any): Promise<any> => requests.put(`direct-sale/${id}`, data),
  delete: (id: string): Promise<any> => requests.delete(`direct-sale/${id}`),
  purchase: (data: { directSaleId: string; quantity: number; paymentMethod?: string; paymentReference?: string }): Promise<any> =>
    requests.post('direct-sale/purchase', data),
  getMyPurchases: (): Promise<any> => requests.get('direct-sale/my-purchases'),
  getMyOrders: (): Promise<any> => requests.get('direct-sale/my-orders'),
  confirmPurchase: (purchaseId: string): Promise<any> =>
    requests.post(`direct-sale/purchase/${purchaseId}/confirm`, {}),
  getPurchasesByDirectSale: (id: string): Promise<any> =>
    requests.get(`direct-sale/${id}/purchases`),
};
export interface Offer {
  _id?: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  owner: string;
  bid: {
    _id: string;
    title: string;
    currentPrice: number;
  };
  price: number;
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OfferFormData {
  price: number;
}
import axios from 'axios';
import { Auction, AuctionFormData, BID_STATUS } from '../types/Auction';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/bids`;

export const auctionService = {
  createAuction: async (auctionData: AuctionFormData): Promise<Auction> => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', auctionData.title);
    formData.append('description', auctionData.description);
    formData.append('startingPrice', auctionData.startingPrice.toString());
    formData.append('productCategory', auctionData.productCategory);
    formData.append('type', auctionData.type);
    formData.append('bidType', auctionData.bidType);
    formData.append('auctionType', auctionData.auctionType);
    
    // Format dates
    formData.append('startingAt', auctionData.startingAt.toISOString());
    formData.append('endingAt', auctionData.endingAt.toISOString());
    
    if (auctionData.instantBuyPrice) {
      formData.append('instantBuyPrice', auctionData.instantBuyPrice.toString());
    }
    
    // Add reserve price for Classic auctions
    if (auctionData.reservePrice) {
      formData.append('reservePrice', auctionData.reservePrice.toString());
    }
    
    // Add max auto bid for Automatic Sub-Bidding
    if (auctionData.maxAutoBid) {
      formData.append('maxAutoBid', auctionData.maxAutoBid.toString());
    }
    
    // Add attributes as JSON string
    formData.append('attributes', JSON.stringify(auctionData.attributes));
    
    // Add images
    auctionData.thumbs.forEach((image) => {
      if (image instanceof Blob) {
        formData.append('thumbs', image);
      } else if (typeof image === 'string') {
        // Convert string to blob if needed
        const blob = new Blob([image], { type: 'image/jpeg' });
        formData.append('thumbs', blob);
      } else {
        // Handle Attachment type
        formData.append('thumbs', image as any);
      }
    });
    
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  getAuctions: async (): Promise<Auction[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },
  
  getAuctionById: async (id: string): Promise<Auction> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },
  
  updateAuction: async (id: string, auctionData: Partial<AuctionFormData>): Promise<Auction> => {
    const formData = new FormData();
    
    // Add text fields if they exist
    if (auctionData.title) formData.append('title', auctionData.title);
    if (auctionData.description) formData.append('description', auctionData.description);
    if (auctionData.startingPrice) formData.append('startingPrice', auctionData.startingPrice.toString());
    if (auctionData.productCategory) formData.append('productCategory', auctionData.productCategory);
    if (auctionData.type) formData.append('type', auctionData.type);
    if (auctionData.bidType) formData.append('bidType', auctionData.bidType);
    if (auctionData.auctionType) formData.append('auctionType', auctionData.auctionType);
    
    // Format dates if they exist
    if (auctionData.startingAt) formData.append('startingAt', auctionData.startingAt.toISOString());
    if (auctionData.endingAt) formData.append('endingAt', auctionData.endingAt.toISOString());
    
    if (auctionData.instantBuyPrice) formData.append('instantBuyPrice', auctionData.instantBuyPrice.toString());
    
    // Add reserve price for Classic auctions
    if (auctionData.reservePrice) {
      formData.append('reservePrice', auctionData.reservePrice.toString());
    }
    
    // Add max auto bid for Automatic Sub-Bidding
    if (auctionData.maxAutoBid) {
      formData.append('maxAutoBid', auctionData.maxAutoBid.toString());
    }
    
    // Add attributes as JSON string if they exist
    if (auctionData.attributes) formData.append('attributes', JSON.stringify(auctionData.attributes));
    
    // Add images if they exist
    if (auctionData.thumbs) {
      auctionData.thumbs.forEach((image) => {
        if (image instanceof Blob) {
          formData.append('thumbs', image);
        } else if (typeof image === 'string') {
          // Convert string to blob if needed
          const blob = new Blob([image], { type: 'image/jpeg' });
          formData.append('thumbs', blob);
        } else {
          // Handle Attachment type
          formData.append('thumbs', image as any);
        }
      });
    }
    
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  deleteAuction: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },
  
  getCategories: async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  }
};

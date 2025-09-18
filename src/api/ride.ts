import Ride from '../types/Ride';
import { requests } from './utils';



export const RideAPI = {
	create: (ride: Ride): Promise<any> => requests.post('ride/create', ride),
	find: (ride: Ride): Promise<any> => requests.post('ride/find', ride), // { pickup, dropOff, seats, date }
	booked: (): Promise<any> => requests.get(`ride/booked`),
	findAll: (): Promise<any> => requests.get(`ride/r/findAll`),
	cancel: (id: string): Promise<any> => requests.get(`ride/cancel/${id}`),
	book: (id: string, seats: number): Promise<any> => requests.get(`ride/book/${id}/${seats}`),
};
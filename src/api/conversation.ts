import Conversation from '../types/Conversation';
import { requests } from './utils';



export const ConversationAPI = {
	get: (): Promise<any> => requests.get(`conversation/`),
	create: (conversation: Conversation): Promise<any> => requests.post('conversation/create', conversation),
	getById: (id: string): Promise<any> => requests.get(`conversation/${id}`),
	seen: (id: string): Promise<any> => requests.get(`conversation/seen/${id}`),
	findWith: (id: string): Promise<any> => requests.get(`conversation/findWith/${id}`),
	getGroups: (): Promise<any> => requests.get(`conversation/groups`),
	update: (conversation: Conversation): Promise<any> => requests.post('conversation/update/', conversation),
	delete: (ids: string[]): Promise<any> => requests.post('conversation/delete', { ids }),
	createForAuction: (bidId: string): Promise<any> => {
		console.log('API call - Creating conversation for auction with bidId:', bidId);
		return requests.post('conversation/create-for-auction', { bidId })
			.then(response => {
				console.log('Conversation created successfully:', response);
				return response;
			})
			.catch(error => {
				console.error('Error creating conversation:', error);
				throw error;
			});
	},
};

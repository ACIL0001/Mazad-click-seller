import { requests } from './utils';

export const StatsAPI = {
	get: (): Promise<any> => requests.get('stats/a'),
};
import Credentials from '../types/Credentials';
import Sms from '../types/Sms';
import User from '../types/User';
import { requests } from './utils';

export const AuthAPI = {
  status: (): Promise<any> => requests.get('auth/status'),
  validateToken: (): Promise<any> => requests.get('auth/validate-token'),
  exists: (tel: string): Promise<any> => requests.get(`auth/exists/${tel}`),
  getSMS: (tel: string): Promise<any> => requests.get(`auth/2factor/send-sms/${tel}`),
  login: (credentials: Credentials, returnFullResponse: boolean = true): Promise<any> => requests.post('auth/signin', credentials, returnFullResponse),
  signup: (user: User): Promise<any> => requests.post('auth/signup', user),
  refresh: (refreshToken: string): Promise<any> => requests.put('auth/refresh', { refreshToken }),
  isValid: (sms: Sms): Promise<any> => requests.post('auth/2factor/validate', sms),
  setPassword: (sms: Sms): Promise<any> => requests.post('auth/2factor/set-password', sms),
  PasswordReset: (data: { phone: string; code: string; newPassword: string }): Promise<any> =>
    requests.post('auth/reset-password/confirm', data),
};

import { requests } from './utils';

export const OtpAPI = {
  confirm: (data: any): Promise<any> => requests.post('otp/confirm-phone', data),
  resend: (data: any): Promise<any> => requests.post('otp/resend/confirm-phone', data),
  requestPasswordReset: (data: any): Promise<any> => requests.post('otp/reset-password/request', data),
  confirmPasswordReset: (data: any): Promise<any> => requests.post('otp/reset-password/confirm', data),
};

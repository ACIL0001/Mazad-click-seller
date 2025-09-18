import { requests } from './utils';

export const IdentityAPI = {
  // Professional identity submission (existing professionals or client-to-professional with new required fields)
  create: (formData: FormData): Promise<any> => requests.post('/identities', formData),
  
  // Client to reseller conversion (identity card only)
  createResellerIdentity: (formData: FormData): Promise<any> => requests.post('/identities/reseller', formData),
  
  // Client to professional conversion (with new required fields)
  createProfessionalIdentity: (formData: FormData): Promise<any> => requests.post('/identities/professional', formData),
  
  // Admin verification endpoint
  verifyIdentity: (identityId: string, action: 'accept' | 'reject'): Promise<any> => 
    requests.put(`/identities/${identityId}/verify`, { action }),
  
  // Get current user's identity
  getMy: (): Promise<any> => requests.get('/identities/me'),
  
  // Get identity by ID (admin only)
  getById: (id: string): Promise<any> => requests.get(`/identities/${id}`),
  
  // Get all identities (admin only)
  getAll: (): Promise<any> => requests.get('/identities'),
  
  // Get pending identities (admin only)
  getPending: (): Promise<any> => requests.get('/identities/pending'),
  
  // Get accepted identities (admin only)
  getAccepted: (): Promise<any> => requests.get('/identities/accepted'),
  
  // Get pending professionals (admin only)
  getPendingProfessionals: (): Promise<any> => requests.get('/identities/pending/professionals'),
  
  // Get pending resellers (admin only)
  getPendingResellers: (): Promise<any> => requests.get('/identities/pending/resellers'),
  
  // Delete multiple identities (admin only)
  deleteMultiple: (ids: string[]): Promise<any> => 
    requests.delete(`/identities?ids=${ids.join(',')}`),
  
  // Legacy methods (keeping for backward compatibility)
  upload: (form: FormData): Promise<any> => requests.post('/identities', form),
  update: (status: any): Promise<any> => requests.post('identity/r/update', status),
  get: (): Promise<any> => requests.get('identity/r/all'),
  remove: (id: string): Promise<any> => requests.delete(`identity/r/remove/${id}`),
  uploadProfessionalDocuments: (formData: FormData): Promise<any> => requests.post('identity/professional/upload', formData),
};
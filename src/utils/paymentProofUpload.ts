// Utility function to upload payment proof to an identity
export const uploadPaymentProof = async (identityId: string, file: File): Promise<boolean> => {
  try {
    console.log('🔍 Starting payment proof upload...');
    console.log('🔍 File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    console.log('🔍 Identity ID:', identityId);
    
    const formData = new FormData();
    formData.append('paymentProof', file);
    
    // Get the access token from localStorage
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('❌ No access token found for payment proof upload');
      return false;
    }
    
    console.log('🔍 Access token found, making request...');
    const apiUrl = `${import.meta.env.VITE_API_URL || 'https://mazadclick-server.onrender.com'}/identities/${identityId}/payment-proof`;
    console.log('🔍 API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData
    });
    
    console.log('🔍 Payment proof upload response status:', response.status);
    console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Payment proof upload successful:', result);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Payment proof upload failed:', errorText);
      console.error('❌ Response status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error uploading payment proof:', error);
    return false;
  }
};

// Utility function to get stored payment proof from session storage
export const getStoredPaymentProof = (): { file: File | null; fileName: string; fileType: string } | null => {
  try {
    const base64 = sessionStorage.getItem('paymentProofFile');
    const fileName = sessionStorage.getItem('paymentProofFileName');
    const fileType = sessionStorage.getItem('paymentProofFileType');
    
    if (base64 && fileName && fileType) {
      // Convert base64 back to File
      const byteCharacters = atob(base64.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const file = new File([byteArray], fileName, { type: fileType });
      
      return { file, fileName, fileType };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting stored payment proof:', error);
    return null;
  }
};

// Utility function to clear stored payment proof
export const clearStoredPaymentProof = (): void => {
  sessionStorage.removeItem('paymentProofFile');
  sessionStorage.removeItem('paymentProofFileName');
  sessionStorage.removeItem('paymentProofFileType');
};

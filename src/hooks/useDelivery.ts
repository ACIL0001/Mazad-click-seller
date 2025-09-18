import { useContext } from 'react';
import { DeliveryContext } from '@/contexts/DeliveryContext';

const useDelivery = () => useContext(DeliveryContext);
export default useDelivery;

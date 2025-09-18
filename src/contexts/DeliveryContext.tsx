/** @format */

import { useState, useEffect, createContext } from 'react';
import useAuth from '../hooks/useAuth';
import { DeliveryAPI } from '../api/delivery';
import IDelivery from '../types/Delivery';



interface IDeliveryContext {
  deliveries: IDelivery[]
  updateDelivery: () => Promise<void>;
}

export const DeliveryContext = createContext<IDeliveryContext>({
  deliveries: [] as IDelivery[],
  updateDelivery: async () => {},
});

const DeliveryProvider = ({ children }: any) => {

    const [deliveries, setDeliveries] = useState<IDelivery[]>([]) 
    const { isReady, isLogged } = useAuth();

    const updateDelivery = async () => {

    DeliveryAPI.find().then(({ data }: { data: IDelivery[] }) => {

    setDeliveries(data)

    });
  };

  useEffect(() => {
    if (!isReady || !isLogged) return;
    updateDelivery();
  }, [isLogged, isReady]);

  return (
    <DeliveryContext.Provider
      value={{
        deliveries,
        updateDelivery,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export default DeliveryProvider;

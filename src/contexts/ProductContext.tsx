/** @format */

import { useState, useEffect, createContext } from 'react';
import useAuth from '../hooks/useAuth';
import { ProductAPI } from '../api/product';
import Product from '@/types/Product';

interface IProductContext {
  products: Product[];
  updateProduct: () => Promise<void>;
}

export const ProductContext = createContext<IProductContext>({
  products: [] as Product[],
  updateProduct: async () => {},
});

const ProductProvider = ({ children }: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { isReady, isLogged } = useAuth();

  const updateProduct = async () => {
    ProductAPI.find().then(({ data }: { data: Product[] }) => {
      setProducts(data);
    });
  };
  
  useEffect(() => {
    if (!isReady || !isLogged) return;
    updateProduct();
  }, [isLogged, isReady]);

  return (
    <ProductContext.Provider
      value={{
        products,
        updateProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;

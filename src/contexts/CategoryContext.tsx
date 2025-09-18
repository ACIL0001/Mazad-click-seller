/** @format */

import { useState, useEffect, createContext } from 'react';
import useAuth from '../hooks/useAuth';
import ICategory, { CATEGORY_TYPE } from '@/types/Category';
import { CategoryAPI } from '@/api/category';



interface ICategoryContext {
  categories: ICategory[]
  updateCategory: () => Promise<void>;
}

export const CategoryContext = createContext<ICategoryContext>({
  categories: [] as ICategory[],
  updateCategory: async () => {},
});

const CategoryProvider = ({ children }: any) => {

    const [categories, setCategories] = useState<ICategory[]>([]) 
    const { isReady, isLogged } = useAuth();

    const updateCategory = async () => {
    try {
      const response = await CategoryAPI.getCategories();
      // Convert Category[] to ICategory[]
      const convertedCategories: ICategory[] = response.data.map((category: any) => ({
        _id: category._id,
        name: category.name,
        type: category.type === 'PRODUCT' ? CATEGORY_TYPE.PRODUCT : CATEGORY_TYPE.SERVICE,
        thumb: category.thumb || { _id: '', url: '', filename: '' },
        attributes: category.attributes || []
      }));
      setCategories(convertedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    if (!isReady || !isLogged) return;
    updateCategory();
  }, [isLogged, isReady]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        updateCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryProvider;

import { requests } from './utils';

interface Category {
  _id: string;
  name: string;
  type: string;
  description?: string;
  thumb?: {
    _id: string;
    url: string;
    filename: string;
  } | null;
  attributes?: string[];
  parent?: string | null;
  children?: string[];
  level: number;
  path: string[];
  fullPath: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface CategoryWithAncestors {
  category: Category;
  ancestors: Category[];
}

interface CategoryWithDescendants {
  category: Category;
  descendants: Category[];
}

export const CategoryAPI = {
  // Category CRUD operations
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const res = await requests.get('category');
      return res;
    } catch (error: unknown) {
      throw error;
    }
  },

  create: (data: any): Promise<any> => requests.post('category', data),

  update: (id: string, data: any): Promise<any> => requests.put(`category/a/update/${id}`, data),

  delete: (id: string): Promise<any> => requests.delete(`category/a/delete/${id}`),

  // Category hierarchy operations
  getRootCategories: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const res = await requests.get('category/roots');
      return res;
    } catch (error: unknown) {
      throw error;
    }
  },

  getCategoryTree: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const res = await requests.get('category/tree');
      return res;
    } catch (error: unknown) {
      throw error;
    }
  },

  getCategoriesByParent: async (parentId?: string): Promise<ApiResponse<Category[]>> => {
    try {
      const url = parentId ? `category/by-parent?parentId=${parentId}` : 'category/by-parent';
      const res = await requests.get(url);
      return res;
    } catch (error: unknown) {
      throw error;
    }
  },

  // Single category operations
  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    try {
      const res = await requests.get(`category/${id}`);
      return res;
    } catch (error: unknown) {
      throw error;
    }
  },

  getCategoryWithAncestors: async (id: string): Promise<ApiResponse<CategoryWithAncestors>> => {
    try {
      const res = await requests.get(`category/${id}/with-ancestors`);
      return res;
    } catch (error: unknown) {
      throw error;
    }
  },

  getCategoryWithDescendants: async (id: string): Promise<ApiResponse<CategoryWithDescendants>> => {
    try {
      const res = await requests.get(`category/${id}/with-descendants`);
      return res;
    } catch (error: unknown) {
      throw error;
    }
  },

  // Subcategory operations
  createSouCat: (data: any): Promise<any> => requests.post('subcategory', data),

  getSouCat: (): Promise<any> => requests.get('subcategory'),
};
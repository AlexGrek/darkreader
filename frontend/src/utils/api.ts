import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = 'api';

export interface Catalog {
  files: string[];
  tags: string[];
  description: string;
  prettyName: string;
  pages: number;
}

export type CatalogMap = { [key: string]: Catalog };

export const getFileList = async () => {
  try {
    const response = await fetch('/api/catalogs');
    const data = await response.json();
    return data as CatalogMap;
  } catch (error) {
    console.error('Error fetching file list:', error);
    throw error;
  }
};

export const getCatalog = async (catalog: string) => {
  try {
    const response = await fetch(`/api/catalog/${catalog}`);
    const data = await response.json();
    return data["catalog"] as Catalog;
  } catch (error) {
    console.error('Error fetching catalog:', error);
    throw error;
  }
};

export const getFileContentOr401 = async (catalog: string, fileName: string) => {
  try {
    const response = await fetch(`/api/text/${catalog}/${fileName}`);
    if (response.status === 401) {
      return "401"
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error(`Error fetching file content for ${catalog}/${fileName}:`, error);
    throw error;
  }
};

interface PasswordPayload {
  password: string;
}

export const login = async (password: string): Promise<boolean> => {
  const payload: PasswordPayload = {
    password,
  };

  try {
    const response = await axios.post('/api/login', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Allow sending and receiving cookies
    });

    if (response.status === 200) {
      // The server should have set the necessary cookies in the response headers
      console.log('Login successful');
      return true;
    } else {
      console.error('Login failed');
      return false;
    }
  } catch (error) {
    console.error('Error during login:', error);
    return false;
  }
};
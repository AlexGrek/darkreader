import axios from 'axios';

export interface Catalog {
  files: string[];
  tags: string[];
  description: string;
  prettyName: string;
  pages: number;
  protected: boolean;
  hidden: boolean;
  unpublished: boolean;
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

export const getEpubFile = async (name: string) => {
  try {
    const response = await fetch(`/api/epub/${name}`);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.epub`; // or extract filename from response.headers
    document.body.appendChild(a);
    a.click();

    // Cleanup
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading EPUB:", error);
    throw error;
  }
};


export const sendPostWithPayload = async (path: string, payload: any) => {
  try {
    const response = await axios.post(`/api/${path}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Allow sending and receiving cookies
    });

    if (response.status < 300 && response.status >= 200) {
      // The server should have set the necessary cookies in the response headers
      console.log('Post request successful');
      return true;
    } else {
      console.error('Post request failed');
      console.error(response)
      return false;
    }
  } catch (error) {
    console.error('Error during post request:', error);
    return false;
  }
}

export const getFileContentOr401 = async (catalog: string, fileName: string) => {
  try {
    const response = await fetch(`/api/text/${catalog}/${fileName}`);
    if (response.status >= 400) {
      return "401"
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error(`Error fetching file content for ${catalog}/${fileName}:`, error);
    throw error;
  }
};

export const getAccessLevelOrStatusCode = async () => {
  try {
    const response = await fetch(`/api/get_login_data`);
    if (response.status != 200) {
      return `${response.status}`
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching login data:`, error);
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
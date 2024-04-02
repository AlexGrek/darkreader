import axios from 'axios';

const API_BASE_URL = 'api';

export const getFileList = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/files`);
    return response.data;
  } catch (error) {
    console.error('Error fetching file list:', error);
    return [];
  }
};

export const getFileContent = async (fileName: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/files/${fileName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching file content for ${fileName}:`, error);
    throw error;
  }
};
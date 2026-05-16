import { apiRequest } from './client';

type UploadResponse = {
  file_url: string;
};

export const uploadImage = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('file', file);
  const res = await apiRequest<UploadResponse>('/uploads', { method: 'POST', body: form });
  return res.file_url;
};

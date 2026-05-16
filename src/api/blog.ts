import { apiRequest } from "./client";

export type BlogStatus = "draft" | "publish";

export type Blog = {
  id: string;
  title: string;
  content: string;
  cover_image_url: string;
  status: BlogStatus;
  created_at: string;
  updated_at: string;
};

export type BlogPayload = {
  title: string;
  content: string;
  cover_image_url: string;
  status: BlogStatus;
};

export const getBlogs = () => apiRequest<Blog[]>("/posts");

export const getBlog = (id: string) => apiRequest<Blog>(`/blogs/${id}`);

export const createBlog = (payload: BlogPayload) =>
  apiRequest<Blog>("/blogs", { method: "POST", body: payload });

export const updateBlog = (id: string, payload: BlogPayload) =>
  apiRequest<Blog>(`/blogs/${id}`, { method: "PUT", body: payload });

export const deleteBlog = (id: string) =>
  apiRequest<void>(`/blogs/${id}`, { method: "DELETE" });
